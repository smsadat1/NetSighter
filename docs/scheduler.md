# Scheduler 

## Details
- It has 2 layers: 1. Global, 2. Regional
- Global:
    - Creating IP ranges and give leases to regional schedulers. 
    - Manage regional fallbacks.
    - Ultimate authority over lease duration.
    - Manage the sunrise cycle itself with 1 hour of tolerance.
- Regional: 
    - Creating subranges from regional IP ranges.
    - Manage individual scanner fallbacks with regional ASG.

## Rules

**The big invariant**

> A scanner may perform work only if its lease belongs to the current sunrise, its lease is authoritative, its lease has not expired, and its fencing token matches the scheduler's current fencing token.


* **One ASG per active AWS region.**
* Each ASG maintains:
  * **Minimum:** number of AZs in that region
  * **Maximum:** `3 ×` number of AZs
* When a primary ASG becomes unavailable, the scheduler launches a **new ASG at the configured fallback region** and assigns it the affected IP range.
* The old ASG remains **invalidated for the remainder of the current Sunrise Cycle**, even if it later recovers.
* At the beginning of a new Sunrise Cycle, infrastructure returns to the **default primary-region configuration**.
* Leases are **duration-based**, e.g. `lease_duration: 1h`, rather than timestamp-based.
* Leases are checkpointed.
* The scanner uses the duration as its execution deadline, but **the scheduler is authoritative over lease validity**.
* An expired lease is expired regardless of what the scanner's local clock says.
* Every lease should carry a **unique lease ID/fencing token** so an invalidated scanner cannot continue publishing work after reassignment.

**Lease format**
```json
{
    "sunrise_id": 1842,
    "lease_id": "region-a-range-17",
    "fence_token": 918,
    "duration": "24h",
    "remaining": "30m",
    "owner": "",
    "allocated_range": "100.34.0.0/16",
    "checkpoint": "100.34.21.206",
    "state": "ACTIVE",
}
```

**Possible states**
```text
ACTIVE
DEGRADED
TRANSFERRING
EXPIRED
INVALIDATED
COMPLETED
```

**State commands**
```text
START_SUNRISE
ALLOCATE_REGIONAL_RANGE
MARK_REGION_UNUSABLE
ACTIVATE_FALLBACK
CREATE_SCANNER_LEASE
CHECKPOINT_LEASE
FENCE_LEASE
INVALIDATE_ASG
EXPIRE_LEASE
COMPLETE_LEASE
END_SUNRISE
```

**Events**
```text
LEASE_CREATED
LEASE_RENEWED
LEASE_CHECKPOINTED
LEASE_TRANSFERRED
LEASE_INVALIDATED
LEASE_EXPIRED
```


### Locations

| Vantage region | Primary region | Fallback region  | Capacity |
| -------------- | -------------- | ---------------- | -------- |
| North America  | `us-east-1`    | `us-west-1`      |     6–18 |
| South America  | `sa-east-1`    | `sa-east-1`      |      3–9 |
| Europe         | `eu-central-1` | `eu-south-2`     |      3–9 |
| Middle East    | `me-south-1`   | `me-central-1`   |      3–9 |
| South Asia     | `ap-south-1`   | `ap-southeast-1` |      3–9 |
| East Asia      | `ap-east-1`    | `ap-east-2`      |      3–9 |
| Africa         | `af-south-1`   | `af-south-1`     |      3–9 |

## Failover logic

```text
Primary ASG fails
       │
       ▼
Can fallback target be provisioned?
       │
   ┌───┴────┐
   YES      NO
    │        │
    ▼        ▼
Launch      Vantage
new ASG     unavailable
    │
    ▼
Assign entire affected range
    │
    ▼
Invalidate old ASG
until cycle boundary
```

**Sunrise Cycle boundary**

```text
CURRENT CYCLE
    │
    ├── primary
    ├── fallback
    └── invalidated old ASGs
             │
             ▼
       cycle completes
             │
             ▼
      RESET TO DEFAULT
             │
             ▼
       NEW SUNRISE CYCLE
```


