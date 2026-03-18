import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import { BookmarkDynamoDbConstruct } from './bookmark-dynamodb-construct';
import { BookmarkLambdaConstruct } from './bookmark-lambda-construct';
import { BookmarkApiConstruct } from './bookmark-api-construct';

/**
 * 演習オプション タスク1〜4：ブックマーク投稿アプリ
 *
 * - DynamoDB テーブル（BookmarksTable）
 * - Lambda 関数（CreateBookmark）
 * - API Gateway HTTP API（POST /bookmarks + CORS）
 * - フロントエンド HTML
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

    // API URL を出力（タスク4 の index.html で使用）
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.apiUrl,
      description: 'Bookmark API URL（index.html に設定してください）',
    });
  }
}
