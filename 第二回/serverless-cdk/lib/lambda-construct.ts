import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as path from 'path';

export interface LambdaConstructProps {
  ordersTable: dynamodb.Table;
  auditLogsTable: dynamodb.Table;
  notificationTopic: sns.Topic;
}

/**
 * タスク3：Lambda 関数作成（3種）
 *
 * - save_order: Orders テーブルへ注文を保存
 * - send_notification: SNS で注文通知を送信
 * - save_audit_log: OrderAuditLogs テーブルへ監査ログを保存
 */
export class LambdaConstruct extends Construct {
  public readonly saveOrderFn: lambda.Function;
  public readonly sendNotificationFn: lambda.Function;
  public readonly saveAuditLogFn: lambda.Function;

  constructor(scope: Construct, id: string, props: LambdaConstructProps) {
    super(scope, id);

    // save_order
    this.saveOrderFn = new lambda.Function(this, 'SaveOrder', {
      functionName: 'save_order',
      runtime: lambda.Runtime.PYTHON_3_11,
      handler: 'lambda_function.lambda_handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '..', 'lambda', 'save-order')),
    });
    props.ordersTable.grantReadWriteData(this.saveOrderFn);

    // send_notification
    this.sendNotificationFn = new lambda.Function(this, 'SendNotification', {
      functionName: 'send_notification',
      runtime: lambda.Runtime.PYTHON_3_11,
      handler: 'lambda_function.lambda_handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '..', 'lambda', 'send-notification')),
      environment: {
        SNS_TOPIC_ARN: props.notificationTopic.topicArn,
      },
    });
    props.notificationTopic.grantPublish(this.sendNotificationFn);

    // save_audit_log
    this.saveAuditLogFn = new lambda.Function(this, 'SaveAuditLog', {
      functionName: 'save_audit_log',
      runtime: lambda.Runtime.PYTHON_3_11,
      handler: 'lambda_function.lambda_handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '..', 'lambda', 'save-audit-log')),
    });
    props.auditLogsTable.grantReadWriteData(this.saveAuditLogFn);
  }
}
