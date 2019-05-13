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
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const collectFiles_1 = __importDefault(require("./collectFiles"));
function createTSCompiler(rootDir) {
    const fileName = path_1.default.join(rootDir, "tsconfig.json");
    const optionsFile = fs_1.readFileSync(fileName, "utf8");
    const configJSON = typescript_1.default.parseConfigFileTextToJson(fileName, optionsFile);
    const compilerOptions = typescript_1.default.convertCompilerOptionsFromJson(configJSON.config.compilerOptions, rootDir);
    return {
        configJSON,
        compilerOptions
    };
}
exports.createTSCompiler = createTSCompiler;
function getDiagnostics(paths) {
    return __awaiter(this, void 0, void 0, function* () {
        const files = yield collectFiles_1.default(paths);
        const { compilerOptions } = createTSCompiler(paths.rootDir);
        const program = typescript_1.default.createProgram(files, compilerOptions.options);
        const diagnostics = typescript_1.default.getPreEmitDiagnostics(program);
        return diagnostics;
    });
}
exports.getDiagnostics = getDiagnostics;
function getFilePath(paths, diagnostic) {
    const fileName = diagnostic.file.fileName;
    let filePath = path_1.default.join(paths.rootDir, fileName);
    if (!fs_1.existsSync(filePath)) {
        filePath = fileName;
        if (!fs_1.existsSync(filePath)) {
            throw new Error(`${filePath} does not exist`);
        }
    }
    return filePath;
}
exports.getFilePath = getFilePath;
//# sourceMappingURL=tsCompilerHelpers.js.map