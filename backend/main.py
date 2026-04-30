from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Float
from sqlalchemy.orm import sessionmaker, Session, declarative_base
import math

# --- 1. DATABASE CONFIGURATION ---
# Using SQLite for a simple, zero-config local database
SQLALCHEMY_DATABASE_URL = "sqlite:///./green_ride.db"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# --- 2. DATA MODEL ---
class Station(Base):
    __tablename__ = "stations"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)


# Create the tables automatically if they don't exist
Base.metadata.create_all(bind=engine)

# --- 3. FASTAPI SETUP ---
app = FastAPI(title="Green Ride API")

# --- 4. CORS MIDDLEWARE (REQUIRED FOR FRONTEND) ---
# This allows your Next.js/React app to fetch data from this server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for local development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Dependency to get a database session for each request
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# --- 5. THE HAVERSINE FORMULA ---
def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float):
    R = 6371.0  # Earth radius in kilometers

    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)

    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlon / 2) ** 2
    )

    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


# --- 6. API ENDPOINTS ---


@app.get("/")
def health_check():
    return {
        "status": "online",
        "message": "Green Ride Python Backend is running smoothly",
        "city": "Bengaluru",
    }


@app.get("/api/stations/nearby")
def get_nearby_stations(lat: float, lon: float, db: Session = Depends(get_db)):
    """
    Returns all stations sorted by proximity to the user's lat/lon.
    """
    stations = db.query(Station).all()
    results = []

    for s in stations:
        # Wrap the attributes in float() to satisfy the type checker
        dist = calculate_distance(lat, lon, s.latitude, s.longitude)  # type:ignore
        results.append(
            {
                "id": s.id,
                "name": s.name,
                "distance_km": round(dist, 2),
                "coordinates": {"lat": s.latitude, "lng": s.longitude},
            }
        )

    # Sort results so the closest station appears first
    return sorted(results, key=lambda x: x["distance_km"])


# --- 7. SERVER RUNNER ---
if __name__ == "__main__":
    import uvicorn

    print("🚀 Starting Green Ride Backend on http://localhost:5000")
    uvicorn.run(app, host="0.0.0.0", port=5000)
