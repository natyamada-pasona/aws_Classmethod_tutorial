import json
import boto3

eventbridge = boto3.client('events')

def lambda_handler(event, context):
    """
    DynamoDB Streams から受け取ったレコードを処理し、
    shared=true の新規記事のみ EventBridge にイベントを送信する。
    """
    for record in event['Records']:
        # INSERT（新規作成）のみ対象
        if record['eventName'] != 'INSERT':
            continue

        new_image = record['dynamodb'].get('NewImage', {})

        # shared が true の場合のみ EventBridge に送信
        shared = new_image.get('shared', {}).get('BOOL', False)
        if not shared:
            continue

        # イベント詳細を構築
        detail = {
            'id': new_image.get('id', {}).get('S', ''),
            'title': new_image.get('title', {}).get('S', ''),
            'url': new_image.get('url', {}).get('S', ''),
            'shared': True,
        }

        response = eventbridge.put_events(
            Entries=[
                {
                    'Source': 'custom.bookmarks',
                    'DetailType': 'ArticleShared',
                    'Detail': json.dumps(detail),
                }
            ]
        )

        print(f"EventBridge response: {json.dumps(response)}")

    return {'statusCode': 200}
