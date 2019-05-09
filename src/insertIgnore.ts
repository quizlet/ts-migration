#!/usr/bin/env node
import ts from "typescript";
import * as utils from "tsutils";
import { NodeWrap } from "tsutils";

const IGNORE_TEXT = "// @ts-ignore FIXME";
// const PRETTIER_IGNORE_TEXT = "// prettier-ignore";

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

function getLine(diagnostic: ts.Diagnostic) {
  const { line } = diagnostic!.file!.getLineAndCharacterOfPosition(
    diagnostic.start!
  );
  return line;
}

export default function insertIgnore(
  diagnostic: ts.Diagnostic,
  codeSplitByLine: string[]
) {
  const convertedAST = utils.convertAst(diagnostic.file!);
  const n = utils.getWrappedNodeAtPosition(
    convertedAST.wrapped,
    diagnostic.start!
  );
  const line = getLine(diagnostic);
  console.log(diagnostic.messageText);
  console.log(n!.node.getFullText());

  const jsx = findParentJSX(n);
  if (jsx && n) {
    const [code] = jsx;
    if (code === 270) {
      // WIP
      /* Ok, so we have something like
       *
       * <jsx>
       *   {10 * 'hello'}
       * <jsx>
       *
       * We need to stick the comment inside the expression container.
       * So the above example turns into
       *
       * <jsx>
       *   {
       *     // Comment
       *     10 * 'hello'}
       * <jsx>
       */
      // codeSplitByLine.splice(line, 0, IGNORE_TEXT);
      // codeSplitByLine.splice(line, 0, PRETTIER_IGNORE_TEXT);
      // split the line at the start of our error.
      // insert the ignores into the middle
      // const text = n.node.getFullText();
      // const lineText = codeSplitByLine[line];
      // const splitPoint = lineText.indexOf(text);
      // const part1 = lineText.substring(0, splitPoint);
      // const match = part1.match(/^ */);
      // const padding = match ? match[0] + "  " : "  ";
      // const part2 = padding + lineText.substring(splitPoint);
      // console.log({ line, lineText, text, splitPoint, part1, part2 });
      // codeSplitByLine[line] = part1;
      // codeSplitByLine.splice(line + 1, 0, part2);
      // codeSplitByLine.splice(line + 1, 0, padding + IGNORE_TEXT);
      // codeSplitByLine.splice(line + 1, 0, padding + PRETTIER_IGNORE_TEXT);
    }
    // console.log(jsx[1].node.getFullText());
    // console.log(jsx[0]);
    // console.log(n.node.getFullText());
    // console.log(jsx[1].node.getFullText());
    // TODO handle JSX -- it's more involved than we can do right now.
    // https://github.com/facebook/flow/blob/master/packages/flow-dev-tools/src/comment/add-commentsRunner.js#L732-L816
    // In addition, the typescript parser will only recognize `// @ts-ignore` exactly, so it's not possible to ignore many errors in jsx.
    // https://github.com/Microsoft/TypeScript/issues/27552
    // Try getting the node.getStart() position and see if it's on the same line
    return codeSplitByLine;
  }

  codeSplitByLine.splice(line, 0, IGNORE_TEXT);

  /*
  const foo = foo()
  ? // @ts-ignore
  error.here.is.not.ignored()
  : bar();
  */
  const inTernary = !!findParentKind(n, 205);
  if (inTernary) {
    // TODO this causes semantic changes to the code
    // codeSplitByLine.splice(line, 0, PRETTIER_IGNORE_TEXT);
  }
  return codeSplitByLine;
}
