# Flow to Typescript Migration Tools

These are a collection of tools that we used at Quizlet when migrating from Flow to Typescript. We hope that you find these tools useful when doing your own migration, but keep in mind that they are made for the particularities of Quizlet's large codebase. You may need to modify these tools to suit your needs, but that said, they should be at the very least a good starting point.

## Installation

```
yarn add --dev quizlet/ts-migration.git[#commit]
```

### This tool assumes:

1. Typescript is installed in your codebase, and you have a `tsconfig.json` configured to suit your needs.
2. You use prettier, and you have a `.prettierrc`.

## Commands:

Once installed, you can access the tools via the binary.

### Preview a conversion (without renaming files):

```
yarn ts-migration convert-codebase
```

### Convert the codebase and rename files to `.ts[x]`:

```
yarn ts-migration convert-codebase --commit
```

In order to preserve the git history, this runs the conversion and commits the files in place, and then renames all the files in a separate commit.

### Ignore all Typescript errors:

```
yarn ts-migration ignore-errors [--commit] [--includeJSX]
```

The `--includeJSX` option can be extremely useful when you have a lot of errors you want to ignore, but will insert ignore comments in such a way that they can appear in the rendered HTML, so be sure to carefully review the output!

### Strip Flow comments

```
yarn ts-migration strip-comments [--commit]
```
