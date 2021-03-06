#!/usr/bin/env node
import 'source-map-support/register';
import { App } from '@aws-cdk/core';
import { RDSStack } from '../lib/rds';
import { VPCStack } from '../lib/vpc';
import { BastionStack } from '../lib/bastion';

const app = new App();
const vpc = new VPCStack(app, 'ysku-vpc');
new RDSStack(app, 'ysku-rds', {
  dbClusterIdentifier: 'existing-cluster',
  dbName: 'sample',
  dbSG: vpc.dbSG,
  dbUserName: 'ysku',
  vpc: vpc.vpc,
});
new BastionStack(app, 'ysku-bastion', {
  dbAccessSG: vpc.dbAccessSG,
  vpc: vpc.vpc,
});
