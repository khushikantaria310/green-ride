from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from main import Base, Station  # This looks for Base and Station in main.py

engine = create_engine("sqlite:///./green_ride.db")
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

# Bengaluru Sample Data
stations = [
    {"name": "Indiranagar Metro", "latitude": 12.9784, "longitude": 77.6408},
    {"name": "Koramangala 5th Block", "latitude": 12.9352, "longitude": 77.6245},
]

try:
    # Clear existing data so we don't get duplicates
    db.query(Station).delete()

    for s in stations:
        db.add(Station(**s))

    db.commit()
    print("✅ Database Seeded Successfully!")
except Exception as e:
    print(f"❌ Error: {e}")
finally:
    db.close()
