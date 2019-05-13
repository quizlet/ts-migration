import pathUtils from "path";

import fs from "fs";

import { promisify } from "util";
import simplegit from "simple-git/promise";

import collectFiles from "./collectFiles";
import convert from "./converter";
import { asyncForEach } from "./util";
import commit from "./commitAll";
import { FilePaths } from "./cli";

const exists = promisify(fs.exists);

export default async function process(
  filePaths: FilePaths,
  shouldCommit: boolean,
  filesFromCLI: string[] | undefined
) {
  const git = simplegit(filePaths.rootDir);

  const files = filesFromCLI || (await collectFiles(filePaths));

  console.log(`Converting ${files.length} files`);
  const { successFiles, errorFiles } = await convert(files, filePaths.rootDir);

  console.log(`${successFiles.length} converted successfully.`);
  console.log(`${errorFiles.length} errors:`);
  if (errorFiles.length) console.log(errorFiles);
  if (shouldCommit) {
    await commit("Convert files", filePaths);

    const renameErrors: string[] = [];

    console.log("renaming files");
    const snapsFound: string[] = [];
    const snapsNotFound: string[] = [];

    async function renameSnap(path: string, oldExt: string, newExt: string) {
      const parsedPath = pathUtils.parse(path);
      const jsSnapPath = `${parsedPath.dir}/__snapshots__/${
        parsedPath.name
      }${oldExt}.snap`;
      const tsSnapPath = `${parsedPath.dir}/__snapshots__/${
        parsedPath.name
      }${newExt}.snap`;
      if (await exists(jsSnapPath)) {
        console.log(`Renaming ${jsSnapPath} to ${tsSnapPath}`);
        snapsFound.push(jsSnapPath);
        try {
          await git.mv(jsSnapPath, tsSnapPath);
        } catch (e) {
          console.log(e);
          renameErrors.push(path);
        }
      } else {
        snapsNotFound.push(jsSnapPath);
      }
    }

    function containsReact(path: string) {
      const file = fs.readFileSync(path, "utf8");
      return file.includes("from 'react';");
    }

    await asyncForEach(successFiles, async (path, i) => {
      console.log(`${i + 1} of ${successFiles.length}: Renaming ${path}`);
      try {
        const parsedPath = pathUtils.parse(path);
        const oldExt = parsedPath.ext;

        const newExt = (() => {
          if (oldExt === "jsx") return ".tsx";
          return containsReact(path) ? ".tsx" : ".ts";
        })();

        const newPath = path.replace(oldExt, newExt);
        await git.mv(path, newPath);
        if (path.includes("__tests__") || path.includes("-test")) {
          await renameSnap(path, oldExt, newExt);
        }
      } catch (e) {
        console.log(e);
        renameErrors.push(path);
      }
    });

    console.log(`${renameErrors.length} errors renaming files`);
    if (renameErrors.length) console.log(renameErrors);

    console.log(`Snaps found: ${snapsFound.length}`);
    console.log(`Snaps Not found: ${snapsNotFound.length}`);
    await commit("Rename files", filePaths);

    console.log(`${successFiles.length} converted successfully.`);
    console.log(`${errorFiles.length} errors`);
    if (errorFiles.length) console.log(errorFiles);
  } else {
    console.log("skipping commit in dry run mode");
  }
}
