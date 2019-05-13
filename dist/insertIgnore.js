"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils = __importStar(require("tsutils"));
const IGNORE_TEXT = "// @ts-ignore FIXME";
// JsxElement = 260,
// JsxSelfClosingElement = 261,
// JsxOpeningElement = 262,
// JsxClosingElement = 263,
// JsxFragment = 264,
// JsxOpeningFragment = 265,
// JsxClosingFragment = 266,
// JsxAttribute = 267,
// JsxAttributes = 268,
// JsxSpreadAttribute = 269,
// JsxExpression = 270,
function findParentJSX(n) {
    if (n) {
        const kind = n.kind;
        if (kind >= 260 && kind <= 270) {
            return [kind, n];
        }
        return findParentJSX(n.parent);
    }
    return null;
}
function getLine(diagnostic, position) {
    const { line } = diagnostic.file.getLineAndCharacterOfPosition(position || diagnostic.start);
    return line;
}
function insertIgnore(diagnostic, codeSplitByLine) {
    const convertedAST = utils.convertAst(diagnostic.file);
    const n = utils.getWrappedNodeAtPosition(convertedAST.wrapped, diagnostic.start);
    const line = getLine(diagnostic);
    const jsx = findParentJSX(n);
    if (jsx) {
        // Don't add ignores in JSX since it's too hard.
        return codeSplitByLine;
    }
    codeSplitByLine.splice(line, 0, IGNORE_TEXT);
    return codeSplitByLine;
}
exports.default = insertIgnore;
//# sourceMappingURL=insertIgnore.js.map