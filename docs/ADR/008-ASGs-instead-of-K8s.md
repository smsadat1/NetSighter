# ADR-009: Use regional ASGs instead of Kubernetes

## What it's about?

The NetSighter scanner fleet will use regional EC2 Auto Scaling Groups instead of Kubernetes for scanner orchestration.

Each AWS region will have its own ASG responsible for running scanner instances.

## Explanation

NetSighter scanners are stateless and disposable. The central scheduler assigns work to scanners through leases, allowing failed or interrupted work to be reassigned to another scanner.

The scanner fleet therefore does not require Kubernetes features such as pod scheduling, service discovery, rolling deployments, or persistent workload management.

Regional ASGs provide the required capabilities for this workload:

* Provisioning and terminating scanner instances.
* Scaling the fleet according to workload.
* Replacing failed instances.
* Supporting multiple EC2 instance types for Spot capacity.
* Keeping scanner infrastructure isolated by region.

Using ASGs also keeps the scanner infrastructure closer to the underlying AWS resources being used, reducing the amount of infrastructure that must be operated and maintained.

Kubernetes would introduce an additional orchestration layer without providing capabilities that are necessary for the scanner workload.

The central scheduler remains responsible for distributing IP ranges, while each regional ASG is responsible for providing disposable compute capacity.

## Alternates considered

* **Kubernetes** — Provides powerful container orchestration and scheduling capabilities, but introduces additional control-plane and operational complexity that is unnecessary for stateless scanner workers.

* **ECS** — Provides managed container orchestration, but the scanner workload only requires disposable compute instances and does not benefit significantly from the additional container scheduling layer.

* **Fixed EC2 instances** — Simpler but cannot dynamically scale with scanning workload and provides less flexibility when Spot capacity changes.

* **Single global ASG** — Would simplify fleet management but would not provide the regional isolation and geographic distribution required by NetSighter's multi-vantage scanning model.
