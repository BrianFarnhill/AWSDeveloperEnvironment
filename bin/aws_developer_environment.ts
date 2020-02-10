#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { AwsDeveloperEnvironmentStack } from '../lib/aws_developer_environment-stack';

const app = new cdk.App();
new AwsDeveloperEnvironmentStack(app, 'AwsDeveloperEnvironmentStack');
