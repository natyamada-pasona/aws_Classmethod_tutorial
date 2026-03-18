import { Construct } from 'constructs';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';

export interface BookmarkEventBridgeConstructProps {
  stateMachine: sfn.StateMachine;
}

/**
 * タスク5：EventBridge 設定
 *
 * - カスタムイベントバス bookmarks-bus
 * - ルール BookmarkCreatedRule（source: bookmark.app, detail-type: BookmarkShared）
 * - ターゲット: Step Functions ステートマシン
 */
export class BookmarkEventBridgeConstruct extends Construct {
  public readonly eventBus: events.EventBus;

  constructor(scope: Construct, id: string, props: BookmarkEventBridgeConstructProps) {
    super(scope, id);

    this.eventBus = new events.EventBus(this, 'BookmarksBus', {
      eventBusName: 'bookmarks-bus',
    });

    const rule = new events.Rule(this, 'BookmarkCreatedRule', {
      ruleName: 'BookmarkCreatedRule',
      eventBus: this.eventBus,
      eventPattern: {
        source: ['bookmark.app'],
        detailType: ['BookmarkShared'],
      },
    });

    rule.addTarget(new targets.SfnStateMachine(props.stateMachine));
  }
}
