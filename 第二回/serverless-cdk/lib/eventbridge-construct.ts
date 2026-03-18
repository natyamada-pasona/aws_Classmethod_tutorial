import { Construct } from 'constructs';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';

export interface EventBridgeConstructProps {
  stateMachine: sfn.StateMachine;
}

/**
 * タスク5：EventBridge ルール作成
 *
 * source: app.order / detail-type: OrderCreated のイベントを受け取り、
 * Step Functions ステートマシンをターゲットとして起動する。
 */
export class EventBridgeConstruct extends Construct {
  constructor(scope: Construct, id: string, props: EventBridgeConstructProps) {
    super(scope, id);

    const rule = new events.Rule(this, 'OrderCreatedRule', {
      ruleName: 'order-created-rule',
      eventPattern: {
        source: ['app.order'],
        detailType: ['OrderCreated'],
      },
    });

    rule.addTarget(new targets.SfnStateMachine(props.stateMachine));
  }
}
