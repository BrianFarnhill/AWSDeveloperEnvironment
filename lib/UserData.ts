import * as cdk from '@aws-cdk/core'

const rubyVersion = '2.7.0'
const nodeVersion = 'v12.18.3'
const pythonVersion = '3.8.1'
const dotnetVersion = '3.1'
const powershellVersion = '7.0.3'

export const coreInstall = `
yum update -y
yum install zsh openssl-devel amazon-efs-utils nfs-utils openssl-libs compat-openssl10 krb5-libs zlib libicu libsecret gnome-keyring desktop-file-utils xorg-x11-utils -y
yum group install "Development Tools" -y
amazon-linux-extras install docker
systemctl enable docker
service docker start
usermod -a -G docker ec2-user
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
sudo -u ec2-user sh -c "$(curl -fsSL https://raw.githubusercontent.com/Linuxbrew/install/master/install.sh)"
sudo -u ec2-user echo 'eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"' >> /home/ec2-user/.zshrc
sudo -u ec2-user /home/linuxbrew/.linuxbrew/bin/brew tap aws/tap
sudo -u ec2-user /home/linuxbrew/.linuxbrew/bin/brew install aws-sam-cli
sudo -u ec2-user git config --global core.editor "code --wait"
sudo -u ec2-user git config --global diff.tool "default-difftool"
sudo -u ec2-user git config --global difftool.default-difftool.cmd "code --wait --diff \$LOCAL \$REMOTE"
echo 'fs.inotify.max_user_watches=524288' >> /etc/sysctl.conf
sudo -u ec2-user touch /home/ec2-user/.aws/credentials

sudo -u ec2-user cat <<EOT >> /home/ec2-user/.aws/config
[default]
output = json
region = ${cdk.Aws.REGION}
EOT
`

export const rubyInstall = `
sudo -u ec2-user git clone https://github.com/rbenv/rbenv.git /home/ec2-user/.rbenv
sudo -u ec2-user echo 'export PATH="$HOME/.rbenv/bin:$PATH"' >> /home/ec2-user/.zshrc
sudo -u ec2-user mkdir "$(/home/ec2-user/.rbenv/bin/rbenv root)"/plugins
sudo -u ec2-user git clone https://github.com/rbenv/ruby-build.git "$(sudo -u ec2-user /home/ec2-user/.rbenv/bin/rbenv root)"/plugins/ruby-build
sudo -u ec2-user ./.rbenv/bin/rbenv install ${rubyVersion}
sudo -u ec2-user ./.rbenv/bin/rbenv global ${rubyVersion}
sudo -u ec2-user echo 'eval "$(rbenv init -)"' >> /home/ec2-user/.zshrc
`

export const nodeInstall = `
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.2/install.sh | sudo -u ec2-user bash
sudo -u ec2-user echo 'export NVM_DIR="$HOME/.nvm"' >> /home/ec2-user/.zshrc
sudo -u ec2-user echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"' >> /home/ec2-user/.zshrc
sudo -u ec2-user echo '[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"' >> /home/ec2-user/.zshrc
. /home/ec2-user/.nvm/nvm.sh
nvm install ${nodeVersion}
npm install -g aws-cdk
npm install -g @aws-amplify/cli
sudo chown ec2-user /home/ec2-user/.nvm -R
sudo -u ec2-user echo 'export CDK_DEFAULT_ACCOUNT=${cdk.Aws.ACCOUNT_ID}' >> /home/ec2-user/.zshrc
sudo -u ec2-user echo 'export CDK_DEFAULT_REGION=${cdk.Aws.REGION}' >> /home/ec2-user/.zshrc
`

export const pythonInstall = `
sudo -u ec2-user git clone https://github.com/pyenv/pyenv.git /home/ec2-user/.pyenv
sudo -u ec2-user /home/ec2-user/.pyenv/bin/pyenv install ${pythonVersion}
sudo -u ec2-user /home/ec2-user/.pyenv/bin/pyenv global ${pythonVersion}
sudo -u ec2-user echo 'export PYENV_ROOT="$HOME/.pyenv"' >> /home/ec2-user/.zshrc
sudo -u ec2-user echo 'export PATH="$PYENV_ROOT/bin:$PATH"' >> /home/ec2-user/.zshrc
sudo -u ec2-user echo -e 'if command -v pyenv 1>/dev/null 2>&1; then\\n  eval "$(pyenv init -)"\\nfi' >> /home/ec2-user/.zshrc
`

export const dotnetInstall = `
rpm -Uvh https://packages.microsoft.com/config/centos/7/packages-microsoft-prod.rpm
yum install dotnet-sdk-${dotnetVersion} -y
yum install aspnetcore-runtime-${dotnetVersion} -y
`

export const powerShellInstall = `
wget https://raw.githubusercontent.com/PowerShell/PowerShell/master/docker/InstallTarballPackage.sh
chmod +x InstallTarballPackage.sh
./InstallTarballPackage.sh ${powershellVersion} powershell-${powershellVersion}-linux-x64.tar.gz
`

export const finalise = `
chown ec2-user /home/ec2-user/.zshrc
`
