# Tools to facilitate Quizlet's transition from Flow to Typescript

## Installation

```
yarn add --dev quizlet/ts-migration.git[#commit]
```

### This tool assumes:

1. Typescript is installed in your codebase, and you have a `tsconfig.json` configured to suit your needs.
2. You use prettier, and you have a `.prettierrc`.

## Commands:

Once installed, you can access the tools via the binary.

Preview a conversion:

```
yarn ts-migration convert-codebase
```

Commit the conversion and rename files to `.ts[x]`:

```
yarn ts-migration --commit
```

Ignore all typescript errors:

```
yarn ts-migration ignore-errors [--commit]
```

Strip Flow comments

```
yarn ts-migration strip-comments [--commit]
```

## Custom TSC checker

We've implemented a TS typechecker that allows us to ignore all of the TS errors in a given file. It works by adding a special ignore pragma as the first line, which tells the typechecker how many type errors to expect. We ignore those errors, and only fail the typecheker if a) there are more errors than are ignored, or b) there are fewer errors than are ignored.

### Insert the ignore pragma

```
yarn ts-migration ignore-file-errors [--commit]
```

### Insert the ignore pragma

```
yarn ts-migration check-types [--commit]
```
