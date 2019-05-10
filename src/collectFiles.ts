import fs from "fs";

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
  // @ts-ignore
  return files.reduce((a, f) => a.concat(f), [] as string[]);
}

export default async function collectFiles(paths: {
  rootDir: string;
  include: string[];
  exclude: string[];
  extensions: string[];
}) {
  const filesArr = await Promise.all(
    paths.include.map(includeDir => getFiles(`${paths.rootDir}${includeDir}`))
  );
  const files = filesArr.reduce((a, f) => a.concat(f), [] as string[]);

  const filesWithExtensions = files.filter(f => {
    return paths.extensions.some(e => f.endsWith(e));
  });
  const filesWithoutExclusions = filesWithExtensions.filter(f => {
    return !paths.exclude.some(e => f.includes(e));
  });
  return filesWithoutExclusions;
}
