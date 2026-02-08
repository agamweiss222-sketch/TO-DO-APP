from pydantic import BaseModel, Field, ConfigDict
from typing import List
from datetime import date, datetime
from typing import Optional


# ------------------ Missions ------------------
class MissionBase(BaseModel):
    title: str
    description: Optional[str] = None
    due_date: Optional[date] = None


class MissionCreate(MissionBase):
    title: str
    description: Optional[str] = None
    due_date: Optional[date] = None


class Mission(MissionBase):
    id: int
    created_by_id: int
    created_at: datetime
    created_by_name: str

    model_config = ConfigDict(from_attributes=True)


class MissionWithCompletion(Mission):
    """Mission with completion status for a specific user"""
    completed: bool = False
    completed_at: Optional[datetime] = None


# ------------------ Mission Completions ------------------
class MissionCompletionBase(BaseModel):
    mission_id: int
    user_id: int


class MissionCompletion(MissionCompletionBase):
    id: int
    completed_at: datetime
    user_name: str

    model_config = ConfigDict(from_attributes=True)


# ------------------ Users ------------------
class UserBase(BaseModel):
    name: str

class UserCreate(UserBase):
      password: str = Field(min_length=8, max_length=72)

class UserLogin(UserBase):
    password: str = Field(min_length=8, max_length=72)

class LoginResponse(BaseModel):
    id: int
    name: str
    role: str
    access_token: str

class User(UserBase):
    id: int
    name: str
    role: str

    model_config = ConfigDict(from_attributes=True)
