from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from app.services.ingestion import IngestionAgent
from app.services.pattern_detector import PatternDetectionAgent

router = APIRouter(prefix="/demo", tags=["demo"])

DEMO_FILES = {
    "step1": {
        "filename": "OISD_CS_2024_12_Furnace_Explosion.pdf",
        "content": """OISD CASE STUDY: OISD/CS/2024-25/P&E/12
TITLE: Furnace Explosion during Refinery Maintenance Turnaround
LOCATION: Atmospheric Vacuum Distillation Unit (AVDU-2), Heater F-101
DATE OF INCIDENT: 14th January 2024
EQUIPMENT TAGS: F-101, E-102, TK-402, P-105A

DESCRIPTION OF INCIDENT:
During the scheduled turnaround maintenance of Furnace F-101, a catastrophic vapor cloud explosion occurred inside the combustion chamber upon relighting burner B-3. The flash fire caused severe structural displacement of furnace walls and structural collapse of radiant tube supports.

ROOT CAUSE ANALYSIS:
1. Work Permit System Violation: Hot work permit (PTW #8841) was issued without mandatory explosive hydrocarbon gas testing at elevation +12m per OISD-STD-105 Cl 6.3.1.
2. Fuel gas blind isolation (LOTO) was not verified before permitting open flame ignition sources.
3. Accumulated hydrocarbon vapors ignited upon manual spark igniter operation.

REGULATORY BREACHES: OISD-STD-105 (Cl 6.3.1, Cl 6.4.1), OISD-STD-111 (Cl 4.2), PESO Act 1934.
RECOMMENDATIONS: Enforce digital work permit verification with gas detector interlocks prior to ignition authorization."""
    },
    "step2": {
        "filename": "OISD_CS_2024_11_Fatal_Tube_Stacking.pdf",
        "content": """OISD CASE STUDY: OISD/CS/2024-25/P&E/11
TITLE: Fatal Tube Stacking Accident during Pipe Rack Extension
LOCATION: Offsites & Utilities Area, Pipe Yard 4
DATE OF INCIDENT: 18th April 2024 (Simulating 3 months later)
EQUIPMENT TAGS: H-201, Pipe Rack Yard, Crane-04

DESCRIPTION OF INCIDENT:
While transferring heavy alloy steel furnace replacement tubes from storage yard to site rigging deck, a stack of 12-inch diameter tubes rolled off the timber chocks, fatally crushing a mechanical technician.

ROOT CAUSE ANALYSIS:
1. Work Permit System Violation: Lifting and hoisting operations were executed without a valid Cold Work / Lifting Permit sign-off by the Rigging Supervisor (2nd occurrence of PTW non-compliance).
2. Non-compliance with OISD-GDN-192 guidelines for securing heavy tubular materials.
3. Lack of barricading and spotter presence during heavy load maneuver.

REGULATORY BREACHES: OISD-STD-105 (Cl 6.3.1), OISD-GDN-192 (Cl 3.2), Factories Act 1948 Section 40.
RECOMMENDATIONS: Conduct mandatory daily toolbox talks and forbid un-permitted lifting operations across all plant areas."""
    },
    "step3": {
        "filename": "OISD_CS_2024_17_Fatal_Heater_Treater_Fire.pdf",
        "content": """OISD CASE STUDY: OISD/CS/2024-25/E&P/17
TITLE: Fatal Heater Treater Fire & Thermal Flash Incident
LOCATION: Crude Oil Desalting Terminal, Heater Treater HT-301
DATE OF INCIDENT: 22nd September 2024 (Simulating 9 months after first incident)
EQUIPMENT TAGS: HT-301, Burner-01, Valve-V-12

DESCRIPTION OF INCIDENT:
A high-intensity thermal fire broke out at crude oil heater treater HT-301 during burner maintenance operations. Thermal radiation ignited escaping fuel oil, resulting in 2 fatalities and extensive control instrumentation destruction.

ROOT CAUSE ANALYSIS:
1. Work Permit System Violation: Maintenance crew commenced burner disassembly under expired permit to work (3RD TIME WORK PERMIT SYSTEM FAILURE DETECTED).
2. Flame safeguard interlocks and automatic fuel shutoff valves were manually bypassed.
3. Hydrocarbon gas testing was neglected prior to hot line maintenance.

REGULATORY BREACHES: OISD-STD-105 (Cl 6.3.1, Cl 6.4.1), OISD-STD-111 (Cl 5.5), PESO Safety Directives.
RECOMMENDATIONS: Immediate operational lockdown and comprehensive plant-wide audit on Work Permit compliance culture."""
    }
}

@router.post("/step/{step_id}")
async def run_demo_step(step_id: str) -> Dict[str, Any]:
    if step_id not in DEMO_FILES:
        raise HTTPException(status_code=400, detail="Invalid demo step ID. Use step1, step2, or step3.")
    
    step_info = DEMO_FILES[step_id]
    saved_doc = await IngestionAgent.process_file(step_info["content"].encode("utf-8"), step_info["filename"])
    
    # Analyze patterns
    patterns = PatternDetectionAgent.analyze_knowledge_base()
    
    return {
        "status": "success",
        "step": step_id,
        "document": saved_doc,
        "patterns": patterns
    }
