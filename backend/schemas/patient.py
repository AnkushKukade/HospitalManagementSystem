from pydantic import BaseModel
from typing import Optional
from datetime import date


class PatientCreate(BaseModel):
    first_name: str
    middle_name: Optional[str] = ""
    last_name: str
    birthdate: str
    gender: str
    email_id: Optional[str] = None
    mobile_no: int
    adhar_no: int
    country: str
    state: str
    city: str
    residential_address: str
    permanent_address: Optional[str] = None
    blood_group: str
    chronic_diseases: Optional[str] = None
    medicine_allergy: Optional[str] = None
    doctor_id: str


class PatientUpdate(BaseModel):
    first_name: Optional[str] = None
    middle_name: Optional[str] = None
    last_name: Optional[str] = None
    birthdate: Optional[str] = None
    gender: Optional[str] = None
    email_id: Optional[str] = None
    mobile_no: Optional[int] = None
    adhar_no: Optional[int] = None
    country: Optional[str] = None
    state: Optional[str] = None
    city: Optional[str] = None
    residential_address: Optional[str] = None
    permanent_address: Optional[str] = None
    blood_group: Optional[str] = None
    chronic_diseases: Optional[str] = None
    medicine_allergy: Optional[str] = None
    doctor_id: Optional[str] = None


class PatientOut(BaseModel):
    pid: str
    first_name: str
    middle_name: str
    last_name: str
    birthdate: str
    gender: str
    email_id: Optional[str]
    mobile_no: int
    adhar_no: int
    country: str
    state: str
    city: str
    residential_address: str
    permanent_address: Optional[str]
    blood_group: str
    chronic_diseases: Optional[str]
    medicine_allergy: Optional[str]
    doctor_id: str
    registration_date: date

    class Config:
        from_attributes = True
