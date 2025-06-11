from fastapi import WebSocket, WebSocketDisconnect
from typing import List, Dict, Any
import json
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class DateTimeEncoder(json.JSONEncoder):
    """Custom JSON encoder for datetime objects"""
    def default(self, obj):
        if isinstance(obj, datetime):
            return obj.isoformat()
        return super().default(obj)

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        """Accept and store a new WebSocket connection"""
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket connected. Total connections: {len(self.active_connections)}")
    
    def disconnect(self, websocket: WebSocket):
        """Remove a WebSocket connection"""
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        logger.info(f"WebSocket disconnected. Total connections: {len(self.active_connections)}")
    
    async def send_personal_message(self, message: Dict[Any, Any], websocket: WebSocket):
        """Send a message to a specific WebSocket connection"""
        try:
            # Use custom encoder for datetime serialization
            message_str = json.dumps(message, cls=DateTimeEncoder)
            await websocket.send_text(message_str)
        except Exception as e:
            logger.error(f"Error sending personal message: {e}")
            self.disconnect(websocket)
    
    async def broadcast(self, message: Dict[Any, Any]):
        """Broadcast a message to all connected clients"""
        if not self.active_connections:
            logger.info("No active connections to broadcast to")
            return
        
        try:
            # Use custom encoder for datetime serialization
            message_str = json.dumps(message, cls=DateTimeEncoder)
            logger.info(f"Broadcasting message to {len(self.active_connections)} connections: {message['type']}")
        except Exception as e:
            logger.error(f"Error serializing message: {e}")
            return
        
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_text(message_str)
            except Exception as e:
                logger.error(f"Error broadcasting to connection: {e}")
                disconnected.append(connection)
        
        # Remove disconnected connections
        for conn in disconnected:
            self.disconnect(conn)

# Global connection manager instance
manager = ConnectionManager()