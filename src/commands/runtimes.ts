// prettier-ignore
import { flags, SfdxCommand } from '@salesforce/command';
import { Messages, SfdxError } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
// eslint-disable-next-line import/order
import * as os from 'os';
import {
  exportLocationMakerFactory,
  exportLocationMakerFunction,
  outputExporterFactory,
  outputExporterFunction,
  processorFactoryType,
} from '../outputSaver';
import { getDeployStatus, getTestRunTimes, TestRunTimesData } from '../runtimes';

// Initialize Messages with the current plugin directory
Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = Messages.loadMessages('sfdx-runtimes-exporter', 'runtimes');

const csvMaker = (data: TestRunTimesData[]): string => {
  const output: string[][] = [];
  output.push(['Class Name', 'Method Name', 'Run Time (ms)']);
  const dataArray = data.map((v) => [v.className, v.methodName, v.runTime.toString()]);
  output.push(...dataArray);
  return output.map((v) => v.join(',')).join('\n');
};

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
    threshold: flags.integer({
      char: 't',
      description: messages.getMessage('thresholdFlagDescription'),
      min: 1,
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

      const processorFactory: processorFactoryType<TestRunTimesData> = {
        csv: csvMaker,
        json: JSON.stringify,
        s3: null,
        dynamodb: null,
      };

      const outputExporter = outputExporterFactory[outputFlag] as outputExporterFunction<TestRunTimesData>;
      const exportLocationMaker = exportLocationMakerFactory[outputFlag] as exportLocationMakerFunction;
      const processor = processorFactory[outputFlag] as (data: TestRunTimesData[]) => string;
      const finalPath = exportLocationMaker(targetFlag, deploymentId, deployResult.completedDate, outputFlag);

      outputExporter(testRunTimes, finalPath, processor);

      // Return an object to be displayed with --json
      return jsonData;
    } catch (error) {
      throw new SfdxError(error);
    }
  }
}
