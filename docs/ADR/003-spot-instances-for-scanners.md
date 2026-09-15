# ADR-003: Spot instances of variable EC2 types used for scanners

## What it's about?

The regionally distributed scanner fleet will use EC2 Spot Instances with multiple compatible instance types rather than relying on a single fixed instance type.

## Explanation

Scanner instances are disposable and do not need to persist state locally.

The central scheduler leases IP ranges to scanner instances. If a scanner is interrupted or fails to complete its assigned range, the lease can expire and the range can be assigned to another available scanner.

Because scanner work is retryable and scanners are stateless, Spot Instance interruption does not compromise the correctness of the scanning system.

Spot Instances also provide lower compute costs compared with On-Demand Instances, which is important because the scanner fleet may scale to a large number of instances during a scanning cycle.

Multiple compatible EC2 instance types will be configured for the fleet instead of relying on a single instance type. This increases the probability of obtaining Spot capacity when a particular instance type or Availability Zone has limited capacity.

## Alternates considered

* **On-Demand Instances** — Provide more predictable capacity but have a higher hourly cost, which is unnecessary for disposable and retryable scanner workloads.

* **Single fixed EC2 instance type** — Simpler to configure but increases dependency on the availability of Spot capacity for that specific instance type.

* **Persistent scanner instances** — Would reduce the need to recreate workers but would increase infrastructure cost and make scanner failures more significant.
