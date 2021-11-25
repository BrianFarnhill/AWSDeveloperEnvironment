import { BatchCommands } from './index';

/**
 * Sets up git-secrets and registers it as the default precommit hook in repos
 */
export default {
    commands: `

sudo -u ec2-user brew install git-secrets
sudo -u ec2-user git secrets --register-aws --global
sudo -u ec2-user git secrets --install /home/ec2-user/.git-templates/git-secrets
sudo -u ec2-user git config --global init.templateDir /home/ec2-user/.git-templates/git-secrets
sudo -u ec2-user git secrets --add --allowed --literal --global '123456789012'

`,
} as BatchCommands;
