import program from "commander";
import { createTSCompiler } from "./tsCompilerHelpers";
import stripComments from "./stripCommentsRunner";
import ignoreErrors from "./ignoreErrorsRunner";
import ignoreFileErrors from "./ignoreFileErrorsRunner";
import convertCodebase from "./convertCodebase";
import checkTypes from "./checkRunner";

// const rootDir = process.cwd();
const rootDir = "../quizlet";

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
  exclude: [],
  extensions: [".ts", ".tsx"]
};

program
  .command("strip-comments")
  .option("-c, --commit")
  .option(
    "--comments <list>",
    "A comma-seperated list of comments to strip. Must start with `//`",
    (f: string) => f.split(",")
  )
  .action(
    (cmd: { commit: boolean | undefined; comments: string[] | undefined }) => {
      console.log("Stripping comments from files...");
      if (cmd.comments) console.log("Removing comments: ", cmd.comments);
      stripComments(filePaths, cmd.comments, !!cmd.commit);
    }
  );

program
  .command("convert-codebase")
  .option("-c, --commit")
  // TODO support directory?
  .option(
    "--files <list>",
    "A comma-seperated list of files to convert",
    (f: string) => f.split(",")
  )
  .option(
    "--exclude <list>",
    "A comma-seperated list of strings to exclude",
    (f: string) => f.split(",")
  )
  .action(
    (cmd: {
      commit: boolean | undefined;
      files: string[] | undefined;
      exclude: string[] | undefined;
    }) => {
      console.log("Converting the codebase from Flow to Typescript");
      const paths = {
        ...filePaths,
        exclude: [...filePaths.exclude, ...(cmd.exclude || [])],
        extensions: [".js", ".jsx"]
      };
      console.log(paths);
      convertCodebase(paths, !!cmd.commit, cmd.files);
    }
  );

program
  .command("ignore-errors")
  .option("-c, --commit")
  .option(
    "--exclude <list>",
    "A comma-seperated list of strings to exclude",
    (f: string) => f.split(",")
  )
  .action(
    (cmd: { commit: boolean | undefined; exclude: string[] | undefined }) => {
      console.log("Ignoring Typescript errors...");
      const paths = {
        ...filePaths,
        exclude: [...filePaths.exclude, ...(cmd.exclude || [])]
      };
      console.log(paths);

      ignoreErrors(paths, !!cmd.commit);
    }
  );

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
