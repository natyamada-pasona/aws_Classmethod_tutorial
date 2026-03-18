# 演習3a Step Functions — 注文管理（Parallel ステート）

---

## タスク１：DynamoDB テーブル作成

① AWS マネジメントコンソールで DynamoDB を開き、「テーブルを作成」を選択します。

② 以下の設定でテーブルを作成します。

| 項目 | 値 |
|------|-----|
| テーブル名 | Orders（注文管理用） |
| パーティションキー | orderId（String） |
| キャパシティモード | オンデマンド |

③ もう1つテーブルを作成します。

| 項目 | 値 |
|------|-----|
| テーブル名 | OrderAuditLogs（ログ用） |
| パーティションキー | eventId（String） |
| ソートキー | createdAt（String） |
| キャパシティモード | オンデマンド |

---

## タスク２：SNS トピック作成

① Amazon SNS コンソールを開き、左メニューで「トピック」を選択します。

② 「トピックを作成」をクリックします。

③ 以下の通り設定し、「トピックを作成」をクリックします。

| 項目 | 値 |
|------|-----|
| タイプ | スタンダード |
| 名前 | order-notification-topic |

④ 作成したトピックを選択し、「サブスクリプション」→「作成」をクリックします。

⑤ 以下の設定をします。

| 項目 | 値 |
|------|-----|
| プロトコル | Eメール |
| エンドポイント | 自分のメールアドレス |

⑥ ⑤で設定したメールに届いた「Confirm subscription」をクリックして承認します。

---

## タスク３：Lambda 関数作成（3種）

① AWS Lambda コンソールを開きます。「関数を作成」→「一から作成」を選択します。

② 以下の設定をします。

| 項目 | 値 |
|------|-----|
| 関数名 | save_order |
| ランタイム | Python 3.11 |

③ 実行ロールは「基本的な Lambda アクセス権限で新しいロールを作成」を選択し、関数を作成します。

④ 作成した関数を開き、作成されたロールのリンクをクリックします。

⑤ IAM ロールに「AmazonDynamoDBFullAccess」許可ポリシーを追加します。

⑥ Lambda の画面に戻り、下記コードに置き換えます。

### save_order 関数コード

```python
import boto3
from datetime import datetime

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table("Orders")

def lambda_handler(event, context):
    order = event["detail"]
    table.put_item(
        Item={
            "orderId": order["orderId"],
            "userId": order["userId"],
            "amount": order["amount"],
            "createdAt": datetime.utcnow().isoformat()
        }
    )
    return {"status": "SUCCESS", "orderId": order["orderId"]}
```

⑦ 2つ目の関数を以下の設定で作成します。

| 項目 | 値 |
|------|-----|
| 関数名 | send_notification |
| ランタイム | Python 3.11 |
| IAM ロール | AmazonSNSFullAccess を追加 |

> ※ ARN は各自の設定に置き換えてください

### send_notification 関数コード

```python
import boto3

SNS_TOPIC_ARN = "arn:aws:sns:REGION:ACCOUNT_ID:order-notification-topic"
sns = boto3.client("sns")

def lambda_handler(event, context):
    order = event["detail"]
    sns.publish(
        TopicArn=SNS_TOPIC_ARN,
        Subject="注文作成通知",
        Message=f"注文ID:{order['orderId']} 金額:{order['amount']}"
    )
    return {"status": "SUCCESS", "orderId": order["orderId"]}
```

⑧ 同様に、3つ目の関数を以下の設定で作成します。

| 項目 | 値 |
|------|-----|
| 関数名 | save_audit_log |
| ランタイム | Python 3.11 |
| IAM ロール | AmazonDynamoDBFullAccess を追加 |

### save_audit_log 関数コード

```python
import boto3
import uuid
from datetime import datetime

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table("OrderAuditLogs")

def lambda_handler(event, context):
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
```

---

## タスク4：Step Functions 作成

① Step Functions コンソールを開き、「ステートマシンを作成」をクリックします。

② 以下の設定で作成します。

| 項目 | 値 |
|------|-----|
| 作成方法 | コードで作成 |
| タイプ | Standard |
| IAM ロール | 新規作成 |

③ デザイン画面を「コード」に切替、以下 JSON を入力します。

> ※ 3種の Lambda 関数の ARN は各自の環境に合わせて修正する必要があります。

```json
{
  "StartAt": "ParallelTasks",
  "States": {
    "ParallelTasks": {
      "Type": "Parallel",
      "Branches": [
        {
          "StartAt": "SaveOrder",
          "States": {
            "SaveOrder": {
              "Type": "Task",
              "Resource": "arn:aws:lambda:REGION:ACCOUNT_ID:function:save_order",
              "End": true
            }
          }
        },
        {
          "StartAt": "SendNotification",
          "States": {
            "SendNotification": {
              "Type": "Task",
              "Resource": "arn:aws:lambda:REGION:ACCOUNT_ID:function:send_notification",
              "End": true
            }
          }
        },
        {
          "StartAt": "SaveAuditLog",
          "States": {
            "SaveAuditLog": {
              "Type": "Task",
              "Resource": "arn:aws:lambda:REGION:ACCOUNT_ID:function:save_audit_log",
              "End": true
            }
          }
        }
      ],
      "End": true
    }
  }
}
```
