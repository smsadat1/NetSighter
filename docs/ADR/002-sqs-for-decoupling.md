# ADR-002: SQS for service communication and decoupling

## What it's about?

The regionally distributed scanner fleet will send scanned observation metadata to downstream workers through Amazon SQS.

Scanners will not directly write observation data to DynamoDB or communicate with the API layer.

## Explanation

The scanner fleet is designed to be stateless and independently scalable.

Instead of requiring every scanner to directly communicate with DynamoDB or other downstream services, scanners will publish observation metadata to SQS after completing their work.

This decouples the scanner fleet from downstream processing and allows scanners, workers, and the API layer to operate independently.

SQS also provides buffering when the rate of incoming observations temporarily exceeds the processing capacity of downstream workers.

Scanner failures or temporary downstream unavailability therefore do not require the scanner fleet to remain tightly coupled to the availability of individual services.

The raw observation itself will remain in S3, while SQS messages will contain the metadata and references required for downstream processing.

## Alternates considered

* **Kafka** — The expected event volume and messaging requirements do not justify the additional operational complexity of running and maintaining Kafka.

* **NATS** — NATS would provide lightweight messaging and could support the required architecture, but introducing and operating another distributed messaging system adds infrastructure and operational complexity.

* **RabbitMQ** — RabbitMQ provides the required messaging capabilities, but would require additional infrastructure to operate and maintain compared with using the managed SQS service.

* **Direct DynamoDB writes** — This would tightly couple scanners to the database and make the scanner fleet responsible for downstream persistence and retry behavior.
