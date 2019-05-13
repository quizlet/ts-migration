"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function stripComments(code, comments) {
    const codeSplitByLine = code.split("\n");
    const res = codeSplitByLine.reduce((acc, line) => {
        if (comments.some(c => line.includes(c))) {
            const matchedComment = comments.find(c => line.includes(c));
            const matchedIndex = line.indexOf(matchedComment);
            if (matchedIndex > 0) {
                acc.push(line.slice(0, matchedIndex));
            }
        }
        else {
            acc.push(line);
        }
        return acc;
    }, []);
    return res.join("\n");
}
exports.stripComments = stripComments;
//# sourceMappingURL=stripComments.js.map