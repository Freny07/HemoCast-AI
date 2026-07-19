from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import List, Optional

# --- Auth Schemas ---
class UserBase(BaseModel):
    username: str
    email: str
    role: str
    name: str
    district: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    name: str
    userId: int

# --- Inventory Schemas ---
class InventoryItemBase(BaseModel):
    blood_group: str
    component: str
    units: int
    expiry_date: date

class InventoryItemCreate(InventoryItemBase):
    pass

class InventoryItemResponse(InventoryItemBase):
    id: int
    blood_bank_id: int
    status: str
    redistribution_target: Optional[str] = None
    redistribution_reason: Optional[str] = None

    class Config:
        from_attributes = True

# --- Blood Request Schemas ---
class BloodRequestBase(BaseModel):
    blood_group: str
    component: str
    units: int
    urgency: str
    required_date: date
    notes: Optional[str] = None

class BloodRequestCreate(BloodRequestBase):
    pass

class BloodRequestResponse(BloodRequestBase):
    id: int
    hospital_id: int
    status: str
    request_date: datetime

    class Config:
        from_attributes = True

# --- Donation Drive Schemas ---
class DonationDriveBase(BaseModel):
    name: str
    location: str
    latitude: float
    longitude: float
    date: date
    expected_yield: int

class DonationDriveCreate(DonationDriveBase):
    pass

class DonationDriveResponse(DonationDriveBase):
    id: int
    blood_bank_id: int
    status: str

    class Config:
        from_attributes = True

# --- Donor Schemas ---
class DonorBase(BaseModel):
    blood_group: str
    last_donation_date: Optional[date] = None
    latitude: float
    longitude: float
    contact_number: str
    eligible: bool
    impact_score: int
    streak_weeks: int

class DonorResponse(DonorBase):
    id: int
    user_id: int
    name: str

    class Config:
        from_attributes = True

# --- Target Donor (Response rank list) ---
class TargetDonorResponse(BaseModel):
    id: int
    name: str
    blood_group: str
    distance_km: float
    eligible: bool
    last_donation_days_ago: int
    response_likelihood: float  # 0 to 1
    contact_number: str

# --- Forecasting & Explainable AI Schemas ---
class DriverDetail(BaseModel):
    factor: str
    impact: str  # e.g., "+15% demand", "-5% supply"
    description: str

class ForecastDataPoint(BaseModel):
    date: str
    predicted_demand: float
    confidence_lower: float
    confidence_upper: float

class ForecastResponse(BaseModel):
    granularity: str  # daily, weekly, monthly
    blood_group: str
    component: str
    forecast: List[ForecastDataPoint]
    total_predicted: int
    change_vs_average_percent: float
    drivers: List[DriverDetail]
    recommended_action: str

# --- Chatbot Schemas ---
class ChatQuery(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str
    intent: Optional[str] = None
    data: Optional[List[dict]] = None
