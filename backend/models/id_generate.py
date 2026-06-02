from sqlalchemy import Column, Integer
from database import Base


class IdGenerate(Base):
    __tablename__ = "id_generate"

    id = Column(Integer, primary_key=True, default=1)
    eid_counter = Column(Integer, default=0)
    pid_counter = Column(Integer, default=0)
