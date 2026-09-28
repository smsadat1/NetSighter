# takes JSON from SQS
# sends to llm running on ollama
# takes back from prompt and uploads to S3 -> send enrichment back to SQS

import os
import boto3
import ollama
from dotenv import load_dotenv

load_dotenv()

AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION = os.getenv("AWS_REGION")
S3_BUCKET_NAME = os.getenv("S3_BUCKET_NAME")
S3_DEV_ENDPOINT_URL = os.getenv("S3_DEV_ENDPOINT_URL")
SQS_DEV_QUEUE_URL = os.getenv("SQS_DEV_QUEUE_URL")


def call_LLM(content: str):
    
    response = ollama.chat(
    model='qwen3:4b-thinking', 
       messages=[
            {
                "role": "system",
                "content": """
            
                You are analyzing network observation data.

                Important:
                - "product" and "version" under services are scanner observations.
                - CPE values are enrichment results, NOT independently verified software fingerprints.
                - Never infer that a product/version is confirmed solely because a CPE exists.
                - If the version is null, do not state a specific version as confirmed.
                - Clearly distinguish observed facts from enrichment associations.
                - Do not invent vulnerabilities, software versions, or security issues.
                - If evidence is ambiguous, say so briefly.

                Summarize the observation in no more than 150 words.

                Start with "# Observation Summary" as header followed by one paragraph.
                Output only the summary.
                """
            },
            {
                "role": "user",
                "content": content,
            }
        ]
    )

    return response['message']['content']


if __name__ == "__main__":

    sqs = boto3.client('sqs', region_name=AWS_REGION)
    response = sqs.receive_message(
        QueueUrl=SQS_DEV_QUEUE_URL,
        AttributeNames=['All'],
        MessageAttributeNames=['All'],
        MaxNumberOfMessages=10,  # max allowable messages to retrieve at once
        WaitTimeSeconds=20       # enable long polling
    )

    messages = response.get('Messages', [])

    # if not messages:
    #     print("Waiting for jobs...")
    # else:
    #     for message in messages:
    #         print(f"Processing message ID: {message['MessageId']}")
    #         print(f"Body content: {message['Body']}")
            
    #         # Keep track of the receipt handle to delete the message later
    #         receipt_handle = message['ReceiptHandle']

    s3 = boto3.client(
        "s3",
        endpoint_url=S3_DEV_ENDPOINT_URL,
        region_name=AWS_REGION,
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    )

    with open("mock.json", "r") as f:
        json_data = f.read()

    analysis = call_LLM(content=json_data)
    s3.put_object(
        Bucket=S3_BUCKET_NAME,
        Key="obsv/obsv-123/analysis.md",
        Body=analysis,
        ContentType="text/markdown",
    )
    
    print("Done")