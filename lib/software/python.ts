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
sudo -u ec2-user echo 'export PYENV_ROOT="$HOME/.pyenv"' >> /home/ec2-user/.zshrc
sudo -u ec2-user echo 'export PATH="$PYENV_ROOT/bin:$PATH"' >> /home/ec2-user/.zshrc
sudo -u ec2-user echo -e 'if command -v pyenv 1>/dev/null 2>&1; then\\n  eval "$(pyenv init -)"\\nfi' >> /home/ec2-user/.zshrc

`,
} as BatchCommands;
