import * as cdk from 'aws-cdk-lib';
import * as DevEnvStack from '../lib/stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new DevEnvStack.DevEnvStack(app, 'MyTestStack');
    // THEN
    const actual = app.synth().getStackArtifact(stack.artifactId).template;
    expect(actual.Resources ?? {}).toEqual({});
});
