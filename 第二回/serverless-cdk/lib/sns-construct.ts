import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subscriptions from 'aws-cdk-lib/aws-sns-subscriptions';

export interface SnsConstructProps {
  emailAddress: string;
}

/**
 * タスク2：SNS トピック作成
 *
 * 注文通知用の SNS トピック order-notification-topic を作成し、
 * 指定メールアドレスへの E メールサブスクリプションを追加する。
 */
export class SnsConstruct extends Construct {
  public readonly topic: sns.Topic;

  constructor(scope: Construct, id: string, props: SnsConstructProps) {
    super(scope, id);

    this.topic = new sns.Topic(this, 'OrderNotificationTopic', {
      topicName: 'order-notification-topic',
    });

    this.topic.addSubscription(
      new subscriptions.EmailSubscription(props.emailAddress),
    );

    new cdk.CfnOutput(cdk.Stack.of(this), 'OrderNotificationTopicArn', {
      value: this.topic.topicArn,
      description: 'SNS order-notification-topic ARN',
    });
  }
}
