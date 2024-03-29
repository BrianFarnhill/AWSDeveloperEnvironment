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

``` bash
npm install
```

Next you must export an environment variable for the keypair name. This will be assigned to the
EC2 instance that is created. If you do not provide a keypair you will not be able to SSH to
this instance via a local install of VS Code (method 2 below), and you will only be able to use
the web based version that is installed.

``` bash
export KEYPAIR_NAME="KeyPairName"
```

Then you can build and deploy the solution with these commands.

### AWS CLI and Session Manager plugin

To connect to this instance after it is provisioned, you need the AWS CLI with the Session Manager
plugin installed. Review these links and install versions appropriate to your platform.

* [Installing, updating, and uninstalling the AWS CLI version 2](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html)
* [Install the Session Manager plugin for the AWS CLI - AWS Systems Manager](https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager-working-with-install-plugin.html)

### AWS CDK Bootstrapping

As this template is deployed via the AWS CDK, you need to ensure the account/region you are
deploying too has the latest version of the bootstrap installed. To perform this, run this
command from the directory this repo is stored, substituting in the AWS account ID and region
you are deploying to.

``` bash
npx cdk bootstrap aws://[ACCOUNT ID]/[REGION]
```

## Deploying the template

### Via the cli

You can build and deploy the solution with the deploy command. This will do a full build first
before deployment.

``` bash
npm run deploy
```

## Configure session manager run as account

The scripts in this instance assume you will connect to the instance as `ec2-user`. To allow
this, you must configure one of the options for run as account names. See
[Turn on run as support for Linux and macOS instances](https://docs.aws.amazon.com/systems-manager/latest/userguide/session-preferences-run-as.html)
for instructions on how to do this.

### (Optional) Install fonts used in default terminal configuration

The default configuration of this instance uses [PowerLevel10k](https://github.com/romkatv/powerlevel10k)
as the theme for ZShell. The recommended font family for this is Meslo, and this  is also
configured to be the default font used by the terminal in the web hosted VSCode installation.
It's recommended to install and use that font with this deployment regardless of how you plan
to connect to VSCode.

[Installing Meslo font for PowerLevel10k](https://github.com/romkatv/powerlevel10k#meslo-nerd-font-patched-for-powerlevel10k)

## Running Visual Studio Code

### Method 1: Connecting to Visaul Studio Code (Web Browser)

This instance includes a web based version of VS Code (powered by [OpenVSCode-Server](https://github.com/gitpod-io/openvscode-server)).
As the instance itself sits in a private network, this can be access via port forward that can
be established via Session Manager. The server operates on port 3000 by default, so the below
command will create the port forward connection.

``` bash
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

### Installing VS Code Extensions

To speed up the process of installing common extensions (based purely on my own usage and relating
to the langauges and tools installed in this image) a script is deployed to the remote instance
in the OpenVSCode diretory. To install these extensions run the following command the first time
you connect to the web broser instance (in ther terminal window).

``` bash
~/.opencode-server/install-extensions.sh
```

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

   Windows Example:

   ``` bash
   Host AWSDeveloper
      HostName i-12345678901234567
      IdentityFile ~/.ssh/YourKeyNameHere.pem
      User ec2-user
      ProxyCommand C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe "aws ssm start-session --target %h --document-name AWS-StartSSHSession --parameters portNumber=%p"
   ```

   Linux Example:

   ```bash
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

``` bash
aws ec2 start-instances --instance-ids i-12345678901234567
```

You might also consider a script that powers the instance on if it needs it, as well as logging
yourself in if needed, and directly opening the SSM port forward session. An example of this
type of script is below. It assumes the environment variable `DEV_INSTANCE` is set to the ID
of your instance.

Windows example:

```bash
aws sts get-caller-identity | Out-Null
if ($? -eq $false) {
    aws sso login
}
$STATUS="$(aws ec2 describe-instance-status --include-all-instances --instance-ids $DEV_INSTANCE --query 'InstanceStatuses[*].InstanceState.Name' --output text)"
if ($STATUS -eq "stopped") {
    aws ec2 start-instances --instance-ids $DEV_INSTANCE | Out-Null 
    aws ec2 wait instance-status-ok --instance-ids $DEV_INSTANCE | Out-Null
}
aws ssm start-session --target $DEV_INSTANCE --document-name AWS-StartPortForwardingSession --parameters '{""portNumber"":[""3000""], ""localPortNumber"":[""3000""]}'

```

Linux example:

```bash
aws sts get-caller-identity > /dev/null
if [ $? -gt 0 ]
then
aws sso login
fi
STATUS="$(aws ec2 describe-instance-status --include-all-instances --instance-ids $DEV_INSTANCE --query 'InstanceStatuses[*].InstanceState.Name' --output text)"
if [ $STATUS = "stopped" ]
then
echo "Powering on EC2 instance..."
aws ec2 start-instances --instance-ids $DEV_INSTANCE > /dev/null
aws ec2 wait instance-status-ok --instance-ids $DEV_INSTANCE > /dev/null
fi
aws ssm start-session --target $DEV_INSTANCE --document-name AWS-StartPortForwardingSession --parameters '{"portNumber":["3000"], "localPortNumber":["3000"]}'
```

Using method 2 above, you can run the instance start command by changing the ProxyCommand line
from above to include a call to the start-instances API.

Windows Example:

``` bash
    ProxyCommand C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe "aws ec2 start-instances --instance-ids %h;aws ssm start-session --target %h --document-name AWS-StartSSHSession --parameters portNumber=%p"
```

Linux Example:

``` bash
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
* Consider using a custom AMI that includes hardened configurations for Amazon Linux 2

## What's included in the instance?

The following is a list of items that can be installed in the developer instance:

* zshell (with oh-my-zshell and additional plug-ins)
* Ruby (using rbenv for version management)
* NodeJS (using nvm for version management)
* Python (using pyenv for version management)
* Dotnet core
* PowerShell
