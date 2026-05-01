import os
import math
import random
import asyncio
import jwt
import uuid
import bcrypt
import socketio
from datetime import datetime, timedelta, timezone
from typing import Optional, List
from dotenv import load_dotenv

from pydantic import BaseModel
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jwt.exceptions import InvalidTokenError
from sqlalchemy import create_engine, Column, Integer, String, Float
from sqlalchemy.orm import sessionmaker, Session, declarative_base

# --- 1. ENVIRONMENT & SECURITY CONFIG ---
load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY", "dev_secret_key_change_me")
ALGORITHM = "HS256"
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./green_ride.db")


def get_password_hash(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(
        plain_password.encode("utf-8"), hashed_password.encode("utf-8")
    )


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
    available_slots = Column(Integer, default=10)


class Booking(Base):
    __tablename__ = "bookings"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    station_id = Column(Integer, index=True)
    status = Column(String, default="pending")
    created_at = Column(String, default=lambda: datetime.now(timezone.utc).isoformat())
    expires_at = Column(String)


class Payment(Base):
    __tablename__ = "payments"
    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, index=True)
    amount = Column(Float)
    status = Column(String)
    upi_ref = Column(String, unique=True, nullable=True)
    created_at = Column(String, default=lambda: datetime.now(timezone.utc).isoformat())


class Feedback(Base):
    __tablename__ = "feedback"
    id = Column(Integer, primary_key=True, index=True)
    station_id = Column(Integer, index=True)
    user_id = Column(Integer)
    rating = Column(Integer)
    comment = Column(String, nullable=True)
    created_at = Column(String, default=lambda: datetime.now(timezone.utc).isoformat())


# --- 3. PYDANTIC SCHEMAS ---
class UserCreate(BaseModel):
    email: str
    password: str


class FeedbackCreate(BaseModel):
    station_id: int
    rating: int
    comment: Optional[str] = None


# --- 4. FASTAPI & SOCKET.IO SETUP ---
app = FastAPI(title="Green Ride API — Phase 2 Final")
sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins="*")
socket_app = socketio.ASGIApp(sio, app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)


# --- 5. UTILITIES & AUTH ---
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


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid auth credentials")
    except InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid auth credentials")
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user


# --- 6. BACKGROUND TASKS ---
async def simulate_station_activity():
    """Task 2.7 & 2.9: Randomize slots and broadcast via Socket.IO"""
    while True:
        await asyncio.sleep(60)
        db = SessionLocal()
        try:
            stations = db.query(Station).all()
            updates = []
            for s in stations:
                s.available_slots = random.randint(0, 15)  # type: ignore
                updates.append({"id": s.id, "slots": s.available_slots})
            db.commit()
            await sio.emit("availability_update", updates)
            print(
                f"🔄 [{datetime.now().strftime('%H:%M:%S')}] Broadcasted Simulation Tick."
            )
        except Exception as e:
            print(f"❌ Simulation Error: {e}")
        finally:
            db.close()


async def clear_expired_bookings():
    """Task 2.8: Cleanup expired pending bookings"""
    while True:
        await asyncio.sleep(120)
        db = SessionLocal()
        try:
            now_iso = datetime.now(timezone.utc).isoformat()
            expired_bookings = (
                db.query(Booking)
                .filter(Booking.status == "pending", Booking.expires_at < now_iso)
                .all()
            )
            for b in expired_bookings:
                b.status = "expired"  # type: ignore
                station = db.query(Station).filter(Station.id == b.station_id).first()
                if station:
                    station.available_slots += 1  # type: ignore
            if expired_bookings:
                db.commit()
                print(f"🧹 Cleared {len(expired_bookings)} expired bookings.")
        except Exception as e:
            print(f"❌ Expiry Cron Error: {e}")
        finally:
            db.close()


