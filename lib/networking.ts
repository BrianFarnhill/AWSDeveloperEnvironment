import { aws_ec2 as ec2 } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export default class extends Construct {

  Vpc: ec2.Vpc;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.Vpc = new ec2.Vpc(this, 'DevEnvVpc', {
      cidr: '10.0.0.0/27',
      maxAzs: 1,
      subnetConfiguration: [
        { name: 'Public', subnetType: ec2.SubnetType.PUBLIC },
        { name: 'Private', subnetType: ec2.SubnetType.PRIVATE_WITH_NAT },
      ],
    });
  }
}
