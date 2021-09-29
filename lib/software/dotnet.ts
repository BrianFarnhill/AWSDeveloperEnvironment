import { BatchCommands } from './index';

/**
 * Installs dotNet core 5.0
 */

const dotnetVersion = '5.0';

export default {
    commands: `

rpm -Uvh https://packages.microsoft.com/config/centos/7/packages-microsoft-prod.rpm
yum install dotnet-sdk-${dotnetVersion} -y

`,
} as BatchCommands;
