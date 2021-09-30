import { BatchCommands } from './index';

/**
 * Installs Python (via pyenv to manage versions in future)
 */

const pythonVersion = '3.8.5';

export default {
    commands: `

sudo -u ec2-user git clone https://github.com/pyenv/pyenv.git /home/ec2-user/.pyenv
sudo -u ec2-user /home/ec2-user/.pyenv/bin/pyenv install ${pythonVersion}
sudo -u ec2-user /home/ec2-user/.pyenv/bin/pyenv global ${pythonVersion}

`,
} as BatchCommands;
