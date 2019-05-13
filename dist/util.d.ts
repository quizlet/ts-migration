export declare function asyncForEach<T>(array: Array<T>, callback: (x: T, index: number, array: Array<T>) => Promise<void>): Promise<void>;
