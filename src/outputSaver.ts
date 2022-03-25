import * as fs from 'fs';
import * as path from 'path';

export type outputExporterFunction<T> = (data: T[], target: string, preProcessor?: preProcessorFunction<T>) => void;
export type preProcessorFunction<T> = (data: T[]) => unknown;
type outputOptions = 'csv' | 'json' | 's3' | 'dynamodb';
export type outputExporterFactoryType = { [key in outputOptions]: outputExporterFunction<unknown> };

export type exportLocationMakerFunction = (
  folder: string,
  prefix?: string,
  suffix?: string,
  extension?: string
) => string;
export type exportLocationMakerFactoryType = { [key in outputOptions]: exportLocationMakerFunction };

export type processorFactoryType<T> = { [key in outputOptions]: preProcessorFunction<T> };

type ArgumentTypes<F extends (...args: unknown[]) => unknown> = F extends (...args: infer A) => unknown ? A : never;

export const makeFileName = (...args: ArgumentTypes<exportLocationMakerFunction>): string => {
  // eslint-disable-next-line prefer-const
  let [folder, prefix, suffix, extension] = args;
  folder = folder || '.';
  prefix = prefix ? `${prefix}-` : '';
  if (!suffix) {
    suffix = new Date().toISOString().replace(/:/g, '-');
  } else if (!isNaN(Date.parse(suffix))) suffix = new Date(suffix).toISOString().replace(/:/g, '-');
  const fileName = `${prefix}${suffix}.${extension}`;
  return path.resolve(folder, fileName);
};

export const makeS3FileName = (...args: ArgumentTypes<exportLocationMakerFunction>): string => {
  throw new Error('Not implemented');
};

export const makeDynamoDBTarget = (...args: ArgumentTypes<exportLocationMakerFunction>): string => {
  throw new Error('Not implemented');
};

export const exportFileToDisk = <T>(...args: ArgumentTypes<outputExporterFunction<T>>): void => {
  const [data, target, preProcessor] = args;
  if (!preProcessor) {
    fs.writeFileSync(target, JSON.stringify(data));
    return;
  }
  const csv = preProcessor(data) as string;
  fs.writeFileSync(target, csv);
};

export const exportToS3 = <T>(...args: ArgumentTypes<outputExporterFunction<T>>): void => {
  throw new Error('Not implemented');
};

export const exportToDynamoDB = <T>(...args: ArgumentTypes<outputExporterFunction<T>>): void => {
  throw new Error('Not implemented');
};

export const outputExporterFactory: outputExporterFactoryType = {
  csv: exportFileToDisk,
  json: exportFileToDisk,
  s3: exportToS3,
  dynamodb: exportToDynamoDB,
};

export const exportLocationMakerFactory: exportLocationMakerFactoryType = {
  csv: makeFileName,
  json: makeFileName,
  s3: makeS3FileName,
  dynamodb: makeDynamoDBTarget,
};
