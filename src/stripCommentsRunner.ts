#!/usr/bin/env node
import ts from "typescript";
import { readFileSync, writeFileSync } from "fs";
import * as prettier from "prettier";
import collectFiles from "./collectFiles";
import simplegit from "simple-git/promise";
import { stripComments } from "./stripComments";

const argv = require("minimist")(global.process.argv.slice(2));

const rootDir = "../quizlet/";

const git = simplegit(rootDir);

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

export async function run(
  paths: any,
  options: ts.CompilerOptions
): Promise<void> {
  const files = await collectFiles(paths);

  files.forEach(filePath => {
    try {
      const code = readFileSync(filePath, "utf8");

      const fileData = stripComments(code, argv.comments);
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

  if (argv.commit) {
    console.log("Committing changes");
    try {
      await git.add(".");
    } catch (e) {
      console.log("error adding");
      throw new Error(e);
    }
    try {
      await git.commit("Ignore errors", undefined, { "-n": true });
    } catch (e) {
      console.log("error committing");
      throw new Error(e);
    }
  }

  console.log(`${successFiles.length} files with errors ignored successfully.`);
  console.log(`${errorFiles.length} errors:`);
  console.log(errorFiles);
  const finalProgram = ts.createProgram(files, options);
  const finalDiagnostics = ts
    .getPreEmitDiagnostics(finalProgram)
    .filter(d => !!d.file);
  console.log("Errors remaining after ignoring: ", finalDiagnostics.length);
}
run(filePaths, compilerOptions.options);
