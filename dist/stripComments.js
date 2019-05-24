"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function stripComments(code, comments) {
    const codeSplitByLine = code.split("\n");
    let count = 0;
    const res = codeSplitByLine.reduce((acc, line) => {
        if (comments.some(c => line.includes(c))) {
            const matchedComment = comments.find(c => line.includes(c));
            const matchedIndex = line.indexOf(matchedComment);
            if (matchedIndex > 0) {
                const firstPartOfLine = line.slice(0, matchedIndex);
                if (firstPartOfLine.match(/\S/)) {
                    acc.push(firstPartOfLine);
                    count = count + 1;
                }
            }
        }
        else {
            acc.push(line);
        }
        return acc;
    }, []);
    return [res.join("\n"), count];
}
exports.stripComments = stripComments;
//# sourceMappingURL=stripComments.js.map