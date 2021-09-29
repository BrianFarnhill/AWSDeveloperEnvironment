import {
  Aws, Duration,
  aws_iam as iam,
  aws_lambda as lambda,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as path from 'path';
import PoweroffAlarm from './poweroff_alarm';

interface PowerOffFunctionProps {
  InstanceId: string;
}

export default class extends Construct {

  LambdaFunction: lambda.Function;

  constructor(scope: Construct, id: string, props: PowerOffFunctionProps) {
    super(scope, id);

    this.LambdaFunction = new lambda.Function(this, "PowerOffFunction", {
      code: lambda.Code.fromAsset(path.resolve(__dirname, './poweroff')),
      handler: 'index.handler',
      runtime: lambda.Runtime.NODEJS_12_X,
      memorySize: 128,
      timeout: Duration.seconds(5),
      description: `Powers off the developer environment`,
      environment: {
        INSTANCE_ID: props.InstanceId
      }
    });

    this.LambdaFunction.addToRolePolicy(new iam.PolicyStatement({
      actions: [
        'ec2:StopInstances'
      ],
      resources: [
        `arn:aws:ec2:${Aws.REGION}:${Aws.ACCOUNT_ID}:instance/${props.InstanceId}`
      ]
    }));

    new PoweroffAlarm(this, 'poweroffalarm', { InstanceId: props.InstanceId, LambdaFunction: this.LambdaFunction });
  }
}
