import boto3
import os

sns = boto3.client("sns")


def lambda_handler(event, context):
    # EventBridge イベントの detail から注文情報を取得
    order = event["detail"]

    # SNS トピックに注文通知を publish（サブスクライバーにメール送信される）
    sns.publish(
        TopicArn=os.environ["SNS_TOPIC_ARN"],
        Subject="注文作成通知",
        Message=f"注文ID:{order['orderId']} 金額:{order['amount']}"
    )

    return {"status": "SUCCESS", "orderId": order["orderId"]}
