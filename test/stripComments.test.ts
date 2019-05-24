import { stripComments } from "../src/stripComments";

const testCode = `
// @flow
import os from 'os';
// $FlowFixMe
instance.file = { name: 'error.csv' };

// $FlowFixMe bad typedef
foo()

const bar = undefined;

return {
    audioId: getAudioIdFromTerm(term, termSide),
    // $FlowFixMeImmutable
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
    expect(stripComments(testCode, ["// @flow"])[0]).not.toContain("// @flow");
  });
  it("should strip // $FlowFixMe", () => {
    expect(stripComments(testCode, ["// $FlowFixMe"])[0]).not.toContain(
      "// $FlowFixMe"
    );
  });
  it("should retain any code before the comment", () => {
    expect(stripComments(testCode, ["// $FlowFixMeImmutable"])[0]).toContain(
      "?"
    );
  });
  it("should preserve 'undefined'", () => {
    expect(stripComments(testCode, ["// $FlowFixMeImmutable"])[0]).toContain(
      "?"
    );
  });
  it("should strip all at once", () => {
    expect(
      stripComments(testCode, [
        "// @flow",
        "// $FlowFixMeImmutable",
        "// $FlowFixMe"
      ])[0]
    ).toMatchSnapshot();
  });
});
