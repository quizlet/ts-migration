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
const tsCompilerHelpers_1 = require("./tsCompilerHelpers");
const ignoreFileErrorsRunner_1 = require("./ignoreFileErrorsRunner");
const errorFiles = [];
const errorsToShow = [];
const filesWithTooManyIgnoredErrors = [];
let skippedErrorCount = 0;
function run(paths) {
    return __awaiter(this, void 0, void 0, function* () {
        const diagnostics = yield tsCompilerHelpers_1.getDiagnostics(paths);
        const [diagnosticsWithFile, diagnosticsWithoutFile] = lodash_1.partition(diagnostics, d => !!d.file);
        errorsToShow.push(...diagnosticsWithoutFile);
        const diagnosticsGroupedByFile = lodash_1.groupBy(diagnosticsWithFile, d => d.file.fileName);
        Object.keys(diagnosticsGroupedByFile).forEach((fileName) => __awaiter(this, void 0, void 0, function* () {
            const fileDiagnostics = diagnosticsGroupedByFile[fileName];
            const actualErrorCount = fileDiagnostics.length;
            try {
                const filePath = tsCompilerHelpers_1.getFilePath(paths, fileDiagnostics[0]);
                let codeSplitByLine = fs_1.readFileSync(filePath, "utf8").split("\n");
                const firstLine = codeSplitByLine[0];
                const firstLineIsIgnore = firstLine.startsWith(ignoreFileErrorsRunner_1.ERROR_COMMENT);
                if (firstLineIsIgnore) {
                    const countToIgnore = parseInt(firstLine.replace(ignoreFileErrorsRunner_1.ERROR_COMMENT, ""), 10);
                    if (countToIgnore > actualErrorCount) {
                        filesWithTooManyIgnoredErrors.push({
                            actualErrorCount,
                            countToIgnore,
                            filePath
                        });
                    }
                    else if (countToIgnore !== actualErrorCount) {
                        errorsToShow.push(...fileDiagnostics);
                    }
                    else {
                        skippedErrorCount += countToIgnore;
                    }
                }
                else {
                    errorsToShow.push(...fileDiagnostics);
                }
            }
            catch (e) {
                console.log(e);
                errorFiles.push(fileName);
            }
        }));
        // Something went wrong
        if (errorFiles.length) {
            console.log(`Error checking for ignored type errors in ${errorFiles.length} files:`);
            console.log(errorFiles);
            process.exit(1);
        }
        else {
            // There were type errors
            if (errorsToShow.length || filesWithTooManyIgnoredErrors.length) {
                if (errorsToShow.length) {
                    const system = typescript_1.default.sys;
                    const host = {
                        getCurrentDirectory: () => system.getCurrentDirectory(),
                        getNewLine: () => system.newLine,
                        getCanonicalFileName: (f) => f
                    };
                    console.log(typescript_1.default.formatDiagnosticsWithColorAndContext(errorsToShow, host));
                    console.log(`Found ${errorsToShow.length} type error(s). `);
                }
                // There were issues with the # of ignored errors
                if (filesWithTooManyIgnoredErrors.length) {
                    filesWithTooManyIgnoredErrors.forEach(f => {
                        console.log(`Error: ${f.filePath} has ${f.actualErrorCount} error(s), but is set to ignore ${f.countToIgnore} error(s). Please update the ignore count.`);
                    });
                }
                process.exit(1);
            }
            else {
                // Everything is great
                console.log("No (non-ignored) type errors");
                console.log(`Skipping ${skippedErrorCount} ignored errors`);
                process.exit(0);
            }
        }
    });
}
exports.default = run;
//# sourceMappingURL=checkRunner.js.map