import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import { DynamoDbConstruct } from './dynamodb-construct';
import { SnsConstruct } from './sns-construct';
import { LambdaConstruct } from './lambda-construct';
import { StepFunctionsConstruct } from './stepfunctions-construct';
import { EventBridgeConstruct } from './eventbridge-construct';

export class ServerlessCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // タスク1: DynamoDB テーブル（Orders + OrderAuditLogs）
    const database = new DynamoDbConstruct(this, 'Database');

    // タスク2: SNS トピック（order-notification-topic）+ メールサブスクリプション
    const emailAddress = this.node.tryGetContext('notificationEmail') || 'natsumi.yamada@dtc.work';
    const snsNotification = new SnsConstruct(this, 'Sns', { emailAddress });

    // タスク3: Lambda 関数（save_order, send_notification, save_audit_log）
    const lambdaFunctions = new LambdaConstruct(this, 'Lambda', {
      ordersTable: database.ordersTable,
      auditLogsTable: database.auditLogsTable,
      notificationTopic: snsNotification.topic,
    });

    // タスク4: Step Functions（3つの Lambda を並列実行）
    const stepFunctions = new StepFunctionsConstruct(this, 'StepFunctions', {
      saveOrderFn: lambdaFunctions.saveOrderFn,
      sendNotificationFn: lambdaFunctions.sendNotificationFn,
      saveAuditLogFn: lambdaFunctions.saveAuditLogFn,
    });

    // タスク5: EventBridge ルール（OrderCreated → Step Functions）
    new EventBridgeConstruct(this, 'EventBridge', {
      stateMachine: stepFunctions.stateMachine,
    });
  }
}
