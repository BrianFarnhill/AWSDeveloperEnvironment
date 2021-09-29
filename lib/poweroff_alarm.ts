import {
  Aws, Duration,
  aws_cloudwatch as cloudwatch,
  aws_cloudwatch_actions as actions,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';


interface PowerOffAlarmProps {
  InstanceId: string,
}

export default class extends Construct {

  constructor(scope: Construct, id: string, props: PowerOffAlarmProps) {
    super(scope, id);
    
    const alarm = new cloudwatch.Alarm(this, "NetworkInactiveAlarm", {
      alarmName: `${Aws.STACK_NAME}-TrafficInactive`,
      metric: new cloudwatch.Metric({
        metricName: 'NetworkOut',
        namespace: 'AWS/EC2',
        period: Duration.hours(1),
        statistic: cloudwatch.Statistic.SUM,
        dimensionsMap: {
          InstanceId: props.InstanceId,
        },
      }),
      evaluationPeriods: 1,
      threshold: 1500000,
      comparisonOperator: cloudwatch.ComparisonOperator.LESS_THAN_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.BREACHING,
    });
    alarm.addAlarmAction(new actions.Ec2Action(actions.Ec2InstanceAction.STOP))
  }
}
