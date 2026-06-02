from sqlalchemy import Column, String, Integer, Date
from database import Base


class Opd(Base):
    __tablename__ = "opd"

    opd_id = Column(Integer, primary_key=True, autoincrement=True)
    pid = Column(String, nullable=False)        # FK -> patients.pid
    doctor_id = Column(String, nullable=False)  # FK -> employees.eid
    # 1=pending(in queue), 2=ready to print, 0=completed
    status = Column(Integer, default=1)
    visit_date = Column(Date)


class OpdDetails(Base):
    __tablename__ = "opd_details"

    opd_id = Column(Integer, primary_key=True)  # FK -> opd.opd_id
    symptoms = Column(String)
    diagnosis = Column(String)
    medicines_dose = Column(String)
    dos = Column(String)
    donts = Column(String)
    investigations = Column(String)
    followup_date = Column(String)
    fees = Column(Integer, default=0)
