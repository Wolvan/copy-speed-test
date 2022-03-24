import { FileCopyTest, FileCopyTestArguments, FileDetails } from '../contracts';
import { join } from 'path';
import { createReadStream, createWriteStream } from 'fs';
import progress from 'progress-stream';
import { ProgressMessage } from 'apply-config';
import formatFileSize from 'pretty-file-size';

export function createReadStreamTest(highWaterMark?: number, skipProgressUpdate = false): FileCopyTest {
    const waterMark =
        highWaterMark != null ? formatFileSize(highWaterMark, 0) : `default (${formatFileSize(1024 * 64, 0)})`;
    const name = `fs createReadStream: ${waterMark}${skipProgressUpdate ? ' (no progress)' : ''}`;
    return {
        canRun: true,
        description: `fs.createReadStream(sourceFile)${
            skipProgressUpdate ? '' : '.pipe(progress)'
        }.pipe(fs.createWriteStream(destinationPath))`,
        name,
        perform: (
            args: FileCopyTestArguments,
            fileDetails: FileDetails,
            runCount: number,
            progressMessage: ProgressMessage
        ) => {
            const destination = join(
                args.destinationFolder,
                `${fileDetails.name}_fs-createReadStream${skipProgressUpdate ? '-noprog' : ''}_${runCount}${
                    fileDetails.extension
                }`
            );
            const baseMessage = progressMessage.getMessage();

            return new Promise((resolve, reject) => {
                const progressStream = progress({
                    length: fileDetails.size,
                    time: 100,
                });

                const readStream = createReadStream(args.sourceFile, { highWaterMark });
                const writeStream = createWriteStream(destination);

                readStream.on('error', reject);
                writeStream.on('error', reject);
                writeStream.on('close', resolve);
                progressStream.on('progress', (progress) => {
                    const message = `${baseMessage} ${progress.percentage.toFixed(2)}%`;
                    progressMessage.updateMessage(message, false);
                });

                if (!skipProgressUpdate) readStream.pipe(progressStream).pipe(writeStream);
                else readStream.pipe(writeStream);
            });
        },
    };
}