@app.on_event("startup")
async def startup_event():
    db = SessionLocal()
    try:
        if db.query(Station).count() == 0:
            print("🌱 Seeding initial charging stations...")
            sample_stations = [
                Station(
                    name="Indiranagar Hub",
                    latitude=12.9716,
                    longitude=77.5946,
                    available_slots=10,
                ),
                Station(
                    name="Koramangala Point",
                    latitude=12.9352,
                    longitude=77.6245,
                    available_slots=5,
                ),
                Station(
                    name="MG Road Station",
                    latitude=12.9733,
                    longitude=77.6117,
                    available_slots=8,
                ),
            ]
            db.add_all(sample_stations)
            db.commit()
    finally:
        db.close()
    asyncio.create_task(simulate_station_activity())
    asyncio.create_task(clear_expired_bookings())


# --- 7. ROUTES ---
@app.get("/")
def health_check():
    return {"status": "online", "message": "Green Ride API Phase 2 Complete"}


@app.post("/auth/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    new_user = User(email=user.email, hashed_password=get_password_hash(user.password))
    db.add(new_user)
    db.commit()
    return {"message": "User created successfully"}


@app.post("/auth/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, str(user.hashed_password)):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = jwt.encode(
        {"sub": user.email, "exp": datetime.now(timezone.utc) + timedelta(hours=24)},
        SECRET_KEY,
        algorithm=ALGORITHM,
    )
    return {"access_token": token, "token_type": "bearer"}


@app.get("/api/stations/nearby")
def get_nearby_stations(lat: float, lon: float, db: Session = Depends(get_db)):
    stations = db.query(Station).all()
    results = [
        {
            "id": s.id,
            "name": s.name,
            "distance_km": round(
                calculate_distance(lat, lon, float(s.latitude), float(s.longitude)), 2
            ),  # type: ignore
            "available_slots": s.available_slots,
            "coordinates": {"lat": s.latitude, "lng": s.longitude},
        }
        for s in stations
    ]
    return sorted(results, key=lambda x: x["distance_km"])


@app.post("/api/bookings")
def create_booking(
    station_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    station = db.query(Station).filter(Station.id == station_id).first()
    if not station or int(station.available_slots) <= 0:  # type: ignore
        raise HTTPException(status_code=400, detail="Station unavailable")
    station.available_slots -= 1  # type: ignore
    new_booking = Booking(
        user_id=current_user.id,
        station_id=station_id,
        expires_at=(datetime.now(timezone.utc) + timedelta(minutes=10)).isoformat(),
    )
    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)
    return {"booking_id": new_booking.id, "expires_at": new_booking.expires_at}


@app.post("/api/payments")
async def process_payment(
    booking_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    booking = (
        db.query(Booking)
        .filter(Booking.id == booking_id, Booking.user_id == current_user.id)
        .first()
    )
    if not booking or str(booking.status) != "pending":
        raise HTTPException(status_code=400, detail="Invalid booking")
    await asyncio.sleep(2)
    if random.random() < 0.95:
        booking.status = "confirmed"  # type: ignore
        db.add(
            Payment(
                booking_id=booking.id,
                amount=149.0,
                status="success",
                upi_ref=f"UPI{uuid.uuid4().hex[:12].upper()}",
            )
        )
        db.commit()
        return {"status": "success", "message": "Payment confirmed"}
    raise HTTPException(status_code=402, detail="Payment failed")


@app.post("/api/feedback")
def submit_feedback(
    data: FeedbackCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not (1 <= data.rating <= 5):
        raise HTTPException(status_code=400, detail="Rating must be 1-5")
    db.add(
        Feedback(
            station_id=data.station_id,
            user_id=current_user.id,
            rating=data.rating,
            comment=data.comment,
        )
    )
    db.commit()
    return {"status": "success"}


# --- 8. RUNNER ---
if __name__ == "__main__":
    import uvicorn

    # Use string reference "main:socket_app" to allow reload and Socket.IO integration
    uvicorn.run("main:socket_app", host="0.0.0.0", port=5000, reload=True)
