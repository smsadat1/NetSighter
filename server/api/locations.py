vantage_points = {
    "us-east-1": "N. Virginia",
    "us-west-1": "N. California",
    "sa-east-1": "Sao Paulo",
    "eu-central-1": "Frankfurt",
    "eu-south-2": "Barcelona",
    "me-south-1": "Bahrain",
    "me-central-1": "Abu Dhabi",
    "ap-south-1": "Mumbai",
    "ap-southeast-1": "Singapore",
    "ap-east-1": "Hong Kong",
    "ap-east-2": "Taipei",
    "af-south-1": "Cape Town",
}

vantage_regions = {
    "NORTH AMERICA": "BUSY",
    "SOUTH AMERICA": "IDLE",
    "EUROPE": "BUSY",
    "MIDDLE EAST": "BUSY",
    "SOUTH ASIA": "OFFLINE",
    "EAST ASIA": "BUSY",
    "AFRICA": "BUSY",
}

vantage_locations = {
    "us-east-1": {"lat": 38.9072, "lon": -77.0369, "status": "ACTIVE"},
    "us-west-1": {"lat": 37.7749, "lon": -122.4194, "status": "IDLE"},
    "sa-east-1": {"lat": -23.5505, "lon": -46.6333, "status": "ACTIVE"},
    "eu-central-1": {"lat": 50.1109, "lon": 8.6821, "status": "ACTIVE"},
    "eu-south-2": {"lat": 41.3874, "lon": 2.1686, "status": "IDLE"},
    "me-south-1": {"lat": 26.2235, "lon": 50.5876, "status": "ACTIVE"},
    "me-central-1": {"lat": 24.4539, "lon": 54.3773, "status": "OFFLINE"},
    "ap-south-1": {"lat": 19.0760, "lon": 72.8777, "status": "OFFLINE"},
    "ap-southeast-1": {"lat": 1.3521, "lon": 103.8198, "status": "ACTIVE"},
    "ap-east-1": {"lat": 22.3193, "lon": 114.1694, "status": "ACTIVE"},
    "ap-east-2": {"lat": 25.0330, "lon": 121.5654, "status": "IDLE"},
    "af-south-1": {"lat": -33.9249, "lon": 18.4241, "status": "ACTIVE"},
}

mock_data_cf = {
    "observation_id": "obsv-123",
    "ip": "1.1.1.1",
    "observed_at": "2026-10-03T23:23:09Z",
    "vantage_region": "ap-south-1",

    "services": [
        {
            "port": 53,
            "transport": "udp",
            "service": "dns",
            "product": "Cloudflare DNS",
            "version": None,
            "cpe": []
        },
        {
            "port": 53,
            "transport": "tcp",
            "service": "dns",
            "product": "Cloudflare DNS",
            "version": None,
            "cpe": []
        },
        {
            "port": 80,
            "transport": "tcp",
            "service": "http",
            "product": "Cloudflare",
            "version": None,
            "cpe": []
        },
        {
            "port": 443,
            "transport": "tcp",
            "service": "https",
            "product": "Cloudflare",
            "version": None,
            "cpe": []
        }
    ],

    "domain": {
        "names": [
            "cloudflare.com",
            "one.one.one.one"
        ],

        "rdap": {
            "handle": "NET-1-0-0-0-1",
            "name": "Cloudflare, Inc.",
            "country": "US",
            "status": [
                "active"
            ]
        },

        "whois": {
            "registrar": "Cloudflare, Inc.",
            "organization": "Cloudflare, Inc.",
            "country": "US"
        },

        "dns": {
            "ptr": [
                "one.one.one.one"
            ],
            "a": [
                "1.1.1.1"
            ],
            "aaaa": [
                "2606:4700:4700::1111"
            ]
        }
    },

    "vulnerabilities": [
        {
            "cve": "CVE-MOCK-0001",
            "cwe": ["CWE-200"],
            "cvss": 4.3,
            "cpe": "cpe:2.3:a:example:dns-service:1.0:*:*:*:*:*:*:*",
            "status": "test-fixture"
        },
        {
            "cve": "CVE-MOCK-0002",
            "cwe": ["CWE-16"],
            "cvss": 6.5,
            "cpe": "cpe:2.3:a:example:http-service:2.0:*:*:*:*:*:*:*",
            "status": "test-fixture"
        }
    ],

    "analysis": """
    ## Observation Summary

    1.1.1.1 appears to be an externally accessible Cloudflare-operated
    DNS resolver endpoint.

    DNS service is exposed over both UDP and TCP on port 53. HTTP and
    HTTPS services are also reachable and appear to be associated with
    Cloudflare infrastructure.

    No confirmed vulnerabilities were identified from the available
    service fingerprints.

    The observed hostname information is consistent with Cloudflare's
    public DNS infrastructure.
    """,

    "artifacts": {
        "vulnerability_db": "nvd-v44",
        "llm_model": "qwen3:4b",
        "llm_prompt_version": "v3"
    }
}