from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from . import models, schemas
from .database import SessionLocal, engine
from fastapi.middleware.cors import CORSMiddleware
from passlib.context import CryptContext
from datetime import date
from .auth import create_access_token
from .auth import get_current_user
from .auth import get_current_admin




pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

models.Base.metadata.create_all(bind=engine)

app = FastAPI()


origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",   # הכתובת של ה‑React
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,      # רשימת הכתובות שמותרות
    allow_credentials=True,
    allow_methods=["*"],       # מאפשר GET, POST, PUT, DELETE
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
    return {"message": "Server is running"}

@app.post("/signup", response_model=schemas.User)
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
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



#פעולה ששומרת משימות
@app.post("/tasks/", response_model=schemas.Task)
def create_task_for_user(
    task: schemas.TaskCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    if task.due_date and task.due_date < date.today():
        raise HTTPException(status_code=400, detail="Due date cannot be in the past")

    db_task = models.Task(
        **task.dict(),
        user_id=current_user.id,
        created_by_id=current_user.id
    )


    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@app.get("/users/{user_id}/tasks/", response_model=list[schemas.Task])
def read_tasks(user_id: int, db: Session = Depends(get_db)):
    tasks = db.query(models.Task).filter(models.Task.user_id == user_id).all()
    return tasks



#קוד לעדכון משימיה
@app.put("/tasks/{task_id}", response_model=schemas.Task)
def update_task(
    task_id: int,
    task: schemas.TaskCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    db_task = db.query(models.Task).filter(
        models.Task.id == task_id,
        models.Task.user_id == current_user.id
    ).first()

    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")

    db_task.text = task.text
    db_task.completed = task.completed
    db_task.due_date = task.due_date
    db_task.description = task.description

    db.commit()
    db.refresh(db_task)
    return db_task



#קוד למחיקת משימה
@app.delete("/tasks/{task_id}")
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    db_task = db.query(models.Task).filter(
        models.Task.id == task_id,
        models.Task.user_id == current_user.id
    ).first()

    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")

    db.delete(db_task)
    db.commit()

    return {"detail": "Task deleted successfully"}


@app.get("/users", response_model=list[schemas.User])
def get_all_users(db: Session = Depends(get_db)):
    return db.query(models.User).all()

@app.post("/admin/users/{target_user_id}/tasks", response_model=schemas.Task)
def admin_create_task_for_user(
    target_user_id: int,
    task: schemas.TaskCreate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin)
):

    # 3️⃣ בדיקה שהמשתמש קיים
    user = db.query(models.User).filter(models.User.id == target_user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # 4️⃣ בדיקת תאריך (כמו שיש לך)
    if task.due_date and task.due_date < date.today():
        raise HTTPException(
            status_code=400,
            detail="Due date cannot be in the past"
        )

    # 5️⃣ יצירת המשימה למשתמש
    new_task = models.Task(
    **task.dict(),
    user_id=target_user_id,
    created_by_id=admin.id
    )


    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    return new_task


@app.get("/admin/users/{target_user_id}/tasks", response_model=list[schemas.Task])
def admin_get_user_tasks(
    target_user_id: int,
    db: Session = Depends(get_db),
    admin =Depends(get_current_admin)
):

    user = db.query(models.User).filter(models.User.id == target_user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return db.query(models.Task).filter(models.Task.user_id == target_user_id).all()

@app.put("/admin/tasks/{task_id}", response_model=schemas.Task)
def admin_update_task(
    task_id: int,
    task: schemas.TaskCreate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin)
):

    db_task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")

    db_task.text = task.text
    db_task.description = task.description
    db_task.due_date = task.due_date

    db.commit()
    db.refresh(db_task)
    return db_task

@app.delete("/admin/tasks/{task_id}")
def admin_delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin)
):
    
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    db.delete(task)
    db.commit()
    return {"detail": "Task deleted"}


@app.get("/tasks/", response_model=list[schemas.Task])
def get_my_tasks(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return (
        db.query(models.Task)
        .filter(models.Task.user_id == current_user.id)
        .all()
    )


