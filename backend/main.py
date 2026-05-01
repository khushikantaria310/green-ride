import os
import math
import random
import asyncio
import jwt
from datetime import datetime, timedelta
from typing import Optional
from dotenv import load_dotenv

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Float
from sqlalchemy.orm import sessionmaker, Session, declarative_base
from passlib.context import CryptContext

# --- 1. ENVIRONMENT & SECURITY CONFIG ---
load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY", "dev_secret_key_change_me")
ALGORITHM = "HS256"
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./green_ride.db")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# --- 2. DATA MODELS ---
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)


class Station(Base):
    __tablename__ = "stations"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    available_slots = Column(Integer, default=10)  # Added for Phase 2.7


# Create the tables automatically
Base.metadata.create_all(bind=engine)

# --- 3. FASTAPI SETUP ---
app = FastAPI(title="Green Ride API — Phase 2")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- 4. UTILITIES & DEPENDENCIES ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float):
    R = 6371.0
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


# --- 5. PHASE 2.7: SIMULATION CRON JOB ---
async def simulate_station_activity():
    """Background task to randomize station slots every 60s"""
    while True:
        await asyncio.sleep(60)
        db = SessionLocal()
        try:
            stations = db.query(Station).all()
            for s in stations:
                # Randomize availability between 0 and 15 slots
                s.available_slots = random.randint(0, 15)
            db.commit()
            print(
                f"🔄 [{datetime.now().strftime('%H:%M:%S')}] Simulation Tick: Updated station slots."
            )
        except Exception as e:
            print(f"❌ Simulation Error: {e}")
        finally:
            db.close()


@app.on_event("startup")
async def startup_event():
    # Start the simulation background task
    asyncio.create_task(simulate_station_activity())


# --- 6. API ENDPOINTS ---


@app.get("/")
def health_check():
    return {
        "status": "online",
        "message": "Green Ride Backend (Phase 2) is running",
        "city": "Bengaluru",
    }


# --- 2.1 AUTH ROUTES ---
@app.post("/auth/register")
def register(email: str, password: str, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed = pwd_context.hash(password)
    new_user = User(email=email, hashed_password=hashed)
    db.add(new_user)
    db.commit()
    return {"message": "User created successfully"}


@app.post("/auth/login")
def login(email: str, password: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    if not user or not pwd_context.verify(password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token_expires = timedelta(hours=24)
    token_data = {"sub": email, "exp": datetime.utcnow() + access_token_expires}
    token = jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)

    return {"access_token": token, "token_type": "bearer"}


# --- 2.3 STATION ROUTES ---
@app.get("/api/stations/nearby")
def get_nearby_stations(lat: float, lon: float, db: Session = Depends(get_db)):
    stations = db.query(Station).all()
    results = []

    for s in stations:
        dist = calculate_distance(lat, lon, float(s.latitude), float(s.longitude))
        results.append(
            {
                "id": s.id,
                "name": s.name,
                "distance_km": round(dist, 2),
                "available_slots": s.available_slots,
                "coordinates": {"lat": s.latitude, "lng": s.longitude},
            }
        )

    return sorted(results, key=lambda x: x["distance_km"])


# --- 7. SERVER RUNNER ---
if __name__ == "__main__":
    import uvicorn

    print("🚀 Starting Green Ride Backend on http://localhost:5000")
    uvicorn.run(app, host="0.0.0.0", port=5000)
