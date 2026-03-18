import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

/**
 * タスク1：DynamoDB テーブル作成
 *
 * - BookmarksTable：パーティションキー content（String）
 */
export class BookmarkDynamoDbConstruct extends Construct {
  public readonly bookmarksTable: dynamodb.Table;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.bookmarksTable = new dynamodb.Table(this, 'BookmarksTable', {
      tableName: 'BookmarksTable',
      partitionKey: { name: 'content', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
  }
}
