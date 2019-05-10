import ts from "typescript";
import { readFileSync, existsSync } from "fs";

import path from "path";
import collectFiles from "./collectFiles";

// TODO all this should be passed in from the runner
const rootDir = "../quizlet/";
const configFilePath = `${rootDir}tsconfig.json`;
const optionsFile = readFileSync(configFilePath, "utf8");
const configJSON = ts.parseConfigFileTextToJson(configFilePath, optionsFile);
const compilerOptions = ts.convertCompilerOptionsFromJson(
  configJSON.config.compilerOptions,
  rootDir
);

const filePaths = {
  rootDir,
  include: configJSON.config.include,
  exclude: [],
  extensions: [".ts", ".tsx"]
};

// TODO dedupe
export default function createTSCompiler(rootDir: string) {
  const fileName = path.join(rootDir, "tsconfig.json");
  const optionsFile = readFileSync(fileName, "utf8");
  const configJSON = ts.parseConfigFileTextToJson(fileName, optionsFile);
  const compilerOptions = ts.convertCompilerOptionsFromJson(
    configJSON.config.compilerOptions,
    rootDir
  );
  return {
    configJSON,
    compilerOptions
  };
}

export async function getDiagnostics() {
  const files = await collectFiles(filePaths);

  const program = ts.createProgram(files, compilerOptions.options);

  const diagnostics = ts.getPreEmitDiagnostics(program);
  return diagnostics;
}

export function getFilePath(diagnostic: ts.Diagnostic) {
  const fileName = diagnostic.file!.fileName;
  let filePath = path.join(rootDir, fileName);
  if (!existsSync(filePath)) {
    filePath = fileName;
    if (!existsSync(filePath)) {
      throw new Error(`${filePath} does not exist`);
    }
  }
  return filePath;
}
