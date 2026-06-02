from sqlalchemy import Column, String
from database import Base


class Login(Base):
    __tablename__ = "logins"

    username = Column(String, primary_key=True, index=True)
    password = Column(String, nullable=False)   # bcrypt hashed
    role = Column(String, nullable=False)
    entity_id = Column(String, nullable=False)  # eid or pid
