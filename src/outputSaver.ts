import * as fs from 'fs';
import * as path from 'path';
import { TestRunTimesData } from './runtimes';

export type outputHandlerFunction = (
  deploymentId: string,
  completedDate: string,
  data: TestRunTimesData[],
  target: string
) => void;
type outputOptions = 'csv' | 'json' | 's3' | 'dynamodb';
export type outputHandlersRegistry = { [key in outputOptions]: outputHandlerFunction };

const makeFileName = (folder: string, deploymentId: string, completedDate: string, extension: string): string => {
  const date = new Date(completedDate);
  const dateString = date.toISOString().replace(/:/g, '-');
  const fileName = `${deploymentId}-${dateString}.${extension}`;
  return path.resolve(folder, fileName);
};

export const exportCSV = (
  deploymentId: string,
  completedDate: string,
  data: TestRunTimesData[],
  target: string
): void => {
  const output: string[][] = [];
  output.push(['Class Name', 'Method Name', 'Run Time (ms)']);
  const dataArray = data.map((v) => [v.className, v.methodName, v.runTime.toString()]);
  output.push(...dataArray);
  const csv = output.map((v) => v.join(',')).join('\n');
  const finalPath = makeFileName(target || process.cwd(), deploymentId, completedDate, 'csv');
  fs.writeFileSync(finalPath, csv);
};

export const exportJSON = (
  deploymentId: string,
  completedDate: string,
  data: TestRunTimesData[],
  target: string
): void => {
  const finalPath = makeFileName(target || process.cwd(), deploymentId, completedDate, 'json');
  fs.writeFileSync(finalPath, JSON.stringify(data));
};

export const exportToS3 = (
  deploymentId: string,
  completedDate: string,
  data: TestRunTimesData[],
  target: string
): void => {
  throw new Error('Not implemented');
};

export const exportToDynamoDB = (
  deploymentId: string,
  completedDate: string,
  data: TestRunTimesData[],
  target: string
): void => {
  throw new Error('Not implemented');
};
