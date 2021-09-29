import { BatchCommands } from './index';

/**
 * Installs docker and enables the docker service
 */
export default {
    commands: `

amazon-linux-extras install docker
systemctl enable docker
service docker start
usermod -a -G docker ec2-user

`,
} as BatchCommands;
