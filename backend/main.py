from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import auth, admin, receptionist, doctor
from models import employee, patient, auth as auth_model, opd, id_generate  # noqa: ensure all models are registered

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Hospital Management System",
    description="FastAPI + SQLite backend for Hospital Management",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(receptionist.router)
app.include_router(doctor.router)


@app.get("/")
def root():
    return {"message": "Hospital Management API", "docs": "/docs"}
