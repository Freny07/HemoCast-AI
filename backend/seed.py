import datetime
from datetime import timedelta
import random
from sqlalchemy.orm import Session
from database import engine, Base, SessionLocal
from models import User, InventoryItem, BloodRequest, DonationDrive, Donor, HistoricalRecord

# Helper to generate password hashes (mock for simplicity, or we can use hashlib)
import hashlib
def get_password_hash(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def seed_db():
    # 1. Recreate tables
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()

    try:
        print("Seeding Users...")
        # 2. Seed Users
        # Blood Bank Staff
        bank_user = User(
            username="bank",
            password_hash=get_password_hash("password123"),
            email="contact@bhavnagarbloodbank.org",
            role="bank",
            name="Bhavnagar District Blood Bank",
            district="Bhavnagar",
            latitude=21.7645,
            longitude=72.1519
        )
        db.add(bank_user)

        # Hospital Staff
        hospital_user = User(
            username="hospital",
            password_hash=get_password_hash("password123"),
            email="bloodbank@bhavnagarhospital.org",
            role="hospital",
            name="Bhavnagar Civil Hospital",
            district="Bhavnagar",
            latitude=21.7584,
            longitude=72.1633
        )
        db.add(hospital_user)

        # Admin
        admin_user = User(
            username="admin",
            password_hash=get_password_hash("password123"),
            email="admin@hemocast.ai",
            role="admin",
            name="HemoCast Admin Panel",
            district="Bhavnagar",
            latitude=21.7600,
            longitude=72.1500
        )
        db.add(admin_user)

        # Donor User 1
        donor_user1 = User(
            username="donor",
            password_hash=get_password_hash("password123"),
            email="freny@example.com",
            role="donor",
            name="Freny Shah",
            district="Bhavnagar",
            latitude=21.7620,
            longitude=72.1400
        )
        db.add(donor_user1)

        # More donors for targeting list
        donors_to_seed = [
            ("Amit Patel", "O+", 21.7700, 72.1600, "9876543210", 45, 3),
            ("Pooja Sharma", "O-", 21.7500, 72.1300, "9876543211", 120, 6),
            ("Rajesh Mehta", "AB-", 21.7800, 72.1800, "9876543212", 200, 1),
            ("Neha Gohil", "A+", 21.7450, 72.1550, "9876543213", 10, 0),
            ("Vikram Singh", "B+", 21.7610, 72.1700, "9876543214", 60, 4),
            ("Sneha Joshi", "O+", 21.7300, 72.1200, "9876543215", 92, 2),
            ("Karan Dave", "A-", 21.7900, 72.1100, "9876543216", 15, 0),
            ("Devang Shah", "B-", 21.7550, 72.1450, "9876543217", 80, 5)
        ]

        db.commit() # Save users to get IDs

        # 3. Seed Donor Profiles
        # First donor user profile
        donor_profile1 = Donor(
            user_id=donor_user1.id,
            blood_group="O+",
            last_donation_date=datetime.date.today() - timedelta(days=90),
            latitude=donor_user1.latitude,
            longitude=donor_user1.longitude,
            contact_number="9876501234",
            eligible=True,
            impact_score=350,
            streak_weeks=4
        )
        db.add(donor_profile1)

        # Seed other mock donors (they will have implicit user records created)
        for i, (name, bg, lat, lng, phone, days_ago, streak) in enumerate(donors_to_seed):
            d_user = User(
                username=f"donor_{i}",
                password_hash=get_password_hash("password123"),
                email=f"donor_{i}@example.com",
                role="donor",
                name=name,
                district="Bhavnagar",
                latitude=lat,
                longitude=lng
            )
            db.add(d_user)
            db.commit()

            d_profile = Donor(
                user_id=d_user.id,
                blood_group=bg,
                last_donation_date=datetime.date.today() - timedelta(days=days_ago),
                latitude=lat,
                longitude=lng,
                contact_number=phone,
                eligible=(days_ago >= 90),
                impact_score=streak * 100 + 50,
                streak_weeks=streak
            )
            db.add(d_profile)

        print("Seeding Inventory...")
        # 4. Seed Inventory
        today = datetime.date.today()
        # Blood bank ID is bank_user.id
        bank_id = bank_user.id

        inventory_items = [
            # Expiring soon (amber/red alert)
            InventoryItem(blood_bank_id=bank_id, blood_group="O+", component="Whole Blood", units=8, expiry_date=today + timedelta(days=2)),
            InventoryItem(blood_bank_id=bank_id, blood_group="O-", component="Packed RBC", units=3, expiry_date=today + timedelta(days=4)),
            # Critical Expiry (Platelets expire in 5 days, so 1 day is red alert)
            InventoryItem(blood_bank_id=bank_id, blood_group="A+", component="Platelets", units=12, expiry_date=today + timedelta(days=1)),
            InventoryItem(blood_bank_id=bank_id, blood_group="O+", component="Platelets", units=6, expiry_date=today + timedelta(days=1)),
            
            # Redistribution candidates (Surplus at this bank, needed elsewhere or vice versa)
            InventoryItem(
                blood_bank_id=bank_id, 
                blood_group="AB-", 
                component="Packed RBC", 
                units=10, 
                expiry_date=today + timedelta(days=5),
                status="available",
                redistribution_target="Ahmedabad Civil Hospital Bank",
                redistribution_reason="Expiry risk. Bhavnagar demand is low (0.5 units/week), transfer to Ahmedabad where surgical demand for AB- is high."
            ),
            InventoryItem(
                blood_bank_id=bank_id, 
                blood_group="O+", 
                component="Fresh Frozen Plasma", 
                units=25, 
                expiry_date=today + timedelta(days=120),
                status="available"
            ),
            # Stable stock
            InventoryItem(blood_bank_id=bank_id, blood_group="B+", component="Packed RBC", units=18, expiry_date=today + timedelta(days=22)),
            InventoryItem(blood_bank_id=bank_id, blood_group="A-", component="Whole Blood", units=4, expiry_date=today + timedelta(days=15)),
            InventoryItem(blood_bank_id=bank_id, blood_group="AB+", component="Whole Blood", units=7, expiry_date=today + timedelta(days=28))
        ]
        db.add_all(inventory_items)

        print("Seeding Requests...")
        # 5. Seed Blood Requests
        requests = [
            BloodRequest(
                hospital_id=hospital_user.id,
                blood_group="A+",
                component="Platelets",
                units=6,
                urgency="urgent",
                status="pending",
                required_date=today + timedelta(days=1),
                notes="Dengue patient with dropping platelet count (currently 22,000)."
            ),
            BloodRequest(
                hospital_id=hospital_user.id,
                blood_group="O-",
                component="Packed RBC",
                units=4,
                urgency="emergency",
                status="fulfilled",
                required_date=today - timedelta(days=2),
                request_date=datetime.datetime.utcnow() - timedelta(days=2),
                notes="Trauma case. Transfused successfully."
            ),
            BloodRequest(
                hospital_id=hospital_user.id,
                blood_group="B+",
                component="Whole Blood",
                units=10,
                urgency="normal",
                status="approved",
                required_date=today + timedelta(days=3),
                notes="Scheduled orthopaedic joint replacement surgery."
            )
        ]
        db.add_all(requests)

        print("Seeding Donation Drives...")
        # 6. Seed Donation Drives
        drives = [
            DonationDrive(
                blood_bank_id=bank_id,
                name="Bhavnagar University Student Drive",
                location="University Campus Hall, Bhavnagar",
                latitude=21.7500,
                longitude=72.1400,
                date=today + timedelta(days=10),
                expected_yield=80,
                status="scheduled"
            ),
            DonationDrive(
                blood_bank_id=bank_id,
                name="Rotary Club Monsoon Camp",
                location="Rotary Community Hall, Bhavnagar",
                latitude=21.7650,
                longitude=72.1600,
                date=today - timedelta(days=15),
                expected_yield=45,
                status="completed"
            ),
            DonationDrive(
                blood_bank_id=bank_id,
                name="GIDC Industrial Area Outreach",
                location="GIDC Welfare Center, Chitra, Bhavnagar",
                latitude=21.7850,
                longitude=72.1200,
                date=today + timedelta(days=24),
                expected_yield=120,
                status="scheduled"
            )
        ]
        db.add_all(drives)

        print("Seeding Historical Records (ML features)...")
        # 7. Seed Historical Records (365 days of history for O+, O-, A+, AB- for Whole Blood, Packed RBC, Platelets)
        # We model high-need monsoons (July-Sept) for dengue platelets, and Navratri/Diwali festival trauma spikes (Oct/Nov).
        start_date = today - timedelta(days=365)
        blood_groups = ["O+", "O-", "A+", "AB+", "B+", "B-", "A-", "AB-"]
        components = ["Whole Blood", "Packed RBC", "Platelets", "FFP"]
        
        histories = []
        
        for day_offset in range(366):
            current_date = start_date + timedelta(days=day_offset)
            m = current_date.month
            dow = current_date.weekday()
            
            # Environmental features
            # Monsoon (July to Sept)
            is_monsoon = m in [7, 8, 9]
            rain = random.uniform(20.0, 80.0) if is_monsoon else random.uniform(0.0, 5.0)
            temp = random.uniform(24.0, 28.0) if is_monsoon else (random.uniform(18.0, 25.0) if m in [12, 1, 2] else random.uniform(30.0, 38.0))
            
            # Dengue cases (spikes in July-October)
            dengue_baseline = 15 if m in [7, 8, 9, 10] else 2
            dengue = dengue_baseline + random.randint(0, 10)
            
            # Festival season (October/November)
            is_festival = m in [10, 11]
            
            for bg in blood_groups:
                for comp in components:
                    # Baseline demand
                    base_demand = 8.0
                    if bg in ["O+", "A+"]:
                        base_demand += 4.0  # More common groups
                    elif bg in ["O-", "AB-"]:
                        base_demand -= 2.0  # Rarest groups
                        
                    if comp == "Whole Blood":
                        base_demand += 2.0
                    elif comp == "Platelets":
                        base_demand -= 3.0  # Platelets are low volume but spike heavily
                        
                    # 1. Weekly surgical patterns (Hospitals run surgeries on Tuesday/Thursday, fewer on weekends)
                    surgical_multiplier = 1.0
                    if dow in [1, 3]:  # Tue, Thu
                        surgical_multiplier = 1.3
                        surgeries = random.randint(6, 12)
                    elif dow in [5, 6]:  # Weekend
                        surgical_multiplier = 0.5
                        surgeries = random.randint(1, 3)
                    else:
                        surgeries = random.randint(4, 7)
                        
                    # 2. Monsoon Dengue Platelet demand spike
                    dengue_multiplier = 1.0
                    if comp == "Platelets" and is_monsoon:
                        dengue_multiplier = 2.2 + (dengue * 0.05)
                        
                    # 3. Festival Trauma Spike for O+ / O-
                    festival_multiplier = 1.0
                    if is_festival and bg in ["O+", "O-"]:
                        festival_multiplier = 1.6
                        
                    # Compute final demand
                    demand = base_demand * surgical_multiplier * dengue_multiplier * festival_multiplier
                    # Add noise
                    demand += random.uniform(-1.5, 1.5)
                    demand = max(0.5, round(demand, 1))
                    
                    # Inventory level simulation
                    inventory = int(demand * random.uniform(2.0, 4.0)) + random.randint(5, 15)
                    
                    # Create record
                    rec = HistoricalRecord(
                        date=current_date,
                        blood_group=bg,
                        component=comp,
                        inventory_level=inventory,
                        historical_requests=int(demand * 1.1),
                        hospital_name="Bhavnagar Civil Hospital",
                        district="Bhavnagar",
                        festival_flag=is_festival,
                        temperature=round(temp, 1),
                        rainfall=round(rain, 1),
                        dengue_cases=dengue,
                        surgeries_count=surgeries,
                        actual_demand=int(demand)
                    )
                    histories.append(rec)
            
            # Batch inserts to avoid memory overflow in SQLite
            if len(histories) >= 1000:
                db.bulk_save_objects(histories)
                db.commit()
                histories = []
                
        if histories:
            db.bulk_save_objects(histories)
            db.commit()

        print("Database seeded successfully!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
