import { BatchCommands } from './index';
import { Aws } from 'aws-cdk-lib';

/**
 * Establishes config files that help some AWS CLI tools (CDK and amplify specifically) run smoothly
 */
export default {
    commands: `

sudo -u ec2-user mkdir /home/ec2-user/.aws
sudo -u ec2-user touch /home/ec2-user/.aws/credentials

sudo -u ec2-user cat <<EOT >> /home/ec2-user/.aws/config
[default]
output = json
region = ${Aws.REGION}
EOT

`,
} as BatchCommands;
