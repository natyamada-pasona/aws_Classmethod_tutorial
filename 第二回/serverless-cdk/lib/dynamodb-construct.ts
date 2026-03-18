import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

/**
 * タスク1：DynamoDB テーブル作成
 *
 * - Orders：注文管理用テーブル（パーティションキー: orderId）
 * - OrderAuditLogs：ログ用テーブル（パーティションキー: eventId、ソートキー: createdAt）
 */
export class DynamoDbConstruct extends Construct {
  public readonly ordersTable: dynamodb.Table;
  public readonly auditLogsTable: dynamodb.Table;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    // Orders テーブル
    this.ordersTable = new dynamodb.Table(this, 'OrdersTable', {
      tableName: 'Orders',
      partitionKey: { name: 'orderId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // OrderAuditLogs テーブル
    this.auditLogsTable = new dynamodb.Table(this, 'OrderAuditLogsTable', {
      tableName: 'OrderAuditLogs',
      partitionKey: { name: 'eventId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'createdAt', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
  }
}
