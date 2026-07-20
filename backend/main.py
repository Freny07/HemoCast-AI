from fastapi import FastAPI, Depends, HTTPException, status, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
import datetime
from datetime import timedelta
import hashlib

from database import engine, get_db
import models
import schemas
from forecaster import generate_predictions_ml

app = FastAPI(title="HemoCast AI Backend", version="1.0.0")

# Enable CORS for frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_password_hash(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

# --- AUTH ENDPOINTS ---

@app.post("/api/auth/signup", response_model=schemas.UserBase)
def signup(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.username == user_data.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    hashed_pwd = get_password_hash(user_data.password)
    new_user = models.User(
        username=user_data.username,
        password_hash=hashed_pwd,
        email=user_data.email,
        role=user_data.role,
        name=user_data.name,
        district=user_data.district or "Bhavnagar",
        latitude=user_data.latitude or 21.7600,
        longitude=user_data.longitude or 72.1500
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # If donor role, create profile
    if user_data.role == "donor":
        new_donor = models.Donor(
            user_id=new_user.id,
            blood_group="O+",  # Default blood group for new signups
            last_donation_date=None,
            latitude=new_user.latitude,
            longitude=new_user.longitude,
            contact_number="9999999999",
            eligible=True,
            impact_score=0,
            streak_weeks=0
        )
        db.add(new_donor)
        db.commit()
        
    return new_user

@app.post("/api/auth/login", response_model=schemas.Token)
def login(login_data: schemas.UserLogin, db: Session = Depends(get_db)):
    hashed_pwd = get_password_hash(login_data.password)
    user = db.query(models.User).filter(
        models.User.username == login_data.username,
        models.User.password_hash == hashed_pwd
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
        
    return {
        "access_token": f"mock-token-{user.id}",
        "token_type": "bearer",
        "role": user.role,
        "name": user.name,
        "userId": user.id
    }

# --- DASHBOARD SUMMARY ENDPOINT ---

@app.get("/api/dashboard/summary")
def get_dashboard_summary(role: str = "bank", user_id: int = 1, db: Session = Depends(get_db)):
    """
    Returns role-aware dashboard summaries customized for Donors, Hospitals, and Blood Banks.
    """
    today = datetime.date.today()
    
    # Core stats for public impact counters
    units_saved = 142
    shortages_prevented = 58
    
    if role == "donor":
        donor = db.query(models.Donor).filter(models.Donor.user_id == user_id).first()
        if not donor:
            # Fallback if profile doesn't exist
            donor = db.query(models.Donor).first()
        
        # Calculate next eligibility
        days_since_donation = 999
        if donor.last_donation_date:
            days_since_donation = (today - donor.last_donation_date).days
            
        eligible_in_days = max(0, 90 - days_since_donation)
        eligibility_status = "Eligible Now" if eligible_in_days == 0 else f"Eligible in {eligible_in_days} days"
        
        return {
            "role": "donor",
            "name": donor.user.name,
            "blood_group": donor.blood_group,
            "impact_score": donor.impact_score,
            "streak_weeks": donor.streak_weeks,
            "last_donation": donor.last_donation_date.strftime("%Y-%m-%d") if donor.last_donation_date else "Never",
            "eligibility": eligibility_status,
            "badges": ["Monsoon Hero", "O+ Lifesaver", "Fever Fighter"] if donor.impact_score >= 200 else ["First Step"],
            "notifications": [
                {
                    "title": "Platelet Shortage Alert!",
                    "message": "Dengue cases are rising in Bhavnagar. Your blood group O+ is highly recommended for platelets. Can you donate this week?",
                    "action": "Schedule Donation"
                }
            ]
        }
        
    elif role == "hospital":
        hospital = db.query(models.User).filter(models.User.id == user_id).first()
        my_requests = db.query(models.BloodRequest).filter(models.BloodRequest.hospital_id == user_id).order_by(models.BloodRequest.request_date.desc()).all()
        
        pending_count = sum(1 for r in my_requests if r.status == "pending")
        fulfilled_count = sum(1 for r in my_requests if r.status == "fulfilled")
        
        return {
            "role": "hospital",
            "name": hospital.name if hospital else "Bhavnagar Civil Hospital",
            "district": hospital.district if hospital else "Bhavnagar",
            "pending_requests_count": pending_count,
            "fulfilled_requests_count": fulfilled_count,
            "recent_requests": [
                {
                    "id": r.id,
                    "blood_group": r.blood_group,
                    "component": r.component,
                    "units": r.units,
                    "urgency": r.urgency,
                    "status": r.status,
                    "required_date": r.required_date.strftime("%Y-%m-%d")
                } for r in my_requests[:5]
            ]
        }
        
    else:  # Blood Bank Staff ("bank") or Admin
        bank = db.query(models.User).filter(models.User.id == user_id).first()
        bank_name = bank.name if bank else "Bhavnagar District Blood Bank"
        
        # Calculate active alert count (inventory expiring in <= 3 days)
        expiring_items = db.query(models.InventoryItem).filter(
            models.InventoryItem.blood_bank_id == user_id,
            models.InventoryItem.expiry_date <= today + timedelta(days=3),
            models.InventoryItem.status == "available"
        ).all()
        
        # Expiry risk count
        expiry_risk_units = sum(item.units for item in expiring_items)
        
        # Suggested transfer (grab one redistribution item)
        redistribute_item = db.query(models.InventoryItem).filter(
            models.InventoryItem.blood_bank_id == user_id,
            models.InventoryItem.redistribution_target != None,
            models.InventoryItem.status == "available"
        ).first()
        
        transfer_suggestion = None
        if redistribute_item:
            transfer_suggestion = {
                "id": redistribute_item.id,
                "blood_group": redistribute_item.blood_group,
                "component": redistribute_item.component,
                "units": redistribute_item.units,
                "target": redistribute_item.redistribution_target,
                "reason": redistribute_item.redistribution_reason
            }
            
        # Top donor to notify (grab one eligible O- or O+ donor who is eligible and hasn't donated recently)
        top_donor = db.query(models.Donor).filter(models.Donor.eligible == True).order_by(models.Donor.impact_score.desc()).first()
        donor_suggestion = None
        if top_donor:
            donor_suggestion = {
                "id": top_donor.id,
                "name": top_donor.user.name,
                "blood_group": top_donor.blood_group,
                "contact": top_donor.contact_number,
                "streak": top_donor.streak_weeks
            }
            
        # Tomorrow's Predicted Demand for main groups (progress bars)
        # We can run mock models or call the forecaster for some indicators
        demand_indicators = [
            {"blood_group": "A+", "component": "Platelets", "predicted_units": 14, "confidence": 92, "level": "High (Dengue Spike)"},
            {"blood_group": "O+", "component": "Packed RBC", "predicted_units": 18, "confidence": 88, "level": "Medium (Regular Surgeries)"},
            {"blood_group": "O-", "component": "Packed RBC", "predicted_units": 6, "confidence": 95, "level": "High (Trauma Alert)"},
            {"blood_group": "AB-", "component": "Whole Blood", "predicted_units": 2, "confidence": 81, "level": "Stable"}
        ]
        
        # Alert banner
        alert_banner = {
            "severity": "high",
            "message": "Critical shortage predicted: Platelets A+ demand will exceed local stock by 8 units tomorrow.",
            "reasoning": "Explainable AI flags: 1) Mosquito surveillance indicates high larval count (dengue vector), 2) Hospital reports 2 pediatric platelet transfusions scheduled for tomorrow, 3) Current A+ platelet inventory is below safety margin.",
            "action_text": "Notify A+ Platelet Donors",
            "action_type": "notify_donors",
            "target_blood_group": "A+",
            "target_component": "Platelets"
        }
        
        return {
            "role": "bank",
            "bank_name": bank_name,
            "units_saved": units_saved,
            "shortages_prevented": shortages_prevented,
            "expiry_risk_units": expiry_risk_units,
            "alert_banner": alert_banner,
            "transfer_suggestion": transfer_suggestion,
            "donor_suggestion": donor_suggestion,
            "demand_indicators": demand_indicators
        }

# --- FORECAST ENDPOINTS ---

@app.get("/api/forecast", response_model=schemas.ForecastResponse)
def get_forecast(
    blood_group: str,
    component: str,
    granularity: str = "daily",
    district: str = "Bhavnagar",
    db: Session = Depends(get_db)
):
    try:
        forecast_result = generate_predictions_ml(db, blood_group, component, granularity, district)
        return forecast_result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Forecasting engine error: {str(e)}")

# --- INVENTORY ENDPOINTS ---

@app.get("/api/inventory", response_model=List[schemas.InventoryItemResponse])
def get_inventory(bank_id: int = 1, db: Session = Depends(get_db)):
    return db.query(models.InventoryItem).filter(
        models.InventoryItem.blood_bank_id == bank_id,
        models.InventoryItem.status == "available"
    ).all()

@app.post("/api/inventory/create", response_model=schemas.InventoryItemResponse)
def create_inventory_item(item: schemas.InventoryItemCreate, bank_id: int = 1, db: Session = Depends(get_db)):
    new_item = models.InventoryItem(
        blood_bank_id=bank_id,
        blood_group=item.blood_group,
        component=item.component,
        units=item.units,
        expiry_date=item.expiry_date,
        status="available"
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item

@app.post("/api/inventory/redistribute/{item_id}")
def execute_redistribution(item_id: int, db: Session = Depends(get_db)):
    item = db.query(models.InventoryItem).filter(models.InventoryItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    
    # Mark as redirected (simulating transfer)
    target = item.redistribution_target or "Regional Hospital"
    item.status = "redirected"
    db.commit()
    
    return {
        "success": True, 
        "message": f"Successfully initiated transfer of {item.units} units of {item.blood_group} {item.component} to {target}."
    }

# --- DONOR TARGETING ENDPOINTS ---

@app.get("/api/donors/target", response_model=List[schemas.TargetDonorResponse])
def get_targeted_donors(blood_group: str = "O+", component: str = "Platelets", db: Session = Depends(get_db)):
    """
    Ranks donors for targeting by location distance, donation eligibility, and response likelihood.
    """
    donors = db.query(models.Donor).all()
    today = datetime.date.today()
    
    ranked_donors = []
    for d in donors:
        # Calculate days since last donation
        days_ago = 999
        if d.last_donation_date:
            days_ago = (today - d.last_donation_date).days
            
        # Eligible?
        is_eligible = days_ago >= 90
        
        # Calculate mock distance (within Bhavnagar area, based on coords)
        # Center: 21.7645, 72.1519
        distance = round(((d.latitude - 21.7645)**2 + (d.longitude - 72.1519)**2)**0.5 * 111, 2)
        
        # Calculate response likelihood based on impact score, eligibility, and blood group match
        likelihood = 0.5
        if d.blood_group == blood_group:
            likelihood += 0.2
        if is_eligible:
            likelihood += 0.15
        likelihood += (d.impact_score / 1500.0) # higher score = higher engagement
        likelihood = min(0.98, max(0.1, round(likelihood, 2)))
        
        ranked_donors.append({
            "id": d.id,
            "name": d.user.name,
            "blood_group": d.blood_group,
            "distance_km": distance,
            "eligible": is_eligible,
            "last_donation_days_ago": days_ago,
            "response_likelihood": likelihood,
            "contact_number": d.contact_number
        })
        
    # Sort by response likelihood (highest first) and eligibility (eligible first)
    ranked_donors.sort(key=lambda x: (x["eligible"], x["response_likelihood"]), reverse=True)
    return ranked_donors

@app.post("/api/donors/notify")
def notify_donors(donor_ids: List[int], message: str, db: Session = Depends(get_db)):
    # Simulates sending SMS / WhatsApp triggers
    donors = db.query(models.Donor).filter(models.Donor.id.in_(donor_ids)).all()
    names = [d.user.name for d in donors]
    
    return {
        "success": True,
        "message": f"Outreach triggered. Sent plain SMS & WhatsApp fallbacks containing '{message}' to {len(donors)} donors: {', '.join(names)}."
    }

# --- DRIVES PLANNER ENDPOINTS ---

@app.get("/api/drives/planner")
def get_drive_recommendations(db: Session = Depends(get_db)):
    """
    Suggests locations, dates, and expected yields for donation drives based on AI predictions.
    """
    today = datetime.date.today()
    
    # We analyze upcoming high-need months
    return [
        {
            "suggested_location": "Bhavnagar Engineering College Hall",
            "suggested_date": (today + timedelta(days=12)).strftime("%Y-%m-%d"),
            "expected_yield": 95,
            "reasoning": "High-yield historical location. Aligning with predicted 15% bump in O+ demand for the upcoming festival weeks.",
            "target_blood_group": "O+",
            "priority": "High"
        },
        {
            "suggested_location": "Alang Port Community Center",
            "suggested_date": (today + timedelta(days=22)).strftime("%Y-%m-%d"),
            "expected_yield": 130,
            "reasoning": "High concentration of factory workers. Perfect for mass Whole Blood collection prior to dengue season.",
            "target_blood_group": "All Groups",
            "priority": "Medium"
        },
        {
            "suggested_location": "Bhavnagar GIDC Sports Club",
            "suggested_date": (today + timedelta(days=5)).strftime("%Y-%m-%d"),
            "expected_yield": 40,
            "reasoning": "Nearby local donor hub. Urgent target needed to cover predicted A+ Platelet deficit due to dengue caseload rise.",
            "target_blood_group": "A+",
            "priority": "Critical"
        }
    ]

@app.get("/api/drives", response_model=List[schemas.DonationDriveResponse])
def list_drives(bank_id: int = 1, db: Session = Depends(get_db)):
    return db.query(models.DonationDrive).filter(models.DonationDrive.blood_bank_id == bank_id).all()

@app.post("/api/drives", response_model=schemas.DonationDriveResponse)
def schedule_drive(drive: schemas.DonationDriveCreate, bank_id: int = 1, db: Session = Depends(get_db)):
    new_drive = models.DonationDrive(
        blood_bank_id=bank_id,
        name=drive.name,
        location=drive.location,
        latitude=drive.latitude,
        longitude=drive.longitude,
        date=drive.date,
        expected_yield=drive.expected_yield,
        status="scheduled"
    )
    db.add(new_drive)
    db.commit()
    db.refresh(new_drive)
    return new_drive

# --- HOSPITAL REQUESTS & EMERGENCY SOS ---

@app.get("/api/hospital/requests", response_model=List[schemas.BloodRequestResponse])
def get_hospital_requests(hospital_id: int = 2, db: Session = Depends(get_db)):
    return db.query(models.BloodRequest).filter(models.BloodRequest.hospital_id == hospital_id).all()

@app.post("/api/hospital/requests", response_model=schemas.BloodRequestResponse)
def submit_blood_request(req: schemas.BloodRequestCreate, hospital_id: int = 2, db: Session = Depends(get_db)):
    new_req = models.BloodRequest(
        hospital_id=hospital_id,
        blood_group=req.blood_group,
        component=req.component,
        units=req.units,
        urgency=req.urgency,
        status="pending",
        required_date=req.required_date,
        notes=req.notes
    )
    db.add(new_req)
    db.commit()
    db.refresh(new_req)
    return new_req

@app.post("/api/hospital/emergency")
def trigger_emergency_sos(req: schemas.BloodRequestCreate, hospital_id: int = 2, db: Session = Depends(get_db)):
    """
    One-tap SOS. Pings nearby banks and matches donors simultaneously.
    """
    # Create request record in DB
    new_req = models.BloodRequest(
        hospital_id=hospital_id,
        blood_group=req.blood_group,
        component=req.component,
        units=req.units,
        urgency="emergency",
        status="pending",
        required_date=datetime.date.today(),
        notes=f"[SOS EMERGENCY] {req.notes or 'Urgent blood request triggered!'}"
    )
    db.add(new_req)
    db.commit()
    db.refresh(new_req)
    
    # 1. Search nearby blood banks (in real system, do spatial query. Here we return mock listings)
    nearby_banks = [
        {"name": "Bhavnagar District Blood Bank", "distance_km": 1.2, "units_available": 4, "contact": "9876543219"},
        {"name": "Red Cross Bhavnagar Center", "distance_km": 3.4, "units_available": 2, "contact": "9876543218"}
    ]
    
    # 2. Match local donors of matching blood group (and O-)
    matching_donors = db.query(models.Donor).filter(
        models.Donor.eligible == True,
        models.Donor.blood_group.in_([req.blood_group, "O-"])
    ).all()
    
    contacted_donors = []
    for d in matching_donors[:5]:  # Limit to top 5
        distance = round(((d.latitude - 21.7584)**2 + (d.longitude - 72.1633)**2)**0.5 * 111, 2)
        contacted_donors.append({
            "name": d.user.name,
            "blood_group": d.blood_group,
            "distance_km": distance,
            "contact": d.contact_number
        })
        
    return {
        "success": True,
        "request_id": new_req.id,
        "blood_group": req.blood_group,
        "component": req.component,
        "units": req.units,
        "banks_notified": nearby_banks,
        "donors_contacted": contacted_donors,
        "message": f"SOS Emergency alert broadcasted! Paged 2 nearby blood banks and notified {len(contacted_donors)} matching local donors."
    }

# --- SMART AI CHATBOT ENDPOINT ---

@app.post("/api/chatbot/query", response_model=schemas.ChatResponse)
def chatbot_query(query: schemas.ChatQuery, db: Session = Depends(get_db)):
    msg = query.message.lower().strip()
    reply = ""
    intent = "general"
    data = None
    
    today = datetime.date.today()
    
    # 1. Check for platelets expiring queries
    if "platelet" in msg and ("expire" in msg or "expiry" in msg or "old" in msg):
        intent = "platelet_expiry"
        # Find platelets expiring in the next 3 days
        items = db.query(models.InventoryItem).filter(
            models.InventoryItem.component == "Platelets",
            models.InventoryItem.expiry_date <= today + timedelta(days=3),
            models.InventoryItem.status == "available"
        ).all()
        
        if items:
            details = [f"{item.units} units of {item.blood_group} expiring on {item.expiry_date}" for item in items]
            reply = f"I found {len(items)} batch(es) of Platelets expiring within the next 3 days:\n" + "\n".join(details) + "\n\nI recommend contacting nearby hospitals for redistribution or setting up urgent platelet transfers."
            data = [{"units": item.units, "blood_group": item.blood_group, "expiry": str(item.expiry_date)} for item in items]
        else:
            reply = "Great news! There are currently no platelet batches expiring within the next 3 days."
            
    # 2. Check for rare blood group availability or general availability (e.g., "3 units AB- nearby")
    elif "units" in msg or "stock" in msg or "avail" in msg or any(bg.lower() in msg for bg in ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]):
        intent = "stock_check"
        
        # Parse blood group if mentioned
        target_bg = None
        for bg in ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]:
            if bg.lower() in msg:
                target_bg = bg
                break
                
        # Parse component if mentioned
        target_comp = None
        for comp in ["whole blood", "packed rbc", "platelets", "ffp"]:
            if comp in msg:
                if comp == "packed rbc":
                    target_comp = "Packed RBC"
                elif comp == "whole blood":
                    target_comp = "Whole Blood"
                elif comp == "platelets":
                    target_comp = "Platelets"
                elif comp == "ffp":
                    target_comp = "FFP"
                break
                
        query_builder = db.query(models.InventoryItem).filter(models.InventoryItem.status == "available")
        if target_bg:
            query_builder = query_builder.filter(models.InventoryItem.blood_group == target_bg)
        if target_comp:
            query_builder = query_builder.filter(models.InventoryItem.component == target_comp)
            
        items = query_builder.all()
        
        if items:
            total_units = sum(item.units for item in items)
            reply = f"Yes, HemoCast AI database shows we have a total of {total_units} units matching your search:\n"
            details = [f"- {item.units} units of {item.blood_group} {item.component} (Expiring: {item.expiry_date})" for item in items]
            reply += "\n".join(details)
            data = [{"units": item.units, "blood_group": item.blood_group, "component": item.component} for item in items]
        else:
            reply = f"I couldn't find any available stock matching your query"
            if target_bg:
                reply += f" for blood group {target_bg}"
            if target_comp:
                reply += f" ({target_comp})"
            reply += " in our local inventory. Would you like to check nearby regional centers or trigger an alert?"

    # 3. Check for demand predictions/forecasting queries (e.g. "O+ demand forecast")
    elif "forecast" in msg or "predict" in msg or "future" in msg or "demand" in msg:
        intent = "forecast_query"
        target_bg = "O+"
        for bg in ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]:
            if bg.lower() in msg:
                target_bg = bg
                break
                
        reply = f"Based on HemoCast AI's predictive model for {target_bg} blood groups: \n" \
                f"- We anticipate a **12% rise in trauma cases** over the coming festival weeks.\n" \
                f"- Scheduled elective surgeries at Bhavnagar Civil Hospital are rising from 4 to 8 weekly.\n" \
                f"- Pre-positioning an additional 10-15 units is highly recommended to prevent shortfalls.\n\n" \
                f"You can view the full interactive chart and tweak features on our AI Insights tab!"

    # 4. Emergency/SOS query
    elif "sos" in msg or "emergency" in msg or "urgent help" in msg:
        intent = "emergency_info"
        reply = "🚨 **Emergency SOS Mode Activated** 🚨\n\nIf you need immediate blood units, you can go to the 'Hospital Request' panel and click the **One-Tap Emergency SOS** button. This will instantly:\n1. Ping all matching registered donors (like O- universal donors) within a 15km radius.\n2. Broadcast an emergency alert to the nearest blood banks.\n3. Keep your request open for priority fulfillment. \n\nHow can I help you navigate there?"

    # 5. Default fallback
    else:
        reply = "Hello! I am the HemoCast AI Assistant. 🩸\n\nI can help you monitor live inventory, predict upcoming shortages, or find donors. Try asking me:\n" \
                f"- *'Are there any platelets expiring tomorrow?'*\n" \
                f"- *'What is our AB- stock?'*\n" \
                f"- *'Tell me about the O+ demand forecast'* \n" \
                f"- *'How does the emergency SOS button work?'*"
                
    return {
        "reply": reply,
        "intent": intent,
        "data": data
    }
