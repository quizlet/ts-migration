#!/usr/bin/env node
import ts from "typescript";
import { groupBy } from "lodash";
import { readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";
import * as prettier from "prettier";
import collectFiles from "./collectFiles";

const rootDir = "../quizlet/";

// const optionsJSON = require(`${rootDir}tsconfig.json`);
const fileName = `${rootDir}tsconfig.json`;
const optionsFile = readFileSync(fileName, "utf8");
const configJSON = ts.parseConfigFileTextToJson(fileName, optionsFile);
const compilerOptions = ts.convertCompilerOptionsFromJson(
  configJSON.config.compilerOptions,
  rootDir
);

const successFiles: string[] = [];
const errorFiles: string[] = [];

const filePaths = {
  rootDir,
  include: configJSON.config.include,
  exclude: [],
  extensions: [".ts", ".tsx"]
};

const prettierConfig = prettier.resolveConfig.sync(rootDir);

async function compile(paths: any, options: ts.CompilerOptions): Promise<void> {
  const files = await collectFiles(paths);
  const program = ts.createProgram(files, options);

  const diagnostics = ts.getPreEmitDiagnostics(program).filter(d => !!d.file);

  const diagnosticsGroupedByFile = groupBy(diagnostics, d => d.file!.fileName);
  Object.keys(diagnosticsGroupedByFile).forEach(async (fileName, i, arr) => {
    const fileDiagnostics = diagnosticsGroupedByFile[fileName];
    console.log(
      `${i} of ${arr.length - 1}: Ignoring ${
        fileDiagnostics.length
      } ts-error(s) in ${fileName}`
    );
    try {
      let filePath = path.join(rootDir, fileName);
      if (!existsSync(filePath)) {
        filePath = fileName;
        if (!existsSync(filePath)) {
          console.log(`${filePath} does not exist`);
          errorFiles.push(filePath);
          return;
        }
      }
      const codeSplitByLine = readFileSync(filePath, "utf8").split("\n");
      fileDiagnostics.forEach((diagnostic, errorIndex) => {
        const { line } = diagnostic!.file!.getLineAndCharacterOfPosition(
          diagnostic.start!
        );
        codeSplitByLine.splice(line + errorIndex, 0, "// @ts-ignore FIXME");
      });
      const fileData = codeSplitByLine.join("\n");
      const formattedFileData = prettier.format(fileData, {
        ...prettierConfig,
        parser: "typescript"
      });
      writeFileSync(filePath, formattedFileData);
      successFiles.push(fileName);
    } catch (e) {
      console.log(e);
      errorFiles.push(fileName);
    }
  });
  console.log(`${successFiles.length} files with errors ignored successfully.`);
  console.log(`${errorFiles.length} errors:`);
  console.log(errorFiles);
  const finalProgram = ts.createProgram(files, options);
  const finalDiagnostics = ts
    .getPreEmitDiagnostics(finalProgram)
    .filter(d => !!d.file);
  console.log("Errors remaining after ignoring: ", finalDiagnostics.length);
}
compile(filePaths, compilerOptions.options);
