#!/usr/bin/env node
import * as babel from "@babel/core";
// @ts-ignore
import dynamicImport from "@babel/plugin-syntax-dynamic-import";
import recast from "recast";
import * as prettier from "prettier";
import { writeFileSync } from "fs";
import plugin from "./index";
import { asyncForEach } from "./util";

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

function recastGenerate(ast: File): { code: string; map?: object } {
  const file = recast.print(ast);
  file.code = prettier.format(file.code, {
    ...prettier.resolveConfig.sync(global.process.cwd()),
    parser: "typescript"
  });
  return file;
}

const recastPlugin = function() {
  return {
    parserOverride: recastParse,
    generatorOverride: recastGenerate
  };
};

export const babelOptions: babel.TransformOptions = {
  plugins: [recastPlugin, plugin, dynamicImport]
};

const successFiles: string[] = [];
const errorFiles: string[] = [];

export default async function convert(files: string[]) {
  await asyncForEach(files, async (path, i) => {
    console.log(`${i} of ${files.length}: Converting ${path}`);
    let res;
    try {
      res = await babel.transformFileAsync(path, babelOptions);
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
