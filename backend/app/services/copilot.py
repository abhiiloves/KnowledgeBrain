import datetime
from typing import Dict, Any, List
from app.database import DatabaseManager
from app.services.llm import GeminiLLMService

class CopilotAgent:
    @staticmethod
    async def ask_question(question: str, session_id: str = "default", doc_id: str = None) -> Dict[str, Any]:
        docs = DatabaseManager.get_all_documents()

        # Check if user explicitly asks to combine/compare reports
        q_lower = question.lower()
        is_comparison_requested = any(k in q_lower for k in [
            "compare", "combine", "all documents", "all reports", "across reports",
            "cross-document", "dono ko mila", "sare report", "sab mila", "dono ke mila"
        ])

        doc_context_list = []
        referenced_docs = []

        if docs:
            # docs[0] is the LATEST uploaded document because database.py sorts descending by upload_date
            latest_doc = docs[0]
            
            if not is_comparison_requested:
                # Primary focus on the LATEST uploaded file
                doc_context_list.append(f"★ LATEST UPLOADED DOCUMENT (ACTIVE CONTEXT): {latest_doc.get('filename')}\nContent:\n{latest_doc.get('content_text')}\nEntities: {latest_doc.get('entities_json')}")
                referenced_docs.append(latest_doc.get('filename'))
                
                # Also include historical docs as secondary context if needed
                for d in docs[1:]:
                    doc_context_list.append(f"Historical Document: {d.get('filename')}\nContent Summary: {d.get('content_text')[:500]}")
            else:
                for d in docs:
                    doc_context_list.append(f"Document Filename: {d.get('filename')}\nContent:\n{d.get('content_text')}\nEntities: {d.get('entities_json')}")
                    referenced_docs.append(d.get('filename'))

        doc_context_str = "\n\n====================\n\n".join(doc_context_list) if doc_context_list else "No document ingested yet."

        system_instruction = (
            "You are KnowledgeBrain AI, a highly intelligent Senior Industrial Intelligence Specialist (acting with ChatGPT-level conversation excellence).\n\n"
            "STRICT CONTEXT & FILE RULES:\n"
            "1. Focus your answer directly and specifically on the LATEST UPLOADED DOCUMENT (marked with ★). When the user uploads a new file and asks a question, answer about THAT new file!\n"
            "2. DO NOT confuse details of older historical files with the newly uploaded file, unless the user explicitly asks to 'compare reports' or 'combine documents'.\n"
            "3. Provide clear, genuine, articulate, and insightful answers citing exact equipment tags, dates, and causes from the text.\n"
            "4. End with a helpful next step or recommendation."
        )

        prompt = (
            f"User Query: {question}\n\n"
            f"Knowledge Base Document Context:\n{doc_context_str}\n\n"
            "Provide a clear, genuine, and comprehensive answer focusing on the relevant active document."
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
        return [
            "Summarize the key root causes of this specific document.",
            "Compare this report with other uploaded documents.",
            "What regulatory standards apply to this file?"
        ]
