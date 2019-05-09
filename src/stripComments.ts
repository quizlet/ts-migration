export function stripComments(code: string, comments: string[]) {
  const codeSplitByLine = code.split("\n");

  const res = codeSplitByLine.reduce(
    (acc, line: string) => {
      if (!comments.some(c => line.includes(c))) {
        acc.push(line);
      }
      const matchedComment = comments.find(c => line.includes(c))!;
      const matchedIndex = line.indexOf(matchedComment);
      if (matchedIndex > 0) {
        acc.push(line.slice(0, matchedIndex));
      }
      return acc;
    },
    [] as string[]
  );

  return res.join("/n");
}
