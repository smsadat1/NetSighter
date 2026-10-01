from dataclasses import dataclass


@dataclass(frozen=True)
class StartSunrise:
    sunrise_id: int


@dataclass(frozen=True)
class AllocateRegionalRange:
    sunrise_id: int
    lease_id: int
    vantage_region: str
    ip_range: str

@dataclass(frozen=True)
class MarkRegionUnusable:
    vantage_region: str


@dataclass(frozen=True)
class ActivateFallback:
    vantage_id: int


Command = (
    StartSunrise
    | AllocateRegionalRange
    | MarkRegionUnusable
    | ActivateFallback
)