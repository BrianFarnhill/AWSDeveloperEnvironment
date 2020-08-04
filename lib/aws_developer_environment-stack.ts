import * as cdk from '@aws-cdk/core'
import * as ec2 from '@aws-cdk/aws-ec2'
import * as cloudwatch from '@aws-cdk/aws-cloudwatch'
import * as sns from '@aws-cdk/aws-sns'
import * as subscriptions from '@aws-cdk/aws-sns-subscriptions'
import * as lambda from '@aws-cdk/aws-lambda'
import * as iam from '@aws-cdk/aws-iam'
import * as userData from './UserData'
import { Duration } from '@aws-cdk/core'

const fs = require('fs')

export class AwsDeveloperEnvironmentStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const vpc = ec2.Vpc.fromLookup(this, "DefaultVPC", {isDefault: true})
    const subnets = vpc.selectSubnets({
      availabilityZones: [ `${this.region}a` ],
    })

    const amazonLinuxImage = new ec2.AmazonLinuxImage({
      edition: ec2.AmazonLinuxEdition.STANDARD,
      generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      storage: ec2.AmazonLinuxStorage.EBS,
      virtualization: ec2.AmazonLinuxVirt.HVM
    })

    const devInstance = new ec2.Instance(this, "DevInstance", {
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.C5, ec2.InstanceSize.LARGE),
      machineImage: amazonLinuxImage,
      vpc,
      vpcSubnets: subnets,
      blockDevices: [
        {
          deviceName: '/dev/xvda',
          volume: {
            ebsDevice: {
              volumeType: ec2.EbsDeviceVolumeType.GP2,
              volumeSize: 20
            }
          }
        }
      ],
      keyName: process.env.KEYPAIR_NAME,
      resourceSignalTimeout: Duration.minutes(30)
    })
    devInstance.userData.addCommands(
      userData.coreInstall,
      userData.rubyInstall,
      userData.nodeInstall,
      userData.pythonInstall,
      userData.dotnetInstall,
      userData.powerShellInstall,
      userData.finalise
    )
    devInstance.userData.addSignalOnExitCommand(devInstance)
    devInstance.userData.addOnExitCommands('reboot')

    devInstance.addToRolePolicy(new iam.PolicyStatement({
      actions: ['*'],
      resources: ['*']
    }))

    const repoVolume = new ec2.Volume(this, "RepoVolume", {
      availabilityZone: `${this.region}a`,
      size: cdk.Size.gibibytes(50),
      encrypted: true
    })
    repoVolume.grantAttachVolumeByResourceTag(devInstance.grantPrincipal, [devInstance])

    const targetDevice = '/dev/sda1'
    const mountPath = '/home/ec2-user/repos'
    devInstance.userData.addCommands(
      `export INSTANCE_ID="$(curl http://169.254.169.254/latest/meta-data/instance-id/)"`,
      `aws --region ${this.region} ec2 attach-volume --volume-id ${repoVolume.volumeId} --instance-id $INSTANCE_ID --device ${targetDevice}`,
      `while ! test -e ${targetDevice}; do sleep 1; done`,
      `mke2fs -t ext3 -L repos ${targetDevice}`,
      `mkdir ${mountPath}`,
      `mount ${targetDevice} ${mountPath}`,
      `chown ec2-user ${mountPath}`,
      `echo 'LABEL=repos     ${mountPath}    ext4    defaults        0       0' >> /etc/fstab`
    )

//     const efsInstall = new cfn.CustomResource(this, `BuildUserData-EfsInstall`, {
//       provider: cfn.CustomResourceProvider.lambda(userDataFunction),
//       properties: {
//           VERSION: '`',
//           SCRIPT: `
// sudo -u ec2-user mkdir /home/ec2-user/repos
// echo '${repoShare.ref}.efs.${cdk.Aws.REGION}.amazonaws.com:/  /home/ec2-user/repos    nfs     nfsvers=4.1,rsize=1048576,wsize=1048576,hard,timeo=600,retrans=2,noresvport     0       0' >> /etc/fstab
// mount -t nfs -o nfsvers=4.1,rsize=1048576,wsize=1048576,hard,timeo=600,retrans=2,noresvport ${repoShare.ref}.efs.${cdk.Aws.REGION}.amazonaws.com:/ /home/ec2-user/repos
// chown ec2-user /home/ec2-user/repos
   
// `
//       }
//     })

    const powerOffFunction = new lambda.Function(this, "PowerOffFunction", {
      code: lambda.Code.fromInline(fs.readFileSync("./lib/poweroff.js").toString()),
      handler: 'index.handler',
      runtime: lambda.Runtime.NODEJS_12_X,
      memorySize: 128,
      timeout: Duration.seconds(5),
      description: `Powers off the ${cdk.Aws.STACK_NAME} developer environment`,
      environment: {
        INSTANCE_ID: devInstance.instanceId
      }
    })
    powerOffFunction.addToRolePolicy(new iam.PolicyStatement({
      actions: [
        'ec2:StopInstances'
      ],
      resources: [
        `arn:aws:ec2:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:instance/${devInstance.instanceId}`
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
      threshold: 1500000,
      treatMissingData: "breaching",
      dimensions: [{
        name: "InstanceId",
        value: devInstance.instanceId
      }],
      alarmActions: [
        inactiveTopic.topicArn
      ]
    }) 
  }
}
