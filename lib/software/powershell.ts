import { BatchCommands } from './index';

/**
 * Installs PowerShell 7
 */

export default {
    commands: `

yum install https://github.com/PowerShell/PowerShell/releases/download/v7.1.4/powershell-7.1.4-1.rhel.7.x86_64.rpm -y

`,
} as BatchCommands;
