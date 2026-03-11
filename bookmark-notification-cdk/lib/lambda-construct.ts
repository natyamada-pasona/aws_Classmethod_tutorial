import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambdaEventSources from 'aws-cdk-lib/aws-lambda-event-sources';
import * as path from 'path';

export interface LambdaConstructProps {
  /** DynamoDB ArticlesTable（Stream トリガー接続用） */
  table: dynamodb.Table;
}

/**
 * タスク2：StreamToEventBridge Lambda 関数
 * タスク3：DynamoDB Stream トリガーの接続
 *
 * - ランタイム: Python 3.12
 * - 権限: AWSLambdaBasicExecutionRole, events:PutEvents, DynamoDB Stream 読み取り
 * - DynamoDB Streams をイベントソースとして接続（バッチサイズ 5）
 */
export class LambdaConstruct extends Construct {
  public readonly streamToEventBridgeFn: lambda.Function;

  constructor(scope: Construct, id: string, props: LambdaConstructProps) {
    super(scope, id);

    // タスク2: Lambda 関数作成
    this.streamToEventBridgeFn = new lambda.Function(this, 'StreamToEventBridge', {
      functionName: 'StreamToEventBridge',
      runtime: lambda.Runtime.PYTHON_3_12,
      handler: 'lambda_function.lambda_handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '..', 'lambda', 'stream-to-eventbridge')),
    });

    // EventBridge へのイベント送信権限
    this.streamToEventBridgeFn.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['events:PutEvents'],
        resources: ['*'],
      }),
    );

    // タスク3: DynamoDB Stream トリガーの接続（バッチサイズ 5）
    this.streamToEventBridgeFn.addEventSource(
      new lambdaEventSources.DynamoEventSource(props.table, {
        startingPosition: lambda.StartingPosition.LATEST,
        batchSize: 5,
      }),
    );

    new cdk.CfnOutput(cdk.Stack.of(this), 'StreamToEventBridgeFnArn', {
      value: this.streamToEventBridgeFn.functionArn,
      description: 'StreamToEventBridge Lambda Function ARN',
    });
  }
}
