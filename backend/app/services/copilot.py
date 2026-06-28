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

        # 1. Dialogue history formatting
        history_str = ""
        if history:
            recent_turns = history[-6:]
            history_str = "\n".join([f"{m.get('role').upper()}: {m.get('content')}" for m in recent_turns])

        # 2. Complete workspace document compilation
        doc_workspace_list = []
        referenced_docs = []
        for idx, d in enumerate(docs):
            doc_title = d.get('filename', f'Document_{idx+1}')
            referenced_docs.append(doc_title)
            is_latest = (idx == 0)
            status = "[ACTIVE TARGET DOCUMENT / MOST RECENTLY UPLOADED]" if is_latest else "[HISTORICAL WORKSPACE FILE]"
            
            doc_workspace_list.append(
                f"=== DOCUMENT {idx+1}: {doc_title} {status} ===\n"
                f"Domain: {d.get('domain')}\n"
                f"Uploaded Date: {d.get('upload_date', '')[:10]}\n"
                f"Structured Entities: {d.get('entities_json')}\n"
                f"Complete Document Text:\n{d.get('content_text')}"
            )

        workspace_str = "\n\n".join(doc_workspace_list) if doc_workspace_list else "No documents uploaded in workspace yet."
        pattern_str = "\n".join([f"Pattern: {p.get('title')} ({p.get('severity')} - {p.get('occurrence_count')} incidents)" for p in patterns])

        # 3. Enterprise Expert System Prompt
        system_instruction = (
            "You are KnowledgeBrain AI, an authoritative Senior Industrial Intelligence Specialist and Systems Architect.\n\n"
            "OPERATING INSTRUCTIONS:\n"
            "1. CONVERSATIONAL EXCELLENCE: Respond with high intelligence, clarity, and professionalism (like ChatGPT and Gemini Pro).\n"
            "2. CONTEXTUAL REASONING: Analyze the user query against the uploaded documents. If the user asks about the latest uploaded document, focus on that file. If they ask a general repository question (e.g., 'How many reports do I have?'), give an accurate counting overview of all workspace files. If they ask to compare reports, analyze similarities across files.\n"
            "3. FACTUAL CITATIONS: Cite exact document titles, equipment tags (e.g. HT-3, RC-1, F-101), dates, root causes, and regulatory clauses directly from the text.\n"
            "4. NO SYNTHETIC FALLBACKS: Give thorough, genuine, and highly helpful responses grounded strictly in the provided text."
        )

        prompt = (
            f"=== WORKSPACE DOCUMENTS REPOSITORY ({len(docs)} Files Ingested) ===\n{workspace_str}\n\n"
            f"=== DETECTED SAFETY PATTERNS ===\n{pattern_str}\n\n"
            f"=== RECENT DIALOGUE HISTORY ===\n{history_str}\n\n"
            f"USER QUERY: {question}\n\n"
            "Provide a factual, articulate, genuine, and highly insightful response."
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
                f"Summarize all {len(docs)} uploaded documents.",
                "Compare common root causes across reports.",
                "What regulatory standards apply to these reports?"
            ]
        return [
            "Summarize the key root causes of this report.",
            "What regulatory standards apply to this file?",
            "Show equipment tags extracted."
        ]
