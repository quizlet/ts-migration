#!/usr/bin/env node
import pathUtils from "path";

const argv = require("minimist")(global.process.argv.slice(2));

import fs from "fs";

import { promisify } from "util";
import simplegit from "simple-git/promise";

import collectFiles from "./collectFiles";
import convert from "./converter";
import { asyncForEach } from "./util";

const filesFromArgs = (function() {
  const { file } = argv;
  if (!file) return undefined;
  return Array.isArray(file) ? file : [file];
})();

const filePaths = {
  rootDir: "../quizlet/",
  include: ["app/j", "stories"],
  exclude: ["/vendor/", "i18n/findMessageAndLocale"],
  extensions: [".js", ".jsx"]
};
const git = simplegit(filePaths.rootDir);

const exists = promisify(fs.exists);

async function process() {
  const files = filesFromArgs || (await collectFiles(filePaths));

  console.log(`Converting ${files.length} files`);
  const { successFiles, errorFiles } = await convert(files, filePaths.rootDir);

  console.log(`${successFiles.length} converted successfully.`);
  console.log(`${errorFiles.length} errors:`);
  if (errorFiles.length) console.log(errorFiles);
  if (argv.commit) {
    console.log("Committing changed files");
    try {
      await git.add(".");
    } catch (e) {
      console.log("error adding");
      throw new Error(e);
    }

    try {
      await git.commit("Convert files", undefined, { "-n": true });
    } catch (e) {
      console.log("error committing");
      throw new Error(e);
    }

    const renameErrors: string[] = [];

    console.log("renaming files");

    async function renameSnap(path: string, oldExt: string, newExt: string) {
      const parsedPath = pathUtils.parse(path);
      const jsSnapPath = `${parsedPath.dir}/__snapshots__/${
        parsedPath.name
      }.${oldExt}.snap`;
      const tsSnapPath = `${parsedPath.dir}/__snapshots__/${
        parsedPath.name
      }.${newExt}.snap`;
      if (await exists(jsSnapPath)) {
        console.log(`Renaming ${jsSnapPath} to ${tsSnapPath}`);
        try {
          await git.mv(jsSnapPath, tsSnapPath);
        } catch (e) {
          console.log(e);
          renameErrors.push(path);
        }
      }
    }

    async function containsReact(path: string) {
      const file = fs.readFileSync(path, "utf8");
      return file.includes("from 'React';");
    }

    await asyncForEach(successFiles, async (path, i) => {
      console.log(`${i} of ${successFiles.length}: Renaming ${path}`);
      try {
        const parsedPath = pathUtils.parse(path);
        const oldExt = parsedPath.ext;

        const newExt = (() => {
          if (oldExt === "jsx") return "tsx";
          return containsReact(path) ? "tsx" : "ts";
        })();

        const newPath = path.replace(oldExt, newExt);
        await git.mv(path, newPath);
        if (path.includes("__tests_") || path.includes("-test")) {
          await renameSnap(path, oldExt, newExt);
        }
      } catch (e) {
        console.log(e);
        renameErrors.push(path);
      }
    });

    console.log(`${renameErrors.length} errors renaming files`);
    if (renameErrors.length) console.log(renameErrors);

    console.log("Committing renamed files");
    try {
      await git.add(".");
    } catch (e) {
      console.log("error adding");
      throw new Error(e);
    }
    try {
      await git.commit("Rename files", undefined, { "-n": true });
    } catch (e) {
      console.log("error committing");
      throw new Error(e);
    }
    console.log(`${successFiles.length} converted successfully.`);
    console.log(`${errorFiles.length} errors`);
    if (errorFiles.length) console.log(errorFiles);
  } else {
    console.log("skipping commit in dry run mode");
  }
}

process();
