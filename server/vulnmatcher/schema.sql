CREATE TABLE vulnerability (
    cve TEXT PRIMARY KEY,
    cvss REAL,
    cwe TEXT
);

CREATE TABLE cpe_match (
    id INTEGER PRIMARY KEY,
    cve TEXT NOT NULL,
    criteria TEXT NOT NULL,
    vulnerable BOOLEAN,
    version_start_including TEXT,
    version_start_excluding TEXT,
    version_end_including TEXT,
    version_end_excluding TEXT
);