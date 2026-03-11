import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as apigwv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as path from 'path';

export interface ApiConstructProps {
  table: dynamodb.Table;
}

/**
 * タスク7：DynamoDBWriteFunction Lambda 関数
 * タスク8：HTTP API Gateway（POST /articles + CORS）
 */
export class ApiConstruct extends Construct {
  public readonly writeFn: lambda.Function;
  public readonly httpApi: apigwv2.HttpApi;

  constructor(scope: Construct, id: string, props: ApiConstructProps) {
    super(scope, id);

    // タスク7: DynamoDB 書き込み用 Lambda
    this.writeFn = new lambda.Function(this, 'DynamoDBWriteFunction', {
      functionName: 'DynamoDBWriteFunction',
      runtime: lambda.Runtime.PYTHON_3_12,
      handler: 'lambda_function.lambda_handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '..', 'lambda', 'dynamodb-write')),
    });

    // DynamoDB への書き込み権限
    props.table.grantWriteData(this.writeFn);

    // タスク8: HTTP API Gateway
    this.httpApi = new apigwv2.HttpApi(this, 'BookmarkApi', {
      apiName: 'BookmarkApi',
      corsPreflight: {
        allowOrigins: ['*'],
        allowHeaders: ['content-type'],
        allowMethods: [apigwv2.CorsHttpMethod.POST, apigwv2.CorsHttpMethod.OPTIONS],
      },
    });

    // POST /articles → DynamoDBWriteFunction
    this.httpApi.addRoutes({
      path: '/articles',
      methods: [apigwv2.HttpMethod.POST],
      integration: new integrations.HttpLambdaIntegration('WriteIntegration', this.writeFn),
    });

    new cdk.CfnOutput(cdk.Stack.of(this), 'ApiEndpoint', {
      value: this.httpApi.apiEndpoint,
      description: 'HTTP API Gateway endpoint URL',
    });
  }
}
