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

const successFiles: string[] = [];
const errorFiles: string[] = [];

const filePaths = {
  rootDir,
  include: configJSON.config.include,
  exclude: ["/vendor/", "i18n/findMessageAndLocale"],
  extensions: [".ts", ".tsx"]
};

const prettierConfig = prettier.resolveConfig.sync(rootDir);
const flowComments = [
  "// @flow",
  "// $FlowFixMeImmutable",
  "// $FlowFixMe",
  "// @noflow"
];

const filesFromArgs = (function(): string[] | undefined {
  const { file } = argv;
  if (!file) return undefined;
  return Array.isArray(file) ? file : [file];
})();

export async function run(paths: any): Promise<void> {
  const files = filesFromArgs || (await collectFiles(paths));

  files.forEach(filePath => {
    try {
      const code = readFileSync(filePath, "utf8");

      const fileData = stripComments(code, argv.comments || flowComments);
      const formattedFileData = prettier.format(fileData, {
        ...prettierConfig,
        parser: "typescript"
      });
      writeFileSync(filePath, formattedFileData);
      successFiles.push(filePath);
    } catch (e) {
      console.log(e);
      errorFiles.push(filePath);
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
      await git.commit("Strip comments", undefined, { "-n": true });
    } catch (e) {
      console.log("error committing");
      throw new Error(e);
    }
  }

  console.log(
    `${successFiles.length} files with comments stripped successfully.`
  );
  console.log(`${errorFiles.length} errors:`);
  console.log(errorFiles);
}
run(filePaths);
