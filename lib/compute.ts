import { 
  Duration,
  aws_ec2 as ec2,
  aws_iam as iam,
  custom_resources as cr,
  Aws,
} from 'aws-cdk-lib';
import { BlockDeviceVolume, EbsDeviceVolumeType } from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import Software from './software';

interface ComputeProps {
  Vpc: ec2.Vpc;
}

export default class extends Construct {

  Instance: ec2.Instance;

  constructor(scope: Construct, id: string, props: ComputeProps) {
    super(scope, id);

    const amazonLinuxImage = new ec2.AmazonLinuxImage({
      edition: ec2.AmazonLinuxEdition.STANDARD,
      generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      storage: ec2.AmazonLinuxStorage.EBS,
      virtualization: ec2.AmazonLinuxVirt.HVM
    });
    
    this.Instance = new ec2.Instance(this, "DevInstance", {
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.M5, ec2.InstanceSize.XLARGE2),
      machineImage: amazonLinuxImage,
      vpc: props.Vpc,
      blockDevices: [
        {
          deviceName: '/dev/xvda',
          volume: BlockDeviceVolume.ebs(80, { volumeType: EbsDeviceVolumeType.GP3, encrypted: true }),
        },
      ],
      resourceSignalTimeout: Duration.minutes(30),
      keyName: process.env.KEYPAIR_NAME,
    });

    // Enforce instance metadata service v2
    new cr.AwsCustomResource(this, 'SetIMDSConfig', {
      policy: cr.AwsCustomResourcePolicy.fromSdkCalls({ resources: [ `arn:aws:ec2:${Aws.REGION}:${Aws.ACCOUNT_ID}:instance/${this.Instance.instanceId}` ] }),
      onUpdate: {
        action: 'modifyInstanceMetadataOptions',
        service: 'EC2',
        parameters: {
          InstanceId: this.Instance.instanceId,
          HttpTokens: 'required',
        },
        physicalResourceId: cr.PhysicalResourceId.of('DevEnvIMDSConfig'),
      }
    });

    this.Instance.addToRolePolicy(new iam.PolicyStatement({
      actions: ['*'],
      resources: ['*']
    }));

    new Software(this, 'software', { Instance: this.Instance });

    this.Instance.userData.addSignalOnExitCommand(this.Instance);
    this.Instance.userData.addOnExitCommands('reboot');
  }
}
