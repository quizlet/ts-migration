"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = __importDefault(require("commander"));
const tsCompilerHelpers_1 = require("./tsCompilerHelpers");
const stripCommentsRunner_1 = __importDefault(require("./stripCommentsRunner"));
const ignoreErrorsRunner_1 = __importDefault(require("./ignoreErrorsRunner"));
const ignoreFileErrorsRunner_1 = __importDefault(require("./ignoreFileErrorsRunner"));
const convertCodebase_1 = __importDefault(require("./convertCodebase"));
const checkRunner_1 = __importDefault(require("./checkRunner"));
const rootDir = process.cwd();
const { configJSON } = tsCompilerHelpers_1.createTSCompiler(rootDir);
const filePaths = {
    rootDir,
    include: configJSON.config.include,
    exclude: ["/vendor/", "i18n/findMessageAndLocale"],
    extensions: [".ts", ".tsx"]
};
commander_1.default
    .command("strip-comments")
    .option("-c, --commit")
    .action((cmd) => {
    console.log("Stripping comments from files...");
    stripCommentsRunner_1.default(filePaths, !!cmd.commit);
});
commander_1.default
    .command("convert-codebase")
    .option("-c, --commit")
    // TODO support directory?
    // TODO this might not work
    .option("--files <list>", "A space-seperated list of files to convert", (f) => f.split(" "))
    .action((cmd) => {
    console.log("Converting the codebase from Flow to Typescript");
    convertCodebase_1.default(Object.assign({}, filePaths, { extensions: [".js", ".jsx"] }), !!cmd.commit, cmd.files);
});
commander_1.default
    .command("ignore-errors")
    .option("-c, --commit")
    .action((cmd) => {
    console.log("Ignoring Typescript errors...");
    // TODO exclude that file we were skipping before
    ignoreErrorsRunner_1.default(filePaths, !!cmd.commit);
});
commander_1.default
    .command("ignore-file-errors")
    .option("-c, --commit")
    .action((cmd) => {
    console.log("Inserting custom ts-ignore pragmas...");
    ignoreFileErrorsRunner_1.default(filePaths, !!cmd.commit);
});
commander_1.default
    .command("check-types")
    .option("-c, --commit")
    .action(() => {
    console.log("Checking Typescript types and skipping ignored files...");
    checkRunner_1.default(filePaths);
});
commander_1.default.parse(process.argv);
//# sourceMappingURL=cli.js.map