from fastapi import APIRouter
from typing import Dict, Any
from app.database import DatabaseManager
from app.services.pattern_detector import PatternDetectionAgent
from app.services.compliance import ComplianceAgent
from app.services.ingestion import IngestionAgent

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/stats")
async def get_dashboard_stats() -> Dict[str, Any]:
    docs = DatabaseManager.get_all_documents()
    patterns = PatternDetectionAgent.analyze_knowledge_base()
    compliance = ComplianceAgent.evaluate_compliance()

    active_alerts = [p for p in patterns if p.get("severity") in ["MEDIUM", "CRITICAL"]]

    return {
        "total_documents": len(docs),
        "knowledge_nodes_count": len(docs) * 15 + len(patterns) * 8,
        "active_patterns_count": len(patterns),
        "critical_alerts_count": len([p for p in patterns if p.get("severity") == "CRITICAL"]),
        "overall_compliance_score": compliance.get("overall_compliance_score", 100),
        "recent_alerts": active_alerts[:5],
        "recent_documents": docs[:5]
    }

@router.post("/reset")
async def reset_database():
    DatabaseManager.clear_database()
    return {"status": "success", "message": "Database reset completed."}
