#!/usr/bin/env node

import { ProgressMessage, writeProgressMessage } from 'apply-config';
import { blue, red, yellow } from 'chalk';
import { stat } from 'fs';
import mkdirp from 'mkdirp';
import { basename } from 'path';
import { parse } from 'ts-command-line-args';
import { promisify } from 'util';
import { parseArgs, parseOptions } from './constants';
import { FileCopyTest, FileCopyTestArguments, FileDetails, TestResult } from './contracts';
import { average, deleteFolder, getFileDetails, parseBytes } from './helpers';
import { fsCopyFile } from './tests/fs-copy';
import { winNative } from './tests/win-native';
import formatFileSize from 'pretty-file-size';
import { createReadStreamTest } from './tests/read-stream';
import { linuxNative } from './tests/linux-native';
import { macNative } from './tests/mac-native';
import { Table } from 'console-table-printer';

const statPromisify = promisify(stat);

async function runTests() {
    const args = parse<FileCopyTestArguments>(parseArgs, parseOptions);
    const bytesArray = args.highWaterMark
        .reduce((all, current) => [...all, ...current.split(',')], new Array<string>())
        .map(parseBytes);

    await createDestinationFolder(args.destinationFolder, args.force);

    const fileDetails = await getFileDetails(args.sourceFile);

    console.log(' ');

    console.log(blue(`Copying '${basename(args.sourceFile)}' (${formatFileSize(fileDetails.size)})`));

    console.log(' ');

    const results = await runSets(args, fileDetails, bytesArray);

    await cleanUp(args.destinationFolder);

    printResult(results);
}

async function runSets(args: FileCopyTestArguments, fileDetails: FileDetails, bytesArray: number[]) {
    const testSuite = [];

    if (!args.disableNativeTests && !args.disableNativeWindowsTest) testSuite.push(winNative);
    if (!args.disableNativeTests && !args.disableNativeLinuxTest) testSuite.push(linuxNative);
    if (!args.disableNativeTests && !args.disableNativeMacTest) testSuite.push(macNative);
    if (!args.disableCopyFileTest) testSuite.push(fsCopyFile);
    if (!args.disableStreamTests && !args.disableDefaultStreamTest) testSuite.push(createReadStreamTest());
    if (!args.disableStreamTests && !args.disableCustomStreamTests)
        bytesArray.forEach((bytes) => testSuite.push(createReadStreamTest(bytes)));

    const tests = testSuite.filter((test) => test.canRun);
    const results: TestResult[] = [];

    for (const test of tests) {
        const result = await runSet(test, args, fileDetails);
        results.push(result);
    }

    return results;
}

function printResult(results: TestResult[]) {
    const resultsTable = new Table({
        columns: [
            { name: 'name', title: 'Name', color: 'blue' },
            { name: 'average', title: 'Average' },
            { name: 'best', title: 'Best' },
        ],
    });

    results.forEach((result) =>
        resultsTable.addRow({
            name: result.name,
            average: `${result.average.toFixed(2)}s`,
            best: `${result.best.toFixed(2)}s`,
        })
    );

    resultsTable.printTable();
}

async function runSet(test: FileCopyTest, args: FileCopyTestArguments, fileDetails: FileDetails): Promise<TestResult> {
    const message = `Running Test: ${test.name}`;

    const runs: number[] = [];

    console.log(blue(test.name));
    console.log(yellow(test.description));

    for (let index = 0; index < args.testsInSet; index++) {
        const runCount = index + 1;
        const runMessage = `${message} ${runCount}/${args.testsInSet}`;
        const progress = writeProgressMessage(runMessage, true);
        const result = (await runTest(test, args, fileDetails, runCount, progress)) / 1000;
        runs.push(result);
        progress.complete(true, `${runMessage} (${result.toFixed(1)}s)`);

        await new Promise((resolve) => setTimeout(resolve, 500)); // wait between each test
    }

    const { averageTime, bestTime, averageSpeed, bestSpeed, averageDisplay, bestDisplay } = calculateStats(
        runs,
        fileDetails
    );

    console.log(blue(`${test.name} Average: ${averageDisplay} (${averageSpeed}) Best: ${bestDisplay} (${bestSpeed})`));

    console.log(' ');
    return { runs, average: averageTime, best: bestTime, name: test.name };
}

function calculateStats(runs: number[], fileDetails: FileDetails) {
    const averageTime = average(...runs);
    const averageSpeed = formatFileSize(fileDetails.size / averageTime);
    const bestTime = Math.min(...runs);
    const bestSpeed = formatFileSize(fileDetails.size / bestTime);

    return {
        averageDisplay: `${averageTime.toFixed(1)}s`,
        bestDisplay: `${bestTime.toFixed(1)}s`,
        averageSpeed: `${averageSpeed}/s`,
        bestSpeed: `${bestSpeed}/s`,
        bestTime,
        averageTime,
    };
}

async function runTest(
    test: FileCopyTest,
    args: FileCopyTestArguments,
    fileDetails: FileDetails,
    runCount: number,
    progress: ProgressMessage
) {
    const testStart = Date.now();
    await test.perform(args, fileDetails, runCount, progress);
    const elapsed = Date.now() - testStart;
    return elapsed;
}

async function createDestinationFolder(path: string, force: boolean) {
    let progress = writeProgressMessage(`Checking Destination`, false, blue);

    const destinationStat = await statPromisify(path).catch(() => {
        return undefined; // folder does not exist. Ok to carry on
    });

    progress.complete();

    if (destinationStat != null) {
        if (force) {
            await cleanUp(path);
        } else {
            console.log(
                red(
                    `Destination '${path}' already exists. Please provide a folder path that does not exist. The folder will be deleted after the test. Run with '-f' to force and delete this folder.`
                )
            );
            process.exit(1);
        }
    }

    progress = writeProgressMessage(`Creating '${path}'`, false, blue);

    await mkdirp(path).catch((error) => {
        throw error;
    });

    progress.complete();
}

async function cleanUp(path: string) {
    const progress = writeProgressMessage(`Deleting '${path}'`, true, blue);

    await deleteFolder(path).catch((error) => {
        throw error;
    });

    progress.complete();
}

runTests();
