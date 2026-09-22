## Systems diagram

```
                ┌─────────────────┐
                │       EC2       | 
                |                 |
                |  Control Plane  |
                |   (scheduler)   |   
                └────────┬────────┘   
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
      Region A        Region B        Region C
         ASG            ASG            ASG
          │              │              │
     ┌────┴────┐    ┌────┴────┐    ┌────┴────┐
     |   EC2   |    |   EC2   |    |   EC2   |   
     | scanner |    | scanner |    | scanner |
     └────┬────┘    └────┬────┘    └────┬────┘
          │              │              │
          └──────────────┼──────────────┘
                         │
          ┌──────────────┼──────────────┐
          ▼                             ▼
         S3                            SQS  
                                        |
                                        ▼
                            ┌───────────┼────────────┐        
                            ▼                        ▼    
                        OpenSearch               DynamoDB
                            │                        │
                         Indexing                    ▼
                            |                ┌───────┼─────────┐
                            |                |                 |  
                            |                |  Lambda worker  |
                            |                |                 |
                            |                | structured data |
                            |                | LLM enhancement | 
                            |                └─────────────────┘       
                            |                        |       
                            └───────────┬────────────┘
                                        ▼
                             ┌──────────┼──────────┐
                             │        EC2          | 
                             | (API LLM inference) |
                             └─────────────────────┘   
```
```

                ┌─────────────────┐
                |    Scheduler    |  
                | lease IP range  |  
                | to regional ASG |  
                └────────┬────────┘
                         ▼
              ┌──────────┼─────────┐
              │        ASG         | 
              | lease sub-range to |
              | individual scanner | 
              └─────────┬──────────┘     
                        ▼
              ┌─────────┼─────────┐      
              |      Scanner      |
              | scans and probes  | 
              | ports within the  |  
              |  given IP range   |             
              └────────┬──────────┘ 
                       ▼
                       SQS ---- > [vulnmatcher]
                        |
                        ▼
                       SQS ---- > [llm analyzer]
                        |
                        ▼
                [Opensearch DynamoDB]
                        |
                        ▼
                    [API server]
```


## Rules

* **One ASG per active AWS region.**
* Each ASG maintains:

  * **Minimum:** number of AZs in that region
  * **Maximum:** `3 ×` number of AZs
* When a primary ASG becomes unavailable, the scheduler launches a **new ASG at the configured fallback region** and assigns it the affected IP range.
* The old ASG remains **invalidated for the remainder of the current Sunrise Cycle**, even if it later recovers.
* At the beginning of a new Sunrise Cycle, infrastructure returns to the **default primary-region configuration**.
* Leases are **duration-based**, e.g. `lease_duration: 1h`, rather than timestamp-based.
* The scanner uses the duration as its execution deadline, but **the scheduler is authoritative over lease validity**.
* An expired lease is expired regardless of what the scanner's local clock says.
* Every lease should carry a **unique lease ID/fencing token** so an invalidated scanner cannot continue publishing work after reassignment.

| Vantage region | Primary region | Fallback region  | Capacity |
| -------------- | -------------- | ---------------- | -------- |
| North America  | `us-east-1`    | `us-west-1`      |     6–18 |
| South America  | `sa-east-1`    | `sa-east-1`      |      3–9 |
| Europe         | `eu-central-1` | `eu-south-2`     |      3–9 |
| Middle East    | `me-south-1`   | `me-central-1`   |      3–9 |
| South Asia     | `ap-south-1`   | `ap-southeast-1` |      3–9 |
| East Asia      | `ap-east-1`    | `ap-east-2`      |      3–9 |
| Africa         | `af-south-1`   | `af-south-1`     |      3–9 |

**Failover logic**

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


```text
S3 = source of truth
SQS = "something is ready"
```

### SQS event lifecycle

```text
          ┌─────────┐
          │ Scanner │
          └────┬────┘
               │ event: observation.ready
               | adds:  s3://{observation_id}/response.bin, s3://{observation_id}/scandata.json
               ▼
    ┌────────────────────┐
    │ Domain Enrichment  │
    │ RDAP / WHOIS / DNS │
    └──────────┬─────────┘
               │ event: domain.ready
               | adds:  s3://{observation_id}/domaindata.json
               ▼
   ┌──────────────────────┐
   │ Vulnerability        │
   │ Enrichment           │
   │ CPE → CVE/CWE/CVSS   │
   └──────────┬───────────┘
              │ event: vulnerabilities.ready
              | adds: s3://{observation_id}/vulnerabilities.json
              ▼
   ┌────────────────────┐
   │ LLM Enrichment     │
   │ Qwen3-4B / Ollama  │
   └──────────┬─────────┘
              │ event: analysis.ready
              | adds: s3://{observation_id}/summaries.md
              ▼
         ┌──────────┐
         │ Indexer  │
         └────┬─────┘
              ▼
          OpenSearch
```

---

```json
{
  "event": "{event_name}.ready",
  "observation_id": "obsv-123",
  "vantage_region": "ap-south-1",
  "ip": "203.0.100.200",
  "observed_at": "2026-10-03T23:23:09Z",
}
```

---

**Materialized representation by Opensearch:**

```json
{
    "observation_id": "obsv-123",
    "ip": "203.0.100.200",
    "observed_at": "2026-10-03T23:23:09Z",
    "vantage_region": "ap-south-1",

    "services": [
        {
            "port": 80,
            "transport": "tcp",
            "service": "http",
            "product": "Apache httpd",
            "version": "2.4.49",
            "cpe": [
                "cpe:2.3:a:apache:http_server:2.4.49:*:*:*:*:*:*:*"
            ]
        }
    ],

    "domain": {
        "names": ["example.com"],
        "rdap": {},
        "whois": {},
        "dns": {}
    },

    "vulnerabilities": [
        {
            "cve": "CVE-2021-41773",
            "cwe": ["CWE-22"],
            "cvss": 7.5,
            "cpe": "cpe:2.3:a:apache:http_server:2.4.49:*:*:*:*:*:*:*"
        }
    ],

    "analysis": "...",

    "artifacts": {
        "vulnerability_db": "nvd-v44",
        "llm_model": "qwen3:4b",
        "llm_prompt_version": "v3"
    }
}
```

---

```text
CONTROL PLANE
Scheduler
   ↓
scanner work queue
   ↓
Scanner


DATA PLANE
Scanner
   ↓
observation.ready
   ↓
VulnMatcher
   ↓
vulnerabilities.ready
   ↓
LLM
   ↓
analysis.ready
   ↓
Indexer
```
