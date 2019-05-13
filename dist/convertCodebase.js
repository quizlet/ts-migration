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
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const util_1 = require("util");
const promise_1 = __importDefault(require("simple-git/promise"));
const collectFiles_1 = __importDefault(require("./collectFiles"));
const converter_1 = __importDefault(require("./converter"));
const util_2 = require("./util");
const commitAll_1 = __importDefault(require("./commitAll"));
const exists = util_1.promisify(fs_1.default.exists);
function process(filePaths, shouldCommit, filesFromCLI) {
    return __awaiter(this, void 0, void 0, function* () {
        const git = promise_1.default(filePaths.rootDir);
        const files = filesFromCLI || (yield collectFiles_1.default(filePaths));
        console.log(`Converting ${files.length} files`);
        const { successFiles, errorFiles } = yield converter_1.default(files, filePaths.rootDir);
        console.log(`${successFiles.length} converted successfully.`);
        console.log(`${errorFiles.length} errors:`);
        if (errorFiles.length)
            console.log(errorFiles);
        if (shouldCommit) {
            yield commitAll_1.default("Convert files", filePaths);
            const renameErrors = [];
            console.log("renaming files");
            const snapsFound = [];
            const snapsNotFound = [];
            function renameSnap(path, oldExt, newExt) {
                return __awaiter(this, void 0, void 0, function* () {
                    const parsedPath = path_1.default.parse(path);
                    const jsSnapPath = `${parsedPath.dir}/__snapshots__/${parsedPath.name}${oldExt}.snap`;
                    const tsSnapPath = `${parsedPath.dir}/__snapshots__/${parsedPath.name}${newExt}.snap`;
                    if (yield exists(jsSnapPath)) {
                        console.log(`Renaming ${jsSnapPath} to ${tsSnapPath}`);
                        snapsFound.push(jsSnapPath);
                        try {
                            yield git.mv(jsSnapPath, tsSnapPath);
                        }
                        catch (e) {
                            console.log(e);
                            renameErrors.push(path);
                        }
                    }
                    else {
                        snapsNotFound.push(jsSnapPath);
                    }
                });
            }
            function containsReact(path) {
                const file = fs_1.default.readFileSync(path, "utf8");
                return file.includes("from 'react';");
            }
            yield util_2.asyncForEach(successFiles, (path, i) => __awaiter(this, void 0, void 0, function* () {
                console.log(`${i + 1} of ${successFiles.length}: Renaming ${path}`);
                try {
                    const parsedPath = path_1.default.parse(path);
                    const oldExt = parsedPath.ext;
                    const newExt = (() => {
                        if (oldExt === "jsx")
                            return ".tsx";
                        return containsReact(path) ? ".tsx" : ".ts";
                    })();
                    const newPath = path.replace(oldExt, newExt);
                    yield git.mv(path, newPath);
                    if (path.includes("__tests__") || path.includes("-test")) {
                        yield renameSnap(path, oldExt, newExt);
                    }
                }
                catch (e) {
                    console.log(e);
                    renameErrors.push(path);
                }
            }));
            console.log(`${renameErrors.length} errors renaming files`);
            if (renameErrors.length)
                console.log(renameErrors);
            console.log(`Snaps found: ${snapsFound.length}`);
            console.log(`Snaps Not found: ${snapsNotFound.length}`);
            yield commitAll_1.default("Rename files", filePaths);
            console.log(`${successFiles.length} converted successfully.`);
            console.log(`${errorFiles.length} errors`);
            if (errorFiles.length)
                console.log(errorFiles);
        }
        else {
            console.log("skipping commit in dry run mode");
        }
    });
}
exports.default = process;
//# sourceMappingURL=convertCodebase.js.map