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

        # 3. Short, Sharp & Crisp Master System Prompt
        system_instruction = (
            "You are KnowledgeBrain AI, a Senior Industrial Intelligence Specialist.\n\n"
            "CRITICAL RESPONSE STYLE RULES (SHORT & CRISP):\n"
            "1. SHORT & CRISP: Give direct, sharp, to-the-point, and highly accurate answers. Avoid long boring intros or unnecessary filler text.\n"
            "2. CLEAR BULLET POINTS: Use short bullet points and bold highlights for readability.\n"
            "3. ACCURATE CITATIONS: Cite exact equipment tags, dates, and regulatory clauses directly from the workspace documents.\n"
            "4. WORKSPACE CONTEXT: Understand the user's intent cleanly and provide accurate facts."
        )

        prompt = (
            f"=== WORKSPACE DOCUMENTS ({len(docs)} Files Total) ===\n{workspace_str}\n\n"
            f"=== SAFETY PATTERNS ===\n{pattern_str}\n\n"
            f"=== DIALOGUE HISTORY ===\n{history_str}\n\n"
            f"USER QUERY: {question}\n\n"
            "Provide a short, crisp, direct, and highly accurate response."
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
                f"Summarize all {len(docs)} documents cleanly.",
                "Which document has the highest damage?",
                "What are the key regulatory breaches?"
            ]
        return [
            "Summarize root causes cleanly.",
            "What regulatory clauses apply?",
            "Show equipment tags."
        ]
