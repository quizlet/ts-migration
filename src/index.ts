import program from "commander";
import createTSCompiler from "./tsCompilerHelpers";
import stripComments from "./stripCommentsRunner";
import convertCodebase from "./convertCodebase";

const rootDir = "../quizlet/";

const { configJSON } = createTSCompiler(rootDir);

const filePaths = {
  rootDir,
  include: configJSON.config.include,
  exclude: ["/vendor/", "i18n/findMessageAndLocale"],
  extensions: [".ts", ".tsx"]
};

program
  .command("strip-comments")
  .option("-c, --commit")
  .action((cmd: { commit: boolean }) => {
    console.log(cmd);
    stripComments(filePaths, cmd.commit);
  });

program
  .command("convert-codebase")
  .option("-c, --commit")
  .option(
    "--files <list>",
    "A space-seperated list of files to convert",
    (f: string) => f.split(" ")
  )
  .action((cmd: { commit: boolean; files: string[] | undefined }) => {
    console.log(cmd);

    convertCodebase(filePaths, cmd.commit, cmd.files);
  });

program.parse(process.argv);
