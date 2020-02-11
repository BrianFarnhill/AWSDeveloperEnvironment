import * as cdk from '@aws-cdk/core'
import * as ec2 from '@aws-cdk/aws-ec2'
import * as cloudwatch from '@aws-cdk/aws-cloudwatch'
import * as sns from '@aws-cdk/aws-sns'
import * as subscriptions from '@aws-cdk/aws-sns-subscriptions'
import * as lambda from '@aws-cdk/aws-lambda'
import * as iam from '@aws-cdk/aws-iam'
import * as efs from '@aws-cdk/aws-efs'
import * as cfn from '@aws-cdk/aws-cloudformation'
import { Duration } from '@aws-cdk/core'

const fs = require('fs')

export class AwsDeveloperEnvironmentStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const vpcId = new cdk.CfnParameter(this, "VPCId", { type: "AWS::EC2::VPC::Id", description: "The VPC to deploy this developer instance to" })
    const subnetId = new cdk.CfnParameter(this, "SubnetId", { type: "AWS::EC2::Subnet::Id", description: "The subnet to deploy this developer instance to" })
    const keypair = new cdk.CfnParameter(this, "Keyname", { type: "AWS::EC2::KeyPair::KeyName", description: "The keypair to use to SSH to this instance"})

    const rubyVersion = new cdk.CfnParameter(this, "RubyVersion", { 
      type: "String", 
      description: "The version of Ruby to install",
      allowedValues: ['none', '2.7.0', '2.6.5', '2.5.7'],
      default: '2.7.0'
    })

    const nodeVersion = new cdk.CfnParameter(this, "NodeVersion", { 
      type: "String", 
      description: "The version of NodeJs to install",
      allowedValues: ['none', 'v12.15.0', 'v10.19.0', 'v8.17.0'],
      default: 'v12.15.0'
    })

    const pythonVersion = new cdk.CfnParameter(this, "PythonVersion", { 
      type: "String", 
      description: "The version of Python to install",
      allowedValues: ['none', '3.7.6', '2.7.17'],
      default: '3.7.6'
    })

    const dotnetVersion = new cdk.CfnParameter(this, "DotnetVersion", { 
      type: "String", 
      description: "The version of Dotnet to install",
      allowedValues: ['none', '3.1', '3.0', '2.2', '2.1'],
      default: '3.1'
    })

    const powershellVersion = new cdk.CfnParameter(this, "PowershellVersion", { 
      type: "String", 
      description: "The version of Dotnet to install",
      allowedValues: ['none', '6.2.4', '6.1.6'],
      default: '6.2.4'
    })

    const ec2Size = new cdk.CfnParameter(this, "InstanceSize", { 
      type: "String", 
      description: "The size of the EC2 instance",
      allowedValues: ['t3.medium', 'c5.large', 'c5.xlarge'],
      default: 'c5.large'
    })

    const amazonLinuxImage = new ec2.AmazonLinuxImage({
      edition: ec2.AmazonLinuxEdition.STANDARD,
      generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      storage: ec2.AmazonLinuxStorage.EBS,
      virtualization: ec2.AmazonLinuxVirt.HVM
    })

    const devInstanceSG = new ec2.CfnSecurityGroup(this, "DevInstanceSecurityGroup", {
      groupDescription: "Developer instance connection rules",
      vpcId: vpcId.valueAsString,
      securityGroupIngress: [],
      securityGroupEgress: [
        {
          cidrIp: "0.0.0.0/0",
          ipProtocol: "-1",
          fromPort: -1,
          toPort: -1,
          description: "Allow all egress"
        }
      ],
      tags: [
        {key: 'Name', value: `${cdk.Aws.STACK_NAME}-Instance` }
      ]
    })

    const repoShare = new efs.CfnFileSystem(this, "RepoShare", {
      fileSystemTags: [
        {key: 'Name', value: cdk.Aws.STACK_NAME }
      ]
    })
    const efsFileShareSG = new ec2.CfnSecurityGroup(this, "efsShareSecurityGroup", {
      groupDescription: "Allow connections to EFS from developer instances",
      vpcId: vpcId.valueAsString,
      securityGroupIngress: [{
        sourceSecurityGroupId: devInstanceSG.attrGroupId,
        ipProtocol: "tcp",
        fromPort: 2049,
        toPort: 2049,
        description: "Allow NFS access"
      }],
      securityGroupEgress: [
        {
          cidrIp: "0.0.0.0/0",
          ipProtocol: "-1",
          fromPort: -1,
          toPort: -1,
          description: "Allow all egress"
        }
      ],
      tags: [
        {key: 'Name', value: `${cdk.Aws.STACK_NAME}-FileShare` }
      ]
    })
    new efs.CfnMountTarget(this, "RepoShareTarget", {
      fileSystemId: repoShare.ref,
      subnetId: subnetId.valueAsString,
      securityGroups: [
        efsFileShareSG.attrGroupId
      ]
    })


    const userDataFunction = new lambda.Function(this, "UserDataFunction", {
      code: lambda.Code.fromInline(fs.readFileSync("./lib/builduserdata.js").toString()),
      handler: 'index.handler',
      runtime: lambda.Runtime.NODEJS_12_X,
      memorySize: 128,
      timeout: Duration.seconds(6),
      description: `Generates sections of user data strings for developer environment builds`
    })

    const baseInstall = new cfn.CustomResource(this, `BuildUserData-BaseInstall`, {
      provider: cfn.CustomResourceProvider.lambda(userDataFunction),
      properties: {
          VERSION: '1',
          SCRIPT: `#!/bin/bash
yum update -y
yum install zsh openssl-devel amazon-efs-utils nfs-utils -y
yum group install "Development Tools" -y
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
export CDK_DEFAULT_ACCOUNT=${cdk.Aws.ACCOUNT_ID}
export CDK_DEFAULT_REGION=${cdk.Aws.REGION}
EOT`
      }
    })

    const rubyInstall = new cfn.CustomResource(this, `BuildUserData-RubyInstall`, {
      provider: cfn.CustomResourceProvider.lambda(userDataFunction),
      properties: {
          VERSION: rubyVersion.valueAsString,
          SCRIPT: `
sudo -u ec2-user git clone https://github.com/rbenv/rbenv.git /home/ec2-user/.rbenv
sudo -u ec2-user echo 'export PATH="$HOME/.rbenv/bin:$PATH"' >> /home/ec2-user/.zshrc
sudo -u ec2-user mkdir "$(/home/ec2-user/.rbenv/bin/rbenv root)"/plugins
sudo -u ec2-user git clone https://github.com/rbenv/ruby-build.git "$(sudo -u ec2-user /home/ec2-user/.rbenv/bin/rbenv root)"/plugins/ruby-build
sudo -u ec2-user ./.rbenv/bin/rbenv install ${rubyVersion.valueAsString}
sudo -u ec2-user ./.rbenv/bin/rbenv global ${rubyVersion.valueAsString}
sudo -u ec2-user echo 'eval "$(rbenv init -)"' >> /home/ec2-user/.zshrc

`
      }
    })

    const nodeInstall = new cfn.CustomResource(this, `BuildUserData-NodeInstall`, {
      provider: cfn.CustomResourceProvider.lambda(userDataFunction),
      properties: {
          VERSION: nodeVersion.valueAsString,
          SCRIPT: `
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.2/install.sh | sudo -u ec2-user bash
sudo -u ec2-user echo 'export NVM_DIR="$HOME/.nvm"' >> /home/ec2-user/.zshrc
sudo -u ec2-user echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"' >> /home/ec2-user/.zshrc
sudo -u ec2-user echo '[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"' >> /home/ec2-user/.zshrc
. /home/ec2-user/.nvm/nvm.sh
nvm install ${nodeVersion.valueAsString}

`
      }
    })

    const pythonInstall = new cfn.CustomResource(this, `BuildUserData-PythonInstall`, {
      provider: cfn.CustomResourceProvider.lambda(userDataFunction),
      properties: {
          VERSION: pythonVersion.valueAsString,
          SCRIPT: `
sudo -u ec2-user git clone https://github.com/pyenv/pyenv.git /home/ec2-user/.pyenv
sudo -u ec2-user /home/ec2-user/.pyenv/bin/pyenv install ${pythonVersion.valueAsString}
sudo -u ec2-user /home/ec2-user/.pyenv/bin/pyenv global ${pythonVersion.valueAsString}
sudo -u ec2-user echo 'export PYENV_ROOT="$HOME/.pyenv"' >> /home/ec2-user/.zshrc
sudo -u ec2-user echo 'export PATH="$PYENV_ROOT/bin:$PATH"' >> /home/ec2-user/.zshrc
sudo -u ec2-user echo -e 'if command -v pyenv 1>/dev/null 2>&1; then\\n  eval "$(pyenv init -)"\\nfi' >> /home/ec2-user/.zshrc

`
      }
    })

    const dotnetInstall = new cfn.CustomResource(this, `BuildUserData-DotnetInstall`, {
      provider: cfn.CustomResourceProvider.lambda(userDataFunction),
      properties: {
          VERSION: dotnetVersion.valueAsString,
          SCRIPT: `
rpm -Uvh https://packages.microsoft.com/config/centos/7/packages-microsoft-prod.rpm
yum install dotnet-sdk-${dotnetVersion.valueAsString} -y
yum install aspnetcore-runtime-${dotnetVersion.valueAsString} -y
          
`
      }
    })

    const powershellInstall = new cfn.CustomResource(this, `BuildUserData-PowershellInstall`, {
      provider: cfn.CustomResourceProvider.lambda(userDataFunction),
      properties: {
          VERSION: powershellVersion.valueAsString,
          SCRIPT: `
wget https://raw.githubusercontent.com/PowerShell/PowerShell/master/docker/InstallTarballPackage.sh
chmod +x InstallTarballPackage.sh
./InstallTarballPackage.sh ${powershellVersion.valueAsString} powershell-${powershellVersion.valueAsString}-linux-x64.tar.gz
          
`
      }
    })

    const efsInstall = new cfn.CustomResource(this, `BuildUserData-EfsInstall`, {
      provider: cfn.CustomResourceProvider.lambda(userDataFunction),
      properties: {
          VERSION: '`',
          SCRIPT: `
sudo -u ec2-user mkdir /home/ec2-user/repos
echo '${repoShare.ref}.efs.${cdk.Aws.REGION}.amazonaws.com:/  /home/ec2-user/repos    nfs     nfsvers=4.1,rsize=1048576,wsize=1048576,hard,timeo=600,retrans=2,noresvport     0       0' >> /etc/fstab
mount -t nfs -o nfsvers=4.1,rsize=1048576,wsize=1048576,hard,timeo=600,retrans=2,noresvport ${repoShare.ref}.efs.${cdk.Aws.REGION}.amazonaws.com:/ /home/ec2-user/repos
chown ec2-user /home/ec2-user/repos
   
`
      }
    })

    const userDataFull = `
${baseInstall.getAttString('userData')}
${rubyInstall.getAttString('userData')}
${nodeInstall.getAttString('userData')}
${pythonInstall.getAttString('userData')}
${dotnetInstall.getAttString('userData')}
${powershellInstall.getAttString('userData')}
${efsInstall.getAttString('userData')}
/opt/aws/bin/cfn-signal -e $? --stack ${cdk.Aws.STACK_NAME} --resource DevInstance --region ${cdk.Aws.REGION}
`

    const devInstanceRole = new iam.Role(this, "DevInstanceRole", {
      inlinePolicies: {
        "AdminProfile": new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              actions: ['*'],
              resources: ['*']
            })
          ]
        })
      },
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com')
    })

    const devInstanceProfile = new iam.CfnInstanceProfile(this, "DevInstanceProfile", {
      roles: [ devInstanceRole.roleName ]
    })

    const devInstance = new ec2.CfnInstance(this, "DevInstance", {
      instanceType: ec2Size.valueAsString,
      imageId: amazonLinuxImage.getImage(this).imageId,
      subnetId: subnetId.valueAsString,
      securityGroupIds: [ devInstanceSG.attrGroupId ],
      keyName: keypair.valueAsString,
      userData: cdk.Fn.base64(userDataFull),
      iamInstanceProfile: devInstanceProfile.ref,
      tags: [
        {key: 'Name', value: cdk.Aws.STACK_NAME }
      ]
    })
    devInstance.cfnOptions.creationPolicy = {
      resourceSignal: {
        timeout: 'PT30M'
      }
    }

    const powerOffFunction = new lambda.Function(this, "PowerOffFunction", {
      code: lambda.Code.fromInline(fs.readFileSync("./lib/poweroff.js").toString()),
      handler: 'index.handler',
      runtime: lambda.Runtime.NODEJS_12_X,
      memorySize: 128,
      timeout: Duration.seconds(5),
      description: `Powers off the ${cdk.Aws.STACK_NAME} developer environment`,
      environment: {
        INSTANCE_ID: devInstance.ref
      }
    })
    powerOffFunction.addToRolePolicy(new iam.PolicyStatement({
      actions: [
        'ec2:StopInstances'
      ],
      resources: [
        `arn:aws:ec2:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:instance/${devInstance.ref}`
      ]
    }))

    const inactiveTopic = new sns.Topic(this, "PowerOffTopic", {})
    inactiveTopic.addSubscription(new subscriptions.LambdaSubscription(powerOffFunction))

    new cloudwatch.CfnAlarm(this, "NetworkInactiveAlarm", {
      alarmName: `${cdk.Aws.STACK_NAME}-TrafficInactive`,
      metricName: 'NetworkOut',
      namespace: 'AWS/EC2',
      period: 3600,
      statistic: "Sum",
      comparisonOperator: "LessThanThreshold",
      evaluationPeriods: 1,
      threshold: 1000000,
      treatMissingData: "breaching",
      dimensions: [{
        name: "InstanceId",
        value: devInstance.ref
      }],
      alarmActions: [
        inactiveTopic.topicArn
      ]
    }) 
  }
}
