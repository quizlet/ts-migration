#!/usr/bin/env node
import ts from "typescript";
export default function createCompiler(rootDir: string): {
    configJSON: {
        config?: any;
        error?: ts.Diagnostic | undefined;
    };
    compilerOptions: {
        options: ts.CompilerOptions;
        errors: ts.Diagnostic[];
    };
};
