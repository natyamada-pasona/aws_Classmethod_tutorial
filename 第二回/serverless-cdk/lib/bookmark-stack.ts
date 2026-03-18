import * as cdk from 'aws-cdk-lib/core';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as path from 'path';
import { Construct } from 'constructs';
import { BookmarkDynamoDbConstruct } from './bookmark-dynamodb-construct';
import { BookmarkLambdaConstruct } from './bookmark-lambda-construct';
import { BookmarkApiConstruct } from './bookmark-api-construct';
import { BookmarkEventBridgeConstruct } from './bookmark-eventbridge-construct';
import { BookmarkSnsConstruct } from './bookmark-sns-construct';
import { BookmarkStepFunctionsConstruct } from './bookmark-stepfunctions-construct';
import { BookmarkApprovalConstruct } from './bookmark-approval-construct';

/**
 * 演習オプション：ブックマーク投稿アプリ
 *
 * - タスク1: DynamoDB テーブル（BookmarksTable）
 * - タスク2: Lambda 関数（CreateBookmark）
 * - タスク3: API Gateway HTTP API（POST /bookmarks + CORS）
 * - タスク4: フロントエンド HTML
 * - タスク5: EventBridge（bookmarks-bus + BookmarkCreatedRule）
 * - タスク6: Step Functions（承認ワークフロー）+ SNS + 承認 Lambda/API
 */
export class BookmarkCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // タスク1: DynamoDB テーブル
    const database = new BookmarkDynamoDbConstruct(this, 'Database');

    // タスク2: Lambda 関数（CreateBookmark）
    const lambdaFn = new BookmarkLambdaConstruct(this, 'Lambda', {
      bookmarksTable: database.bookmarksTable,
    });

    // タスク3: API Gateway HTTP API
    const api = new BookmarkApiConstruct(this, 'Api', {
      createBookmarkFn: lambdaFn.createBookmarkFn,
    });

    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.apiUrl,
      description: 'Bookmark API URL（index.html に設定してください）',
    });

    // タスク6-⑧〜⑩: SNS トピック + メールサブスクリプション
    const emailAddress = this.node.tryGetContext('notificationEmail') || 'natsumi.yamada@dtc.work';
    const snsNotification = new BookmarkSnsConstruct(this, 'Sns', { emailAddress });

    // タスク6-⑬〜⑮: ApprovalCallback Lambda + API Gateway（GET /approve）
    const approval = new BookmarkApprovalConstruct(this, 'Approval');

    // タスク6-⑦: CheckDuplicateBookmark Lambda
    const checkDuplicateFn = new lambda.Function(this, 'CheckDuplicateBookmark', {
      functionName: 'CheckDuplicateBookmark',
      runtime: lambda.Runtime.PYTHON_3_12,
      handler: 'lambda_function.lambda_handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '..', 'lambda', 'check-duplicate-bookmark')),
    });
    database.bookmarksTable.grantReadData(checkDuplicateFn);

    // タスク6-⑪: SendApprovalMail Lambda
    const sendApprovalMailFn = new lambda.Function(this, 'SendApprovalMail', {
      functionName: 'SendApprovalMail',
      runtime: lambda.Runtime.PYTHON_3_12,
      handler: 'lambda_function.lambda_handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '..', 'lambda', 'send-approval-mail')),
      environment: {
        SNS_TOPIC_ARN: snsNotification.topic.topicArn,
        APPROVAL_API_URL: approval.approvalApiUrl,
      },
    });
    snsNotification.topic.grantPublish(sendApprovalMailFn);

    // タスク6-④⑫: Step Functions ステートマシン
    const stepFunctions = new BookmarkStepFunctionsConstruct(this, 'StepFunctions', {
      checkDuplicateFn,
      sendApprovalMailFn,
    });

    // タスク5: EventBridge（ターゲットを Step Functions に設定）
    new BookmarkEventBridgeConstruct(this, 'EventBridge', {
      stateMachine: stepFunctions.stateMachine,
    });

    // Lambda に EventBridge PutEvents 権限を付与
    lambdaFn.createBookmarkFn.addToRolePolicy(new iam.PolicyStatement({
      actions: ['events:PutEvents'],
      resources: ['*'],
    }));
    lambdaFn.createBookmarkFn.addEnvironment('EVENT_BUS_NAME', 'bookmarks-bus');
  }
}
