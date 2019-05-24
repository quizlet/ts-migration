export function stripComments(
  code: string,
  comments: string[]
): [string, number] {
  const codeSplitByLine = code.split("\n");
  let count = 0;

  const res = codeSplitByLine.reduce(
    (acc, line: string) => {
      if (comments.some(c => line.includes(c))) {
        const matchedComment = comments.find(c => line.includes(c))!;
        const matchedIndex = line.indexOf(matchedComment);
        if (matchedIndex > 0) {
          acc.push(line.slice(0, matchedIndex));
          count = count + 1;
        }
      } else {
        acc.push(line);
      }
      return acc;
    },
    [] as string[]
  );

  return [res.join("\n"), count];
}
