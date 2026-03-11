import { Construct } from 'constructs';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as sns from 'aws-cdk-lib/aws-sns';

export interface NotifyRuleConstructProps {
  bus: events.EventBus;
  topic: sns.Topic;
}

/**
 * タスク6：EventBridge ルール
 *
 * bookmarks-bus 上で source=articles.service, detail-type=ArticleShared の
 * イベントを検知し、SNS トピック BookmarkNotification に転送するルールを作成する。
 */
export class NotifyRuleConstruct extends Construct {
  constructor(scope: Construct, id: string, props: NotifyRuleConstructProps) {
    super(scope, id);

    new events.Rule(this, 'NotifyRule', {
      ruleName: 'notify-rule',
      eventBus: props.bus,
      eventPattern: {
        source: ['articles.service'],
        detailType: ['ArticleShared'],
      },
      targets: [new targets.SnsTopic(props.topic)],
    });
  }
}
