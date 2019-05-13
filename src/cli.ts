import program from "commander";
import { createTSCompiler } from "./tsCompilerHelpers";
import stripComments from "./stripCommentsRunner";
import ignoreErrors from "./ignoreErrorsRunner";
import ignoreFileErrors from "./ignoreFileErrorsRunner";
import convertCodebase from "./convertCodebase";
import checkTypes from "./checkRunner";

const rootDir = process.cwd();

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
    console.log("Stripping comments from files...");
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
      console.log("Converting the codebase from Flow to Typescript");

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
    console.log("Ignoring Typescript errors...");

    // TODO exclude that file we were skipping before
    ignoreErrors(filePaths, !!cmd.commit);
  });

program
  .command("ignore-file-errors")
  .option("-c, --commit")
  .action((cmd: { commit: boolean | undefined }) => {
    console.log("Inserting custom ts-ignore pragmas...");
    ignoreFileErrors(filePaths, !!cmd.commit);
  });

program
  .command("check-types")
  .option("-c, --commit")
  .action(() => {
    console.log("Checking Typescript types and skipping ignored files...");

    checkTypes(filePaths);
  });

program.parse(process.argv);
