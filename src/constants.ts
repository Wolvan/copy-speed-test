import prettyFileSize from 'pretty-file-size';
import { ArgumentConfig, UsageGuideConfig, ParseOptions } from 'ts-command-line-args';
import { FileCopyTestArguments } from './contracts';

export const defaultTestsInSet = 3;

const oneMb = 1024 * 1024;
const defaultHighWaterMark = [oneMb, oneMb * 100, oneMb * 500, oneMb * 1024].map(prettyFileSize);
const defaultWatermarkString = defaultHighWaterMark.map((v) => `'${v}'`).join(', ');

export const parseArgs: ArgumentConfig<FileCopyTestArguments> = {
    destinationFolder: {
        type: String,
        alias: 'd',
        description: 'A folder to copy to. The folder should not exist. It will be deleted after the tests complete',
    },
    sourceFile: { type: String, alias: 's', description: 'The file to copy' },
    force: {
        type: Boolean,
        alias: 'f',
        description: 'Will delete the destination folder before starting if it exists.',
    },
    testsInSet: {
        type: Number,
        defaultValue: defaultTestsInSet,
        description: 'The number of times to run each test. Defaults to 3.',
    },
    highWaterMark: {
        type: String,
        multiple: true,
        defaultValue: defaultHighWaterMark,
        description: `An Array of highwatermark values to run the createReadStream test at. Defaults to [${defaultWatermarkString}]. Set multiple values as follows: '--highWaterMark="50 kB,150 MB,1 GB"'`,
    },
    disableNativeTests: {
        type: Boolean,
        defaultValue: false,
        description: 'Disable all native copy tests',
    },
    disableNativeLinuxTest: {
        type: Boolean,
        defaultValue: false,
        description: 'Disable Linux native copy test',
    },
    disableNativeWindowsTest: {
        type: Boolean,
        defaultValue: false,
        description: 'Disable Windows native copy test',
    },
    disableNativeMacTest: {
        type: Boolean,
        defaultValue: false,
        description: 'Disable MacOS native copy test',
    },
    disableStreamTests: {
        type: Boolean,
        defaultValue: false,
        description: 'Disable all stream copy tests',
    },
    disableDefaultStreamTest: {
        type: Boolean,
        defaultValue: false,
        description: 'Disable default (64kb) stream copy test',
    },
    disableCustomStreamTests: {
        type: Boolean,
        defaultValue: false,
        description: 'Disable all custom highwatermark stream copy tests',
    },
    disableCopyFileTest: {
        type: Boolean,
        defaultValue: false,
        description: 'Disable fs.copyFile test',
    },
    disableNativeFSLibraryTest: {
        type: Boolean,
        defaultValue: false,
        description: 'Disable NativeFS module test',
    },
    disableFinderTest: {
        type: Boolean,
        defaultValue: false,
        description: 'Disable copying via Finder by using applescript test',
    },
    enableSkipStreamProgressTest: {
        type: Boolean,
        defaultValue: false,
        description: 'Runs stream tests a second time but with the progress reporting disabled',
    },
    help: { type: Boolean, alias: 'h', description: 'Shows this help guide' },
};

export const parseOptions: ParseOptions<FileCopyTestArguments> = {
    helpArg: 'help',
    baseCommand: 'npx copy-speed-test',
};

export const usageGuideInfo: UsageGuideConfig<FileCopyTestArguments> = {
    arguments: parseArgs,
};
