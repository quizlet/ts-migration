import fs from "fs";
import ts from "typescript";
import path from "path";

import insertIgnore from "../src/insertIgnore";
import { createTSCompiler } from "../src/tsCompilerHelpers";

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
      codeSplitByLine = insertIgnore(diagnostic, codeSplitByLine, false);
    });
    expect(codeSplitByLine.join("\n")).toMatchSnapshot();
  });
  it("should insert into jsx when the option is passed", () => {
    const fixturePath = path.join(__dirname, "./insertIgnore.fixture.tsx");

    const program = ts.createProgram([fixturePath], compilerOptions.options);

    const diagnostics = ts
      .getPreEmitDiagnostics(program)
      .filter(d => !!d.file)
      .reverse();
    const testCode = fs.readFileSync(fixturePath, "utf8");
    let codeSplitByLine = testCode.split("\n");
    diagnostics.forEach((diagnostic, _errorIndex) => {
      codeSplitByLine = insertIgnore(diagnostic, codeSplitByLine, true);
    });
    expect(codeSplitByLine.join("\n")).toMatchSnapshot();
  });
});
