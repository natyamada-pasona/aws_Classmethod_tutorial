import json
import boto3
import urllib.parse

sf = boto3.client("stepfunctions")


def lambda_handler(event, context):
    try:
        params = event.get("queryStringParameters") or {}
        task_token = params.get("token")
        action = params.get("result", "approve")

        if not task_token:
            raise Exception("taskToken is missing")

        # URL デコード
        task_token = urllib.parse.unquote(task_token)

        if action == "approve":
            sf.send_task_success(
                taskToken=task_token,
                output=json.dumps({"approved": True})
            )
        else:
            sf.send_task_failure(
                taskToken=task_token,
                error="Rejected",
                cause="Rejected by reviewer"
            )

        return {
            "statusCode": 200,
            "body": "Approval processed successfully"
        }
    except Exception as e:
        print("ERROR:", str(e))
        return {
            "statusCode": 500,
            "body": json.dumps({"message": "Internal Server Error"})
        }
