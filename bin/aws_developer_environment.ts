#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { AwsDeveloperEnvironmentStack } from '../lib/aws_developer_environment-stack';

const app = new cdk.App();
new AwsDeveloperEnvironmentStack(app, 'AwsDeveloperEnvironmentStack', {
    stackName: 'AwsDevEnvironment',
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION
    }
});
