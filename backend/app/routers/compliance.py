from fastapi import APIRouter
from app.services.compliance import ComplianceAgent

router = APIRouter(prefix="/compliance", tags=["compliance"])

@router.get("")
async def get_compliance_dashboard():
    return ComplianceAgent.evaluate_compliance()

@router.get("/export-audit")
async def export_audit_package():
    return ComplianceAgent.generate_audit_package()
