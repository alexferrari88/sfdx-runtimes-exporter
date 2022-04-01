import { Connection } from '@salesforce/core';
// eslint-disable-next-line import/order
import * as fs from 'fs';
import { DeployResultWithSuccessfulTestResults, getDeployStatus } from './runtimes';
export type Deployment = {
  Id: string;
  CompletedDate: string;
  attributes?: unknown[];
  totalTestsTime: number;
};

export const getDeployments = async (
  connection: Connection,
  beforeDate?: Date,
  afterDate?: Date,
  latest?: boolean,
  max?: number
): Promise<Deployment[]> => {
  max = max || 10;
  if (latest && (beforeDate || afterDate)) throw new Error('Cannot use --latest and --before/--after flags together');
  if (beforeDate && afterDate) throw new Error('Cannot specify both --before and --after');
  if (beforeDate > afterDate) throw new Error('--after must be after --before');

  let query =
    "SELECT Id, CompletedDate FROM DeployRequest WHERE TestLevel != 'NoTestRun' AND Status = 'Succeeded' AND NumberTestsTotal != 0";
  if (beforeDate) query += ` AND CompletedDate <= ${beforeDate.toISOString()}`;
  if (afterDate) query += ` AND CompletedDate >= ${afterDate.toISOString()}`;
  if (latest) query += ' ORDER BY CompletedDate DESC';
  if (max) query += ` LIMIT ${max}`;

  const deployments = await connection.tooling.query<Deployment>(query);
  if (deployments.records.length === 0) throw new Error('No deployments found');
  const results: Deployment[] = [];
  const deployStatuses: Array<Promise<DeployResultWithSuccessfulTestResults>> = [];
  for (const deployment of deployments.records) {
    // results.push({
    //   Id: deployment.Id,
    //   CompletedDate: deployment.CompletedDate,
    //   totalTestsTime: Math.round((await getDeployStatus(connection, deployment.Id)).details.runTestResult.totalTime),
    // });
    deployStatuses.push(getDeployStatus(connection, deployment.Id));
  }
  try {
    const deployStatusResults = await Promise.all(deployStatuses);
    for (const deployStatus of deployStatusResults) {
      results.push({
        Id: deployStatus.id,
        CompletedDate: deployStatus.completedDate,
        totalTestsTime: Math.round(deployStatus.details.runTestResult.totalTime),
      });
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error getting all deploy statuses', error);
    fs.writeFileSync(`partial-list-${new Date().toISOString()}.json`, JSON.stringify(results, null, 2));
    throw error;
  }

  return results;
};
