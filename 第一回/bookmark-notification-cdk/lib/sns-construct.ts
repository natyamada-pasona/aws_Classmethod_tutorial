import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subscriptions from 'aws-cdk-lib/aws-sns-subscriptions';

export interface SnsConstructProps {
  /** 通知先メールアドレス（CDK コンテキストまたは環境変数で指定） */
  emailAddress: string;
}

/**
 * タスク5：通知用 SNS トピック
 *
 * 記事共有時にメール通知を送信するための SNS トピック BookmarkNotification を作成し、
 * 指定されたメールアドレスへの E メールサブスクリプションを追加する。
 */
export class SnsConstruct extends Construct {
  public readonly topic: sns.Topic;

  constructor(scope: Construct, id: string, props: SnsConstructProps) {
    super(scope, id);

    this.topic = new sns.Topic(this, 'BookmarkNotification', {
      topicName: 'BookmarkNotification',
    });

    this.topic.addSubscription(
      new subscriptions.EmailSubscription(props.emailAddress),
    );

    new cdk.CfnOutput(cdk.Stack.of(this), 'BookmarkNotificationTopicArn', {
      value: this.topic.topicArn,
      description: 'SNS BookmarkNotification Topic ARN',
    });
  }
}
