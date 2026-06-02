from pydantic import BaseModel
from typing import Optional
from datetime import date


class OpdQueueItem(BaseModel):
    opd_id: int
    pid: str
    patient_name: str
    doctor_id: str
    doctor_name: str
    visit_date: date
    status: int

    class Config:
        from_attributes = True


class OpdDetailsCreate(BaseModel):
    symptoms: str
    diagnosis: str
    medicines_dose: str
    dos: Optional[str] = ""
    donts: Optional[str] = ""
    investigations: Optional[str] = ""
    followup_date: Optional[str] = ""
    fees: Optional[int] = 0


class OpdDetailsOut(BaseModel):
    opd_id: int
    symptoms: str
    diagnosis: str
    medicines_dose: str
    dos: Optional[str]
    donts: Optional[str]
    investigations: Optional[str]
    followup_date: Optional[str]
    fees: int
    visit_date: Optional[date] = None
    doctor_name: Optional[str] = None

    class Config:
        from_attributes = True


class PrescriptionQueueItem(BaseModel):
    opd_id: int
    pid: str
    patient_name: str
