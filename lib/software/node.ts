import { BatchCommands } from './index';

/**
 * Installs Node (via nvm to manage versions in future), and adds CDK + Amplify libraries
 */

const nodeVersion = 'v14.17.6';

export default {
    commands: `

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.2/install.sh | sudo -u ec2-user bash
. /home/ec2-user/.nvm/nvm.sh
nvm install ${nodeVersion}
sudo chown ec2-user /home/ec2-user/.nvm -R

`,
} as BatchCommands;
