# ADR-007: Stateless scanners

## What it's about

Scanner instances will run as stateless daemons focused only on scanning their assigned IP range and publishing the resulting data.

After scanning, raw observation data is uploaded to S3 and structured metadata is sent to SQS.

## Explanation

Scanner instances do not maintain persistent application state locally.

The central scheduler assigns IP ranges to scanners through leases. A scanner only needs to process its current assignment and publish the resulting observations.

If a scanner fails, is terminated, or receives a Spot interruption, its lease can expire and the unfinished range can be assigned to another scanner.

Keeping scanners stateless allows instances to be created and destroyed freely according to regional workload and Spot capacity.

It also separates scanning from downstream processing. Scanners do not need to communicate directly with DynamoDB, OpenSearch, or the API layer.

This reduces the responsibilities of each scanner and makes the fleet easier to scale, replace, and recover from failures.

## Alternatives considered

* **Stateful scanners** — Would allow scanners to retain progress locally, but would make instance replacement and Spot interruption more complicated because state would need to be recovered or migrated.

* **Centralized scanner state** — Could track detailed scanner progress in a shared database, but would introduce additional coordination and write overhead that is unnecessary when work can be safely reassigned through leases.

* **Scanners directly writing to OpenSearch/DynamoDB** — Would couple the scanner implementation to downstream storage and processing systems, making the scanner fleet harder to operate and evolve.
