# AWS Developer Environment for Visual Studio Code

This project creates a CloudFormation template that is used to deploy an EC2 instance for use
developing solutions on AWS with Visual Studio Code. The instance is designed to be a [remote
SSH environment for Visual Studio Code](https://code.visualstudio.com/docs/remote/ssh). This
template includes the following features:

 * The instance will automatically power off when there is low network activity for an hour
   to optimise cost. (Power on can be automated when SSH connections are initiated, see the
   section below for instructions)
 * Common languages and tools are installed by default. Versions can be selected through
   template parameters, and tools can be excluded through parameters also
 * An IAM instance role is created to control what AWS services can be invoked from the
   developer instance
 * Connectivity via SSH is handled using the Session Manager function inside AWS Systems
   Manager, ensuring that the instance is never exposed to the internet directly. This also
   allows the instance to be deployed to a private subnet (internet connectivity is required
   to install packages and components however)

## Deploying the template

### Via the console

Download the template file `AwsDeveloperEnvironmentStack.template.json` from the cdk.out
directory in this repository, and [upload this when creating a new CloudFormation
stack](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/cfn-console-create-stack.html). 

### Via the cli

To deploy the template using the AWS CLI, execute the following command, substituting in the
appropriate variables:

```
aws cloudformation create-stack --stack-name "DevEnvironment3" 
                                --template-body file://./cdk.out/AwsDeveloperEnvironmentStack.template.json 
                                --parameters ParameterKey=VPCId,ParameterValue=[VPC ID] 
                                             ParameterKey=SubnetId,ParameterValue=[Subnet ID] 
                                             ParameterKey=Keyname,ParameterValue=[Key name] 
                                --region ap-southeast-2
                                --capabilities CAPABILITY_IAM
```

## Conneting from Visual Studio Code

To add the instance to Visual Studio Code:

1. Select the "Remote Explorer" tab in Visual Studio Code, and select "SSH targets" from the
   drop down
2. Choose the "configure" icon and when prompted choose the file you wish to store your SSH
   configuration in. In windows this will usually be `C:\Users\username\.ssh\config.` and in
   linux it will be `~/.ssh/config`.
3. Add your new server using it's EC2 instance ID. Specify the local path to the key file you
   selected when provisioning the instance. The user name is always `ec2-user`. The Host value
   can be any user friendly name for the instance that you wish to see in VSCode. This is the
   same process as [connecting to instances through session manager using SSH](https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager-getting-started-enable-ssh-connections.html).

__Windows__
```
Host AWSDeveloper
    HostName i-12345678901234567
    IdentityFile ~/.ssh/YourKeyNameHere.pem
    User ec2-user
    ProxyCommand C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe "aws ssm start-session --target %h --document-name AWS-StartSSHSession --parameters portNumber=%p"
```

__Linux__
```
Host AWSDeveloper
    HostName i-12345678901234567
    IdentityFile ~/.ssh/YourKeyNameHere.pem
    User ec2-user
    ProxyCommand sh -c "aws ssm start-session --target %h --document-name AWS-StartSSHSession --parameters 'portNumber=%p'"
```

4. The instance will now appear under the SSH Targets list in Visual Studio Code. Move your
   mouse over your new instance and choose the "Connect to host in new window" option.
5. A new window will open connecting you to the server. This will take a while longer on the
   first run as the remote components are installed

Ensure that the local AWS profile has permissions to run ssm:startSession. 

## Powering instances on when you connect

As the EC2 instance in the template is programmed to turn off after a period of network activity,
programming a script to power on the instance before you connect will ensure it is running when
you need it. To run the instance start command, change the ProxyCommand line from above to include
a call to the start-instances API.

__Windows__
```
    ProxyCommand C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe "aws ec2 start-instances --instance-ids %h;aws ssm start-session --target %h --document-name AWS-StartSSHSession --parameters portNumber=%p"
```
__Linux__
```
    ProxyCommand sh -c "aws ec2 start-instances --instance-ids %h; aws ssm start-session --target %h --document-name AWS-StartSSHSession --parameters 'portNumber=%p'"
```


When you attempt a connection while the instance is turned off, you will receive a prompt about the
server being unavailable. Wait a few moments and select the "retry" button and the window will now
open as normal. 

Ensure that the local AWS profile additionally has the ec2:StartInstances permission to execute this
additional command.

## Applying security to developers

By default this template applies an instance role that has full admin rights to the AWS account it
is deployed in. This might not be ideal in some environments, so the following changes should be
considered to add additional security to developer environments:

 * Change the IAM role 'DevInstanceRole' to have only the permissions that developers require. Also
   make use of [permissions boundaries](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_boundaries.html)
 * Consider the need to add KMS encryptions to the EFS share and EBS volumes of the EC2 instance
 * Consider using a custom AMI that includes hardened configurations for Amazon Linux 2

## What's included in the instance?

The following is a list of items that can be installed in the developer instance:

 * zshell (with oh-my-zshell and additional plug-ins)
 * Ruby (using rbenv for version management)
 * NodeJS (using nvm for version management)
 * Python (using pyenv for version management)
 * Dotnet core
 * PowerShell
