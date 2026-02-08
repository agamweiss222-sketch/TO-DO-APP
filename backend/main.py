from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from . import models, schemas
from .database import SessionLocal, engine
from fastapi.middleware.cors import CORSMiddleware
from passlib.context import CryptContext
from datetime import date, datetime
from .auth import create_access_token
from .auth import get_current_user
from .auth import get_current_admin
from typing import List


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Mission Management System API",
    description="Backend API for managing missions with role-based access control",
    version="1.0.0"
)


origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def root():
    return {"message": "Mission Management System API is running"}

# ==================== AUTHENTICATION ====================

@app.post("/signup", response_model=schemas.User)
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    existing_user = db.query(models.User).filter(models.User.name == user.name).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")

    hashed_password = pwd_context.hash(user.password)

    new_user = models.User(name=user.name, password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user

@app.post("/login", response_model=schemas.LoginResponse)
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    """Authenticate user and return JWT token"""
    db_user = db.query(models.User).filter(models.User.name == user.name).first()

    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid username or password")

    if not pwd_context.verify(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    access_token = create_access_token(
        data={"user_id": db_user.id}
    )

    return {
        "id": db_user.id,
        "name": db_user.name,
        "role": db_user.role,
        "access_token": access_token
    }

# ==================== USER ENDPOINTS ====================

@app.get("/users", response_model=List[schemas.User])
def get_all_users(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Get all users (authenticated users only)"""
    return db.query(models.User).all()

# ==================== MISSION ENDPOINTS (USER) ====================

@app.get("/missions", response_model=List[schemas.MissionWithCompletion])
def get_my_missions(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Get all missions with completion status for current user"""
    missions = db.query(models.Mission).all()
    
    result = []
    for mission in missions:
        # Check if user has completed this mission
        completion = db.query(models.MissionCompletion).filter(
            models.MissionCompletion.mission_id == mission.id,
            models.MissionCompletion.user_id == current_user.id
        ).first()
        
        mission_dict = {
            "id": mission.id,
            "title": mission.title,
            "description": mission.description,
            "due_date": mission.due_date,
            "created_by_id": mission.created_by_id,
            "created_at": mission.created_at,
            "created_by_name": mission.created_by_name,
            "completed": bool(completion),
            "completed_at": completion.completed_at if completion else None
        }
        result.append(mission_dict)
    
    return result

@app.post("/missions/{mission_id}/complete")
def complete_mission(
    mission_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Mark a mission as completed by the current user"""
    mission = db.query(models.Mission).filter(models.Mission.id == mission_id).first()
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")
    
    # Check if already completed
    existing = db.query(models.MissionCompletion).filter(
        models.MissionCompletion.mission_id == mission_id,
        models.MissionCompletion.user_id == current_user.id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Mission already completed")
    
    # Create completion record
    completion = models.MissionCompletion(
        mission_id=mission_id,
        user_id=current_user.id
    )
    db.add(completion)
    db.commit()
    db.refresh(completion)
    
    return {"message": "Mission completed successfully", "completed_at": completion.completed_at}

@app.delete("/missions/{mission_id}/complete")
def uncomplete_mission(
    mission_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Unmark a mission as completed by the current user"""
    completion = db.query(models.MissionCompletion).filter(
        models.MissionCompletion.mission_id == mission_id,
        models.MissionCompletion.user_id == current_user.id
    ).first()
    
    if not completion:
        raise HTTPException(status_code=404, detail="Mission completion not found")
    
    db.delete(completion)
    db.commit()
    
    return {"message": "Mission unmarked as completed"}

@app.get("/missions/{mission_id}/history", response_model=List[schemas.MissionCompletion])
def get_mission_history(
    mission_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Get completion history for a specific mission"""
    mission = db.query(models.Mission).filter(models.Mission.id == mission_id).first()
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")
    
    completions = db.query(models.MissionCompletion).filter(
        models.MissionCompletion.mission_id == mission_id
    ).all()
    
    return completions

# ==================== ADMIN ENDPOINTS ====================

@app.post("/admin/missions", response_model=schemas.Mission)
def admin_create_mission(
    mission: schemas.MissionCreate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin)
):
    """Admin: Create a new mission"""
    if mission.due_date and mission.due_date < date.today():
        raise HTTPException(
            status_code=400,
            detail="Due date cannot be in the past"
        )
    
    new_mission = models.Mission(
        **mission.dict(),
        created_by_id=admin.id
    )
    
    db.add(new_mission)
    db.commit()
    db.refresh(new_mission)
    
    return new_mission

@app.get("/admin/missions", response_model=List[schemas.Mission])
def admin_get_all_missions(
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin)
):
    """Admin: Get all missions"""
    return db.query(models.Mission).all()

@app.put("/admin/missions/{mission_id}", response_model=schemas.Mission)
def admin_update_mission(
    mission_id: int,
    mission: schemas.MissionCreate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin)
):
    """Admin: Update a mission"""
    db_mission = db.query(models.Mission).filter(models.Mission.id == mission_id).first()
    if not db_mission:
        raise HTTPException(status_code=404, detail="Mission not found")
    
    if mission.due_date and mission.due_date < date.today():
        raise HTTPException(
            status_code=400,
            detail="Due date cannot be in the past"
        )
    
    db_mission.title = mission.title
    db_mission.description = mission.description
    db_mission.due_date = mission.due_date
    
    db.commit()
    db.refresh(db_mission)
    return db_mission

@app.delete("/admin/missions/{mission_id}")
def admin_delete_mission(
    mission_id: int,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin)
):
    """Admin: Delete a mission"""
    mission = db.query(models.Mission).filter(models.Mission.id == mission_id).first()
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")
    
    db.delete(mission)
    db.commit()
    return {"detail": "Mission deleted successfully"}

@app.get("/admin/missions/{mission_id}/completions", response_model=List[schemas.MissionCompletion])
def admin_get_mission_completions(
    mission_id: int,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin)
):
    """Admin: Get all users who completed a specific mission"""
    mission = db.query(models.Mission).filter(models.Mission.id == mission_id).first()
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")
    
    completions = db.query(models.MissionCompletion).filter(
        models.MissionCompletion.mission_id == mission_id
    ).all()
    
    return completions
