from fastapi import APIRouter, FastAPI

app = FastAPI()
router = APIRouter()

@router.get("/status/regions")
def get_regional_data():
    return {
        "regions": [
            {
              "id": 1,
              "name": "NORTH AMERICA",
              "status": "FULL",
              "active_azs": 3,
              "max_azs": 3
            },
            {
              "id": 2,
              "name": "SOUTH AMERICA",
              "status": "HALF",
              "active_azs": 1,
              "max_azs": 2
            },
            {
              "id": 3,
              "name": "EUROPE",
              "status": "FULL",
              "active_azs": 3,
              "max_azs": 3
            },
            {
              "id": 4,
              "name": "MIDDLE EAST",
              "status": "HALF",
              "active_azs": 1,
              "max_azs": 2
            },
            {
              "id": 5,
              "name": "SOUTH ASIA",
              "status": "FULL",
              "active_azs": 3,
              "max_azs": 3
            },
            {
              "id": 6,
              "name": "EAST ASIA",
              "status": "HALF",
              "active_azs": 6,
              "max_azs": 9,
            },
            {
              "id": 7,
              "name": "AFRICA",
              "status": "FULL",
              "active_azs": 9,
              "max_azs": 9,
            },
        ],
        "active_regions": 7,
        "total_regions": 7,
    }

app.include_router(router)


@router.get("/status/azs")
def get_az_data():
    return {
        "availability_zones": [
            {
              "id": "ap-southeast-1a",
              "region": "ap-southeast-1",
              "city": "Singapore",
              "latitude": 1.3521,
              "longitude": 103.8198,
              "status": "RUNNING"
            },
            {
              "id": "ap-southeast-1b",
              "region": "ap-southeast-1",
              "city": "Singapore",
              "latitude": 1.3521,
              "longitude": 103.8198,
              "status": "IDLE"
            }
        ]
    }