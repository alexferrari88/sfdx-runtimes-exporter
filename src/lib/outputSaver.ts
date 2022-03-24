import * as fs from 'fs';
import { TestRunTimesData } from './runtimes';

export type outputHandlerFunction = (data: TestRunTimesData[], target: string) => void;
type outputOptions = 'csv' | 'S3' | 'dynamoDB';
export type outputHandlersRegistry = { [key in outputOptions]: outputHandlerFunction };

export const exportCSV = (data: TestRunTimesData[], target: string): void => {
  const output: string[][] = [];
  output.push(['Class Name', 'Method Name', 'Run Time (ms)']);
  const dataArray = data.map((v) => [v.className, v.methodName, v.runTime.toString()]);
  output.push(...dataArray);
  const csv = output.map((v) => v.join(',')).join('\n');
  fs.writeFileSync(target, csv);
};

export const exportToS3 = (data: TestRunTimesData[], target: string): void => {
  throw new Error('Not implemented');
};

export const exportToDynamoDB = (data: TestRunTimesData[], target: string): void => {
  throw new Error('Not implemented');
};
