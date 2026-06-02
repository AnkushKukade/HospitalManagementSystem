from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.opd import Opd, OpdDetails
from models.patient import Patient
from models.employee import Employee
from models.auth import Login
from schemas.opd import OpdQueueItem, OpdDetailsCreate, OpdDetailsOut
from dependencies import require_doctor, get_current_user
from typing import List

router = APIRouter(prefix="/api/doctor", tags=["doctor"])


@router.get("/queue", response_model=List[OpdQueueItem])
def get_my_queue(current_user: Login = Depends(get_current_user), db: Session = Depends(get_db), _=Depends(require_doctor)):
    opds = db.query(Opd).filter(Opd.doctor_id == current_user.entity_id, Opd.status == 1).all()
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


@router.get("/patient/{pid}")
def get_patient_details(pid: str, db: Session = Depends(get_db), _=Depends(require_doctor)):
    patient = db.query(Patient).filter(Patient.pid == pid).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    doctor = db.query(Employee).filter(Employee.eid == patient.doctor_id).first()
    return {
        "patient": patient,
        "assigned_doctor": f"{doctor.first_name} {doctor.last_name}" if doctor else "",
    }


@router.post("/patient/{pid}/prescribe")
def prescribe(pid: str, data: OpdDetailsCreate, current_user: Login = Depends(get_current_user), db: Session = Depends(get_db), _=Depends(require_doctor)):
    opd = db.query(Opd).filter(Opd.pid == pid, Opd.doctor_id == current_user.entity_id, Opd.status == 1).first()
    if not opd:
        raise HTTPException(status_code=404, detail="No active OPD entry for this patient")

    details = OpdDetails(opd_id=opd.opd_id, **data.model_dump())
    db.add(details)
    opd.status = 2   # ready to print
    db.commit()
    return {"message": "Prescription saved", "opd_id": opd.opd_id}


@router.delete("/queue/{pid}")
def remove_from_queue(pid: str, current_user: Login = Depends(get_current_user), db: Session = Depends(get_db), _=Depends(require_doctor)):
    opd = db.query(Opd).filter(Opd.pid == pid, Opd.doctor_id == current_user.entity_id, Opd.status == 1).first()
    if not opd:
        raise HTTPException(status_code=404, detail="OPD entry not found")
    db.delete(opd)
    db.commit()
    return {"message": "Patient removed from queue"}


@router.get("/patient/{pid}/history")
def get_patient_history(pid: str, db: Session = Depends(get_db), _=Depends(require_doctor)):
    opds = db.query(Opd).filter(Opd.pid == pid, Opd.status == 0).order_by(Opd.visit_date.desc()).all()
    result = []
    for opd in opds:
        details = db.query(OpdDetails).filter(OpdDetails.opd_id == opd.opd_id).first()
        doctor = db.query(Employee).filter(Employee.eid == opd.doctor_id).first()
        result.append({
            "opd_id": opd.opd_id,
            "visit_date": opd.visit_date,
            "doctor_name": f"{doctor.first_name} {doctor.last_name}" if doctor else "",
            "details": details,
        })
    return result


@router.get("/patient/{pid}/history/{opd_id}", response_model=OpdDetailsOut)
def get_history_record(pid: str, opd_id: int, db: Session = Depends(get_db), _=Depends(require_doctor)):
    opd = db.query(Opd).filter(Opd.opd_id == opd_id, Opd.pid == pid).first()
    if not opd:
        raise HTTPException(status_code=404, detail="OPD record not found")
    details = db.query(OpdDetails).filter(OpdDetails.opd_id == opd_id).first()
    if not details:
        raise HTTPException(status_code=404, detail="OPD details not found")
    doctor = db.query(Employee).filter(Employee.eid == opd.doctor_id).first()
    out = OpdDetailsOut.model_validate(details)
    out.visit_date = opd.visit_date
    out.doctor_name = f"{doctor.first_name} {doctor.last_name}" if doctor else ""
    return out
