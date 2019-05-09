import { stripComments } from "../src/stripComments";

const testCode = `
// @flow
import os from 'os';
// $FlowFixMe
instance.file = { name: 'error.csv' };

// $FlowFixMe bad typedef
foo()

return {
    audioId: getAudioIdFromTerm(term, termSide),
    url:
      termSide === TermSide.WORD
        ? // $FlowFixMeImmutable
          term.get('_wordAudioUrl')
        : // $FlowFixMeImmutable
          term.get('_definitionAudioUrl'),
  };
`;

describe("stripComments", () => {
  it("should strip // @flow", () => {
    expect(stripComments(testCode, ["// @flow"])).not.toContain("// @flow");
  });
  it("should strip // $FlowFixMe", () => {
    expect(stripComments(testCode, ["// $FlowFixMe"])).not.toContain(
      "// $FlowFixMe"
    );
  });
  it("should retain any code before the comment", () => {
    expect(stripComments(testCode, ["// $FlowFixMeImmutable"])).toContain("?");
  });
  it("should strip all at once", () => {
    expect(
      stripComments(testCode, [
        "// @flow",
        "// $FlowFixMeImmutable",
        "// $FlowFixMe"
      ])
    ).toContain("?");
  });
});
