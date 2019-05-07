#!/usr/bin/env node
import ts from "typescript";
import { groupBy, uniqBy } from "lodash";
import { readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";
import * as prettier from "prettier";
import collectFiles from "./collectFiles";
import * as utils from "tsutils";
import { NodeWrap } from "tsutils";

const rootDir = "../quizlet/";

// const optionsJSON = require(`${rootDir}tsconfig.json`);
const fileName = `${rootDir}tsconfig.json`;
const optionsFile = readFileSync(fileName, "utf8");
const configJSON = ts.parseConfigFileTextToJson(fileName, optionsFile);
const compilerOptions = ts.convertCompilerOptionsFromJson(
  configJSON.config.compilerOptions,
  rootDir
);

const successFiles: string[] = [];
const errorFiles: string[] = [];

const filePaths = {
  rootDir,
  include: configJSON.config.include,
  exclude: [],
  extensions: [".ts", ".tsx"]
};

const prettierConfig = prettier.resolveConfig.sync(rootDir);

// JsxElement = 260,
// JsxSelfClosingElement = 261,
// JsxOpeningElement = 262,
// JsxClosingElement = 263,
// JsxFragment = 264,
// JsxOpeningFragment = 265,
// JsxClosingFragment = 266,
// JsxAttribute = 267,
// JsxAttributes = 268,
// JsxSpreadAttribute = 269,
// JsxExpression = 270,
function findParentJSX(n: NodeWrap | undefined): [number, NodeWrap] | null {
  if (n) {
    const kind = n.kind as number;
    if (kind >= 260 && kind <= 270) {
      return [kind, n];
    }
    return findParentJSX(n.parent);
  }
  return null;
}

function findParentKind(
  n: NodeWrap | undefined,
  kind: number
): [number, NodeWrap] | null {
  if (n) {
    const nodeKind = n.kind as number;
    if (nodeKind === kind) {
      return [nodeKind, n];
    }
    return findParentKind(n.parent, kind);
  }
  return null;
}

async function compile(paths: any, options: ts.CompilerOptions): Promise<void> {
  const files = await collectFiles(paths);
  const program = ts.createProgram(files, options);

  const diagnostics = ts.getPreEmitDiagnostics(program).filter(d => !!d.file);

  const diagnosticsGroupedByFile = groupBy(diagnostics, d => d.file!.fileName);
  Object.keys(diagnosticsGroupedByFile).forEach(async (fileName, i, arr) => {
    const fileDiagnostics = uniqBy(diagnosticsGroupedByFile[fileName], d =>
      d.file!.getLineAndCharacterOfPosition(d.start!)
    ).reverse();
    console.log(
      `${i} of ${arr.length - 1}: Ignoring ${
        fileDiagnostics.length
      } ts-error(s) in ${fileName}`
    );
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
      const codeSplitByLine = readFileSync(filePath, "utf8").split("\n");
      fileDiagnostics.forEach((diagnostic, _errorIndex) => {
        const convertedAST = utils.convertAst(diagnostic.file!);
        const n = utils.getWrappedNodeAtPosition(
          convertedAST.wrapped,
          diagnostic.start!
        );

        const jsx = findParentJSX(n);
        if (jsx) {
          // TODO handle JSX -- it's more involved than we can do right now.
          // https://github.com/facebook/flow/blob/master/packages/flow-dev-tools/src/comment/add-commentsRunner.js#L732-L816
          // In addition, the typescript parser will only recognize `// @ts-ignore` exactly, so it's not possible to ignore many errors in jsx.
          // https://github.com/Microsoft/TypeScript/issues/27552
          return;
        }

        const { line } = diagnostic!.file!.getLineAndCharacterOfPosition(
          diagnostic.start!
        );
        codeSplitByLine.splice(line, 0, "// @ts-ignore FIXME");

        /*
        const foo = foo()
          ? // @ts-ignore
            error.here.is.not.ignored()
          : bar();
        */
        const inTernary = !!findParentKind(n, 205);
        if (inTernary) {
          codeSplitByLine.splice(line, 0, "// prettier-ignore");
        }
      });
      const fileData = codeSplitByLine.join("\n");
      const formattedFileData = prettier.format(fileData, {
        ...prettierConfig,
        parser: "typescript"
      });
      writeFileSync(filePath, formattedFileData);
      successFiles.push(fileName);
    } catch (e) {
      console.log(e);
      errorFiles.push(fileName);
    }
  });
  console.log(`${successFiles.length} files with errors ignored successfully.`);
  console.log(`${errorFiles.length} errors:`);
  console.log(errorFiles);
  const finalProgram = ts.createProgram(files, options);
  const finalDiagnostics = ts
    .getPreEmitDiagnostics(finalProgram)
    .filter(d => !!d.file);
  console.log("Errors remaining after ignoring: ", finalDiagnostics.length);
}
compile(filePaths, compilerOptions.options);
