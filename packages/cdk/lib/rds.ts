import {
  InstanceClass,
  InstanceSize,
  InstanceType,
  SecurityGroup,
  SubnetType,
  Vpc,
} from '@aws-cdk/aws-ec2';
import {
  AuroraPostgresEngineVersion,
  Credentials,
  DatabaseCluster,
  DatabaseClusterEngine,
  ParameterGroup,
} from '@aws-cdk/aws-rds';
import { Secret } from '@aws-cdk/aws-secretsmanager';
import { App, Stack, StackProps } from '@aws-cdk/core';

export type RDSStackProps = {
  dbClusterIdentifier: string;
  dbName: string;
  dbSG: SecurityGroup;
  dbUserName: string;
  vpc: Vpc;
} & StackProps;

export class RDSStack extends Stack {
  readonly dbCluster: DatabaseCluster;
  readonly secret: Secret;

  constructor(scope: App, id: string, props: RDSStackProps) {
    super(scope, id, props);

    const { dbClusterIdentifier, dbName, dbSG, dbUserName, vpc } = props;

    // use secret manager to configure database username and password
    // cf. https://docs.aws.amazon.com/ja_jp/secretsmanager/latest/userguide/intro.html
    this.secret = new Secret(this, 'Secret', {
      secretName: `${id}Secret`,
      description: 'RDS database auto-generated user password',
      generateSecretString: {
        excludeCharacters: ':/?#[]@!$&"\'()*+,;=%{}|\\^~[]`',
        generateStringKey: 'password',
        passwordLength: 32,
        secretStringTemplate: `{"username": "${dbUserName}"}`,
      },
    });

    const parameterGroup = new ParameterGroup(this, 'RDSParameterGroup', {
      description: `parameter group for ${dbName}`,
      engine: DatabaseClusterEngine.auroraPostgres({
        version: AuroraPostgresEngineVersion.VER_10_7,
      }),
      parameters: {
        log_statement: 'all',
      },
    });

    this.dbCluster = new DatabaseCluster(this, 'RDS', {
      clusterIdentifier: dbClusterIdentifier,
      // cannot use upper case characters.
      defaultDatabaseName: dbName,
      parameterGroup: parameterGroup,
      instances: 2,
      instanceProps: {
        instanceType: InstanceType.of(InstanceClass.R4, InstanceSize.LARGE),
        vpc: vpc,
        vpcSubnets: {
          subnetType: SubnetType.ISOLATED,
        },
        securityGroups: [dbSG],
      },
      port: 5432,
      engine: DatabaseClusterEngine.auroraPostgres({
        version: AuroraPostgresEngineVersion.VER_10_7,
      }),
      credentials: Credentials.fromSecret(this.secret),
    });
  }
}
