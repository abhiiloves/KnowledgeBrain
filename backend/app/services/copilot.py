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

        # Build full context from documents
        doc_context_list = []
        referenced_docs = []
        for d in docs:
            doc_context_list.append(f"Document Filename: {d.get('filename')}\nDomain: {d.get('domain')}\nFull Content Text:\n{d.get('content_text')}\nEntities Extracted: {d.get('entities_json')}")
            referenced_docs.append(d.get('filename'))

        doc_context_str = "\n\n====================\n\n".join(doc_context_list) if doc_context_list else "No documents ingested in knowledge base yet."
        pattern_context_str = "\n".join([f"Pattern: {p.get('title')} (Severity: {p.get('severity')} - Incidents Count: {p.get('occurrence_count')} in {p.get('document_names')})" for p in patterns])

        system_instruction = (
            "You are KnowledgeBrain AI, an expert Senior Industrial Intelligence Specialist & Systems Architect. Your persona is highly articulate, genuine, helpful, natural, and deeply knowledgeable.\n\n"
            "Guidelines for your response:\n"
            "1. Answer the user's question in a clear, natural, comprehensive, and conversational manner. Avoid robotic templates or overly stiff forced headings unless appropriate.\n"
            "2. Thoroughly analyze and reference the specific details from the uploaded documents in your answer (e.g. equipment tags, specific times, root causes, sequence of events, and regulatory clauses).\n"
            "3. Seamlessly mention the exact document sources and clause numbers where the information comes from.\n"
            "4. If cross-document patterns or recurring violations exist, mention them naturally to provide valuable foresight.\n"
            "5. End with a helpful, actionable recommendation or suggestion."
        )

        prompt = (
            f"User Query: {question}\n\n"
            f"Uploaded Knowledge Base Documents & Records:\n{doc_context_str}\n\n"
            f"Active Detected Cross-Document Patterns:\n{pattern_context_str}\n\n"
            "Provide a comprehensive, genuine, detailed, and highly insightful response."
        )

        response_text = await GeminiLLMService.generate_text(prompt, system_instruction)

        follow_ups = CopilotAgent._generate_follow_ups(question, docs)

        DatabaseManager.save_chat_message({
            "session_id": session_id,
            "role": "user",
            "content": question,
            "timestamp": datetime.datetime.utcnow().isoformat()
        })

        assistant_msg = {
            "session_id": session_id,
            "role": "assistant",
            "content": response_text,
            "confidence": 96 if docs else 75,
            "documents_referenced": referenced_docs,
            "suggested_followups": follow_ups,
            "timestamp": datetime.datetime.utcnow().isoformat()
        }
        DatabaseManager.save_chat_message(assistant_msg)

        return assistant_msg

    @staticmethod
    def _generate_follow_ups(question: str, docs: List[Dict[str, Any]]) -> List[str]:
        q_lower = question.lower()
        if "explosion" in q_lower or "root cause" in q_lower or "cause" in q_lower:
            return [
                "What specific equipment valves or DCS alarms were involved?",
                "Which OISD regulatory clauses were breached in this incident?",
                "How can we prevent similar occurrences across our units?"
            ]
        elif "permit" in q_lower or "sop" in q_lower:
            return [
                "What are the mandatory gas testing requirements before hot work?",
                "Show compliance gap analysis across all standards.",
                "How many recurring procedural violations exist?"
            ]
        else:
            return [
                "Summarize the key findings and root causes of uploaded documents.",
                "Which equipment tags appear most frequently in the logs?",
                "Generate an executive safety audit summary."
            ]
