# ADR-005: Sunrise scheduling

## What it's about?

Sunrise scheduling is a rolling scheduling strategy used to lease IP ranges across regional ASGs over a seven-day cycle.

The schedule rotates IP ranges between seven regions so that each range is eventually observed from every regional vantage point.

## Explanation

The global IPv4 address space is divided into seven logical ranges.

Each day, every regional ASG receives one range according to the following rolling schedule:

```text
1 2 3 4 5 6 7
2 3 4 5 6 7 1
3 4 5 6 7 1 2
4 5 6 7 1 2 3
5 6 7 1 2 3 4
6 7 1 2 3 4 5
7 1 2 3 4 5 6
```

After seven days, every IP range has been assigned to every regional scanner fleet exactly once.

This allows NetSighter to collect observations of the same IP from seven different geographic vantage points within a single global cycle.

The approach provides a predictable observation schedule while avoiding the need to scan the entire address space from every region simultaneously.

The seven-day cycle also provides a natural boundary for comparing observations across regions and tracking changes between successive cycles.

## Alternates considered

* **Same range scanned from every region simultaneously** — Provides multi-region observations faster but requires significantly more scanner capacity and creates unnecessary regional workload spikes.

* **Random range assignment** — Could distribute workload across regions but would make it difficult to guarantee that every range is observed from every region within a predictable period.

* **Single-region sequential scanning** — Simpler to schedule but cannot provide multi-vantage observations.
