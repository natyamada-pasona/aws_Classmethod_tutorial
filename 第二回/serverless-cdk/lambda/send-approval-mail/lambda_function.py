import json
import os
import boto3
import urllib.parse

sns = boto3.client("sns")
TOPIC_ARN = os.environ["SNS_TOPIC_ARN"]
APPROVAL_API_URL = os.environ["APPROVAL_API_URL"]


def lambda_handler(event, context):
    task_token = event["TaskToken"]
    detail = event["detail"]

    approve_url = (
        APPROVAL_API_URL + "?"
        + urllib.parse.urlencode({
            "token": task_token,
            "result": "approve"
        })
    )

    message = f"""
Bookmark approval required.

Title: {detail.get('title')}
URL: {detail.get('content')}

Approve:
{approve_url}
"""

    sns.publish(
        TopicArn=TOPIC_ARN,
        Subject="Bookmark Approval Required",
        Message=message
    )

    return {}
