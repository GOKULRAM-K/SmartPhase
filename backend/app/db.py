from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

# SQLite database URL (local file)
DATABASE_URL = "sqlite:///./loadbalancer.db"

# SQLAlchemy setup
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Example telemetry model
class Telemetry(Base):
    __tablename__ = "telemetry"

    id = Column(Integer, primary_key=True, index=True)
    node_id = Column(String, index=True)
    ts = Column(DateTime, default=datetime.utcnow)
    vuf = Column(Float)
    v_a = Column(Integer)
    v_b = Column(Integer)
    v_c = Column(Integer)
    neutral_current = Column(Float)

# Create tables
Base.metadata.create_all(bind=engine)
