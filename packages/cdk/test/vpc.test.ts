import { SynthUtils } from '@aws-cdk/assert';
import { App } from '@aws-cdk/core';

import { VPCStack } from '../lib/vpc';

describe('VPCStack', () => {
  const app = new App();

  test('snapshot', () => {
    const stack = new VPCStack(app, 'TestVPCStack');
    expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
  });
});
