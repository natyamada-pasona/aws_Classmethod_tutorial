import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import { HostingConstruct } from './hosting-construct';
import { AuthConstruct } from './auth-construct';

export class WildrydesCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new HostingConstruct(this, 'Hosting');
    new AuthConstruct(this, 'Auth');
  }
}
