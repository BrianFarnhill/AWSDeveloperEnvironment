# AWS Developer Environment for Visual Studio Code

This project creates a CloudFormation template that is used to deploy an EC2 instance for use
developing solutions on AWS with Visual Studio Code. The instance is designed to be a [remote
SSH environment for Visual Studio Code](https://code.visualstudio.com/docs/remote/ssh). This
template includes the following features:

 * The instance will automatically power off when there is low network activity for an hour
   to optimise cost. (Power on can be automated when SSH connections are initiated, see the
   section below for instructions)
 * Common languages and tools are installed by default. (See `lib/software` path for specifics)
 * An IAM instance role is created to control what AWS services can be invoked from the
   developer instance
 * Connectivity via SSH is handled using the Session Manager function inside AWS Systems
   Manager, ensuring that the instance is never exposed to the internet directly.
 * The instance is deployed in to a new VPC, with a public and private subnet. This helps
   ensure that no direct connectivity can be made to the instance, but it will have internet
   connectivity via a NAT gateway

## Dependencies

This project uses the [AWS CDK](https://aws.amazon.com/cdk/) to deploy the dev instnace. It
is installed with the dependencies for the project. To install everything needed run:

```
npm install
```

Next you must export an environment variable for the keypair name. This will be assigned to the 
EC2 instance that is created. If you do not provide a keypair you will not be able to SSH to
this instance via a local install of VS Code (method 2 below), and you will only be able to use
the web based version that is installed.

```
export KEYPAIR_NAME="KeyPairName"
```

Then you can build and deploy the solution with these commands.
## Deploying the template

### Via the cli

You can build and deploy the solution with the deploy command. This will do a full build first
before deployment. 

```
npm run deploy
```

## Running Visual Studio Code
### Method 1: Connecting to Visaul Studio Code (Web Browser)

This instance includes a web based version of VS Code (powered by [OpenVSCode-Server](https://github.com/gitpod-io/openvscode-server)).
As the instance itself sits in a private network, this can be access via port forward that can
be established via Session Manager. The server operates on port 3000 by default, so the below
command will create the port forward connection. 

```
aws ssm start-session --target i-12345678901234567 --document-name AWS-StartPortForwardingSession --parameters '{"portNumber":["3000"], "localPortNumber":["3000"]}'
```

While this command stays active you can access the web based version of VS code at
[http://localhost:3000](http://localhost:3000). This does not need any local installation of
VSCode to operate. Note: You will need to connect from a compute instance that can run the 
Session Manager CLI plugin (e.g. a Windows/MacOS/Linux machine) to enable the port forward
to be configured. Machines such as iPads and others won't be able to connect to this instance
via a browser unless the HTTP port is made accessible to the internet (which you should secure
appropriately, especially as this instance will have permissions to run the AWS CLI against your
account, and the default configuration of this package includes admin rights for this purpose).

### Method 2: Connecting from Visual Studio Code (Locally installed IDE)

If you wish to use a local installation of VS Code, add this instance as a SSH target.

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
you need it. 

Using method 1 above, you should simply run the start instance command before starting the port
forwarding session.

```
aws ec2 start-instances --instance-ids i-12345678901234567
```

Using method 2 above, you can run the instance start command by changing the ProxyCommand line 
from above to include a call to the start-instances API.

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
