# ADR-004: Multi-region scanner fleet

## What it's about?

Scanners deployed across multiple AWS regions to provide geographically distributed vantage points for network observations.

Each region operate its own scanner fleet through a regional ASG.

## Explanation

Network services can behave differently depending on the geographic location of the observer.

Routing, firewalls, CDN infrastructure, geo-restrictions, load balancing, and network policies can cause the same IP and port to produce different results from different locations.

NetSighter therefore treats the scanner's geographic region as part of an observation.

The same endpoint may be observed from multiple regions during a Sunrise Cycle, allowing NetSighter to identify regional differences and maintain a more complete historical representation of an endpoint.

Regional separation also limits the impact of a regional infrastructure failure. A failure in one AWS region does not prevent the remaining scanner fleets from continuing their assigned work.

## Alternates considered

* **Single-region scanner fleet** — Simpler and cheaper to operate, but observations would originate from a single network vantage point and could miss regional differences in routing, filtering, service availability, and network behavior.

* **Centralized scanning with multiple network proxies** — Could provide geographic vantage points, but introduces additional proxy infrastructure and makes the scanning path more complex than using regional scanner fleets directly.

* **One global scanner fleet without regional separation** — Would reduce infrastructure management overhead but would make geographic assignment and regional failure isolation less explicit.
