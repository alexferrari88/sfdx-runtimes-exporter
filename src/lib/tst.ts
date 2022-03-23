﻿import { Connection } from '@salesforce/core';
import { DeployResult } from 'jsforce';

type ApexSuccessfulTestResult = {
  namespace?: string;
  name: string;
  methodName: string;
  id: string;
  time: number;
  seeAllData?: boolean;
};

type DeployResultWithSuccessfulTestResults = DeployResult & {
  details: {
    runTestResult: {
      successes: ApexSuccessfulTestResult[];
    };
  };
};

export interface TestRunTimesData {
  className: string;
  methodName: string;
  runTime: number;
}

export const getTestRunTimes = async (connection: Connection, deploymentId: string): Promise<TestRunTimesData[]> => {
  const deployResult = (await connection.metadata.checkDeployStatus(
    deploymentId,
    true
  )) as DeployResultWithSuccessfulTestResults;

  if (!deployResult.success) {
    throw new Error("Can't get test run times for failed deployments");
  }

  const testResults: ApexSuccessfulTestResult[] = deployResult.details?.runTestResult?.successes;

  if (testResults.length === 0) throw new Error(`No tests were run in deployment ${deploymentId}`);

  testResults.sort((a, b) => b.time - a.time);

  // const output: Array<Array<string | number>> = [
  //   ['Class Name', 'Method Name', 'Time (ms)'],
  // ]
  const output = testResults.map((v) => {
    return { className: v.name, methodName: v.methodName, runTime: v.time };
  }) as TestRunTimesData[];
  // await fireHook('onTestRunTimes', output)
  // return output

  return output;
};