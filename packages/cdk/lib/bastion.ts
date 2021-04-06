import {
  GenericLinuxImage,
  Instance,
  InstanceClass,
  InstanceSize,
  InstanceType,
  SecurityGroup,
  Vpc,
} from '@aws-cdk/aws-ec2';
import { ManagedPolicy, Role, ServicePrincipal } from '@aws-cdk/aws-iam';
import { App, Stack, StackProps } from '@aws-cdk/core';

export type BastionProps = {
  dbAccessSG: SecurityGroup;
  vpc: Vpc;
} & StackProps;

export class BastionStack extends Stack {
  constructor(scope: App, id: string, props: BastionProps) {
    super(scope, id, props);

    const { dbAccessSG, vpc } = props;

    new Instance(this, 'bastion', {
      instanceName: 'bastion',
      vpc,
      instanceType: InstanceType.of(InstanceClass.T2, InstanceSize.MICRO),
      machineImage: new GenericLinuxImage({
        'ap-northeast-1': 'ami-059b6d3840b03d6dd', // Ubuntu Server 20.04 LTS (HVM), SSD Volume Type
      }),
      securityGroup: dbAccessSG,
      role: new Role(this, 'bastion-role', {
        assumedBy: new ServicePrincipal('ec2.amazonaws.com'),
        managedPolicies: [
          ManagedPolicy.fromAwsManagedPolicyName(
            'AmazonSSMManagedInstanceCore'
          ),
        ],
      }),
    });
  }
}
