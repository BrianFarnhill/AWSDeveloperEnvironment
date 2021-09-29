import { aws_ec2 as ec2 } from 'aws-cdk-lib';
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

export interface BatchCommands {
    commands: string,
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
    ];

    props.Instance.userData.addCommands(...software.map((s) => s.commands));
  }
}
