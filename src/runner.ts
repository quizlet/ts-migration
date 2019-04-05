#!/usr/bin/env node
import pathUtils from "path";

const argv = require("minimist")(global.process.argv.slice(2));

import fs from "fs";

import { promisify } from "util";
import simplegit from "simple-git/promise";

import collectFiles from "./collectFiles";
import convert from "./converter";
import { asyncForEach } from "./util";

const git = simplegit();

const exists = promisify(fs.exists);

const rootDir = "../quizlet/";

async function process() {
  const files = await collectFiles(rootDir);

  console.log(`Converting ${files.length} files`);
  const { successFiles, errorFiles } = await convert(files, rootDir);

  console.log(`${successFiles.length} converted successfully.`);
  console.log(`${errorFiles.length} errors:`);
  console.log(errorFiles);
  if (!argv.d) {
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
    await asyncForEach(successFiles, async (path, i) => {
      console.log(`${i} of ${successFiles.length}: Renaming ${path}`);
      try {
        await git.mv(path, path.replace(".js", ".tsx"));
      } catch (e) {
        console.log(e);
        renameErrors.push(path);
      }
    });

    const testFiles = successFiles.filter(path => {
      return path.includes("__tests_") || path.includes("-test");
    });
    await asyncForEach(testFiles, async path => {
      const parsedPath = pathUtils.parse(path);
      const jsSnapPath = `${parsedPath.dir}/__snapshots__/${
        parsedPath.name
      }.js.snap`;
      const tsSnapPath = `${parsedPath.dir}/__snapshots__/${
        parsedPath.name
      }.tsx.snap`;
      if (await exists(jsSnapPath)) {
        console.log(`Renaming ${jsSnapPath}`);
        try {
          await git.mv(jsSnapPath, tsSnapPath);
        } catch (e) {
          console.log(e);
          renameErrors.push(path);
        }
      }
    });
    console.log(`${renameErrors.length} errors:`);
    console.log(renameErrors);

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
    console.log(`${errorFiles.length} errors:`);
    console.log(errorFiles);
  } else {
    console.log("skipping commit in dry run mode");
  }
}

process();
