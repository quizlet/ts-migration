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
const lodash_1 = require("lodash");
const fs_1 = require("fs");
const commitAll_1 = __importDefault(require("./commitAll"));
const tsCompilerHelpers_1 = require("./tsCompilerHelpers");
exports.ERROR_COMMENT = "// @quizlet-ts-ignore-errors:";
const successFiles = [];
const errorFiles = [];
function run(paths, shouldCommit) {
    return __awaiter(this, void 0, void 0, function* () {
        const diagnostics = yield tsCompilerHelpers_1.getDiagnostics(paths);
        const diagnosticsWithFile = diagnostics.filter(d => !!d.file);
        const diagnosticsGroupedByFile = lodash_1.groupBy(diagnosticsWithFile, d => d.file.fileName);
        Object.keys(diagnosticsGroupedByFile).forEach((fileName, i, arr) => __awaiter(this, void 0, void 0, function* () {
            const fileDiagnostics = diagnosticsGroupedByFile[fileName];
            console.log(`${i} of ${arr.length - 1}: Ignoring ${fileDiagnostics.length} ts-error(s) in ${fileName}`);
            try {
                const filePath = tsCompilerHelpers_1.getFilePath(paths, fileDiagnostics[0]);
                let codeSplitByLine = fs_1.readFileSync(filePath, "utf8").split("\n");
                codeSplitByLine.unshift(`${exports.ERROR_COMMENT}${fileDiagnostics.length}`);
                const fileData = codeSplitByLine.join("\n");
                fs_1.writeFileSync(filePath, fileData);
                successFiles.push(fileName);
            }
            catch (e) {
                console.log(e);
                errorFiles.push(fileName);
            }
        }));
        if (shouldCommit) {
            yield commitAll_1.default("Ignore File Errors", paths);
        }
        console.log(`${successFiles.length} files with errors ignored successfully.`);
        if (errorFiles.length) {
            console.log(`Error checking for ignored type errors in ${errorFiles.length} files:`);
            console.log(errorFiles);
        }
    });
}
exports.default = run;
//# sourceMappingURL=ignoreFileErrorsRunner.js.map