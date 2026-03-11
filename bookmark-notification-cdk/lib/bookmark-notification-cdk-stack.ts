import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import { DynamoDbConstruct } from './dynamodb-construct';
import { LambdaConstruct } from './lambda-construct';
import { EventBridgeConstruct } from './eventbridge-construct';
import { SnsConstruct } from './sns-construct';
import { NotifyRuleConstruct } from './notify-rule-construct';
import { ApiConstruct } from './api-construct';

/**
 * 演習2：EventBridge によるメッセージのファンアウト メインスタック
 *
 * 各 Construct が演習の各タスクに対応:
 *   - Database      : タスク1 - DynamoDB テーブル（ArticlesTable + Streams）
 *   - Lambda        : タスク2 & 3 - StreamToEventBridge 関数 + トリガー接続
 *   - EventBridge   : タスク4 - EventBridge イベントバス（bookmarks-bus）
 *   - Sns           : タスク5 - SNS トピック（BookmarkNotification）+ メール通知
 *   - NotifyRule    : タスク6 - EventBridge ルール（notify-rule）→ SNS 転送
 *   - Api           : タスク7 & 8 - DynamoDBWriteFunction + HTTP API Gateway
 */
export class BookmarkNotificationCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // タスク1: DynamoDB テーブル（Streams 有効）
    const database = new DynamoDbConstruct(this, 'Database');

    // タスク2 & 3: Lambda 関数 + DynamoDB Stream トリガー
    new LambdaConstruct(this, 'Lambda', { table: database.table });

    // タスク4: EventBridge イベントバス
    const eventBridge = new EventBridgeConstruct(this, 'EventBridge');

    // タスク5: SNS トピック + メールサブスクリプション
    const emailAddress = this.node.tryGetContext('notificationEmail') || 'natsumi.yamada@dtc.work';
    const snsNotification = new SnsConstruct(this, 'Sns', { emailAddress });

    // タスク6: EventBridge ルール → SNS 通知
    new NotifyRuleConstruct(this, 'NotifyRule', {
      bus: eventBridge.bus,
      topic: snsNotification.topic,
    });

    // タスク7 & 8: DynamoDB 書き込み Lambda + HTTP API Gateway
    new ApiConstruct(this, 'Api', { table: database.table });
  }
}
