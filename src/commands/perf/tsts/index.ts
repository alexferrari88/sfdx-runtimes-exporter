// prettier-ignore
import { flags, SfdxCommand } from '@salesforce/command';
import { Messages, SfdxError } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
// eslint-disable-next-line import/order
import * as os from 'os';
import { getTestRunTimes } from '../../../lib/tst';

// Initialize Messages with the current plugin directory
Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = Messages.loadMessages('sfdx-test-performance', 'tst.index');

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
      char: 'f',
      description: messages.getMessage('targetFlagDescription'),
    }),
  };
  // Comment this out if your command does not require an org username
  protected static requiresUsername = true;

  public async run(): Promise<AnyJson> {
    const deploymentId = this.flags.deployment as string;

    // this.org is guaranteed because requiresUsername=true, as opposed to supportsUsername
    const conn = this.org.getConnection();

    try {
      const testRunTimesData = await getTestRunTimes(conn, deploymentId);

      // Return an object to be displayed with --json
      return JSON.stringify(testRunTimesData);
    } catch (error) {
      throw new SfdxError(error);
    }
  }
}
