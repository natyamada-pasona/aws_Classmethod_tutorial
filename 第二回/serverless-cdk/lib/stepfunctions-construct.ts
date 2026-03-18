import { Construct } from 'constructs';
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';
import * as tasks from 'aws-cdk-lib/aws-stepfunctions-tasks';
import * as lambda from 'aws-cdk-lib/aws-lambda';

export interface StepFunctionsConstructProps {
  saveOrderFn: lambda.Function;
  sendNotificationFn: lambda.Function;
  saveAuditLogFn: lambda.Function;
}

/**
 * タスク4：Step Functions 作成
 *
 * 3つの Lambda（save_order, send_notification, save_audit_log）を
 * Parallel ステートで同時実行するステートマシン。
 */
export class StepFunctionsConstruct extends Construct {
  public readonly stateMachine: sfn.StateMachine;

  constructor(scope: Construct, id: string, props: StepFunctionsConstructProps) {
    super(scope, id);

    // 各 Lambda を呼び出すタスク
    const saveOrder = new tasks.LambdaInvoke(this, 'SaveOrder', {
      lambdaFunction: props.saveOrderFn,
    });

    const sendNotification = new tasks.LambdaInvoke(this, 'SendNotification', {
      lambdaFunction: props.sendNotificationFn,
    });

    const saveAuditLog = new tasks.LambdaInvoke(this, 'SaveAuditLog', {
      lambdaFunction: props.saveAuditLogFn,
    });

    // 3つのタスクを並列実行
    const parallel = new sfn.Parallel(this, 'ParallelTasks');
    parallel.branch(saveOrder);
    parallel.branch(sendNotification);
    parallel.branch(saveAuditLog);

    this.stateMachine = new sfn.StateMachine(this, 'OrderStateMachine', {
      stateMachineName: 'OrderProcessingStateMachine',
      definitionBody: sfn.DefinitionBody.fromChainable(parallel),
      stateMachineType: sfn.StateMachineType.STANDARD,
    });
  }
}
