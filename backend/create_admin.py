"""
Run once to create the first admin user.
Usage: python create_admin.py
"""
from database import SessionLocal, engine, Base
from models import employee, patient, auth, opd, id_generate  # noqa: register models
from models.auth import Login
from models.employee import Employee
from models.id_generate import IdGenerate
from passlib.context import CryptContext
from datetime import date

Base.metadata.create_all(bind=engine)
db = SessionLocal()
pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")

if db.query(Login).filter(Login.username == "admin").first():
    print("Admin already exists.")
    db.close()
    exit()

counter = db.query(IdGenerate).filter(IdGenerate.id == 1).first()
if not counter:
    counter = IdGenerate(id=1, eid_counter=0, pid_counter=0)
    db.add(counter)
counter.eid_counter += 1
db.flush()

admin_emp = Employee(
    eid="E0001", first_name="Admin", last_name="User",
    birthdate="1990-01-01", gender="Male",
    mobile_no=9999999999, adhar_no=123456789012,
    country="India", state="Maharashtra", city="Pune",
    residential_address="Hospital Campus",
    role="administrator", qualification="MBA",
    status=1, joining_date=date.today()
)
admin_login = Login(username="admin", password=pwd.hash("admin123"), role="administrator", entity_id="E0001")

db.add(admin_emp)
db.add(admin_login)
db.commit()
db.close()
print("✓ Admin created")
print("  Username : admin")
print("  Password : admin123")
print("  Change credentials after first login!")
