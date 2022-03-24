import { ProgressMessage } from 'apply-config';

export type FileCopyTestArguments = {
    sourceFile: string;
    destinationFolder: string;
    force: boolean;
    help: boolean;
    testsInSet: number;
    highWaterMark: string[];
    disableNativeTests: boolean;
    disableNativeLinuxTest: boolean;
    disableNativeWindowsTest: boolean;
    disableNativeMacTest: boolean;
    disableStreamTests: boolean;
    disableDefaultStreamTest: boolean;
    disableCustomStreamTests: boolean;
    disableCopyFileTest: boolean;
    enableSkipStreamProgressTest: boolean;
};

export type FileDetails = {
    path: string;
    name: string;
    extension: string;
    size: number;
};

export type FileCopyTest = {
    readonly name: string;
    readonly description: string;
    readonly perform: (
        args: FileCopyTestArguments,
        fileDetails: FileDetails,
        runCount: number,
        progress: ProgressMessage
    ) => Promise<void>;
    readonly canRun: boolean;
};

export type TestResult = {
    runs: number[];
    name: string;
    average: number;
    best: number;
};
