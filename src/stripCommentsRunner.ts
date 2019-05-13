import { readFileSync, writeFileSync } from "fs";
import collectFiles from "./collectFiles";
import { stripComments } from "./stripComments";
import commit from "./commitAll";
import prettierFormat from "./prettierFormat";
import { FilePaths } from "./cli";

const argv = require("minimist")(global.process.argv.slice(2));

const successFiles: string[] = [];
const errorFiles: string[] = [];

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

export default async function run(
  paths: FilePaths,
  shouldComit: boolean
): Promise<void> {
  const files = filesFromArgs || (await collectFiles(paths));

  files.forEach(filePath => {
    try {
      const code = readFileSync(filePath, "utf8");

      const fileData = stripComments(code, argv.comments || flowComments);
      const formattedFileData = prettierFormat(fileData, paths.rootDir);
      writeFileSync(filePath, formattedFileData);
      successFiles.push(filePath);
    } catch (e) {
      console.log(e);
      errorFiles.push(filePath);
    }
  });

  if (shouldComit) {
    await commit(`Strip comments`, paths);
  }

  console.log(
    `${successFiles.length} files with comments stripped successfully.`
  );
  if (errorFiles.length) {
    console.log(`Error stripping comments in ${errorFiles.length} files:`);
    console.log(errorFiles);
  }
}
