import { BatchCommands } from './index';

/**
 * Installs CDK + Amplify libraries, and GRC helper
 */

const nodeVersion = 'v14.17.6';

export default {
    commands: `

sudo -u ec2-user /usr/bin/zsh -i -c "npm install -g aws-cdk@next @aws-amplify/cli"
sudo -u ec2-user /usr/bin/zsh -i -c "pip3 install git-remote-codecommit"

`,
} as BatchCommands;
