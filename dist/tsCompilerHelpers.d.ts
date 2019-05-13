import ts from "typescript";
import { FilePaths } from "./cli";
export declare function createTSCompiler(rootDir: string): {
    configJSON: {
        config?: any;
        error?: ts.Diagnostic | undefined;
    };
    compilerOptions: {
        options: ts.CompilerOptions;
        errors: ts.Diagnostic[];
    };
};
export declare function getDiagnostics(paths: FilePaths): Promise<readonly ts.Diagnostic[]>;
export declare function getFilePath(paths: FilePaths, diagnostic: ts.Diagnostic): string;
