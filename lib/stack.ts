import { 
  Stack, StackProps,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import Compute from './compute';
import Networking from './networking';
import PoweroffAlarm from './poweroff_alarm';

export class DevEnvStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const network = new Networking(this, 'networking');
    const compute = new Compute(this, 'compute', { Vpc: network.Vpc });
    new PoweroffAlarm(this, 'poweroff', { InstanceId: compute.Instance.instanceId });
  }
}
