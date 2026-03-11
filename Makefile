# デフォルトターゲット: 間違って make しても安全なように diff だけ表示
.DEFAULT_GOAL := diff

CDK_DIR := wildrydes-cdk
CDK_DIR2 := bookmark-notification-cdk

# ===== 演習1: Wild Rydes =====
diff:
	cd $(CDK_DIR) && npx cdk diff --profile wildrydes

deploy:
	cd $(CDK_DIR) && npx cdk deploy --profile wildrydes

synth:
	cd $(CDK_DIR) && npx cdk synth

destroy:
	cd $(CDK_DIR) && npx cdk destroy --profile wildrydes

# ===== 演習2: Bookmark Notification =====
diff2:
	cd $(CDK_DIR2) && npx cdk diff --profile wildrydes

deploy2:
	cd $(CDK_DIR2) && npx cdk deploy --profile wildrydes

synth2:
	cd $(CDK_DIR2) && npx cdk synth

destroy2:
	cd $(CDK_DIR2) && npx cdk destroy --profile wildrydes
