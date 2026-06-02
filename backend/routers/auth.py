from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from database import get_db
from models.auth import Login
from models.employee import Employee
from models.patient import Patient
from schemas.auth import LoginRequest, TokenResponse, ChangeCredentialsRequest
from dependencies import create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(Login).filter(
        Login.username == data.username,
        Login.role == data.role
    ).first()

    if not user or not pwd_context.verify(data.password, user.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token = create_access_token({"sub": user.username, "role": user.role, "entity_id": user.entity_id})
    return TokenResponse(access_token=token, role=user.role, entity_id=user.entity_id)


@router.get("/me")
def get_profile(current_user: Login = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role == "doctor" or current_user.role == "receptionist" or current_user.role == "administrator":
        emp = db.query(Employee).filter(Employee.eid == current_user.entity_id).first()
        if emp:
            return {
                "id": emp.eid,
                "name": f"{emp.first_name} {emp.middle_name} {emp.last_name}".strip(),
                "role": current_user.role,
                "email": emp.email_id,
                "mobile": emp.mobile_no,
                "qualification": emp.qualification,
                "specialization": emp.specialization,
                "joining_date": emp.joining_date,
            }
    patient = db.query(Patient).filter(Patient.pid == current_user.entity_id).first()
    if patient:
        return {
            "id": patient.pid,
            "name": f"{patient.first_name} {patient.middle_name} {patient.last_name}".strip(),
            "role": current_user.role,
        }
    raise HTTPException(status_code=404, detail="Profile not found")


@router.put("/change-credentials")
def change_credentials(
    data: ChangeCredentialsRequest,
    current_user: Login = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    existing = db.query(Login).filter(Login.username == data.new_username).first()
    if existing and existing.username != current_user.username:
        raise HTTPException(status_code=400, detail="Username already taken")

    hashed = pwd_context.hash(data.new_password)
    db.query(Login).filter(Login.username == current_user.username).update({
        "username": data.new_username,
        "password": hashed
    })
    db.commit()
    return {"message": "Credentials updated successfully"}
