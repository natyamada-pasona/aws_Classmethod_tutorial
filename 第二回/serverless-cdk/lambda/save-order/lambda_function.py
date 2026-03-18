import boto3
from datetime import datetime

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table("Orders")


def lambda_handler(event, context):
    # EventBridge イベントの detail から注文情報を取得
    order = event["detail"]

    # Orders テーブルに注文を保存（createdAt は現在時刻を自動付与）
    table.put_item(
        Item={
            "orderId": order["orderId"],
            "userId": order["userId"],
            "amount": order["amount"],
            "createdAt": datetime.utcnow().isoformat()
        }
    )

    return {"status": "SUCCESS", "orderId": order["orderId"]}
