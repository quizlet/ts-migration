import * as babel from "@babel/core";
export declare const babelOptions: (rootDir: string) => babel.TransformOptions;
export default function convert(files: string[], rootDir: string): Promise<{
    successFiles: string[];
    errorFiles: string[];
}>;
