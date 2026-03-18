import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subscriptions from 'aws-cdk-lib/aws-sns-subscriptions';

export interface BookmarkSnsConstructProps {
  emailAddress: string;
}

/**
 * タスク6-⑧〜⑩：SNS トピック（BookmarkNotification）+ メールサブスクリプション
 */
export class BookmarkSnsConstruct extends Construct {
  public readonly topic: sns.Topic;

  constructor(scope: Construct, id: string, props: BookmarkSnsConstructProps) {
    super(scope, id);

    this.topic = new sns.Topic(this, 'BookmarkNotificationTopic', {
      topicName: 'BookmarkNotification',
    });

    this.topic.addSubscription(
      new subscriptions.EmailSubscription(props.emailAddress),
    );

    new cdk.CfnOutput(cdk.Stack.of(this), 'BookmarkNotificationTopicArn', {
      value: this.topic.topicArn,
      description: 'SNS BookmarkNotification ARN',
    });
  }
}
