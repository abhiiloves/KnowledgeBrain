import datetime
from typing import Dict, Any, List
from app.database import DatabaseManager
from app.services.llm import GeminiLLMService

class CopilotAgent:
    @staticmethod
    async def ask_question(question: str, session_id: str = "default", doc_id: str = None) -> Dict[str, Any]:
        docs = DatabaseManager.get_all_documents()
        patterns = DatabaseManager.get_all_patterns()

        q_lower = question.lower()
        
        # 1. Detect if user is asking about overall repository stats / file count / listing all documents
        is_overview_query = any(k in q_lower for k in [
            "how many", "kitne", "kitni", "total report", "total document", "list all",
            "what documents", "all files", "kitne file", "what reports", "repository",
            "summary of all", "sabka summary"
        ])

        # 2. Detect if user is asking to compare or combine reports
        is_comparison_query = any(k in q_lower for k in [
            "compare", "combine", "across reports", "cross-document", "dono ko mila",
            "sare report", "sab mila", "dono ke mila", "difference between"
        ])

        doc_context_list = []
        referenced_docs = []

        if docs:
            if is_overview_query or is_comparison_query:
                # Give FULL access to all documents with clear titles
                for idx, d in enumerate(docs):
                    doc_title = d.get('filename', f'Document_{idx+1}')
                    doc_context_list.append(
                        f"Document #{idx+1}: {doc_title} (Uploaded: {d.get('upload_date', '')[:10]})\n"
                        f"Domain: {d.get('domain')}\n"
                        f"Entities Extracted: {d.get('entities_json')}\n"
                        f"Content Summary:\n{d.get('content_text')[:1500]}"
                    )
                    referenced_docs.append(doc_title)
            else:
                # Specific file query - primary focus on the latest active document, with awareness of total repo count
                latest_doc = docs[0]
                doc_title = latest_doc.get('filename', 'Latest Document')
                doc_context_list.append(
                    f"★ ACTIVE TARGET DOCUMENT: {doc_title}\n"
                    f"Domain: {latest_doc.get('domain')}\n"
                    f"Full Content:\n{latest_doc.get('content_text')}\n"
                    f"Entities: {latest_doc.get('entities_json')}"
                )
                referenced_docs.append(doc_title)
                
                # List other files in metadata so AI is aware of repository size
                other_titles = [d.get('filename') for d in docs[1:]]
                if other_titles:
                    doc_context_list.append(f"Other Stored Repository Files ({len(other_titles)} total): {', '.join(other_titles)}")

        doc_context_str = "\n\n====================\n\n".join(doc_context_list) if doc_context_list else "No documents stored in knowledge base yet."
        pattern_context_str = "\n".join([f"Pattern: {p.get('title')} (Severity: {p.get('severity')}, Incidents: {p.get('occurrence_count')})" for p in patterns])

        system_instruction = (
            "You are KnowledgeBrain AI, a highly intelligent Senior Industrial Systems Specialist with ChatGPT-level conversational excellence.\n\n"
            f"REPOSITORY AWARENESS: There are currently {len(docs)} documents stored in your active knowledge repository.\n\n"
            "GUIDELINES:\n"
            "1. If the user asks general questions like 'How many reports do you have?' or 'List all documents', ACCURATELY state the total number of stored documents in the repository and list their smart titles cleanly!\n"
            "2. If the user asks about a specific incident or the active document, answer thoroughly based on that file.\n"
            "3. If the user asks to compare reports, analyze similarities and recurring patterns across documents.\n"
            "4. Be articulate, natural, articulate, genuine, and highly helpful."
        )

        prompt = (
            f"User Query: {question}\n\n"
            f"Total Repository Documents Stored: {len(docs)}\n\n"
            f"Document Context:\n{doc_context_str}\n\n"
            f"Active Patterns Detected:\n{pattern_context_str}\n\n"
            "Provide an accurate, genuine, and insightful response directly answering the user's query."
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
        if len(docs) > 1:
            return [
                f"Summarize all {len(docs)} stored documents.",
                "Compare common root causes across reports.",
                "Show regulatory compliance breakdown."
            ]
        return [
            "Summarize key root causes of this document.",
            "What regulatory standards apply to this file?",
            "Show equipment tags extracted."
        ]
