import json
import boto3
from botocore.exceptions import ClientError

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table("BookmarksTable")


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

    return {
        "statusCode": 200,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": "OPTIONS,POST"
        },
        "body": json.dumps({"message": "Bookmark created successfully!"})
    }
