import {
  CfnSecurityGroupIngress,
  SecurityGroup,
  SubnetType,
  Vpc,
  VpcProps,
} from '@aws-cdk/aws-ec2';
import { App, Stack, StackProps } from '@aws-cdk/core';

export class VPCStack extends Stack {
  readonly vpc: Vpc;
  readonly dbAccessSG: SecurityGroup;
  readonly dbSG: SecurityGroup;
  readonly instanceSG: SecurityGroup;

  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);

    const vpcProps: VpcProps = {
      cidr: '192.168.0.0/16',
      enableDnsHostnames: true,
      enableDnsSupport: true,
      maxAzs: 3,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'public',
          subnetType: SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: 'private',
          subnetType: SubnetType.PRIVATE,
        },
        {
          cidrMask: 24,
          name: 'isolated',
          subnetType: SubnetType.ISOLATED,
        },
      ],
    };

    // NOTE: default security group will be also created
    this.vpc = new Vpc(this, 'VPC', vpcProps);

    this.dbAccessSG = new SecurityGroup(this, 'dbaccesssg', {
      vpc: this.vpc,
      description: 'for instances that access database',
      securityGroupName: 'Database Access',
    });

    this.dbSG = new SecurityGroup(this, 'dbsg', {
      vpc: this.vpc,
      description: 'for database',
      securityGroupName: 'Database',
    });

    this.instanceSG = new SecurityGroup(this, 'instancesg', {
      vpc: this.vpc,
      description: 'for ec2 instance',
      securityGroupName: 'Instance',
    });

    // allow DatabaseSG to access from DBAccessSG
    new CfnSecurityGroupIngress(this, 'fromdbaccesssg', {
      groupId: this.dbSG.securityGroupId,
      ipProtocol: 'tcp',
      description: `from instances with sg named ${this.dbAccessSG.securityGroupName}`,
      fromPort: 5432,
      toPort: 5432,
      sourceSecurityGroupId: this.dbAccessSG.securityGroupId,
    });

    // allow DatabaseSG to access from DBAccessSG
    new CfnSecurityGroupIngress(this, 'frominstance', {
      groupId: this.dbSG.securityGroupId,
      ipProtocol: 'tcp',
      description: `from instances with sg named ${this.instanceSG.securityGroupName}`,
      fromPort: 5432,
      toPort: 5432,
      sourceSecurityGroupId: this.instanceSG.securityGroupId,
    });
  }
}
