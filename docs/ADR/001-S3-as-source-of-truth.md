# ADR-001: S3 is the source of truth

## What it's about?

In the NetSighter system, S3 will hold all raw data produced by scanners.

OpenSearch will consume processed data from S3 for indexing and search.

DynamoDB will store metadata, processing state, and references to the corresponding S3 objects.

## Explanation

S3 is designed for durable, long-term, and relatively inexpensive object storage.

NetSighter needs to retain observations from millions of IP addresses across multiple geographic regions. As observations accumulate across repeated scanning cycles, the total volume of raw data can become very large.

Keeping the complete raw dataset in S3 allows the system to retain historical observations without making the primary data store responsible for search or operational state.

S3 also allows downstream systems such as OpenSearch to be rebuilt from the original observations if necessary.

This makes S3 the source of truth, while OpenSearch and DynamoDB act as derived or operational stores.

## Alternates considered

* **PostgreSQL** — The raw observation data is large and partially unstructured. Keeping the complete dataset in PostgreSQL would increase storage and database maintenance requirements without providing significant benefits for the raw-data workload.

* **DynamoDB** — DynamoDB is better suited for structured metadata and high-scale key-value access than for storing the complete raw observation dataset. The accumulated raw-data volume would also make it unnecessarily expensive as the primary storage layer.

* **OpenSearch** — OpenSearch is optimized for search and indexing rather than long-term storage of complete raw observations. Using it as the source of truth would also make index failures or migrations more difficult to recover from.
