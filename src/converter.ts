#!/usr/bin/env node
import * as babel from "@babel/core";
// @ts-ignore
import dynamicImport from "@babel/plugin-syntax-dynamic-import";
import recast from "recast";
import { writeFileSync } from "fs";
import plugin from "./babel-plugin/index";
import { asyncForEach } from "./util";
import prettierFormat from "./prettierFormat";

function recastParse(
  code: string,
  options: babel.ParserOptions,
  parse: (code: string, options: babel.ParserOptions) => File
): File {
  return recast.parse(code, {
    parser: {
      parse: (code: string) => {
        return parse(code, { ...options, tokens: true });
      }
    }
  });
}

function buildRecastGenerate(rootDir: string = global.process.cwd()) {
  return function recastGenerate(ast: File): { code: string; map?: object } {
    const file = recast.print(ast);
    file.code = prettierFormat(file.code, rootDir);
    return file;
  };
}

const recastPlugin = function(rootDir: string) {
  return {
    parserOverride: recastParse,
    generatorOverride: buildRecastGenerate(rootDir)
  };
};

export const babelOptions = (rootDir: string): babel.TransformOptions => ({
  plugins: [recastPlugin(rootDir), plugin, dynamicImport]
});

const successFiles: string[] = [];
const errorFiles: string[] = [];

export default async function convert(files: string[], rootDir: string) {
  await asyncForEach(files, async (path, i) => {
    console.log(`${i} of ${files.length}: Converting ${path}`);
    let res;
    try {
      res = await babel.transformFileAsync(path, babelOptions(rootDir));
    } catch (err) {
      console.log(err);
      errorFiles.push(path);
      return;
    }
    writeFileSync(path, res!.code);
    successFiles.push(path);
  });
  return {
    successFiles,
    errorFiles
  };
}
