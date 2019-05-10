import { groupBy } from "lodash";
import { readFileSync, writeFileSync } from "fs";
import commit from "./commitAll";
import { getDiagnostics, getFilePath } from "./tsCompilerHelpers";

export const ERROR_COMMENT = "// @quizlet-ts-ignore-errors:";

const successFiles: string[] = [];
const errorFiles: string[] = [];

export default async function run(shouldCommit: boolean): Promise<void> {
  const diagnostics = await getDiagnostics();
  const diagnosticsWithFile = diagnostics.filter(d => !!d.file);
  const diagnosticsGroupedByFile = groupBy(
    diagnosticsWithFile,
    d => d.file!.fileName
  );

  Object.keys(diagnosticsGroupedByFile).forEach(async (fileName, i, arr) => {
    const fileDiagnostics = diagnosticsGroupedByFile[fileName];
    console.log(
      `${i} of ${arr.length - 1}: Ignoring ${
        fileDiagnostics.length
      } ts-error(s) in ${fileName}`
    );
    try {
      const filePath = getFilePath(fileDiagnostics[0]);
      let codeSplitByLine = readFileSync(filePath, "utf8").split("\n");
      codeSplitByLine.unshift(`${ERROR_COMMENT}${fileDiagnostics.length}`);
      const fileData = codeSplitByLine.join("\n");
      writeFileSync(filePath, fileData);
      successFiles.push(fileName);
    } catch (e) {
      console.log(e);
      errorFiles.push(fileName);
    }
  });

  if (shouldCommit) {
    await commit("Ignore File Errors");
  }

  console.log(`${successFiles.length} files with errors ignored successfully.`);
  console.log(`${errorFiles.length} errors:`);
  console.log(errorFiles);
}
