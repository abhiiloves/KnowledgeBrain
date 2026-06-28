import datetime
from typing import Dict, Any, List
from app.database import DatabaseManager
from app.services.llm import GeminiLLMService

class CopilotAgent:
    @staticmethod
    async def ask_question(question: str, session_id: str = "default", doc_id: str = None) -> Dict[str, Any]:
        docs = DatabaseManager.get_all_documents()
        patterns = DatabaseManager.get_all_patterns()

        # Check if user explicitly asks to combine/compare reports
        q_lower = question.lower()
        is_comparison_requested = any(k in q_lower for k in [
            "compare", "combine", "all documents", "all reports", "across reports",
            "cross-document", "dono ko mila", "sare report", "sab mila", "dono ke mila"
        ])

        # Select relevant document context based on user intent
        doc_context_list = []
        referenced_docs = []

        if doc_id:
            target_doc = DatabaseManager.get_document_by_id(doc_id)
            if target_doc:
                docs = [target_doc]

        if not is_comparison_requested and len(docs) > 1:
            # By default, focus primarily on the latest uploaded document or the specific document queried
            latest_doc = docs[0]  # docs are stored latest first
            doc_context_list.append(f"Primary Document: {latest_doc.get('filename')}\nContent:\n{latest_doc.get('content_text')}\nEntities: {latest_doc.get('entities_json')}")
            referenced_docs.append(latest_doc.get('filename'))
        else:
            for d in docs:
                doc_context_list.append(f"Document Filename: {d.get('filename')}\nContent:\n{d.get('content_text')}\nEntities: {d.get('entities_json')}")
                referenced_docs.append(d.get('filename'))

        doc_context_str = "\n\n====================\n\n".join(doc_context_list) if doc_context_list else "No document ingested yet."

        system_instruction = (
            "You are KnowledgeBrain AI, a helpful, natural, and highly articulate Senior Intelligence Specialist (acting with ChatGPT-level conversation excellence).\n\n"
            "STRICT SCOPE RULES:\n"
            "1. Answer strictly and specifically about the target document in context. DO NOT mix or combine details from other unrelated reports unless the user explicitly asks to 'compare reports' or 'combine all documents'.\n"
            "2. Be genuine, natural, detailed, and clear. Avoid stiff robotic templates. Give direct, insightful answers.\n"
            "3. Cite specific equipment tags, dates, times, and clauses from the text where appropriate.\n"
            "4. End with a helpful next step or recommendation."
        )

        prompt = (
            f"User Query: {question}\n\n"
            f"Relevant Document Context:\n{doc_context_str}\n\n"
            "Provide a clear, genuine, and comprehensive answer focusing strictly on the relevant document."
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
