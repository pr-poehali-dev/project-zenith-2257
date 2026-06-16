import json
import os
import base64
import uuid
import boto3

def handler(event: dict, context) -> dict:
    """Загрузка фотографий в S3 хранилище портфолио"""

    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400',
            },
            'body': ''
        }

    body = json.loads(event.get('body', '{}'))
    files = body.get('files', [])

    if not files:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': {'error': 'Нет файлов для загрузки'}
        }

    s3 = boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
    )

    uploaded = []
    for file in files:
        name = file.get('name', 'photo.jpg')
        content_type = file.get('type', 'image/jpeg')
        data_b64 = file.get('data', '')
        data = base64.b64decode(data_b64)

        ext = name.rsplit('.', 1)[-1].lower() if '.' in name else 'jpg'
        key = f"portfolio/{uuid.uuid4()}.{ext}"

        s3.put_object(
            Bucket='files',
            Key=key,
            Body=data,
            ContentType=content_type,
        )

        cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/files/{key}"
        uploaded.append({'url': cdn_url, 'name': name})

    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'uploaded': uploaded})
    }