from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..schemas import TaskCreate, TaskResponse, TaskUpdate, TaskSearchParams
from ..models import TaskStatus
from .. import crud
from ..websocket import manager

router = APIRouter(prefix="/api/tasks", tags=["tasks"])

@router.post("/", response_model=TaskResponse)
async def create_task(task: TaskCreate, db: Session = Depends(get_db)):
    """Create a new task and broadcast to all clients"""
    try:
        db_task = crud.create_task(db, task)
        
        # Broadcast new task to all connected clients
        await manager.broadcast({
            "type": "task_created",
            "data": TaskResponse.from_orm(db_task).dict()
        })
        
        return db_task
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create task: {str(e)}")

@router.get("/", response_model=List[TaskResponse])
def get_tasks(
    status: Optional[TaskStatus] = Query(None, description="Filter by task status"),
    search: Optional[str] = Query(None, description="Search in task titles"),
    skip: int = Query(0, ge=0, description="Number of tasks to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of tasks to return"),
    db: Session = Depends(get_db)
):
    """Get tasks with optional filtering"""
    try:
        return crud.get_tasks(db, status=status, search=search, skip=skip, limit=limit)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch tasks: {str(e)}")

@router.get("/{task_id}", response_model=TaskResponse)
def get_task(task_id: int, db: Session = Depends(get_db)):
    """Get a single task by ID"""
    db_task = crud.get_task(db, task_id)
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    return db_task

@router.patch("/{task_id}", response_model=TaskResponse)
async def update_task(task_id: int, task_update: TaskUpdate, db: Session = Depends(get_db)):
    """Update task status and broadcast to all clients"""
    db_task = crud.update_task_status(db, task_id, task_update.status)
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Broadcast task update to all connected clients
    await manager.broadcast({
        "type": "task_updated",
        "data": TaskResponse.from_orm(db_task).dict()
    })
    
    return db_task

@router.delete("/{task_id}")
async def delete_task(task_id: int, db: Session = Depends(get_db)):
    """Delete a task and broadcast to all clients"""
    success = crud.delete_task(db, task_id)
    if not success:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Broadcast task deletion to all connected clients
    await manager.broadcast({
        "type": "task_deleted",
        "data": {"id": task_id}
    })
    
    return {"message": "Task deleted successfully"}