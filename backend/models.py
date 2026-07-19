from sqlalchemy import Column, Integer, String, Float, Date, DateTime, Boolean, ForeignKey, Table
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    email = Column(String, nullable=False)
    role = Column(String, nullable=False)  # donor, hospital, bank, admin
    name = Column(String, nullable=False)
    district = Column(String, nullable=True)  # e.g., Bhavnagar, Ahmedabad
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    # Relationships
    donor_profile = relationship("Donor", back_populates="user", uselist=False)
    requests = relationship("BloodRequest", back_populates="hospital")

class InventoryItem(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, index=True)
    blood_bank_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    blood_group = Column(String, nullable=False)  # A+, A-, B+, B-, AB+, AB-, O+, O-
    component = Column(String, nullable=False)    # Whole Blood, Packed RBC, Platelets, FFP
    units = Column(Integer, nullable=False)
    expiry_date = Column(Date, nullable=False)
    status = Column(String, default="available")  # available, redirected, used, expired
    redistribution_target = Column(String, nullable=True) # Name of bank recommended to transfer to
    redistribution_reason = Column(String, nullable=True) # Reason for transfer (e.g. high expiry risk)

class BloodRequest(Base):
    __tablename__ = "blood_requests"

    id = Column(Integer, primary_key=True, index=True)
    hospital_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    blood_group = Column(String, nullable=False)
    component = Column(String, nullable=False)
    units = Column(Integer, nullable=False)
    urgency = Column(String, nullable=False)      # normal, urgent, emergency
    status = Column(String, default="pending")    # pending, approved, fulfilled, rejected
    request_date = Column(DateTime, default=datetime.utcnow)
    required_date = Column(Date, nullable=False)
    notes = Column(String, nullable=True)

    hospital = relationship("User", back_populates="requests")

class DonationDrive(Base):
    __tablename__ = "donation_drives"

    id = Column(Integer, primary_key=True, index=True)
    blood_bank_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    location = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    date = Column(Date, nullable=False)
    expected_yield = Column(Integer, nullable=False)
    status = Column(String, default="scheduled")  # scheduled, completed, cancelled

class Donor(Base):
    __tablename__ = "donors"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    blood_group = Column(String, nullable=False)
    last_donation_date = Column(Date, nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    contact_number = Column(String, nullable=False)
    eligible = Column(Boolean, default=True)
    impact_score = Column(Integer, default=0)
    streak_weeks = Column(Integer, default=0)

    user = relationship("User", back_populates="donor_profile")

class HistoricalRecord(Base):
    __tablename__ = "historical_records"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False)
    blood_group = Column(String, nullable=False)
    component = Column(String, nullable=False)
    inventory_level = Column(Integer, nullable=False)
    historical_requests = Column(Integer, nullable=False)
    hospital_name = Column(String, nullable=False)
    district = Column(String, nullable=False)
    festival_flag = Column(Boolean, default=False)
    temperature = Column(Float, nullable=False)
    rainfall = Column(Float, nullable=False)
    dengue_cases = Column(Integer, nullable=False)
    surgeries_count = Column(Integer, nullable=False)
    actual_demand = Column(Integer, nullable=False)
