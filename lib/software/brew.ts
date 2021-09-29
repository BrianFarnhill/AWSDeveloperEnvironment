import { BatchCommands } from './index';

/**
 * Installs linux brew and adds to shell 
 */
export default {
    commands: `

sudo -u ec2-user sh -c "$(curl -fsSL https://raw.githubusercontent.com/Linuxbrew/install/master/install.sh)"
sudo -u ec2-user echo 'eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"' >> /home/ec2-user/.zshrc

`,
} as BatchCommands;
