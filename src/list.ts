import { Connection } from '@salesforce/core';

export type Deployment = {
  Id: string;
  CompletedDate: string;
  attributes?: unknown[];
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

  let query = "SELECT Id, CompletedDate FROM DeployRequest WHERE TestLevel != 'NoTestRun' AND Status = 'Succeeded'";
  if (beforeDate) query += ` AND CompletedDate <= ${beforeDate.toISOString()}`;
  if (afterDate) query += ` AND CompletedDate >= ${afterDate.toISOString()}`;
  if (latest) query += ' ORDER BY CompletedDate DESC';
  if (max) query += ` LIMIT ${max}`;

  const results = await connection.tooling.query<Deployment>(query);
  if (results.records.length === 0) throw new Error('No deployments found');
  return results.records.map((record) => ({ Id: record.Id, CompletedDate: record.CompletedDate }));
};
