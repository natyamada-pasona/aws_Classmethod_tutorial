import boto3

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table("BookmarksTable")


def lambda_handler(event, context):
    """
    EventBridge 由来の入力を受け取り、DynamoDB に同一 content が存在するか判定する。
    """
    content = event.get("detail", {}).get("content")

    if not content:
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

    # CreateBookmark で既に1件保存済みのため、2件以上で重複と判定
    return {
        "isDuplicate": response["Count"] > 1
    }
