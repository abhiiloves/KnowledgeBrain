import datetime
from typing import Dict, Any, List
from app.database import DatabaseManager
from app.services.llm import GeminiLLMService

class CopilotAgent:
    @staticmethod
    async def ask_question(question: str, session_id: str = "default", doc_id: str = None) -> Dict[str, Any]:
        docs = DatabaseManager.get_all_documents()
        patterns = DatabaseManager.get_all_patterns()
        history = DatabaseManager.get_chat_history(session_id)

        q_lower = question.lower()
        
        # Detect if user explicitly requests elaboration or detailed explanation
        is_elaboration_requested = any(k in q_lower for k in [
            "elaborate", "explain", "detail", "vistar", "breakdown", "describe",
            "full report", "complete summary", "deep dive", "sab kuch batao"
        ])

        # 1. Build conversational history thread
        history_str = ""
        if history:
            recent_turns = history[-4:]
            history_str = "\n".join([f"{m.get('role').upper()}: {m.get('content')}" for m in recent_turns])

        # 2. Build complete document workspace
        doc_workspace_list = []
        referenced_docs = []
        for idx, d in enumerate(docs):
            doc_title = d.get('filename', f'Document_{idx+1}')
            referenced_docs.append(doc_title)
            is_latest = (idx == 0)
            status_tag = "[MOST RECENTLY UPLOADED FILE]" if is_latest else "[HISTORICAL WORKSPACE FILE]"
            
            doc_workspace_list.append(
                f"=== DOCUMENT {idx+1}: {doc_title} {status_tag} ===\n"
                f"Domain: {d.get('domain')}\n"
                f"Content:\n{d.get('content_text')}"
            )

        workspace_str = "\n\n".join(doc_workspace_list) if doc_workspace_list else "No documents uploaded in workspace yet."
        pattern_str = "\n".join([f"Pattern Alert: {p.get('title')} ({p.get('severity')})" for p in patterns])

        # 3. Dynamic Adaptive System Prompt based on user request depth
        if is_elaboration_requested:
            system_instruction = (
                "You are KnowledgeBrain AI, a Senior Industrial Intelligence Specialist.\n\n"
                "ELABORATION MODE ENGAGED:\n"
                "The user explicitly asked to ELABORATE or EXPLAIN IN DETAIL. Provide a thorough, comprehensive, section-by-section detailed breakdown of the target document.\n"
                "Include:\n"
                "- Incident Overview & Background\n"
                "- Detailed Sequence of Events & Observations\n"
                "- Root Cause Analysis & Equipment Involved\n"
                "- Regulatory Violations & Safety Recommendations\n"
                "Be articulate, highly informative, genuine, and comprehensive."
            )
        else:
            system_instruction = (
                "You are KnowledgeBrain AI, a Senior Industrial Intelligence Specialist.\n\n"
                "RESPONSE STYLE RULES:\n"
                "1. Provide clear, direct, and accurate answers matching the user's query intent.\n"
                "2. Use clean bullet points and bold highlights for key facts.\n"
                "3. Cite specific equipment tags, dates, and regulatory clauses directly from the workspace documents.\n"
                "4. Be articulate, genuine, and helpful without unnecessary filler text."
            )

        prompt = (
            f"=== WORKSPACE DOCUMENTS ({len(docs)} Files Total) ===\n{workspace_str}\n\n"
            f"=== SAFETY PATTERNS ===\n{pattern_str}\n\n"
            f"=== DIALOGUE HISTORY ===\n{history_str}\n\n"
            f"USER QUERY: {question}\n\n"
            "Provide an accurate, genuine response tailored specifically to the requested depth."
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
            "confidence": 98 if docs else 75,
            "documents_referenced": referenced_docs[:3],
            "suggested_followups": follow_ups,
            "timestamp": datetime.datetime.utcnow().isoformat()
        }
        DatabaseManager.save_chat_message(assistant_msg)

        return assistant_msg

    @staticmethod
    def _generate_follow_ups(question: str, docs: List[Dict[str, Any]]) -> List[str]:
        if len(docs) > 1:
            return [
                "Elaborate in full detail on this file.",
                "Compare all uploaded reports.",
                "What regulatory clauses apply?"
            ]
        return [
            "Elaborate in full detail on this file.",
            "Summarize root causes cleanly.",
            "What regulatory clauses apply?"
        ]
