#!/usr/bin/env node

import fs, { writeFileSync } from "fs";

import { promisify } from "util";
import { resolve } from "path";

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

async function getFiles(dir: string): Promise<string[]> {
  const subdirs = await readdir(dir);
  const files = await Promise.all(
    subdirs.map(async (subdir: string) => {
      const res = resolve(dir, subdir);
      return (await stat(res)).isDirectory() ? getFiles(res) : res;
    })
  );
  return files.reduce((a, f) => a.concat(f), [] as string[]);
}

const rootDir = "../../quizlet";

export default async function collectFiles() {
  const files: string[] = [
    ...(await getFiles(`${rootDir}app/j`)),
    ...(await getFiles(`${rootDir}stories`))
  ];
  const filesWithExtensions = files.filter(f => {
    return f.endsWith(".js") || f.endsWith(".jsx");
  });
  const filesWithoutExclusions = filesWithExtensions.filter(f => {
    return !f.includes("/vendor/") && !f.includes("i18n/findMessageAndLocale");
  });
  return filesWithoutExclusions;
}
