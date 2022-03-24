import { exec } from 'child_process';
import { FileCopyTest, FileCopyTestArguments, FileDetails } from '../contracts';
import { join } from 'path';

export const macNative: FileCopyTest = {
    canRun: process.platform === 'darwin',
    description: `child_process.exec('cp sourceFile destinationPath')`,
    name: 'Mac Native Copy',
    perform: (args: FileCopyTestArguments, fileDetails: FileDetails, runCount: number) =>
        new Promise((resolve, reject) => {
            const fileName = `${fileDetails.name}_macNative_${runCount}${fileDetails.extension}`;
            exec(`cp "${args.sourceFile}" "${join(args.destinationFolder, fileName)}"`, (error) => {
                if (error) {
                    return reject(error);
                }
                resolve();
            });
        }),
};
