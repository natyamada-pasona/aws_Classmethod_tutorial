import json
import logging
import os
import boto3
from botocore.exceptions import ClientError

logger = logging.getLogger()
logger.setLevel(logging.INFO)

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table("BookmarksTable")

# EventBridge クライアント
eventbridge = boto3.client("events")
EVENT_BUS_NAME = os.environ.get("EVENT_BUS_NAME", "bookmarks-bus")


def lambda_handler(event, context):
    logger.info("イベント受信: %s", json.dumps(event, default=str))

    body = json.loads(event["body"])
    content = body["content"]
    title = body.get("title", "")
    shared = body.get("shared", False)
    logger.info("content=%s, title=%s, shared=%s", content, title, shared)

    try:
        table.put_item(
            Item={
                "content": content,
                "title": title,
                "shared": shared
            },
            ConditionExpression="attribute_not_exists(content)"
        )
        logger.info("DynamoDB に保存完了")
    except ClientError as e:
        if e.response["Error"]["Code"] == "ConditionalCheckFailedException":
            logger.warning("ブックマーク重複: %s", content)
            return {
                "statusCode": 409,
                "body": json.dumps({"message": "Duplicate bookmark"})
            }
        raise

    # 保存成功後のみ、shared=true ならイベント送信
    if shared:
        response = eventbridge.put_events(
            Entries=[
                {
                    "EventBusName": EVENT_BUS_NAME,
                    "Source": "bookmark.app",
                    "DetailType": "BookmarkShared",
                    "Detail": json.dumps({
                        "content": content,
                        "title": title,
                        "shared": shared
                    })
                }
            ]
        )
        logger.info("EventBridge にイベント送信: %s", json.dumps(response, default=str))
    else:
        logger.info("shared=False のため EventBridge 送信スキップ")

    return {
        "statusCode": 200,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": "OPTIONS,POST"
        },
        "body": json.dumps({"message": "Bookmark created successfully!"})
    }
