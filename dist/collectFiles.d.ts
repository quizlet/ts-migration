export default function collectFiles(paths: {
    rootDir: string;
    include: string[];
    exclude: string[];
    extensions: string[];
}): Promise<string[]>;
