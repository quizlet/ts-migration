import ts from "typescript";
import { FilePaths } from "./index";
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
export declare function getDiagnostics(paths: FilePaths): Promise<ReadonlyArray<ts.Diagnostic>>;
export declare function getFilePath(paths: FilePaths, diagnostic: ts.Diagnostic): string;
