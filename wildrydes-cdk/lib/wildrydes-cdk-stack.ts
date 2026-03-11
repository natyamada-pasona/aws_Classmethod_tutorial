import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import { HostingConstruct } from './hosting-construct';
import { AuthConstruct } from './auth-construct';
import { DynamoDbConstruct } from './dynamodb-construct';
import { LambdaConstruct } from './lambda-construct';
import { ApiConstruct } from './api-construct';

/**
 * Wild Rydes アプリケーションのメインスタック
 *
 * 各 Construct が演習の各タスクに対応:
 *   - Hosting  : タスク１ - 静的ウェブホスティング（CodeCommit + Amplify）
 *   - Auth     : タスク２ - ユーザー認証（Cognito）
 *   - Database : タスク３ - データストア（DynamoDB）
 *   - Lambda   : タスク３ - バックエンド処理（Lambda）
 *   - Api      : タスク４ - RESTful API（API Gateway）
 */
export class WildrydesCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // タスク１: 静的ウェブホスティング
    new HostingConstruct(this, 'Hosting');

    // タスク２: ユーザー認証
    const auth = new AuthConstruct(this, 'Auth');

    // タスク３: サーバーレスバックエンド
    const database = new DynamoDbConstruct(this, 'Database');
    const lambdaBackend = new LambdaConstruct(this, 'Lambda', { table: database.table });

    // タスク４: RESTful API
    new ApiConstruct(this, 'Api', {
      userPool: auth.userPool,
      requestUnicornFn: lambdaBackend.requestUnicornFn,
    });
  }
}
