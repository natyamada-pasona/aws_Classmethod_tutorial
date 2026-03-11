import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import * as amplify from 'aws-cdk-lib/aws-amplify';
import * as codecommit from 'aws-cdk-lib/aws-codecommit';
import * as iam from 'aws-cdk-lib/aws-iam';

/**
 * タスク１：静的ウェブホスティング
 *
 * CodeCommit リポジトリと AWS Amplify を使用して、
 * Wild Rydes の静的ウェブサイトをホスティングする。
 * master ブランチへの push で自動ビルド・デプロイされる。
 */
export class HostingConstruct extends Construct {
  public readonly amplifyAppUrl: string;
  public readonly repoCloneUrl: string;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    // ソースコードを管理する CodeCommit リポジトリ
    const repo = new codecommit.Repository(this, 'WildRydesSite', {
      repositoryName: 'wildrydes-site',
      description: 'Wild Rydes static website',
    });

    // Amplify が CodeCommit を読み取るためのサービスロール
    const amplifyRole = new iam.Role(this, 'AmplifyRole', {
      assumedBy: new iam.ServicePrincipal('amplify.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AWSCodeCommitReadOnly'),
      ],
    });

    // Amplify アプリケーション（CodeCommit リポジトリと連携）
    const amplifyApp = new amplify.CfnApp(this, 'WildRydesAmplify', {
      name: 'wildrydes-site',
      repository: repo.repositoryCloneUrlHttp,
      iamServiceRole: amplifyRole.roleArn,
    });

    // master ブランチを自動ビルド対象として設定
    new amplify.CfnBranch(this, 'MainBranch', {
      appId: amplifyApp.attrAppId,
      branchName: 'master',
      enableAutoBuild: true,
    });

    this.amplifyAppUrl = `https://master.${amplifyApp.attrDefaultDomain}`;
    this.repoCloneUrl = repo.repositoryCloneUrlHttp;

    new cdk.CfnOutput(cdk.Stack.of(this), 'AmplifyAppUrl', {
      value: this.amplifyAppUrl,
      description: 'Amplify App URL',
    });

    new cdk.CfnOutput(cdk.Stack.of(this), 'RepoCloneUrl', {
      value: this.repoCloneUrl,
      description: 'CodeCommit Clone URL',
    });
  }
}
