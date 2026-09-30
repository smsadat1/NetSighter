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


```text
S3 = source of truth
SQS = "something is ready"
```

### SQS & S3 event lifecycle 

```text
           ┌─────────┐
           │ Scanner │
           └────┬────┘
                │ event: observation.ready
                | data: scandata (json)
                | (puts:  s3://{observation_id}/response.bin, s3://{observation_id}/scandata.json)
                ▼
     ┌────────────────────┐
     │ LLM Enrichment     │
     │ Qwen3-4B / Ollama  │
     └──────────┬─────────┘
                │ event: analysis.ready
                | data: analysis (md)
                | (puts: s3://{observation_id}/summaries.md)
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


