#!/usr/bin/env node
import ts from "typescript";
import { readFileSync, writeFileSync } from "fs";
import collectFiles from "./collectFiles";
import { stripComments } from "./stripComments";
import commit from "./commitAll";
import prettierFormat from "./prettierFormat";

const argv = require("minimist")(global.process.argv.slice(2));

const rootDir = "../quizlet/";

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
      const formattedFileData = prettierFormat(fileData, rootDir);
      writeFileSync(filePath, formattedFileData);
      successFiles.push(filePath);
    } catch (e) {
      console.log(e);
      errorFiles.push(filePath);
    }
  });

  if (argv.commit) {
    await commit(`Strip comments`);
  }

  console.log(
    `${successFiles.length} files with comments stripped successfully.`
  );
  console.log(`${errorFiles.length} errors:`);
  console.log(errorFiles);
}
run(filePaths);
