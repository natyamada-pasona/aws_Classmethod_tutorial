import boto3
import uuid
from datetime import datetime

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table("OrderAuditLogs")


def lambda_handler(event, context):
    # 一意な eventId を生成し、イベント情報を監査ログとして保存
    table.put_item(
        Item={
            "eventId": str(uuid.uuid4()),
            "createdAt": datetime.utcnow().isoformat(),
            "eventType": event.get("detail-type", "Unknown"),
            "source": event.get("source"),
            "payload": event["detail"]
        }
    )

    return {"status": "SUCCESS"}
