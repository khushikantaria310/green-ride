import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Import your app and database components from main.py
from main import _fastapi_app, get_db, Base, Station, User

# 1. SETUP A FAKE IN-MEMORY DATABASE FOR TESTING
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# 2. OVERRIDE THE APP'S DATABASE DEPENDENCY
def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


_fastapi_app.dependency_overrides[get_db] = override_get_db
client = TestClient(_fastapi_app)


# 3. TEST SETUP (Runs before tests start)
@pytest.fixture(autouse=True)
def setup_database():
    # Create the tables in the fake RAM database
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    # Seed one test station
    test_station = Station(
        id=999, name="Test Lab Node", latitude=0.0, longitude=0.0, available_slots=5
    )
    db.add(test_station)
    db.commit()
    yield
    # Destroy the tables after tests finish
    Base.metadata.drop_all(bind=engine)


# --- THE ACTUAL TESTS ---


def test_health_check():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {
        "status": "online",
        "message": "Green Ride API Fully Operational",
    }


def test_user_registration():
    response = client.post(
        "/auth/register",
        json={"email": "test@greenride.com", "password": "securepassword123"},
    )
    assert response.status_code == 200
    assert response.json()["message"] == "User created successfully"


def test_duplicate_registration_fails():
    # Register once
    client.post("/auth/register", json={"email": "clone@test.com", "password": "pass"})
    # Try again
    response = client.post(
        "/auth/register", json={"email": "clone@test.com", "password": "pass"}
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Email already registered"


def test_user_login():
    client.post("/auth/register", json={"email": "login@test.com", "password": "pass"})
    response = client.post(
        "/auth/login",
        data={
            "username": "login@test.com",
            "password": "pass",
        },  # OAuth2 uses form data
    )
    assert response.status_code == 200
    assert "access_token" in response.json()


def test_booking_flow():
    # 1. Register & Login to get token
    client.post("/auth/register", json={"email": "booker@test.com", "password": "pass"})
    login_res = client.post(
        "/auth/login", data={"username": "booker@test.com", "password": "pass"}
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Check initial slots (should be 5 based on our fixture)
    db = TestingSessionLocal()
    station = db.query(Station).filter(Station.id == 999).first()
    assert station.available_slots == 5

    # 3. Create a booking
    response = client.post("/api/bookings?station_id=999", headers=headers)
    assert response.status_code == 200
    assert "booking_id" in response.json()

    # 4. Verify slots decremented to 4
    db.refresh(station)
    assert station.available_slots == 4
    db.close()
