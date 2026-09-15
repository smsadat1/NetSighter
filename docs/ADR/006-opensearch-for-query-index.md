# ADR-006: OpenSearch for query indexing

## What it's about

OpenSearch used as the query and indexing layer for searchable NetSighter observations.

It provides fast access to IP-specific service information, historical observations, regional results, and other indexed metadata without querying the raw S3 dataset directly.

## Explanation

NetSighter's raw observation dataset is stored in S3 as the source of truth.

However, querying large collections of historical observations directly from object storage would be inefficient for interactive searches.

OpenSearch provides an indexing layer optimized for searching semi-structured observation data using fields such as IP address, port, service, version, CPE, region, and observation time.

The index is considered a derived data store rather than the authoritative source. If the OpenSearch cluster is lost or its schema changes, the index can be rebuilt from the raw observations stored in S3.

This separation allows NetSighter to optimize S3 for durable storage and OpenSearch for interactive querying.

## Alternates considered

* **PostgreSQL** — Provides strong relational querying and indexing, but the volume and semi-structured nature of NetSighter observations make a search-oriented datastore more appropriate for the primary query workload.

* **DynamoDB** — Well suited for predictable key-value access but less suitable for flexible exploratory queries across IPs, services, CPEs, regions, and historical observations.

* **S3 only** — Provides inexpensive durable storage but is not suitable as the primary interactive search layer for large historical datasets.

* **Elasticsearch** — Provides similar search capabilities, but OpenSearch was selected to avoid introducing a separate commercial dependency and to retain an open-source search stack.
