import ts from "typescript";
import { readFileSync, existsSync } from "fs";

import path from "path";
import collectFiles from "./collectFiles";
import { FilePaths } from "./cli";

export function createTSCompiler(rootDir: string) {
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

export async function getDiagnostics(paths: FilePaths) {
  const files = await collectFiles(paths);
  const { compilerOptions } = createTSCompiler(paths.rootDir);

  const program = ts.createProgram(files, compilerOptions.options);

  const diagnostics = ts.getPreEmitDiagnostics(program);
  return diagnostics;
}

export function getFilePath(paths: FilePaths, diagnostic: ts.Diagnostic) {
  const fileName = diagnostic.file!.fileName;
  let filePath = path.join(paths.rootDir, fileName);
  if (!existsSync(filePath)) {
    filePath = fileName;
    if (!existsSync(filePath)) {
      throw new Error(`${filePath} does not exist`);
    }
  }
  return filePath;
}
