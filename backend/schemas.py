from pydantic import BaseModel, Field
from typing import List
from datetime import date, datetime
from typing import Optional
from pydantic import constr


# ------------------ Tasks ------------------
class TaskBase(BaseModel):
    text: str
    completed: bool = False
    due_date: Optional[date] = None
    description: Optional[str] = None



class TaskCreate(TaskBase):
     text: str
     completed: bool = False
     due_date: Optional[date] = None
     description: Optional[str] = None


class Task(TaskBase):
    id: int
    user_id: int
    created_by_id: int
    created_at: datetime
    user_name: str
    created_by_name: str


    model_config = {"from_attributes": True}


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
    tasks: List[Task] = []

    model_config = {"from_attributes": True}
