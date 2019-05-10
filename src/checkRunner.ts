#!/usr/bin/env node
import ts from "typescript";
import { groupBy } from "lodash";
import { readFileSync, existsSync } from "fs";
import path from "path";
import collectFiles from "./collectFiles";

const ERROR_COMMENT = "// @quizlet-ts-ignore-errors:";

const rootDir = "../quizlet/";

const fileName = `${rootDir}tsconfig.json`;
const optionsFile = readFileSync(fileName, "utf8");
const configJSON = ts.parseConfigFileTextToJson(fileName, optionsFile);
const compilerOptions = ts.convertCompilerOptionsFromJson(
  configJSON.config.compilerOptions,
  rootDir
);

const errorFiles: string[] = [];
const errorsToShow: ts.Diagnostic[] = [];
const filesWithTooManyIgnoredErrors: {
  actualErrorCount: number;
  countToIgnore: number;
  filePath: string;
}[] = [];
let skippedErrorCount = 0;

const filePaths = {
  rootDir,
  include: configJSON.config.include,
  exclude: [],
  extensions: [".ts", ".tsx"]
};

async function compile(paths: any, options: ts.CompilerOptions): Promise<void> {
  const files = await collectFiles(paths);

  const program = ts.createProgram(files, options);

  const diagnostics = ts.getPreEmitDiagnostics(program).filter(d => !!d.file);

  const diagnosticsGroupedByFile = groupBy(diagnostics, d => d.file!.fileName);
  Object.keys(diagnosticsGroupedByFile).forEach(async fileName => {
    const fileDiagnostics = diagnosticsGroupedByFile[fileName];
    const actualErrorCount = fileDiagnostics.length;
    try {
      let filePath = path.join(rootDir, fileName);
      if (!existsSync(filePath)) {
        filePath = fileName;
        if (!existsSync(filePath)) {
          console.log(`${filePath} does not exist`);
          errorFiles.push(filePath);
          return;
        }
      }

      let codeSplitByLine = readFileSync(filePath, "utf8").split("\n");
      const firstLine = codeSplitByLine[0];
      const firstLineIsIgnore = firstLine.startsWith(ERROR_COMMENT);
      if (firstLineIsIgnore) {
        const countToIgnore = parseInt(
          firstLine.replace(ERROR_COMMENT, ""),
          10
        );
        if (countToIgnore > actualErrorCount) {
          filesWithTooManyIgnoredErrors.push({
            actualErrorCount,
            countToIgnore,
            filePath
          });
        } else if (countToIgnore !== actualErrorCount) {
          console.log("different!");
          console.log({ countToIgnore, actualErrorCount });
          errorsToShow.push(...fileDiagnostics);
        } else {
          skippedErrorCount += countToIgnore;
        }
      } else {
        errorsToShow.push(...fileDiagnostics);
      }
    } catch (e) {
      console.log(e);
      errorFiles.push(fileName);
    }

    errorsToShow.push(
      ...ts.getPreEmitDiagnostics(program).filter(d => !d.file)
    );
  });
  if (errorFiles.length) {
    console.log(
      `Error checking for ignored type errors in ${errorFiles.length} files:`
    );
    console.log(errorFiles);
    process.exit(1);
  } else {
    if (errorsToShow.length || filesWithTooManyIgnoredErrors.length) {
      if (errorsToShow.length) {
        const system = ts.sys;
        const host = {
          getCurrentDirectory: () => system.getCurrentDirectory(),
          getNewLine: () => system.newLine,
          getCanonicalFileName: (f: string) => f
        };
        console.log(
          ts.formatDiagnosticsWithColorAndContext(errorsToShow, host)
        );
        console.log(`Found ${errorsToShow.length} type error(s). `);
      }
      if (filesWithTooManyIgnoredErrors.length) {
        filesWithTooManyIgnoredErrors.forEach(f => {
          console.log(
            `Error: ${f.filePath} has ${
              f.actualErrorCount
            } error(s), but is set to ignore ${
              f.countToIgnore
            } error(s). Please update the ignore count.`
          );
        });
      }
      process.exit(1);
    } else {
      console.log("No (non-ignored) type errors");
      console.log(`Skipping ${skippedErrorCount} ignored errors`);
      process.exit(0);
    }
  }
}
compile(filePaths, compilerOptions.options);
