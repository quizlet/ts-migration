import fs from "fs";
import ts from "typescript";
import path from "path";

import insertIgnore from "../src/insertIgnore";
import createTSCompiler from "../src/tsCompiler";

const { compilerOptions } = createTSCompiler(path.join(__dirname, "../"));

describe("insertIgnore", () => {
  it("should do everything right", () => {
    const fixturePath = path.join(__dirname, "./insertIgnore.fixture.tsx");

    const program = ts.createProgram([fixturePath], compilerOptions.options);

    const diagnostics = ts
      .getPreEmitDiagnostics(program)
      .filter(d => !!d.file)
      .reverse();
    const testCode = fs.readFileSync(fixturePath, "utf8");
    let codeSplitByLine = testCode.split("\n");
    diagnostics.forEach((diagnostic, _errorIndex) => {
      codeSplitByLine = insertIgnore(diagnostic, codeSplitByLine);
    });
    expect(codeSplitByLine.join("\n")).toMatchSnapshot();
  });

  fit("should insert inside a jsx expression", () => {
    const fixturePath = path.join(
      __dirname,
      "./insertIgnore.expression.fixture.tsx"
    );

    const program = ts.createProgram([fixturePath], compilerOptions.options);

    const diagnostics = ts
      .getPreEmitDiagnostics(program)
      .filter(d => !!d.file)
      .reverse();
    const testCode = fs.readFileSync(fixturePath, "utf8");
    let codeSplitByLine = testCode.split("\n");
    diagnostics.forEach((diagnostic, _errorIndex) => {
      codeSplitByLine = insertIgnore(diagnostic, codeSplitByLine);
    });
    expect(codeSplitByLine.join("\n")).toMatchInlineSnapshot(`
"import * as React from \\"react\\";

const Quizlet = {
  doesExist: true
};

function SingleLine() {
  return <div>{Quizlet.doesNotExist && <div className=\\"test\\" />}</div>;
}

SingleLine();

// function MultiLine() {
//   return (
//     <div
//       style={{}}
//       className=\\"long class name so the expression is on the next line\\"
//     >
//       {Quizlet.doesNotExist && <div className=\\"test\\" />}
//     </div>
//   );
// }

// MultiLine();
"
`);
  });
});
