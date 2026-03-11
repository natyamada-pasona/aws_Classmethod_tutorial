# デフォルトターゲット: 間違って make しても安全なように diff だけ表示
.DEFAULT_GOAL := diff

CDK_DIR := wildrydes-cdk

diff:
	cd $(CDK_DIR) && npx cdk diff --profile wildrydes

deploy:
	cd $(CDK_DIR) && npx cdk deploy --profile wildrydes

synth:
	cd $(CDK_DIR) && npx cdk synth

destroy:
	cd $(CDK_DIR) && npx cdk destroy --profile wildrydes
