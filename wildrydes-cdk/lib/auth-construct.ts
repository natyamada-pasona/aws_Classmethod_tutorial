import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import * as cognito from 'aws-cdk-lib/aws-cognito';

/**
 * タスク２：ユーザー認証
 *
 * Amazon Cognito ユーザープールを作成し、
 * ユーザーの登録・確認・サインイン機能を提供する。
 * フロントエンドの cognito-auth.js と連携して JWT を発行する。
 */
export class AuthConstruct extends Construct {
  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.UserPoolClient;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    // ユーザープール: ユーザーの登録・認証を管理
    this.userPool = new cognito.UserPool(this, 'WildRydesUserPool', {
      userPoolName: 'WildRydes',
      selfSignUpEnabled: true,                          // ユーザー自身による登録を許可
      signInAliases: { username: true, email: true },   // ユーザー名またはメールでサインイン
      autoVerify: { email: true },                      // メールアドレスを自動検証
      standardAttributes: {
        email: { required: true, mutable: true },
      },
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: true,
      },
    });

    // アプリクライアント: フロントエンドから Cognito に接続するための設定
    this.userPoolClient = this.userPool.addClient('WildRydesWebApp', {
      userPoolClientName: 'WildRydesWebApp',
      authFlows: { userSrp: true },  // SRP（Secure Remote Password）認証を使用
      generateSecret: false,         // SPA のためクライアントシークレットは不要
    });

    new cdk.CfnOutput(cdk.Stack.of(this), 'UserPoolId', {
      value: this.userPool.userPoolId,
      description: 'Cognito User Pool ID',
    });

    new cdk.CfnOutput(cdk.Stack.of(this), 'UserPoolClientId', {
      value: this.userPoolClient.userPoolClientId,
      description: 'Cognito App Client ID',
    });
  }
}
