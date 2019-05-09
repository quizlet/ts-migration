#!/usr/bin/env node
import path from "path";
import ts from "typescript";
import { readFileSync } from "fs";

export default function createCompiler(rootDir: string) {
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
