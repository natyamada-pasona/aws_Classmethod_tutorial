import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import { DynamoDbConstruct } from './dynamodb-construct';
import { LambdaConstruct } from './lambda-construct';

/**
 * 演習2：EventBridge によるメッセージのファンアウト メインスタック
 *
 * 各 Construct が演習の各タスクに対応:
 *   - Database : タスク1 - DynamoDB テーブル（ArticlesTable + Streams）
 *   - Lambda   : タスク2 & 3 - StreamToEventBridge 関数 + トリガー接続
 */
export class BookmarkNotificationCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // タスク1: DynamoDB テーブル（Streams 有効）
    const database = new DynamoDbConstruct(this, 'Database');

    // タスク2 & 3: Lambda 関数 + DynamoDB Stream トリガー
    new LambdaConstruct(this, 'Lambda', { table: database.table });
  }
}
