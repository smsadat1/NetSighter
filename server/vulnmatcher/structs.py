from typing import Literal

class VulnerabilityData:
    cve: list[str]
    cwe: list[str]
    cvss: float | None

class ConfigNode:
    operator: Literal["AND", "OR"]
    children: list["ConfigNode | CPEMatch"]

class CPEMatch:
    criteria: str
    vulnerable: bool

    version_start_including: str | None
    version_start_excluding: str | None
    version_end_including: str | None
    version_end_excluding: str | None