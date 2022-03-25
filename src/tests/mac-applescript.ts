import { exec } from 'child_process';
import { FileCopyTest, FileCopyTestArguments, FileDetails } from '../contracts';
import { join, parse } from 'path';
import { rename } from 'fs';

export const macFinderCopy: FileCopyTest = {
    canRun: process.platform === 'darwin',
    description: `osascript finder copying`,
    name: 'Finder Copy',
    perform: (args: FileCopyTestArguments, fileDetails: FileDetails, runCount: number) =>
        new Promise((resolve, reject) => {
            const fileName = `${fileDetails.name}_macFinder_${runCount}${fileDetails.extension}`;
            const oldFilename = parse(args.sourceFile).base;
            exec(
                `osascript -e "tell application \\"Finder\\" to duplicate POSIX file \\"${args.sourceFile}\\" to POSIX file \\"${args.destinationFolder}\\""`,
                (error) => {
                    if (error) {
                        return reject(error);
                    }
                    rename(join(args.destinationFolder, oldFilename), join(args.destinationFolder, fileName), (err) => {
                        if (err) return reject(error);
                        else resolve();
                    });
                }
            );
        }),
};
