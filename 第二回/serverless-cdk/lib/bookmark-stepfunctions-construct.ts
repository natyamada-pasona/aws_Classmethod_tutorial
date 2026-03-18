import { Construct } from 'constructs';
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';
import * as tasks from 'aws-cdk-lib/aws-stepfunctions-tasks';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cdk from 'aws-cdk-lib/core';

export interface BookmarkStepFunctionsConstructProps {
  checkDuplicateFn: lambda.Function;
  sendApprovalMailFn: lambda.Function;
}

/**
 * タスク6：Step Functions（承認ワークフロー）
 *
 * CheckDuplicate → IsDuplicate? → (Yes) EndDuplicate / (No) SendApprovalMail → Approved
 */
export class BookmarkStepFunctionsConstruct extends Construct {
  public readonly stateMachine: sfn.StateMachine;

  constructor(scope: Construct, id: string, props: BookmarkStepFunctionsConstructProps) {
    super(scope, id);

    // CheckDuplicate: Lambda 呼び出し
    const checkDuplicate = new tasks.LambdaInvoke(this, 'CheckDuplicate', {
      lambdaFunction: props.checkDuplicateFn,
      resultPath: '$.duplicateResult',
    });

    // EndDuplicate: 重複時は Fail
    const endDuplicate = new sfn.Fail(this, 'EndDuplicate', {
      error: 'DuplicateBookmark',
      cause: 'Bookmark already exists',
    });

    // Approved: 承認完了
    const approved = new sfn.Pass(this, 'Approved');

    // SendApprovalMail: waitForTaskToken で人手承認待ち
    const sendApprovalMail = new tasks.LambdaInvoke(this, 'SendApprovalMail', {
      lambdaFunction: props.sendApprovalMailFn,
      integrationPattern: sfn.IntegrationPattern.WAIT_FOR_TASK_TOKEN,
      payload: sfn.TaskInput.fromObject({
        'TaskToken': sfn.JsonPath.taskToken,
        'detail': sfn.JsonPath.objectAt('$.detail'),
      }),
    });
    sendApprovalMail.next(approved);

    // IsDuplicate? 分岐
    const isDuplicate = new sfn.Choice(this, 'IsDuplicate?')
      .when(
        sfn.Condition.booleanEquals('$.duplicateResult.Payload.isDuplicate', true),
        endDuplicate,
      )
      .otherwise(sendApprovalMail);

    // フロー: CheckDuplicate → IsDuplicate?
    const definition = checkDuplicate.next(isDuplicate);

    this.stateMachine = new sfn.StateMachine(this, 'BookmarkApprovalStateMachine', {
      stateMachineName: 'BookmarkApprovalStateMachine',
      definitionBody: sfn.DefinitionBody.fromChainable(definition),
      stateMachineType: sfn.StateMachineType.STANDARD,
      timeout: cdk.Duration.days(7),
    });
  }
}
