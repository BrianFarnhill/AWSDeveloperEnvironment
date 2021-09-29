import { BatchCommands } from './index';

/**
 * Installs the AWS SAM CLI (depends on brew)
 */
export default {
    commands: `

sudo -u ec2-user /home/linuxbrew/.linuxbrew/bin/brew tap aws/tap
sudo -u ec2-user /home/linuxbrew/.linuxbrew/bin/brew install aws-sam-cli

`,
} as BatchCommands;
