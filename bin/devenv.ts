#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { DevEnvStack } from '../lib/stack';

const app = new cdk.App();
new DevEnvStack(app, 'DevEnvStack', {});