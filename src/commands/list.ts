// prettier-ignore
import { flags, SfdxCommand } from '@salesforce/command';
import { Messages, SfdxError } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
// eslint-disable-next-line import/order
import * as os from 'os';
import { Deployment, getDeployments } from '../list';
import {
  exportLocationMakerFactory,
  exportLocationMakerFunction,
  outputExporterFactory,
  outputExporterFunction,
  processorFactoryType,
} from '../outputSaver';

// Initialize Messages with the current plugin directory
Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = Messages.loadMessages('sfdx-runtimes-exporter', 'list');

const csvMaker = (data: Deployment[]): string => {
  const output: string[][] = [];
  output.push(['Deployment Id', 'Completion Date', 'Total Test Time (ms)']);
  const dataArray = data.map((v) => [v.Id, v.CompletedDate.toString(), v.totalTestsTime.toString()]);
  output.push(...dataArray);
  return output.map((v) => v.join(',')).join('\n');
};

export default class Tst extends SfdxCommand {
  public static description = messages.getMessage('commandDescription');

  public static examples = messages.getMessage('examples').split(os.EOL);

  protected static flagsConfig = {
    before: flags.datetime({
      char: 'b',
      description: messages.getMessage('beforeFlagDescription'),
    }),
    after: flags.datetime({
      char: 'a',
      description: messages.getMessage('afterFlagDescription'),
    }),
    latest: flags.boolean({
      char: 'l',
      description: messages.getMessage('latestFlagDescription'),
    }),
    max: flags.integer({
      char: 'm',
      description: messages.getMessage('maxFlagDescription'),
      min: 1,
      default: 10,
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
  };
  protected static requiresUsername = true;

  public async run(): Promise<AnyJson> {
    const outputFlag = (this.flags.output as string).toLowerCase();
    const targetFlag = this.flags.target as string;
    const max = this.flags.max as number;
    const beforeDate = this.flags.before as Date;
    const afterDate = this.flags.after as Date;
    const latest = this.flags.latest as boolean;

    // this.org is guaranteed because requiresUsername=true, as opposed to supportsUsername
    const conn = this.org.getConnection();

    try {
      const deploysList = await getDeployments(conn, beforeDate, afterDate, latest, max);
      const jsonData = JSON.stringify(deploysList);

      if (!outputFlag) return jsonData;

      const processorFactory: processorFactoryType<Deployment> = {
        csv: csvMaker,
        json: JSON.stringify,
        s3: null,
        dynamodb: null,
      };

      const outputExporter = outputExporterFactory[outputFlag] as outputExporterFunction<Deployment>;
      const exportLocationMaker = exportLocationMakerFactory[outputFlag] as exportLocationMakerFunction;
      const processor = processorFactory[outputFlag] as (data: Deployment[]) => string;
      const finalPath = exportLocationMaker(
        targetFlag,
        'deployments-list-results',
        new Date().toISOString(),
        outputFlag
      );

      outputExporter(deploysList, finalPath, processor);

      // Return an object to be displayed with --json
      return jsonData;
    } catch (error) {
      throw new SfdxError(error);
    }
  }
}
