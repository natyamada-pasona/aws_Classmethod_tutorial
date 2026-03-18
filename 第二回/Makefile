# デフォルトターゲット: 間違って make しても安全なように diff だけ表示
.DEFAULT_GOAL := diff

CDK_DIR := serverless-cdk
PROFILE := serverless

# ===== CDK コマンド =====
diff:
	cd $(CDK_DIR) && npx cdk diff --profile $(PROFILE)

deploy:
	cd $(CDK_DIR) && npx cdk deploy --profile $(PROFILE)

synth:
	cd $(CDK_DIR) && npx cdk synth

destroy:
	cd $(CDK_DIR) && npx cdk destroy --profile $(PROFILE)
