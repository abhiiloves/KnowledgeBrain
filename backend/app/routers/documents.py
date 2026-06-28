from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List, Dict, Any
from app.services.ingestion import IngestionAgent
from app.services.pattern_detector import PatternDetectionAgent
from app.database import DatabaseManager

router = APIRouter(prefix="/documents", tags=["documents"])

@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    if not file:
        raise HTTPException(status_code=400, detail="No file uploaded")
    
    content = await file.read()
    saved_doc = await IngestionAgent.process_file(content, file.filename)
    
    # Trigger automatic pattern detection after each upload
    PatternDetectionAgent.analyze_knowledge_base()
    
    return {"status": "success", "document": saved_doc}

@router.get("", response_model=List[Dict[str, Any]])
async def get_documents():
    return DatabaseManager.get_all_documents()

@router.get("/{doc_id}")
async def get_document(doc_id: str):
    doc = DatabaseManager.get_document_by_id(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc
