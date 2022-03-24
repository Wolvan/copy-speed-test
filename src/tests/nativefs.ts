import { FileCopyTest, FileCopyTestArguments, FileDetails } from '../contracts';
import { join } from 'path';
import { ProgressMessage } from 'apply-config';

async function getNativeFsModule() {
    try {
        return await import('nativefs');
    } catch (error) {
        return null;
    }
}

export async function createNativeFSTest(): Promise<FileCopyTest> {
    const nativefs = await getNativeFsModule();
    return {
        canRun: true,
        description: `nativefs module`,
        name: 'nativefs',
        perform: (
            args: FileCopyTestArguments,
            fileDetails: FileDetails,
            runCount: number,
            progressMessage: ProgressMessage
        ) => {
            const destination = join(
                args.destinationFolder,
                `${fileDetails.name}_nativefs_${runCount}${fileDetails.extension}`
            );
            const baseMessage = progressMessage.getMessage();

            return new Promise((resolve, reject) => {
                nativefs.copy(
                    args.sourceFile,
                    destination,
                    function (copied: number, total: number) {
                        const message = `${baseMessage} ${(copied / total).toFixed(2)}%`;
                        progressMessage.updateMessage(message, false);
                    },
                    function (err: Error) {
                        if (err) reject(err);
                        else resolve();
                    }
                );
            });
        },
    };
}
