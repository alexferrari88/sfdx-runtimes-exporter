import { Connection } from '@salesforce/core';
import { getDeployStatus } from './runtimes';

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
  for (const deployment of deployments.records) {
    results.push({
      Id: deployment.Id,
      CompletedDate: deployment.CompletedDate,
      totalTestsTime: Math.round((await getDeployStatus(connection, deployment.Id)).details.runTestResult.totalTime),
    });
  }

  return results;
};
