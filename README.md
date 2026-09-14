# NetSighter
**Distributed network observation & historical service intelligence.**

## Architecture
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


**Key ideas**
- Multi-region observation (7 total regions)
- Historical service intelligence
- Sunrise Cycles
- Stateless scanner fleet
- S3-backed raw evidence
- CPE/CVE correlation