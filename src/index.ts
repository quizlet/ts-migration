import program from "commander";
import { createTSCompiler } from "./tsCompilerHelpers";
import stripComments from "./stripCommentsRunner";
import ignoreErrors from "./ignoreErrorsRunner";
import ignoreFileErrors from "./ignoreFileErrorsRunner";
import convertCodebase from "./convertCodebase";
import checkTypes from "./checkRunner";

const rootDir = "../quizlet/";

const { configJSON } = createTSCompiler(rootDir);

export interface FilePaths {
  rootDir: string;
  include: string[];
  exclude: string[];
  extensions: string[];
}

const filePaths: FilePaths = {
  rootDir,
  include: configJSON.config.include,
  exclude: ["/vendor/", "i18n/findMessageAndLocale"],
  extensions: [".ts", ".tsx"]
};

program
  .command("strip-comments")
  .option("-c, --commit")
  .action((cmd: { commit: boolean | undefined }) => {
    stripComments(filePaths, !!cmd.commit);
  });

program
  .command("convert-codebase")
  .option("-c, --commit")
  // TODO support directory?
  // TODO this might not work
  .option(
    "--files <list>",
    "A space-seperated list of files to convert",
    (f: string) => f.split(" ")
  )
  .action(
    (cmd: { commit: boolean | undefined; files: string[] | undefined }) => {
      convertCodebase(
        { ...filePaths, extensions: [".js", ".jsx"] },
        !!cmd.commit,
        cmd.files
      );
    }
  );

program
  .command("ignore-errors")
  .option("-c, --commit")
  .action((cmd: { commit: boolean | undefined }) => {
    // TODO exclude that file we were skipping before
    ignoreErrors(filePaths, !!cmd.commit);
  });

program
  .command("ignore-file-errors")
  .option("-c, --commit")
  .action((cmd: { commit: boolean | undefined }) => {
    ignoreFileErrors(filePaths, !!cmd.commit);
  });

program
  .command("check-types")
  .option("-c, --commit")
  .action(() => {
    checkTypes(filePaths);
  });

program.parse(process.argv);
