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
const fs_1 = __importDefault(require("fs"));
const util_1 = require("util");
const path_1 = require("path");
const readdir = util_1.promisify(fs_1.default.readdir);
const stat = util_1.promisify(fs_1.default.stat);
function getFiles(dir) {
    return __awaiter(this, void 0, void 0, function* () {
        const subdirs = yield readdir(dir);
        const files = yield Promise.all(subdirs.map((subdir) => __awaiter(this, void 0, void 0, function* () {
            const res = path_1.resolve(dir, subdir);
            return (yield stat(res)).isDirectory() ? getFiles(res) : res;
        })));
        // @ts-ignore
        return files.reduce((a, f) => a.concat(f), []);
    });
}
function collectFiles(paths) {
    return __awaiter(this, void 0, void 0, function* () {
        const filesArr = yield Promise.all(paths.include.map(includeDir => getFiles(`${paths.rootDir}${includeDir}`)));
        const files = filesArr.reduce((a, f) => a.concat(f), []);
        const filesWithExtensions = files.filter(f => {
            return paths.extensions.some(e => f.endsWith(e));
        });
        const filesWithoutExclusions = filesWithExtensions.filter(f => {
            return !paths.exclude.some(e => f.includes(e));
        });
        return filesWithoutExclusions;
    });
}
exports.default = collectFiles;
//# sourceMappingURL=collectFiles.js.map