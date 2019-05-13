#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const typescript_1 = __importDefault(require("typescript"));
const fs_1 = require("fs");
function createCompiler(rootDir) {
    const fileName = path_1.default.join(rootDir, "tsconfig.json");
    const optionsFile = fs_1.readFileSync(fileName, "utf8");
    const configJSON = typescript_1.default.parseConfigFileTextToJson(fileName, optionsFile);
    const compilerOptions = typescript_1.default.convertCompilerOptionsFromJson(configJSON.config.compilerOptions, rootDir);
    return {
        configJSON,
        compilerOptions
    };
}
exports.default = createCompiler;
//# sourceMappingURL=tsCompiler.js.map