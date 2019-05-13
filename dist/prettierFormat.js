"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const prettier = __importStar(require("prettier"));
function prettierFormat(code, rootDir) {
    const prettierConfig = prettier.resolveConfig.sync(rootDir);
    return prettier.format(code, Object.assign({}, prettierConfig, { parser: "typescript" }));
}
exports.default = prettierFormat;
//# sourceMappingURL=prettierFormat.js.map