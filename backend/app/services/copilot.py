import datetime
from typing import Dict, Any, List
from app.database import DatabaseManager
from app.services.llm import GeminiLLMService
from app.services.pattern_detector import PatternDetectionAgent

class CopilotAgent:
    @staticmethod
    async def ask_question(question: str, session_id: str = "default") -> Dict[str, Any]:
        docs = DatabaseManager.get_all_documents()
        patterns = DatabaseManager.get_all_patterns()
        history = DatabaseManager.get_chat_history(session_id)

        # Build context from documents
        doc_context_list = []
        referenced_docs = []
        for d in docs:
            doc_context_list.append(f"Document: {d.get('filename')} (ID: {d.get('id')})\nContent Excerpt: {d.get('content_text')[:1500]}\nEntities: {d.get('entities_json')}")
            referenced_docs.append(d.get('filename'))

        doc_context_str = "\n\n---\n\n".join(doc_context_list) if doc_context_list else "No documents ingested yet."
        pattern_context_str = "\n".join([f"Pattern: {p.get('title')} ({p.get('severity')} - {p.get('occurrence_count')} incidents across {p.get('document_names')})" for p in patterns])

        system_instruction = (
            "You are the Expert Knowledge Copilot for KnowledgeBrain. Your goal is to deliver authoritative, highly accurate intelligence based strictly on uploaded industrial logs and documents.\n"
            "You MUST format your output with clear distinct sections:\n"
            "1. Answer: [Direct comprehensive answer]\n"
            "2. Source: [Exact document filenames and clause/sections cited]\n"
            "3. Confidence: [Percentage score, e.g. 94%]\n"
            "4. Related Pattern: [Mention any cross-document pattern detected]\n"
            "5. Recommendation: [Actionable safety/regulatory compliance step]"
        )

        prompt = (
            f"User Question: {question}\n\n"
            f"Available Knowledge Base Context:\n{doc_context_str}\n\n"
            f"Active Detected Patterns Across Time:\n{pattern_context_str}\n\n"
            "Deliver an expert, structured response following the required format."
        )

        response_text = await GeminiLLMService.generate_text(prompt, system_instruction)

        # Parse follow up questions dynamically based on content
        follow_ups = CopilotAgent._generate_follow_ups(question, docs)

        # Save user turn
        DatabaseManager.save_chat_message({
            "session_id": session_id,
            "role": "user",
            "content": question,
            "timestamp": datetime.datetime.utcnow().isoformat()
        })

        # Save assistant turn
        assistant_msg = {
            "session_id": session_id,
            "role": "assistant",
            "content": response_text,
            "confidence": 95 if docs else 70,
            "documents_referenced": referenced_docs,
            "suggested_followups": follow_ups,
            "timestamp": datetime.datetime.utcnow().isoformat()
        }
        DatabaseManager.save_chat_message(assistant_msg)

        return assistant_msg

    @staticmethod
    def _generate_follow_ups(question: str, docs: List[Dict[str, Any]]) -> List[str]:
        q_lower = question.lower()
        if "root cause" in q_lower or "common" in q_lower:
            return [
                "Which specific OISD standards were violated in these incidents?",
                "What is the severity breakdown of all active patterns?",
                "Generate an executive audit summary for plant management."
            ]
        elif "permit" in q_lower or "oisd-std-105" in q_lower:
            return [
                "What are the mandatory gas testing requirements before hot work?",
                "Show compliance gap analysis for OISD-STD-105.",
                "How many total documents cite Work Permit violations?"
            ]
        else:
            return [
                "What is the most critical recurring safety violation?",
                "Which equipment tags appear most frequently in incident reports?",
                "Generate compliance audit evidence package."
            ]
