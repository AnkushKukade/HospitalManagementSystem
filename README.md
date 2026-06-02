# Hospital Management System

A full-stack Hospital Management System built with **Python FastAPI** + **React (Vite)**.  
Migrated from a Java Spring MVC + Hibernate project.

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python 3.11+, FastAPI, SQLAlchemy |
| Database | SQLite (default) / PostgreSQL (via env var) |
| Auth | JWT tokens + bcrypt |
| Frontend | React 18, Vite, React Router v6, Axios |

## Features

- **3 roles** — Administrator, Receptionist, Doctor
- **Admin**: Add/Edit/Delete employees, Search (by name/ID/mobile/Aadhar), Dashboard stats
- **Receptionist**: Register/Edit patients, OPD queue management, Prescription print queue
- **Doctor**: View patient queue, Write prescriptions, View patient history
- **Shared**: JWT login, Profile view, Change credentials
- Auto-generated employee IDs (E0001…) and patient IDs (P0001…)
- Soft-delete for employees (status flag)
- OPD 3-state workflow: `pending → ready to print → completed`
- Swagger UI auto-docs at `/docs`

## Project Structure

```
hospital-fastapi/
├── backend/
│   ├── main.py             # FastAPI app + CORS
│   ├── database.py         # SQLAlchemy engine (SQLite/PostgreSQL)
│   ├── dependencies.py     # JWT auth + role guards
│   ├── models/             # SQLAlchemy ORM models
│   ├── schemas/            # Pydantic request/response schemas
│   ├── routers/
│   │   ├── auth.py         # Login, profile, change credentials
│   │   ├── admin.py        # Employee CRUD, search, dashboard
│   │   ├── receptionist.py # Patient CRUD, OPD queue, prescriptions
│   │   └── doctor.py       # Patient queue, prescribe, history
│   └── requirements.txt
└── frontend/
    └── src/
        ├── pages/          # One component per page
        ├── components/     # Layout, ProtectedRoute
        ├── api/axios.js    # Axios instance with JWT interceptor
        └── context/        # Auth context (JWT + role)
```

## Quick Start

### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy env file (SQLite is default — no DB setup needed)
cp .env.example .env

# Run the server
uvicorn main:app --reload
```

API runs at **http://localhost:8000**  
Swagger docs at **http://localhost:8000/docs**

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at **http://localhost:5173**

## First Login

On first run, create an admin account directly via the Swagger UI at `/docs`:

1. Open **http://localhost:8000/docs**
2. Call `POST /api/admin/employees` — but this needs auth…

**Bootstrap admin** — run this once in Python:

```python
# run from backend/ directory
from database import SessionLocal
from models.auth import Login
from models.employee import Employee
from models.id_generate import IdGenerate
from passlib.context import CryptContext
from datetime import date

db = SessionLocal()
pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")

counter = IdGenerate(id=1, eid_counter=1, pid_counter=0)
db.add(counter)

admin = Employee(
    eid="E0001", first_name="Admin", last_name="User",
    birthdate="1990-01-01", gender="Male", mobile_no=9999999999,
    adhar_no=123456789012, country="India", state="MH", city="Pune",
    residential_address="Hospital", role="administrator",
    qualification="MBA", status=1, joining_date=date.today()
)
login = Login(username="admin", password=pwd.hash("admin123"), role="administrator", entity_id="E0001")
db.add(admin); db.add(login)
db.commit()
print("Admin created — username: admin, password: admin123")
```

Or save as `create_admin.py` and run: `python create_admin.py`

## Using PostgreSQL

Edit `.env`:
```
DATABASE_URL=postgresql://user:password@localhost:5432/hospital
```

## API Endpoints Summary

| Method | Endpoint | Role |
|---|---|---|
| POST | `/api/auth/login` | All |
| GET | `/api/auth/me` | All |
| PUT | `/api/auth/change-credentials` | All |
| GET/POST | `/api/admin/employees` | Admin |
| GET/PUT/DELETE | `/api/admin/employees/{eid}` | Admin |
| GET | `/api/admin/employees/search/*` | Admin |
| GET | `/api/admin/dashboard/stats` | Admin |
| GET | `/api/receptionist/doctors` | Receptionist |
| POST/GET | `/api/receptionist/patients` | Receptionist |
| POST | `/api/receptionist/opd/{pid}` | Receptionist |
| GET | `/api/receptionist/opd/queue` | Receptionist |
| GET | `/api/receptionist/prescriptions` | Receptionist |
| GET | `/api/doctor/queue` | Doctor |
| POST | `/api/doctor/patient/{pid}/prescribe` | Doctor |
| GET | `/api/doctor/patient/{pid}/history` | Doctor |
