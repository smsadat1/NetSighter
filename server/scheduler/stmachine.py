# state machine application

from .command import (
    Command, StartSunrise, AllocateRegionalRange, MarkRegionUnusable
)
from .globalst import GlobalState
from .sunrise import apply_start_sunrise
from .leases import (
    apply_alloc_regional_range, apply_mark_region_unusable
)


def apply(state: GlobalState, command: Command) -> GlobalState:

    if isinstance(command, StartSunrise):
      return apply_start_sunrise(state, command)

    if isinstance(command, AllocateRegionalRange):
        return apply_alloc_regional_range(state, command)

    if isinstance(command, MarkRegionUnusable):
        return apply_mark_region_unusable(state, command)

    raise TypeError(f"Unknown command: {type(command)}")