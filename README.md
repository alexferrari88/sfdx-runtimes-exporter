sfdx-test-performance
=====================

Keep track of tests running times during your deployments.

[![Version](https://img.shields.io/npm/v/sfdx-test-performance.svg)](https://npmjs.org/package/sfdx-test-performance)
[![CircleCI](https://circleci.com/gh/alexferrari88/sfdx-test-performance/tree/master.svg?style=shield)](https://circleci.com/gh/alexferrari88/sfdx-test-performance/tree/master)
[![Appveyor CI](https://ci.appveyor.com/api/projects/status/github/alexferrari88/sfdx-test-performance?branch=master&svg=true)](https://ci.appveyor.com/project/heroku/sfdx-test-performance/branch/master)
[![Greenkeeper](https://badges.greenkeeper.io/alexferrari88/sfdx-test-performance.svg)](https://greenkeeper.io/)
[![Known Vulnerabilities](https://snyk.io/test/github/alexferrari88/sfdx-test-performance/badge.svg)](https://snyk.io/test/github/alexferrari88/sfdx-test-performance)
[![Downloads/week](https://img.shields.io/npm/dw/sfdx-test-performance.svg)](https://npmjs.org/package/sfdx-test-performance)
[![License](https://img.shields.io/npm/l/sfdx-test-performance.svg)](https://github.com/alexferrari88/sfdx-test-performance/blob/master/package.json)

<!-- toc -->
* [Debugging your plugin](#debugging-your-plugin)
<!-- tocstop -->
<!-- install -->
<!-- usage -->
```sh-session
$ npm install -g sfdx-runtimes-exporter
$ sfdx COMMAND
running command...
$ sfdx (-v|--version|version)
sfdx-runtimes-exporter/0.0.1 win32-x64 node-v17.7.1
$ sfdx --help [COMMAND]
USAGE
  $ sfdx COMMAND
...
```
<!-- usagestop -->
<!-- commands -->
* [`sfdx runtimes:tests -i <id> [-o csv|json|S3|dynamoDB] [-d <string>] [-t <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-runtimestests--i-id--o-csvjsons3dynamodb--d-string--t-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)

## `sfdx runtimes:tests -i <id> [-o csv|json|S3|dynamoDB] [-d <string>] [-t <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Retrieve tests execution time for a given deployment

```
USAGE
  $ sfdx runtimes:tests -i <id> [-o csv|json|S3|dynamoDB] [-d <string>] [-t <string>] [-u <string>] [--apiversion 
  <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -d, --target=target                                                               target location to save the results
                                                                                    (do not include the file name)

  -i, --deployment=deployment                                                       (required) id of the deployment to
                                                                                    get tests execution time for

  -o, --output=(csv|json|S3|dynamoDB)                                               [default: json] where do you want to
                                                                                    output the results

  -t, --threshold=threshold                                                         return the tests execution time to
                                                                                    only those above the threshold (in
                                                                                    milliseconds)

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLES
  sfdx per:tst --deployment deploymentId --targetusername myOrg@example.com --output=s3 --target=s3://myBucket/myFolder
  sfdx per:tst --deployment deploymentId --targetusername myOrg@example.com --output=csv --target=myFile.csv
  sfdx per:tst --deployment deploymentId --targetusername myOrg@example.com --output=dynamoDB --target=myTable
  sfdx per:tst --deployment deploymentId --targetusername myOrg@example.com --output=json --target=myFile.json 
  --threshold=10000
```

_See code: [src/commands/runtimes/tests.ts](https://github.com/alexferrari88/sfdx-runtimes-exporter/blob/v0.0.1/src/commands/runtimes/tests.ts)_
<!-- commandsstop -->
<!-- debugging-your-plugin -->
# Debugging your plugin
We recommend using the Visual Studio Code (VS Code) IDE for your plugin development. Included in the `.vscode` directory of this plugin is a `launch.json` config file, which allows you to attach a debugger to the node process when running your commands.

To debug the `hello:org` command: 
1. Start the inspector
  
If you linked your plugin to the sfdx cli, call your command with the `dev-suspend` switch: 
```sh-session
$ sfdx hello:org -u myOrg@example.com --dev-suspend
```
  
Alternatively, to call your command using the `bin/run` script, set the `NODE_OPTIONS` environment variable to `--inspect-brk` when starting the debugger:
```sh-session
$ NODE_OPTIONS=--inspect-brk bin/run hello:org -u myOrg@example.com
```

2. Set some breakpoints in your command code
3. Click on the Debug icon in the Activity Bar on the side of VS Code to open up the Debug view.
4. In the upper left hand corner of VS Code, verify that the "Attach to Remote" launch configuration has been chosen.
5. Hit the green play button to the left of the "Attach to Remote" launch configuration window. The debugger should now be suspended on the first line of the program. 
6. Hit the green play button at the top middle of VS Code (this play button will be to the right of the play button that you clicked in step #5).
<br><img src=".images/vscodeScreenshot.png" width="480" height="278"><br>
Congrats, you are debugging!
