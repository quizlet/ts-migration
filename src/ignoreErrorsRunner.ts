import { groupBy, uniqBy } from "lodash";
import { readFileSync, writeFileSync } from "fs";
import insertIgnore from "./insertIgnore";
import commit from "./commitAll";
import prettierFormat from "./prettierFormat";
import { getFilePath, getDiagnostics } from "./tsCompilerHelpers";

const successFiles: string[] = [];
const errorFiles: string[] = [];

export default async function compile(
  rootDir: string,
  shouldCommit: boolean
): Promise<void> {
  const diagnostics = await getDiagnostics();
  const diagnosticsWithFile = diagnostics.filter(d => !!d.file);
  const diagnosticsGroupedByFile = groupBy(
    diagnosticsWithFile,
    d => d.file!.fileName
  );

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
      const filePath = getFilePath(fileDiagnostics[0]);
      let codeSplitByLine = readFileSync(filePath, "utf8").split("\n");
      fileDiagnostics.forEach((diagnostic, _errorIndex) => {
        codeSplitByLine = insertIgnore(diagnostic, codeSplitByLine);
      });
      const fileData = codeSplitByLine.join("\n");
      const formattedFileData = prettierFormat(fileData, rootDir);
      writeFileSync(filePath, formattedFileData);
      successFiles.push(fileName);
    } catch (e) {
      console.log(e);
      errorFiles.push(fileName);
    }
  });

  if (shouldCommit) {
    await commit("Ignore errors");
  }

  console.log(`${successFiles.length} files with errors ignored successfully.`);
  console.log(`${errorFiles.length} errors:`);
  console.log(errorFiles);
}
