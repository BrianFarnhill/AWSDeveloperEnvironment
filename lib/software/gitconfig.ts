import { BatchCommands } from './index';

/**
 * Sets up config in Git to use VS Code as the default editor and difftool
 */
export default {
    commands: `

sudo -u ec2-user git config --global core.editor "code --wait"
sudo -u ec2-user git config --global diff.tool "default-difftool"
sudo -u ec2-user git config --global difftool.default-difftool.cmd "code --wait --diff \$LOCAL \$REMOTE"
sudo -u ec2-user git config --global credential.helper store

`,
} as BatchCommands;
