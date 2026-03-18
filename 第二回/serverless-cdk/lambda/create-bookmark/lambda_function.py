import json
import os
import boto3
from botocore.exceptions import ClientError

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table("BookmarksTable")

# EventBridge クライアント
eventbridge = boto3.client("events")
EVENT_BUS_NAME = os.environ.get("EVENT_BUS_NAME", "bookmarks-bus")


def lambda_handler(event, context):
    body = json.loads(event["body"])
    content = body["content"]
    title = body.get("title", "")
    shared = body.get("shared", False)

    try:
        table.put_item(
            Item={
                "content": content,
                "title": title,
                "shared": shared
            },
            ConditionExpression="attribute_not_exists(content)"
        )
    except ClientError as e:
        if e.response["Error"]["Code"] == "ConditionalCheckFailedException":
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
        print("Event sent to EventBridge")
        print("EventBridge response:", response)

    return {
        "statusCode": 200,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": "OPTIONS,POST"
        },
        "body": json.dumps({"message": "Bookmark created successfully!"})
    }
