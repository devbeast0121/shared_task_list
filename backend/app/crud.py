from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List, Optional
from .models import Task, TaskStatus
from .schemas import TaskCreate, TaskUpdate

def create_task(db: Session, task: TaskCreate) -> Task:
    """Create a new task"""
    db_task = Task(
        title=task.title,
        description=task.description,
        assignee=task.assignee,
        status=TaskStatus.TODO
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

def get_tasks(
    db: Session, 
    status: Optional[TaskStatus] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
) -> List[Task]:
    """Get tasks with optional filtering"""
    query = db.query(Task)
    
    if status:
        query = query.filter(Task.status == status)
    
    if search:
        # Case-insensitive search in title
        query = query.filter(Task.title.ilike(f"%{search}%"))
    
    return query.order_by(Task.created_at.desc()).offset(skip).limit(limit).all()

def get_task(db: Session, task_id: int) -> Optional[Task]:
    """Get a single task by ID"""
    return db.query(Task).filter(Task.id == task_id).first()

def update_task_status(db: Session, task_id: int, status: TaskStatus) -> Optional[Task]:
    """Update task status"""
    db_task = get_task(db, task_id)
    if db_task:
        db_task.status = status
        db.commit()
        db.refresh(db_task)
    return db_task

def delete_task(db: Session, task_id: int) -> bool:
    """Delete a task"""
    db_task = get_task(db, task_id)
    if db_task:
        db.delete(db_task)
        db.commit()
        return True
    return False