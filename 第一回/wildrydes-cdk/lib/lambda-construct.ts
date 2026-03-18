import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as path from 'path';

export interface LambdaConstructProps {
  /** DynamoDB Rides テーブル（書き込み権限を付与するため） */
  table: dynamodb.Table;
}

/**
 * タスク３-b：Lambda 関数
 *
 * ユニコーン配車リクエストを処理する RequestUnicorn 関数を作成する。
 * - ランタイム: Python 3.13
 * - ソースコード: lambda/request-unicorn/ ディレクトリ（Code.fromAsset）
 * - DynamoDB Rides テーブルへの書き込み権限を自動付与（grantWriteData）
 *
 * Lambda コードを修正した場合は cdk deploy するだけで反映される。
 */
export class LambdaConstruct extends Construct {
  /** API Gateway Construct など外部から参照するための Lambda 関数 */
  public readonly requestUnicornFn: lambda.Function;

  constructor(scope: Construct, id: string, props: LambdaConstructProps) {
    super(scope, id);

    // RequestUnicorn Lambda 関数
    // Code.fromAsset でローカルの Python コードを自動的に zip → S3 アップロードする
    this.requestUnicornFn = new lambda.Function(this, 'RequestUnicorn', {
      functionName: 'RequestUnicorn',
      runtime: lambda.Runtime.PYTHON_3_13,
      handler: 'lambda_function.lambda_handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '..', 'lambda', 'request-unicorn')),
    });

    // DynamoDB テーブルへの書き込み権限を付与
    // （演習手順⑫のインラインポリシー DynamoDBWriteAccess に相当）
    props.table.grantWriteData(this.requestUnicornFn);

    new cdk.CfnOutput(cdk.Stack.of(this), 'RequestUnicornFnArn', {
      value: this.requestUnicornFn.functionArn,
      description: 'RequestUnicorn Lambda Function ARN',
    });
  }
}
