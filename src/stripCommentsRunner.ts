import { readFileSync, writeFileSync } from "fs";
import collectFiles from "./collectFiles";
import { stripComments } from "./stripComments";
import commit from "./commitAll";
import prettierFormat from "./prettierFormat";
import { FilePaths } from "./cli";

const successFiles: string[] = [];
const errorFiles: string[] = [];

const flowComments = [
  "// @flow",
  "// $FlowFixMeImmutable",
  "// $FlowFixMe",
  "// @noflow"
];

export default async function run(
  paths: FilePaths,
  comments: string[] | undefined,
  shouldComit: boolean
): Promise<void> {
  const files = await collectFiles(paths);
  let count = 0;
  files.forEach(filePath => {
    try {
      const code = readFileSync(filePath, "utf8");

      const [fileData, countRemoved] = stripComments(
        code,
        comments || flowComments
      );
      count = count + countRemoved;
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
    `${count} comments in ${successFiles.length} files stripped successfully.`
  );

  if (errorFiles.length) {
    console.log(`Error stripping comments in ${errorFiles.length} files:`);
    console.log(errorFiles);
  }
}
