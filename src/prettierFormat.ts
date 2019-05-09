#!/usr/bin/env node
import * as prettier from "prettier";

export default function prettierFormat(code: string, rootDir: string) {
  const prettierConfig = prettier.resolveConfig.sync(rootDir);
  return prettier.format(code, {
    ...prettierConfig,
    parser: "typescript"
  });
}
