import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

/**
 * タスク３-a：DynamoDB テーブル
 *
 * ユニコーンの配車リクエストを保存する Rides テーブルを作成する。
 * パーティションキーは RideId（文字列）。
 */
export class DynamoDbConstruct extends Construct {
  /** Lambda Construct など外部から参照するためのテーブル */
  public readonly table: dynamodb.Table;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.table = new dynamodb.Table(this, 'Rides', {
      tableName: 'Rides',
      partitionKey: { name: 'RideId', type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY, // 演習用のため、スタック削除時にテーブルも削除
    });

    new cdk.CfnOutput(cdk.Stack.of(this), 'RidesTableArn', {
      value: this.table.tableArn,
      description: 'DynamoDB Rides Table ARN',
    });
  }
}
