import { Connection } from '@salesforce/core';
import { DeployResult } from 'jsforce';

type ApexSuccessfulTestResult = {
  namespace?: string;
  name: string;
  methodName: string;
  id: string;
  time: number;
  seeAllData?: boolean;
};

export type DeployResultWithSuccessfulTestResults = DeployResult & {
  details: {
    runTestResult: {
      successes: ApexSuccessfulTestResult[];
      totalTime: number;
    };
  };
};

export interface TestRunTimesData {
  className: string;
  methodName: string;
  runTime: number;
}

export const getDeployStatus = async (
  connection: Connection,
  deploymentId: string
): Promise<DeployResultWithSuccessfulTestResults> => {
  const deployResult = (await connection.metadata.checkDeployStatus(
    deploymentId,
    true
  )) as DeployResultWithSuccessfulTestResults;

  if (!deployResult.success) {
    throw new Error("Can't get test run times for failed deployments");
  }

  return deployResult;
};
export const getTestRunTimes = (
  deployResult: DeployResultWithSuccessfulTestResults,
  threshold?: number
): TestRunTimesData[] => {
  let testResults: ApexSuccessfulTestResult[] = deployResult.details?.runTestResult?.successes;

  if (testResults.length === 0) throw new Error(`No tests were run in deployment ${deployResult.id}`);

  if (threshold) {
    testResults = testResults.filter((testResult) => testResult.time >= threshold);
  }

  testResults.sort((a, b) => b.time - a.time);

  const output = testResults.map((v) => {
    return { className: v.name, methodName: v.methodName, runTime: Math.round(v.time) };
  }) as TestRunTimesData[];

  return output;
};
