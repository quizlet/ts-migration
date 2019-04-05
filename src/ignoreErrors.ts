#!/usr/bin/env node
import ts from 'typescript';

const argv = require("minimist")(global.process.argv.slice(2));

import fs from "fs";

import { promisify } from "util";
import simplegit from "simple-git/promise";

import collectFiles from "collectFiles";
import convert from "converter";
import { asyncForEach } from "./util";

const git = simplegit();

const exists = promisify(fs.exists);

async function process() {
  ts.
  const files = await collectFiles();

  console.log(`Converting ${files.length} files`);
  const { successFiles, errorFiles } = await convert(files);

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

    console.log(`${successFiles.length} converted successfully.`);
    console.log(`${errorFiles.length} errors:`);
    console.log(errorFiles);
  } else {
    console.log("skipping commit in dry run mode");
  }
}

process();
