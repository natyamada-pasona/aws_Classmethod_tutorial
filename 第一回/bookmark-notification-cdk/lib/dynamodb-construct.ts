import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

/**
 * タスク1：DynamoDB テーブル
 *
 * 記事（ブックマーク）情報を保存する ArticlesTable を作成する。
 * パーティションキーは id（文字列）。
 * DynamoDB Streams を有効化し、新旧イメージ（NEW_AND_OLD_IMAGES）を出力する。
 */
export class DynamoDbConstruct extends Construct {
  public readonly table: dynamodb.Table;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.table = new dynamodb.Table(this, 'ArticlesTable', {
      tableName: 'ArticlesTable',
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    new cdk.CfnOutput(cdk.Stack.of(this), 'ArticlesTableArn', {
      value: this.table.tableArn,
      description: 'DynamoDB ArticlesTable ARN',
    });
  }
}
