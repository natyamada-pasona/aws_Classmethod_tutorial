import json
import logging
import boto3
import urllib.parse

logger = logging.getLogger()
logger.setLevel(logging.INFO)

sf = boto3.client("stepfunctions")


def lambda_handler(event, context):
    logger.info("イベント受信: %s", json.dumps(event, default=str))

    try:
        params = event.get("queryStringParameters") or {}
        task_token = params.get("token")
        action = params.get("result", "approve")
        logger.info("アクション: %s, トークン有無: %s", action, bool(task_token))

        if not task_token:
            raise Exception("taskToken が見つかりません")

        # URL デコード
        task_token = urllib.parse.unquote(task_token)
        logger.info("デコード済みトークン: %s...", task_token[:30])

        if action == "approve":
            logger.info("SendTaskSuccess を送信")
            sf.send_task_success(
                taskToken=task_token,
                output=json.dumps({"approved": True})
            )
        else:
            logger.info("SendTaskFailure を送信（却下）")
            sf.send_task_failure(
                taskToken=task_token,
                error="Rejected",
                cause="Rejected by reviewer"
            )

        logger.info("承認処理完了")
        return {
            "statusCode": 200,
            "body": "Approval processed successfully"
        }
    except Exception as e:
        logger.error("エラー発生: %s", str(e), exc_info=True)
        return {
            "statusCode": 500,
            "body": json.dumps({"message": "Internal Server Error"})
        }
