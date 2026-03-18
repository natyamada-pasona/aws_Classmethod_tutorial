import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import * as apigwv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as lambda from 'aws-cdk-lib/aws-lambda';

export interface BookmarkApiConstructProps {
  createBookmarkFn: lambda.Function;
}

/**
 * タスク3：API Gateway HTTP API 作成
 *
 * - POST /bookmarks → CreateBookmark Lambda
 * - CORS 設定（Allow-Origin: *, Methods: POST/OPTIONS, Headers: content-type）
 */
export class BookmarkApiConstruct extends Construct {
  public readonly apiUrl: string;

  constructor(scope: Construct, id: string, props: BookmarkApiConstructProps) {
    super(scope, id);

    const httpApi = new apigwv2.HttpApi(this, 'BookmarkHttpApi', {
      apiName: 'BookmarkApi',
      corsPreflight: {
        allowOrigins: ['*'],
        allowMethods: [apigwv2.CorsHttpMethod.POST, apigwv2.CorsHttpMethod.OPTIONS],
        allowHeaders: ['content-type'],
      },
    });

    httpApi.addRoutes({
      path: '/bookmarks',
      methods: [apigwv2.HttpMethod.POST],
      integration: new integrations.HttpLambdaIntegration(
        'CreateBookmarkIntegration',
        props.createBookmarkFn,
      ),
    });

    this.apiUrl = httpApi.apiEndpoint;
  }
}
