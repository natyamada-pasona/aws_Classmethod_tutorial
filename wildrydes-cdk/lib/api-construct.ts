import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as lambda from 'aws-cdk-lib/aws-lambda';

export interface ApiConstructProps {
  /** 認証に使用する Cognito ユーザープール */
  userPool: cognito.UserPool;
  /** /ride POST で呼び出す Lambda 関数 */
  requestUnicornFn: lambda.Function;
}

/**
 * タスク４：RESTful API
 *
 * Amazon API Gateway REST API を作成し、Cognito オーソライザーで保護された
 * POST /ride エンドポイントを Lambda プロキシ統合で公開する。
 */
export class ApiConstruct extends Construct {
  public readonly api: apigateway.RestApi;

  constructor(scope: Construct, id: string, props: ApiConstructProps) {
    super(scope, id);

    // REST API（エッジ最適化）
    this.api = new apigateway.RestApi(this, 'WildRydesApi', {
      restApiName: 'WildRydes',
      endpointTypes: [apigateway.EndpointType.EDGE],
      deployOptions: { stageName: 'prod' },
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });

    // Cognito オーソライザー
    const authorizer = new apigateway.CognitoUserPoolsAuthorizer(this, 'WildRydesAuthorizer', {
      authorizerName: 'WildRydes',
      cognitoUserPools: [props.userPool],
      identitySource: 'method.request.header.Authorization',
    });

    // POST /ride → Lambda プロキシ統合
    const rideResource = this.api.root.addResource('ride');
    rideResource.addMethod(
      'POST',
      new apigateway.LambdaIntegration(props.requestUnicornFn, { proxy: true }),
      {
        authorizer,
        authorizationType: apigateway.AuthorizationType.COGNITO,
      },
    );

    new cdk.CfnOutput(cdk.Stack.of(this), 'ApiInvokeUrl', {
      value: this.api.url,
      description: 'API Gateway Invoke URL',
    });
  }
}
