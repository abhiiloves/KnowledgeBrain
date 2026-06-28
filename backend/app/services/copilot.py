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

        # 1. Build conversational history thread (like ChatGPT)
        history_str = ""
        if history:
            recent_turns = history[-6:]  # last 3 turns
            history_str = "\n".join([f"{m.get('role').upper()}: {m.get('content')}" for m in recent_turns])

        # 2. Build complete, transparent document workspace
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
                f"Upload Date: {d.get('upload_date', '')[:10]}\n"
                f"Extracted Entities: {d.get('entities_json')}\n"
                f"Document Content:\n{d.get('content_text')}"
            )

        workspace_str = "\n\n".join(doc_workspace_list) if doc_workspace_list else "No documents uploaded in workspace yet."
        pattern_str = "\n".join([f"Pattern Alert: {p.get('title')} ({p.get('severity')} - {p.get('occurrence_count')} incidents)" for p in patterns])

        # 3. ChatGPT / Gemini Custom GPT Style Master System Prompt
        system_instruction = (
            "You are KnowledgeBrain AI, a state-of-the-art multimodal AI assistant designed with the exact conversational brilliance, fluidity, and intelligence of ChatGPT and Gemini Pro.\n\n"
            "YOUR CORE OPERATING PRINCIPLES:\n"
            "1. REASONING AUTONOMY: You have full visibility over the user's workspace documents. Use intelligent context awareness to understand what the user is asking. If they ask about a recently uploaded file, answer specifically about that file. If they ask a general question ('How many files do I have?'), give an accurate counting overview of all workspace files.\n"
            "2. CONVERSATIONAL EXCELLENCE: Respond in a warm, natural, articulate, genuine, and highly insightful tone (like ChatGPT). Avoid rigid templates or robotic forced headers unless requested.\n"
            "3. ACCURATE CITATIONS: Cite exact equipment tags, dates, root causes, and regulatory clauses directly from the documents.\n"
            "4. CONTINUOUS THREAD: Pay attention to the conversation history to maintain smooth dialogue flow."
        )

        prompt = (
            f"=== WORKSPACE DOCUMENTS ({len(docs)} Files Total) ===\n{workspace_str}\n\n"
            f"=== DETECTED SAFETY PATTERNS ===\n{pattern_str}\n\n"
            f"=== RECENT DIALOGUE HISTORY ===\n{history_str}\n\n"
            f"USER QUERY: {question}\n\n"
            "Provide a brilliant, natural, genuine, and articulate response."
        )

        response_text = await GeminiLLMService.generate_text(prompt, system_instruction)
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
                "What are the recurring safety patterns across files?",
                "What regulatory clauses apply to these reports?"
            ]
        return [
            "Summarize the key root causes of this report.",
            "What regulatory standards apply to this file?",
            "Show equipment tags extracted."
        ]
