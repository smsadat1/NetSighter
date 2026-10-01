from dataclasses import dataclass, replace
import logging

from .command import Command, StartSunrise
from .globalst import GlobalState

@dataclass(frozen=True)
class Sunrise:
    sunrise_id: int    
    

def get_scheduled_sunrise():
    
    sched_sunrise = 1
    return sched_sunrise


def apply_start_sunrise(state: GlobalState, command: StartSunrise) -> GlobalState:
    
    logging.info(f"Starting sunrise {command.sunrise_id}") 
    
    return replace(
        state, 
        current_sunrise=Sunrise(sunrise_id=command.sunrise_id),
    )