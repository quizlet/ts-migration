"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const babel = __importStar(require("@babel/core"));
// @ts-ignore
const plugin_syntax_dynamic_import_1 = __importDefault(require("@babel/plugin-syntax-dynamic-import"));
const recast_1 = __importDefault(require("recast"));
const fs_1 = require("fs");
const babel_plugin_flow_to_typescript_1 = __importDefault(require("babel-plugin-flow-to-typescript"));
const util_1 = require("./util");
const prettierFormat_1 = __importDefault(require("./prettierFormat"));
const stripComments_1 = require("./stripComments");
function recastParse(code, options, parse) {
    return recast_1.default.parse(code, {
        parser: {
            parse: (code) => {
                return parse(code, Object.assign({}, options, { tokens: true }));
            }
        }
    });
}
function buildRecastGenerate(rootDir = global.process.cwd()) {
    return function recastGenerate(ast) {
        const file = recast_1.default.print(ast);
        file.code = prettierFormat_1.default(file.code, rootDir);
        return file;
    };
}
const recastPlugin = function (rootDir) {
    return {
        parserOverride: recastParse,
        generatorOverride: buildRecastGenerate(rootDir)
    };
};
exports.babelOptions = (rootDir) => ({
    plugins: [recastPlugin(rootDir), babel_plugin_flow_to_typescript_1.default, plugin_syntax_dynamic_import_1.default]
});
const successFiles = [];
const errorFiles = [];
function convert(files, rootDir) {
    return __awaiter(this, void 0, void 0, function* () {
        yield util_1.asyncForEach(files, (path, i) => __awaiter(this, void 0, void 0, function* () {
            console.log(`${i} of ${files.length}: Converting ${path}`);
            let res;
            try {
                res = yield babel.transformFileAsync(path, exports.babelOptions(rootDir));
                res.code = stripComments_1.stripComments(res.code, ["// @flow", "// @noflow"])[0];
            }
            catch (err) {
                console.log(err);
                errorFiles.push(path);
                return;
            }
            fs_1.writeFileSync(path, res.code);
            successFiles.push(path);
        }));
        return {
            successFiles,
            errorFiles
        };
    });
}
exports.default = convert;
//# sourceMappingURL=converter.js.map