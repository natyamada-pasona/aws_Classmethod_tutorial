import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as path from 'path';

export interface BookmarkLambdaConstructProps {
  bookmarksTable: dynamodb.Table;
}

/**
 * タスク2：Lambda 関数作成（CreateBookmark）
 *
 * - DynamoDB PutItem（ConditionExpression で重複チェック）
 * - 初回は成功、同一 content の2回目以降は 409 エラー
 */
export class BookmarkLambdaConstruct extends Construct {
  public readonly createBookmarkFn: lambda.Function;

  constructor(scope: Construct, id: string, props: BookmarkLambdaConstructProps) {
    super(scope, id);

    this.createBookmarkFn = new lambda.Function(this, 'CreateBookmark', {
      functionName: 'CreateBookmark',
      runtime: lambda.Runtime.PYTHON_3_12,
      handler: 'lambda_function.lambda_handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '..', 'lambda', 'create-bookmark')),
    });

    // DynamoDB PutItem 権限
    props.bookmarksTable.grantWriteData(this.createBookmarkFn);
  }
}
