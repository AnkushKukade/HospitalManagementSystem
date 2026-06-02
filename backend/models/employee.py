from sqlalchemy import Column, String, Integer, BigInteger, Date
from database import Base


class Employee(Base):
    __tablename__ = "employees"

    eid = Column(String, primary_key=True, index=True)
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
    role = Column(String)             # doctor | receptionist | administrator
    qualification = Column(String)
    specialization = Column(String, nullable=True)
    status = Column(Integer, default=1)   # 1=active, 0=inactive
    joining_date = Column(Date)
