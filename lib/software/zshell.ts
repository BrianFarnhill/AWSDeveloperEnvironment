import { BatchCommands } from './index';

/**
 * Installs zshell and configures the .zshrc file with dev friendly preferences
 */

export default {
    fileMap: {
        'zshell/.zshrc': '/home/ec2-user/.zshrc',
        'zshell/.p10k.zsh': '/home/ec2-user/.p10k.zsh',
    },
    commands: `

cd /home/ec2-user
sudo -u ec2-user sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
sudo -u ec2-user git clone https://github.com/zsh-users/zsh-syntax-highlighting.git \${ZSH_CUSTOM:-/home/ec2-user/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting
sudo -u ec2-user git clone https://github.com/zsh-users/zsh-autosuggestions \${ZSH_CUSTOM:-/home/ec2-user/.oh-my-zsh/custom}/plugins/zsh-autosuggestions
sudo -u ec2-user git clone --depth=1 https://github.com/romkatv/powerlevel10k.git \${ZSH_CUSTOM:-/home/ec2-user/.oh-my-zsh/custom}/themes/powerlevel10k
usermod -s /usr/bin/zsh ec2-user
chown ec2-user /home/ec2-user/.zshrc
chown ec2-user /home/ec2-user/.p10k.zsh

`,
} as BatchCommands;
