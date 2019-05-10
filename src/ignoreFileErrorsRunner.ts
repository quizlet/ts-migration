#!/usr/bin/env node
import ts from "typescript";
import { groupBy } from "lodash";
import { readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";
import collectFiles from "./collectFiles";
import commit from "./commitAll";
import prettierFormat from "./prettierFormat";

const argv = require("minimist")(global.process.argv.slice(2));

const rootDir = "../quizlet/";

export const ERROR_COMMENT = "// @quizlet-ts-ignore-errors:";

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
      let codeSplitByLine = readFileSync(filePath, "utf8").split("\n");
      codeSplitByLine.unshift(`${ERROR_COMMENT}${fileDiagnostics.length}`);
      const fileData = codeSplitByLine.join("\n");
      const formattedFileData = prettierFormat(fileData, rootDir);
      writeFileSync(filePath, formattedFileData);
      successFiles.push(fileName);
    } catch (e) {
      console.log(e);
      errorFiles.push(fileName);
    }
  });

  if (argv.commit) {
    await commit("Ignore File Errors");
  }

  console.log(`${successFiles.length} files with errors ignored successfully.`);
  console.log(`${errorFiles.length} errors:`);
  console.log(errorFiles);
}
compile(filePaths, compilerOptions.options);
