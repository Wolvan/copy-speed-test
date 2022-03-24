import rimraf from 'rimraf';
import { FileDetails } from './contracts';
import { basename, extname } from 'path';
import { promisify } from 'util';
import { stat } from 'fs';

export function deleteFolder(path: string): Promise<void> {
    return new Promise((resolve, reject) => {
        rimraf(path, (error) => {
            if (error != null) {
                reject(error);
            } else {
                resolve(undefined);
            }
        });
    });
}

export function average(...values: number[]): number {
    return sum(...values) / values.length;
}

export function sum(...values: number[]): number {
    const valueOne = values.shift();
    const valueTwo = values.shift();

    if (valueOne == null) {
        return NaN;
    } else if (valueTwo == null) {
        return valueOne;
    }

    return sum(valueOne + valueTwo, ...values);
}

export async function getFileDetails(path: string): Promise<FileDetails> {
    const extension = extname(path);
    const name = basename(path, extension);

    const stats = await promisify(stat)(path);

    return {
        path,
        name,
        extension,
        size: stats.size,
    };
}

export const kilobyte = 1024;
const bytesRegExp = /^([\d.]+) ?(\w+)$/;
const unitLookup: Record<string, number> = {
    kB: kilobyte,
    MB: kilobyte * kilobyte,
    GB: kilobyte * kilobyte * kilobyte,
};

export function parseBytes(stringValue: string): number {
    const regExpResult = bytesRegExp.exec(stringValue);
    const unitValue = regExpResult != null ? unitLookup[regExpResult[2]] : undefined;
    const value = regExpResult != null ? parseFloat(regExpResult[1]) : undefined;

    if (regExpResult == null || unitValue == null || value == null || isNaN(value)) {
        throw new Error(
            `Could not parse bytes from '${stringValue}'. Should be in the form '2.3 kB'. Supported units: ${Object.keys(
                unitLookup
            )}`
        );
    }

    return value * unitValue;
}
