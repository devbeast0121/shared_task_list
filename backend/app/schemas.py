from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import Optional
from .models import TaskStatus
import html

class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200, description="Task title")
    description: str = Field(..., min_length=1, max_length=1000, description="Task description")
    assignee: str = Field(..., min_length=1, max_length=100, description="Task assignee")
    
    @validator('title', 'description', 'assignee')
    def sanitize_string(cls, v):
        """Sanitize input to prevent XSS"""
        if isinstance(v, str):
            return html.escape(v.strip())
        return v

class TaskUpdate(BaseModel):
    status: TaskStatus

class TaskResponse(BaseModel):
    id: int
    title: str
    description: str
    assignee: str
    status: TaskStatus
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class TaskSearchParams(BaseModel):
    search: Optional[str] = Field(None, max_length=200, description="Search term for task title")
    
    @validator('search')
    def sanitize_search(cls, v):
        """Sanitize search input"""
        if v:
            return html.escape(v.strip())
        return v