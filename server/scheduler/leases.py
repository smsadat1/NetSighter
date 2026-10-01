from dataclasses import dataclass, replace
from enum import Enum
import logging

from .command import Command, MarkRegionUnusable, AllocateRegionalRange
from .globalst import GlobalState


class LeaseState(Enum):
    PENDING = "PENDING"
    ACTIVE = "ACTIVE"
    DEGRADED = "DEGRADED"
    TRANSFERRING = "TRANSFERRING"
    EXPIRED = "EXPIRED"
    INVALIDATED = "INVALIDATED"
    COMPLETED = "COMPLETED"


@dataclass(frozen=True)
class RegionalLease:
    lease_id: int
    sunrise_id: int
    ip_range: str
    owner: str | None = None
    fence_token: int = 0
    checkpoint: str | None = None
    duration_seconds: int = 0
    state: LeaseState = LeaseState.PENDING


default_leases = {
    0: RegionalLease(0, 1, "100.0.0.0/8", "us-east-1", 1, "100.0.0.0", 86400),
    1: RegionalLease(1, 1, "101.0.0.0/8", "sa-east-1", 1, "101.0.0.0", 86400),
    2: RegionalLease(2, 1, "102.0.0.0/8", "eu-central-1", 1, "102.0.0.0", 86400),
    3: RegionalLease(3, 1, "103.0.0.0/8", "me-south-1", 1, "103.0.0.0", 86400),
    4: RegionalLease(4, 1, "104.0.0.0/8", "ap-south-1", 1, "104.0.0.0", 86400),
    5: RegionalLease(5, 1, "105.0.0.0/8", "ap-east-1", 1, "105.0.0.0", 86400),
    6: RegionalLease(6, 1, "106.0.0.0/8", "af-south-1", 1, "106.0.0.0", 86400),
}


# allocate IP ranges to regions and apply
def apply_alloc_regional_range(state: GlobalState, command: AllocateRegionalRange) -> GlobalState:

    lease = RegionalLease(
        sunrise_id=command.sunrise_id,
        lease_id=command.lease_id,
        owner=command.vantage_region,
        ip_range=command.ip_range,
        state=LeaseState.ACTIVE,
    )

    leases = {
        **state.regional_leases,
        command.lease_id: lease,
    }

    return replace(state, regional_leases=leases)
    

# make specific regional unusable for current sunrise cycle
def apply_mark_region_unusable(state: GlobalState, command: MarkRegionUnusable) -> GlobalState:

    logging.info(f"Marking vantage region: {command.vantage_region} unusable")

    leases = {
        lease_id: replace(
            lease, state=LeaseState.INVALIDATED,
        ) 
        if lease.owner == command.vantage_region
        else lease 
        for lease_id, lease in state.regional_leases.items() 
    }

    return replace(state, regional_leases=leases)