from dataclasses import dataclass


@dataclass(frozen=True)
class Vantage:
    region: str
    min_capacity: int
    max_capacity: int


primary_vantage_regions = {
    0: Vantage("us-east-1", 6, 18),
    1: Vantage("sa-east-1", 3, 9),
    2: Vantage("eu-central-1", 3, 9),
    3: Vantage("me-south-1", 3, 9),
    4: Vantage("ap-south-1", 3, 9),
    5: Vantage("ap-east-1", 3, 9),
    6: Vantage("af-south-1", 3, 9),
}

fallback_vantage_regions = {
    0: Vantage("us-west-1", 6, 18),
    1: Vantage("sa-east-1", 3, 9),
    2: Vantage("eu-south-2", 3, 9),
    3: Vantage("me-central-1", 3, 9),
    4: Vantage("ap-southeast-1", 3, 9),
    5: Vantage("ap-east-2", 3, 9),
    6: Vantage("af-south-1", 3, 9),
}
