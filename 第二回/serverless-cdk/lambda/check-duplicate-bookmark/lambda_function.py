import json
import logging
import boto3

logger = logging.getLogger()
logger.setLevel(logging.INFO)

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table("BookmarksTable")


def lambda_handler(event, context):
    """
    EventBridge 由来の入力を受け取り、DynamoDB に同一 content が存在するか判定する。
    """
    logger.info("イベント受信: %s", json.dumps(event, default=str))

    content = event.get("detail", {}).get("content")
    logger.info("重複チェック対象 content: %s", content)

    if not content:
        logger.warning("content が未設定のため isDuplicate=False を返却")
        return {
            "isDuplicate": False,
            "reason": "content missing"
        }

    response = table.scan(
        FilterExpression="content = :content",
        ExpressionAttributeValues={
            ":content": content
        }
    )
    logger.info("DynamoDB scan 件数: %d", response["Count"])

    result = {"isDuplicate": response["Count"] > 1}
    logger.info("判定結果: %s", json.dumps(result))

    # CreateBookmark で既に1件保存済みのため、2件以上で重複と判定
    return result
