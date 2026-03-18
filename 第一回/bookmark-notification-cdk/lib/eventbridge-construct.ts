import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import * as events from 'aws-cdk-lib/aws-events';

/**
 * タスク4：EventBridge イベントバス
 *
 * 「記事が共有された」イベントを複数のターゲットに分配するための
 * カスタムイベントバス bookmarks-bus を作成する。
 */
export class EventBridgeConstruct extends Construct {
  public readonly bus: events.EventBus;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.bus = new events.EventBus(this, 'BookmarksBus', {
      eventBusName: 'bookmarks-bus',
    });

    new cdk.CfnOutput(cdk.Stack.of(this), 'BookmarksBusArn', {
      value: this.bus.eventBusArn,
      description: 'EventBridge bookmarks-bus ARN',
    });
  }
}
