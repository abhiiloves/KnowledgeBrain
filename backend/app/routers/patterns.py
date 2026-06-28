from fastapi import APIRouter
from typing import List, Dict, Any
from app.services.pattern_detector import PatternDetectionAgent

router = APIRouter(prefix="/patterns", tags=["patterns"])

@router.get("", response_model=List[Dict[str, Any]])
async def get_patterns():
    return PatternDetectionAgent.analyze_knowledge_base()
