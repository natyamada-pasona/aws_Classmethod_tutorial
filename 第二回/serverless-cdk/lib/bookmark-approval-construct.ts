import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigwv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as cdk from 'aws-cdk-lib/core';
import * as path from 'path';

/**
 * タスク6-⑬〜⑮：ApprovalCallback Lambda + API Gateway（GET /approve）
 *
 * メールリンクから承認操作を受け取り、Step Functions に SendTaskSuccess/Failure を送信する。
 */
export class BookmarkApprovalConstruct extends Construct {
  public readonly approvalApiUrl: string;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    const callbackFn = new lambda.Function(this, 'ApprovalCallback', {
      functionName: 'ApprovalCallback',
      runtime: lambda.Runtime.PYTHON_3_12,
      handler: 'lambda_function.lambda_handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '..', 'lambda', 'approval-callback')),
    });

    // Step Functions SendTaskSuccess/SendTaskFailure 権限
    callbackFn.addToRolePolicy(new iam.PolicyStatement({
      actions: ['states:SendTaskSuccess', 'states:SendTaskFailure'],
      resources: ['*'],
    }));

    const httpApi = new apigwv2.HttpApi(this, 'ApprovalHttpApi', {
      apiName: 'ApprovalApi',
    });

    httpApi.addRoutes({
      path: '/approve',
      methods: [apigwv2.HttpMethod.GET],
      integration: new integrations.HttpLambdaIntegration(
        'ApprovalCallbackIntegration',
        callbackFn,
      ),
    });

    this.approvalApiUrl = `${httpApi.apiEndpoint}/approve`;

    new cdk.CfnOutput(cdk.Stack.of(this), 'ApprovalApiUrl', {
      value: this.approvalApiUrl,
      description: 'Approval callback API URL',
    });
  }
}
