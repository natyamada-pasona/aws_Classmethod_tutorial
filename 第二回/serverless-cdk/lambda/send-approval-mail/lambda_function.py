import json
import logging
import os
import boto3
import urllib.parse

logger = logging.getLogger()
logger.setLevel(logging.INFO)

sns = boto3.client("sns")
TOPIC_ARN = os.environ["SNS_TOPIC_ARN"]
APPROVAL_API_URL = os.environ["APPROVAL_API_URL"]


def lambda_handler(event, context):
    logger.info("イベント受信: %s", json.dumps(event, default=str))

    task_token = event["TaskToken"]
    detail = event["detail"]
    logger.info("TaskToken: %s...", task_token[:30])
    logger.info("詳細情報: %s", json.dumps(detail, default=str))

    approve_url = (
        APPROVAL_API_URL + "?"
        + urllib.parse.urlencode({
            "token": task_token,
            "result": "approve"
        })
    )
    logger.info("承認URL: %s", approve_url)

    message = f"""
Bookmark approval required.

Title: {detail.get('title')}
URL: {detail.get('content')}

Approve:
{approve_url}
"""

    logger.info("SNS トピックに発行: %s", TOPIC_ARN)

    # サブスクリプションのメールアドレスをログ出力
    subscriptions = sns.list_subscriptions_by_topic(TopicArn=TOPIC_ARN)
    endpoints = [s["Endpoint"] for s in subscriptions.get("Subscriptions", []) if s["Protocol"] == "email"]
    logger.info("送信先メールアドレス: %s", endpoints)

    response = sns.publish(
        TopicArn=TOPIC_ARN,
        Subject="Bookmark Approval Required",
        Message=message
    )
    logger.info("SNS 発行レスポンス: %s", json.dumps(response, default=str))

    return {}
