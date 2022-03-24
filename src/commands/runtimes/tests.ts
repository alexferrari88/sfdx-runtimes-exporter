// prettier-ignore
import { flags, SfdxCommand } from '@salesforce/command';
import { Messages, SfdxError } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
// eslint-disable-next-line import/order
import * as os from 'os';
import {
  exportCSV,
  exportJSON,
  exportToDynamoDB,
  exportToS3,
  outputHandlerFunction,
  outputHandlersRegistry,
} from '../../outputSaver';
import { getDeployStatus, getTestRunTimes } from '../../runtimes';

// Initialize Messages with the current plugin directory
Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = Messages.loadMessages('sfdx-runtimes-exporter', 'runtimes.tests');

export default class Tst extends SfdxCommand {
  public static description = messages.getMessage('commandDescription');

  public static examples = messages.getMessage('examples').split(os.EOL);

  protected static flagsConfig = {
    deployment: flags.id({
      char: 'i',
      description: messages.getMessage('deploymentFlagDescription'),
      required: true,
    }),
    output: flags.enum({
      char: 'o',
      description: messages.getMessage('outputFlagDescription'),
      options: messages.getMessage('outputFlagOptions').split(','),
      default: messages.getMessage('outputFlagDefaultOption'),
    }),
    target: flags.string({
      char: 'd',
      description: messages.getMessage('targetFlagDescription'),
    }),
    threshold: flags.string({
      char: 't',
      description: messages.getMessage('thresholdFlagDescription'),
    }),
  };
  protected static requiresUsername = true;

  public async run(): Promise<AnyJson> {
    const deploymentId = this.flags.deployment as string;
    const outputFlag = (this.flags.output as string).toLowerCase();
    const targetFlag = this.flags.target as string;
    const threshold = this.flags.threshold ? parseInt(this.flags.threshold as string, 10) : undefined;

    // this.org is guaranteed because requiresUsername=true, as opposed to supportsUsername
    const conn = this.org.getConnection();

    try {
      const deployResult = await getDeployStatus(conn, deploymentId);
      const testRunTimes = getTestRunTimes(deployResult, threshold);
      const jsonData = JSON.stringify({ deploymentId: testRunTimes });

      if (!outputFlag) return jsonData;

      const outputHandlers: outputHandlersRegistry = {
        csv: exportCSV,
        json: exportJSON,
        s3: exportToS3,
        dynamodb: exportToDynamoDB,
      };

      const outputHandler = outputHandlers[outputFlag] as outputHandlerFunction;

      outputHandler(deploymentId, deployResult.completedDate, testRunTimes, targetFlag);

      // Return an object to be displayed with --json
      return jsonData;
    } catch (error) {
      throw new SfdxError(error);
    }
  }
}
