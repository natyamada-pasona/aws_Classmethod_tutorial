import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import { DynamoDbConstruct } from './dynamodb-construct';

export class ServerlessCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // タスク1: DynamoDB テーブル（Orders + OrderAuditLogs）
    const database = new DynamoDbConstruct(this, 'Database');
  }
}
