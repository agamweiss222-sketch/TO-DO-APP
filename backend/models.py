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


    tasks = relationship(
    "Task",
    back_populates="user",
    cascade="all, delete",
    foreign_keys="Task.user_id"
    )



class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    text = Column(String, index=True, nullable=False)
    completed = Column(Boolean, default=False)
    due_date = Column(Date, nullable=True)
    description = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # מי יצר את המשימה
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # קשרים
    user = relationship("User", foreign_keys=[user_id])
    created_by = relationship("User", foreign_keys=[created_by_id])

    @property
    def user_name(self):
        return self.user.name if self.user else None
 
    @property
    def created_by_name(self):
        return self.created_by.name if self.created_by else None