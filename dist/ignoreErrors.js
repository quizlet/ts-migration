#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typescript_1 = __importDefault(require("typescript"));
const lodash_1 = require("lodash");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const collectFiles_1 = __importDefault(require("./collectFiles"));
const insertIgnore_1 = __importDefault(require("insertIgnore"));
const commitAll_1 = __importDefault(require("commitAll"));
const tsCompiler_1 = __importDefault(require("./tsCompiler"));
const prettierFormat_1 = __importDefault(require("prettierFormat"));
const argv = require("minimist")(global.process.argv.slice(2));
const rootDir = "../quizlet/";
const { configJSON, compilerOptions } = tsCompiler_1.default(rootDir);
const successFiles = [];
const errorFiles = [];
const filePaths = {
    rootDir,
    include: configJSON.config.include,
    exclude: [
        "app/j/utils/ModeHelper.js" // adding ts-ignore causes lint errors
    ],
    extensions: [".ts", ".tsx"]
};
function compile(paths, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const files = yield collectFiles_1.default(paths);
        const program = typescript_1.default.createProgram(files, options);
        const diagnostics = typescript_1.default.getPreEmitDiagnostics(program).filter(d => !!d.file);
        const diagnosticsGroupedByFile = lodash_1.groupBy(diagnostics, d => d.file.fileName);
        Object.keys(diagnosticsGroupedByFile).forEach((fileName, i, arr) => __awaiter(this, void 0, void 0, function* () {
            const fileDiagnostics = lodash_1.uniqBy(diagnosticsGroupedByFile[fileName], d => d.file.getLineAndCharacterOfPosition(d.start)).reverse();
            console.log(`${i} of ${arr.length - 1}: Ignoring ${fileDiagnostics.length} ts-error(s) in ${fileName}`);
            try {
                let filePath = path_1.default.join(rootDir, fileName);
                if (!fs_1.existsSync(filePath)) {
                    filePath = fileName;
                    if (!fs_1.existsSync(filePath)) {
                        console.log(`${filePath} does not exist`);
                        errorFiles.push(filePath);
                        return;
                    }
                }
                let codeSplitByLine = fs_1.readFileSync(filePath, "utf8").split("\n");
                fileDiagnostics.forEach((diagnostic, _errorIndex) => {
                    codeSplitByLine = insertIgnore_1.default(diagnostic, codeSplitByLine);
                });
                const fileData = codeSplitByLine.join("\n");
                const formattedFileData = prettierFormat_1.default(fileData, rootDir);
                fs_1.writeFileSync(filePath, formattedFileData);
                successFiles.push(fileName);
            }
            catch (e) {
                console.log(e);
                errorFiles.push(fileName);
            }
        }));
        if (argv.commit) {
            yield commitAll_1.default("Ignore errors");
        }
        console.log(`${successFiles.length} files with errors ignored successfully.`);
        console.log(`${errorFiles.length} errors:`);
        console.log(errorFiles);
        const finalProgram = typescript_1.default.createProgram(files, options);
        const finalDiagnostics = typescript_1.default
            .getPreEmitDiagnostics(finalProgram)
            .filter(d => !!d.file);
        console.log("Errors remaining after ignoring: ", finalDiagnostics.length);
    });
}
compile(filePaths, compilerOptions.options);
//# sourceMappingURL=ignoreErrors.js.map