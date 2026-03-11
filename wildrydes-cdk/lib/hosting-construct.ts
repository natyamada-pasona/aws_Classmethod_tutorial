import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import * as amplify from 'aws-cdk-lib/aws-amplify';
import * as codecommit from 'aws-cdk-lib/aws-codecommit';
import * as iam from 'aws-cdk-lib/aws-iam';

export class HostingConstruct extends Construct {
  public readonly amplifyAppUrl: string;
  public readonly repoCloneUrl: string;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    const repo = new codecommit.Repository(this, 'WildRydesSite', {
      repositoryName: 'wildrydes-site',
      description: 'Wild Rydes static website',
    });

    const amplifyRole = new iam.Role(this, 'AmplifyRole', {
      assumedBy: new iam.ServicePrincipal('amplify.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AWSCodeCommitReadOnly'),
      ],
    });

    const amplifyApp = new amplify.CfnApp(this, 'WildRydesAmplify', {
      name: 'wildrydes-site',
      repository: repo.repositoryCloneUrlHttp,
      iamServiceRole: amplifyRole.roleArn,
    });

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
