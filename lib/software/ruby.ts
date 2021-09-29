import { BatchCommands } from './index';

/**
 * Installs ruby (via rbenv to manage versions in future)
 */

const rubyVersion = '2.7.1';

export default {
    commands: `

sudo -u ec2-user git clone https://github.com/rbenv/rbenv.git /home/ec2-user/.rbenv
sudo -u ec2-user echo 'export PATH="$HOME/.rbenv/bin:$PATH"' >> /home/ec2-user/.zshrc
sudo -u ec2-user mkdir "$(/home/ec2-user/.rbenv/bin/rbenv root)"/plugins
sudo -u ec2-user git clone https://github.com/rbenv/ruby-build.git "$(sudo -u ec2-user /home/ec2-user/.rbenv/bin/rbenv root)"/plugins/ruby-build
sudo -u ec2-user ./.rbenv/bin/rbenv install ${rubyVersion}
sudo -u ec2-user ./.rbenv/bin/rbenv global ${rubyVersion}
sudo -u ec2-user echo 'eval "$(rbenv init -)"' >> /home/ec2-user/.zshrc

`,
} as BatchCommands;
