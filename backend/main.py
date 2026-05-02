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
from contextlib import asynccontextmanager
from dotenv import load_dotenv

from pydantic import BaseModel
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jwt.exceptions import InvalidTokenError
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session, DeclarativeBase, Mapped, mapped_column

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


# New SQLAlchemy 2.0 Base class
class Base(DeclarativeBase):
    pass


# --- 2. DATA MODELS (SQLAlchemy 2.0 Type-Safe Syntax) ---
class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    email: Mapped[str] = mapped_column(unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column()


class Station(Base):
    __tablename__ = "stations"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column()
    latitude: Mapped[float] = mapped_column()
    longitude: Mapped[float] = mapped_column()
    available_slots: Mapped[int] = mapped_column(default=10)


class Booking(Base):
    __tablename__ = "bookings"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(index=True)
    station_id: Mapped[int] = mapped_column(index=True)
    status: Mapped[str] = mapped_column(default="pending")
    created_at: Mapped[str] = mapped_column(
        default=lambda: datetime.now(timezone.utc).isoformat()
    )
    expires_at: Mapped[str] = mapped_column()


class Payment(Base):
    __tablename__ = "payments"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    booking_id: Mapped[int] = mapped_column(index=True)
    amount: Mapped[float] = mapped_column()
    status: Mapped[str] = mapped_column()
    upi_ref: Mapped[Optional[str]] = mapped_column(unique=True, nullable=True)
    created_at: Mapped[str] = mapped_column(
        default=lambda: datetime.now(timezone.utc).isoformat()
    )


class Feedback(Base):
    __tablename__ = "feedback"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    station_id: Mapped[int] = mapped_column(index=True)
    user_id: Mapped[int] = mapped_column()
    rating: Mapped[int] = mapped_column()
    comment: Mapped[Optional[str]] = mapped_column(nullable=True)
    created_at: Mapped[str] = mapped_column(
        default=lambda: datetime.now(timezone.utc).isoformat()
    )


# --- 3. PYDANTIC SCHEMAS ---
class UserCreate(BaseModel):
    email: str
    password: str


class FeedbackCreate(BaseModel):
    station_id: int
    rating: int
    comment: Optional[str] = None


# --- 4. BACKGROUND TASKS ---
async def simulate_station_activity(sio_server):
    while True:
        await asyncio.sleep(60)
        db = SessionLocal()
        try:
            stations = db.query(Station).all()
            updates = []
            for s in stations:
                s.available_slots = random.randint(0, 15)
                updates.append({"id": s.id, "slots": s.available_slots})
            db.commit()
            await sio_server.emit("availability_update", updates)
            print(
                f"🔄 [{datetime.now().strftime('%H:%M:%S')}] Broadcasted Simulation Tick."
            )
        except Exception as e:
            print(f"❌ Simulation Error: {e}")
        finally:
            db.close()


async def clear_expired_bookings():
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
                b.status = "expired"
                station = db.query(Station).filter(Station.id == b.station_id).first()
                if station:
                    station.available_slots += 1
            if expired_bookings:
                db.commit()
                print(f"🧹 Cleared {len(expired_bookings)} expired bookings.")
        except Exception as e:
            print(f"❌ Expiry Cron Error: {e}")
        finally:
            db.close()


# --- 5. LIFESPAN HANDLER ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
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

    task1 = asyncio.create_task(simulate_station_activity(sio))
    task2 = asyncio.create_task(clear_expired_bookings())
    yield
    task1.cancel()
    task2.cancel()


# --- 6. FASTAPI & SOCKET.IO SETUP ---
app = FastAPI(title="Green Ride API", lifespan=lifespan)
sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins="*")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- 7. UTILITIES & AUTH ---
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


# --- 8. ROUTES ---
@app.get("/")
def health_check():
    return {"status": "online", "message": "Green Ride API Fully Operational"}


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
                calculate_distance(lat, lon, s.latitude, s.longitude), 2
            ),
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
    if not station or station.available_slots <= 0:
        raise HTTPException(status_code=400, detail="Station unavailable")
    station.available_slots -= 1
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
    if not booking or booking.status != "pending":
        raise HTTPException(status_code=400, detail="Invalid booking")
    await asyncio.sleep(2)
    if random.random() < 0.95:
        booking.status = "confirmed"
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


# --- 9. FINAL ASGI WRAPPER ---
# 🐛 FIX: We wrap the FastAPI 'app' with Socket.IO down here.
# By reassigning it back to 'app', your usual command ('uvicorn main:app')
# will magically run BOTH the API and the WebSockets simultaneously!
_fastapi_app = app
app = socketio.ASGIApp(sio, _fastapi_app)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=5000, reload=True)
