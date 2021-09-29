import {
  Aws, 
  aws_cloudwatch as cloudwatch,
  aws_lambda as lambda,
  aws_sns as sns,
  aws_sns_subscriptions as subscriptions,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';


interface PowerOffAlarmProps {
  InstanceId: string,
  LambdaFunction: lambda.Function;
}

export default class extends Construct {

  constructor(scope: Construct, id: string, props: PowerOffAlarmProps) {
    super(scope, id);

    const inactiveTopic = new sns.Topic(this, "PowerOffTopic", {});
    inactiveTopic.addSubscription(new subscriptions.LambdaSubscription(props.LambdaFunction));

    new cloudwatch.CfnAlarm(this, "NetworkInactiveAlarm", {
      alarmName: `${Aws.STACK_NAME}-TrafficInactive`,
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
        value: props.InstanceId,
      }],
      alarmActions: [
        inactiveTopic.topicArn,
      ],
    });
    
  }
}
