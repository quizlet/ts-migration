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
const fs_1 = require("fs");
const collectFiles_1 = __importDefault(require("./collectFiles"));
const stripComments_1 = require("./stripComments");
const commitAll_1 = __importDefault(require("./commitAll"));
const prettierFormat_1 = __importDefault(require("./prettierFormat"));
const successFiles = [];
const errorFiles = [];
const flowComments = [
    "// @flow",
    "// $FlowFixMeImmutable",
    "// $FlowFixMe",
    "// @noflow"
];
function run(paths, comments, shouldComit) {
    return __awaiter(this, void 0, void 0, function* () {
        const files = yield collectFiles_1.default(paths);
        let count = 0;
        files.forEach(filePath => {
            try {
                const code = fs_1.readFileSync(filePath, "utf8");
                const [fileData, countRemoved] = stripComments_1.stripComments(code, comments || flowComments);
                count = count + countRemoved;
                const formattedFileData = prettierFormat_1.default(fileData, paths.rootDir);
                fs_1.writeFileSync(filePath, formattedFileData);
                successFiles.push(filePath);
            }
            catch (e) {
                console.log(e);
                errorFiles.push(filePath);
            }
        });
        if (shouldComit) {
            yield commitAll_1.default(`Strip comments`, paths);
        }
        console.log(`${count} comments in ${successFiles.length} files stripped successfully.`);
        if (errorFiles.length) {
            console.log(`Error stripping comments in ${errorFiles.length} files:`);
            console.log(errorFiles);
        }
    });
}
exports.default = run;
//# sourceMappingURL=stripCommentsRunner.js.map