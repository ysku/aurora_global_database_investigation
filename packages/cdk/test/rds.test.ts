import { SynthUtils } from '@aws-cdk/assert';
import { App } from '@aws-cdk/core';

import { RDSStack } from '../lib/rds';
import { VPCStack } from '../lib/vpc';

describe('RDSStack', () => {
  const app = new App();
  const vpc = new VPCStack(app, 'TestVPCStack');

  test('snapshot', () => {
    const stack = new RDSStack(app, 'TestRDSStack', {
      dbClusterIdentifier: 'test-db-cluster-name',
      dbName: 'test-db-name',
      dbSG: vpc.dbSG,
      dbUserName: 'test-user',
      vpc: vpc.vpc,
    });
    expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
  });
});
