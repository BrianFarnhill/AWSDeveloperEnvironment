import { BatchCommands } from './index';

/**
 * Installs zshell and configures the .zshrc file with dev friendly preferences
 */
export default {
    commands: `

cd /home/ec2-user
sudo -u ec2-user sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
sudo -u ec2-user git clone https://github.com/zsh-users/zsh-syntax-highlighting.git \${ZSH_CUSTOM:-/home/ec2-user/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting
sudo -u ec2-user git clone https://github.com/zsh-users/zsh-autosuggestions \${ZSH_CUSTOM:-/home/ec2-user/.oh-my-zsh/custom}/plugins/zsh-autosuggestions      
usermod -s /usr/bin/zsh ec2-user
rm /home/ec2-user/.zshrc
sudo -u ec2-user cat <<EOT >> /home/ec2-user/.zshrc
export ZSH="/home/ec2-user/.oh-my-zsh"
ZSH_THEME="agnoster"
plugins=(
    git
    aws
    git-extras
    pip
    python
    zsh-syntax-highlighting
    encode64
    jsontools
    node
    npm
    urltools
    zsh-autosuggestions
)
source /home/ec2-user/.oh-my-zsh/oh-my-zsh.sh
EOT
chown ec2-user /home/ec2-user/.zshrc

`,
} as BatchCommands;
