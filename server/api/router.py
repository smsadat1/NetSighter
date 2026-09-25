from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .locations import vantage_points, vantage_locations, vantage_regions, mock_data_cf

app = FastAPI()
router = APIRouter()
app.include_router(router)

origins = [
    "http://localhost:5173",    
    "http://127.0.0.1:5173",    
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,         
    allow_credentials=True,       
    allow_methods=["*"],            
    allow_headers=["*"],           
)

@router.get("/status/vantages")
def get_regional_data():
    
    regions = [
       {
           "region": region,
           "status": status,
       }
       for region, status in vantage_regions.items()
    ]

    return {
        "regions": regions,
        "active": sum(status == "BUSY" for status in vantage_regions.values()),
        "total": len(vantage_regions),
    }


@router.get("/status/locations")
def get_az_data():

    vantages = [
        {
            "vantage_point": vantage_point,
            "city": city,
            "latitude": vantage_locations[vantage_point]["lat"],
            "longitude": vantage_locations[vantage_point]["lon"],
            "status": vantage_locations[vantage_point]["status"],
        }
        for vantage_point, city in vantage_points.items()
    ]
    return {"vantages": vantages}


@router.post("/search/{ip}")
def get_ip_data(ip: str):

    if ip == "1.1.1.1":
        return {
            "found": True,
            "ip": "1.1.1.1",
            "latitude": -27.4698,
            "longitude": 153.0251,
        }
    
    return {
        "found": False,
        "ip": ip,
        "message": "The IP address doesn't exist or hasn't been observed yet."
    }


@router.get("/observation/{ip}/summary")
def get_ip_summary(ip: str):

    if ip == "1.1.1.1":
        return {
            "found": True,
            "ip": "1.1.1.1",
            "summary": 
            """
            ## Observation Summary

            Cloudflare's 1.1.1.1 is a publicly accessible DNS resolver.

            The observed service is DNS over UDP/TCP on port 53.
            """,
        }

    return {
        "found": False,
        "ip": ip,
        "message": "The IP address doesn't exist or hasn't been observed yet."
    }


@router.get("/observation/{ip}/details")
def get_ip_details(ip: str):

    if ip == "1.1.1.1":
        return {
            "found": True,
            "ip": "1.1.1.1",
            "details": mock_data_cf,
        }

    return {
        "found": False,
        "ip": ip,
        "message": "The IP address doesn't exist or hasn't been observed yet."
    }