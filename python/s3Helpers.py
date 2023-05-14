import os
import json
import boto3
from dotenv import load_dotenv

def uploadObject( key, jsonData):

    load_dotenv()

    s3 = boto3.resource('s3')
    client = boto3.client(
        's3',
        aws_access_key_id = os.getenv('AWS_S3_ACCESS_KEY'),
        aws_secret_access_key = os.getenv('AWS_S3_SECRET_KEY'),
        endpoint_url = "https://" + os.getenv('AWS_S3_ENDPOINT'),
    )

    client.put_object(
        Bucket = os.getenv('AWS_BUCKET'),
        Key = key,
        Body = json.dumps( jsonData )
    )