from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date
from database import get_db
from models.patient import Patient
from models.employee import Employee
from models.opd import Opd, OpdDetails
from models.id_generate import IdGenerate
from schemas.patient import PatientCreate, PatientUpdate, PatientOut
from schemas.opd import OpdQueueItem, PrescriptionQueueItem
from dependencies import require_receptionist, require_admin_or_receptionist
from typing import List

router = APIRouter(prefix="/api/receptionist", tags=["receptionist"])


def _generate_pid(db: Session) -> str:
    counter = db.query(IdGenerate).filter(IdGenerate.id == 1).first()
    if not counter:
        counter = IdGenerate(id=1, eid_counter=0, pid_counter=0)
        db.add(counter)
        db.commit()
        db.refresh(counter)
    counter.pid_counter += 1
    db.commit()
    return f"P{counter.pid_counter:04d}"


@router.get("/doctors")
def get_doctors(db: Session = Depends(get_db), _=Depends(require_receptionist)):
    doctors = db.query(Employee).filter(Employee.role == "doctor", Employee.status == 1).all()
    return [{"eid": d.eid, "name": f"{d.first_name} {d.middle_name} {d.last_name}".strip()} for d in doctors]


# ── Patient CRUD ──────────────────────────────────────────────────────────────

@router.post("/patients", response_model=PatientOut)
def add_patient(data: PatientCreate, db: Session = Depends(get_db), _=Depends(require_receptionist)):
    pid = _generate_pid(db)
    patient = Patient(**data.model_dump(), pid=pid, registration_date=date.today())
    db.add(patient)
    db.commit()
    db.refresh(patient)
    return patient


@router.get("/patients/{pid}", response_model=PatientOut)
def get_patient(pid: str, db: Session = Depends(get_db), _=Depends(require_receptionist)):
    p = db.query(Patient).filter(Patient.pid == pid).first()
    if not p:
        raise HTTPException(status_code=404, detail="Patient not found")
    return p


@router.put("/patients/{pid}", response_model=PatientOut)
def update_patient(pid: str, data: PatientUpdate, db: Session = Depends(get_db), _=Depends(require_receptionist)):
    p = db.query(Patient).filter(Patient.pid == pid).first()
    if not p:
        raise HTTPException(status_code=404, detail="Patient not found")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(p, field, value)
    db.commit()
    db.refresh(p)
    return p


@router.get("/patients/search/name")
def search_patient_name(first_name: str = "", last_name: str = "", db: Session = Depends(get_db), _=Depends(require_receptionist)):
    return db.query(Patient).filter(
        Patient.first_name.ilike(f"%{first_name}%"),
        Patient.last_name.ilike(f"%{last_name}%")
    ).all()


@router.get("/patients/search/id")
def search_patient_id(pid: str, db: Session = Depends(get_db), _=Depends(require_receptionist)):
    return db.query(Patient).filter(Patient.pid == pid).all()


@router.get("/patients/search/mobile")
def search_patient_mobile(mobile_no: int, db: Session = Depends(get_db), _=Depends(require_receptionist)):
    return db.query(Patient).filter(Patient.mobile_no == mobile_no).all()


@router.get("/patients/search/adhar")
def search_patient_adhar(adhar_no: int, db: Session = Depends(get_db), _=Depends(require_receptionist)):
    return db.query(Patient).filter(Patient.adhar_no == adhar_no).all()


# ── OPD Queue ─────────────────────────────────────────────────────────────────

@router.post("/opd/{pid}")
def add_to_opd(pid: str, db: Session = Depends(get_db), _=Depends(require_receptionist)):
    patient = db.query(Patient).filter(Patient.pid == pid).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    doctor = db.query(Employee).filter(Employee.eid == patient.doctor_id, Employee.status == 1).first()
    if not doctor:
        return {"status": 3, "message": "Assigned doctor is not available"}

    existing = db.query(Opd).filter(Opd.pid == pid, Opd.status == 1).first()
    if existing:
        return {"status": 2, "message": "Patient already in OPD queue"}

    opd = Opd(pid=pid, doctor_id=patient.doctor_id, status=1, visit_date=date.today())
    db.add(opd)
    db.commit()
    return {"status": 1, "message": "Patient added to OPD queue"}


@router.get("/opd/queue", response_model=List[OpdQueueItem])
def get_opd_queue(db: Session = Depends(get_db), _=Depends(require_receptionist)):
    opds = db.query(Opd).filter(Opd.status == 1).all()
    result = []
    for opd in opds:
        patient = db.query(Patient).filter(Patient.pid == opd.pid).first()
        doctor = db.query(Employee).filter(Employee.eid == opd.doctor_id).first()
        result.append(OpdQueueItem(
            opd_id=opd.opd_id,
            pid=opd.pid,
            patient_name=f"{patient.first_name} {patient.last_name}" if patient else opd.pid,
            doctor_id=opd.doctor_id,
            doctor_name=f"{doctor.first_name} {doctor.last_name}" if doctor else opd.doctor_id,
            visit_date=opd.visit_date,
            status=opd.status,
        ))
    return result


@router.delete("/opd/{pid}")
def remove_from_opd(pid: str, db: Session = Depends(get_db), _=Depends(require_receptionist)):
    opd = db.query(Opd).filter(Opd.pid == pid, Opd.status == 1).first()
    if not opd:
        raise HTTPException(status_code=404, detail="OPD record not found")
    db.delete(opd)
    db.commit()
    return {"message": "Removed from OPD queue"}


# ── Prescription Queue ─────────────────────────────────────────────────────────

@router.get("/prescriptions", response_model=List[PrescriptionQueueItem])
def get_prescription_queue(db: Session = Depends(get_db), _=Depends(require_receptionist)):
    opds = db.query(Opd).filter(Opd.status == 2).all()
    result = []
    for opd in opds:
        patient = db.query(Patient).filter(Patient.pid == opd.pid).first()
        result.append(PrescriptionQueueItem(
            opd_id=opd.opd_id,
            pid=opd.pid,
            patient_name=f"{patient.first_name} {patient.last_name}" if patient else opd.pid,
        ))
    return result


@router.get("/prescriptions/{opd_id}")
def get_prescription(opd_id: int, db: Session = Depends(get_db), _=Depends(require_receptionist)):
    opd = db.query(Opd).filter(Opd.opd_id == opd_id).first()
    if not opd:
        raise HTTPException(status_code=404, detail="OPD record not found")
    details = db.query(OpdDetails).filter(OpdDetails.opd_id == opd_id).first()
    patient = db.query(Patient).filter(Patient.pid == opd.pid).first()
    doctor = db.query(Employee).filter(Employee.eid == opd.doctor_id).first()
    return {
        "opd": opd,
        "details": details,
        "patient": patient,
        "doctor_name": f"{doctor.first_name} {doctor.last_name}" if doctor else "",
    }


@router.post("/prescriptions/{opd_id}/print-done")
def mark_prescription_done(opd_id: int, db: Session = Depends(get_db), _=Depends(require_receptionist)):
    opd = db.query(Opd).filter(Opd.opd_id == opd_id, Opd.status == 2).first()
    if not opd:
        raise HTTPException(status_code=404, detail="OPD record not found or not ready to print")
    opd.status = 0
    db.commit()
    return {"message": "Prescription marked as printed"}
