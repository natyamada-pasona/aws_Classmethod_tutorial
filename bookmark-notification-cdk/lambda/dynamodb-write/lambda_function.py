import json
import uuid
import boto3

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table("ArticlesTable")

def lambda_handler(event, context):
    body = json.loads(event["body"])
    item = {
        "id": str(uuid.uuid4()),
        "title": body["title"],
        "content": body["content"],
        "shared": body["shared"]
    }
    table.put_item(Item=item)

    return {
        "statusCode": 200,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": "OPTIONS,POST"
        },
        "body": json.dumps({
            "message": "Article created successfully!"
        })
    }
