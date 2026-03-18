import json
import secrets
import random
import boto3

ddb = boto3.resource("dynamodb")
table = ddb.Table("Rides")

fleet = [
    {"Name": "Angel", "Color": "White", "Gender": "Female"},
    {"Name": "Gil", "Color": "White", "Gender": "Male"},
    {"Name": "Rocinante", "Color": "Yellow", "Gender": "Female"},
]


def lambda_handler(event, context):
    try:
        authorizer = event.get("requestContext", {}).get("authorizer")
        if not authorizer:
            return error_response(
                "Authorization not configured",
                context.aws_request_id,
            )

        ride_id = to_url_string(secrets.token_bytes(16))
        print(f"Received event ({ride_id}): {event}")

        username = authorizer["claims"]["cognito:username"]
        body = json.loads(event["body"])
        pickup_location = body["PickupLocation"]

        unicorn = find_unicorn(pickup_location)
        record_ride(ride_id, username, unicorn)

        return {
            "statusCode": 201,
            "body": json.dumps(
                {
                    "RideId": ride_id,
                    "Unicorn": unicorn,
                    "Eta": "30 seconds",
                    "Rider": username,
                }
            ),
            "headers": {
                "Access-Control-Allow-Origin": "*",
            },
        }
    except Exception as e:
        print(e)
        return error_response(str(e), context.aws_request_id)


def find_unicorn(pickup_location):
    print(
        "Finding unicorn for",
        pickup_location["Latitude"],
        ",",
        pickup_location["Longitude"],
    )
    return random.choice(fleet)


def record_ride(ride_id, username, unicorn):
    table.put_item(
        Item={
            "RideId": ride_id,
            "User": username,
            "Unicorn": unicorn,
            "RequestTime": str(__import__("datetime").datetime.now()),
        }
    )


def to_url_string(data):
    import base64
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("utf-8")


def error_response(message, request_id):
    return {
        "statusCode": 500,
        "body": json.dumps(
            {
                "Error": message,
                "Reference": request_id,
            }
        ),
        "headers": {
            "Access-Control-Allow-Origin": "*",
        },
    }
