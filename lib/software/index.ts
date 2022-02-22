import { aws_ec2 as ec2 } from 'aws-cdk-lib';
import { Asset } from 'aws-cdk-lib/aws-s3-assets';
import { Construct } from 'constructs';
import AwsCli from './awscli';
import AwsTools from './awstools';
import Brew from './brew';
import DevTools from './devtools';
import Docker from './docker';
import Dotnet from './dotnet';
import GitConfig from './gitconfig';
import Node from './node';
import Powershell from './powershell';
import Python from './python';
import Ruby from './ruby';
import Sam from './sam';
import VSCodeServer from './vscode-server';
import ZShell from './zshell';
import GitSecrets from './gitsecrets';
import * as path from 'path';

export interface BatchCommands {
    commands: string,
    fileMap?: {
      [LocalPath: string]: string,
    },
}

interface SoftwareProps {
  Instance: ec2.Instance;
}

export default class extends Construct {

  constructor(scope: Construct, id: string, props: SoftwareProps) {
    super(scope, id);

    const software = [
        DevTools,
        Docker,
        ZShell,
        Brew,
        Sam,
        GitConfig,
        AwsCli,
        Ruby,
        Node,
        Python,
        Dotnet,
        Powershell,
        AwsTools,
        VSCodeServer,
        GitSecrets,
    ];

    props.Instance.userData.addCommands(...software.map((s) => s.commands));

    let fileCount = 0;
    software.forEach((s) => {
      const fileMap = s.fileMap || {};
      const localFiles = Object.keys(fileMap);

      localFiles.forEach((localPath: string) => {
        const asset = new Asset(this, `File${fileCount}`, {
          path: path.resolve(__dirname, localPath),
        });
        props.Instance.userData.addS3DownloadCommand({
          bucket: asset.bucket,
          bucketKey: asset.s3ObjectKey,
          localFile: fileMap[localPath],
        });

        if (localPath.endsWith('.sh')) {
          props.Instance.userData.addCommands(`chmod +x ${localPath}`);
        }

        fileCount += 1;
      });
    });

    props.Instance.userData.addCommands('chown -R ec2-user /home/ec2-user/')
  }
}
