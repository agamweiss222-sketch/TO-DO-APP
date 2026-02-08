from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Date, DateTime
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(String, default="user", nullable=False)

    # Relationships
    missions_created = relationship(
        "Mission",
        back_populates="created_by",
        foreign_keys="Mission.created_by_id"
    )
    
    mission_completions = relationship(
        "MissionCompletion",
        back_populates="user",
        cascade="all, delete"
    )


class Mission(Base):
    """
    Mission entity - can be assigned to multiple users.
    Tracks which admin created it and when.
    """
    __tablename__ = "missions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(String, nullable=True)
    due_date = Column(Date, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Admin who created this mission
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Relationships
    created_by = relationship("User", foreign_keys=[created_by_id], back_populates="missions_created")
    completions = relationship("MissionCompletion", back_populates="mission", cascade="all, delete")

    @property
    def created_by_name(self):
        return self.created_by.name if self.created_by else None


class MissionCompletion(Base):
    """
    Tracks mission completion history - many-to-many relationship.
    Multiple users can complete the same mission.
    """
    __tablename__ = "mission_completions"

    id = Column(Integer, primary_key=True, index=True)
    mission_id = Column(Integer, ForeignKey("missions.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    completed_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    mission = relationship("Mission", back_populates="completions")
    user = relationship("User", back_populates="mission_completions")

    @property
    def user_name(self):
        return self.user.name if self.user else None