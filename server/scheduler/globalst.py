from dataclasses import dataclass

from .leases import RegionalLease
from .sunrise import Sunrise
from .vantage import Vantage

@dataclass
class GlobalState:
    current_sunrise: Sunrise
    primary_vantages: dict[int, Vantage]
    fallback_vantages: dict[int, Vantage]
    regional_leases: dict[int, RegionalLease]
    invalidated_asgs: set[str]