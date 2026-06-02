from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from passlib.context import CryptContext
from datetime import date
from database import get_db
from models.employee import Employee
from models.auth import Login
from models.opd import Opd
from models.id_generate import IdGenerate
from models.patient import Patient
from schemas.employee import EmployeeCreate, EmployeeUpdate, EmployeeOut
from dependencies import require_admin, get_current_user
from typing import List, Optional

router = APIRouter(prefix="/api/admin", tags=["admin"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def _generate_eid(db: Session) -> str:
    counter = db.query(IdGenerate).filter(IdGenerate.id == 1).first()
    if not counter:
        counter = IdGenerate(id=1, eid_counter=0, pid_counter=0)
        db.add(counter)
        db.commit()
        db.refresh(counter)
    counter.eid_counter += 1
    db.commit()
    return f"E{counter.eid_counter:04d}"


@router.post("/employees", response_model=EmployeeOut)
def add_employee(data: EmployeeCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    eid = _generate_eid(db)
    emp = Employee(**data.model_dump(), eid=eid, status=1, joining_date=date.today())
    db.add(emp)

    hashed_pw = pwd_context.hash(str(data.adhar_no))
    login = Login(username=eid, password=hashed_pw, role=data.role, entity_id=eid)
    db.add(login)
    db.commit()
    db.refresh(emp)
    return emp


@router.get("/employees", response_model=List[EmployeeOut])
def get_all_employees(db: Session = Depends(get_db), _=Depends(require_admin)):
    return db.query(Employee).filter(Employee.status == 1).all()


@router.get("/employees/{eid}", response_model=EmployeeOut)
def get_employee(eid: str, db: Session = Depends(get_db), _=Depends(require_admin)):
    emp = db.query(Employee).filter(Employee.eid == eid).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    return emp


@router.put("/employees/{eid}", response_model=EmployeeOut)
def update_employee(eid: str, data: EmployeeUpdate, db: Session = Depends(get_db), _=Depends(require_admin)):
    emp = db.query(Employee).filter(Employee.eid == eid).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(emp, field, value)
    db.commit()
    db.refresh(emp)
    return emp


@router.delete("/employees/{eid}")
def delete_employee(eid: str, db: Session = Depends(get_db), _=Depends(require_admin)):
    emp = db.query(Employee).filter(Employee.eid == eid).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    emp.status = 0
    db.query(Opd).filter(Opd.doctor_id == eid, Opd.status == 1).delete()
    db.query(Login).filter(Login.entity_id == eid).delete()
    db.commit()
    return {"message": "Employee deleted"}


@router.get("/employees/search/name")
def search_by_name(first_name: str = "", last_name: str = "", db: Session = Depends(get_db), _=Depends(require_admin)):
    return db.query(Employee).filter(
        Employee.status == 1,
        Employee.first_name.ilike(f"%{first_name}%"),
        Employee.last_name.ilike(f"%{last_name}%")
    ).all()


@router.get("/employees/search/id")
def search_by_id(eid: str, db: Session = Depends(get_db), _=Depends(require_admin)):
    return db.query(Employee).filter(Employee.eid == eid, Employee.status == 1).all()


@router.get("/employees/search/mobile")
def search_by_mobile(mobile_no: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    return db.query(Employee).filter(Employee.mobile_no == mobile_no, Employee.status == 1).all()


@router.get("/employees/search/adhar")
def search_by_adhar(adhar_no: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    return db.query(Employee).filter(Employee.adhar_no == adhar_no, Employee.status == 1).all()


@router.get("/dashboard/stats")
def dashboard_stats(db: Session = Depends(get_db), _=Depends(require_admin)):
    doctors = db.query(func.count(Employee.eid)).filter(Employee.role == "doctor", Employee.status == 1).scalar()
    receptionists = db.query(func.count(Employee.eid)).filter(Employee.role == "receptionist", Employee.status == 1).scalar()
    total_employees = db.query(func.count(Employee.eid)).filter(Employee.status == 1).scalar()
    total_patients = db.query(func.count(Patient.pid)).scalar()
    from models.opd import OpdDetails
    total_income = db.query(func.sum(OpdDetails.fees)).scalar() or 0
    return {
        "doctors": doctors,
        "receptionists": receptionists,
        "total_employees": total_employees,
        "total_patients": total_patients,
        "total_opd_income": total_income,
    }
