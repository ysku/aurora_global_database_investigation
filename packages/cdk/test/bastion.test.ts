import { SynthUtils } from '@aws-cdk/assert';
import { App } from '@aws-cdk/core';

import { BastionStack } from '../lib/bastion';
import { VPCStack } from '../lib/vpc';

describe('BastionStack', () => {
  const app = new App();
  const vpc = new VPCStack(app, 'TestVPCStack');

  test('snapshot', () => {
    const stack = new BastionStack(app, 'TestBastionStack', {
      dbAccessSG: vpc.dbAccessSG,
      vpc: vpc.vpc,
    });
    expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
  });
});
