from sqlalchemy import Column, String, BigInteger, Date
from database import Base


class Patient(Base):
    __tablename__ = "patients"

    pid = Column(String, primary_key=True, index=True)
    first_name = Column(String, nullable=False)
    middle_name = Column(String, default="")
    last_name = Column(String, nullable=False)
    birthdate = Column(String)
    gender = Column(String)
    email_id = Column(String, unique=True, nullable=True)
    mobile_no = Column(BigInteger, unique=True)
    adhar_no = Column(BigInteger, unique=True)
    country = Column(String)
    state = Column(String)
    city = Column(String)
    residential_address = Column(String)
    permanent_address = Column(String, nullable=True)
    blood_group = Column(String)
    chronic_diseases = Column(String, nullable=True)
    medicine_allergy = Column(String, nullable=True)
    doctor_id = Column(String)        # FK -> employees.eid
    registration_date = Column(Date)
