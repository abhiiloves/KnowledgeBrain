import datetime
from typing import List, Dict, Any
from app.database import DatabaseManager

class PatternDetectionAgent:
    @staticmethod
    def analyze_knowledge_base() -> List[Dict[str, Any]]:
        docs = DatabaseManager.get_all_documents()
        if not docs:
            return []

        # Map recurring concepts across documents
        pattern_clusters: Dict[str, List[Dict[str, Any]]] = {}

        for doc in docs:
            entities = doc.get("entities_json", {})
            root_causes = entities.get("root_causes", [])
            content = doc.get("content_text", "").lower()

            # Key pattern categories to track across time
            categories = []
            if any("work permit" in rc.lower() or "permit to work" in rc.lower() for rc in root_causes) or "permit" in content or "ptw" in content:
                categories.append("Work Permit System Violation")
            if any("gas test" in rc.lower() or "hydrocarbon" in rc.lower() for rc in root_causes) or "gas test" in content or "explosion" in content:
                categories.append("Hydrocarbon Gas Testing Failure")
            if any("rigging" in rc.lower() or "stacking" in rc.lower() for rc in root_causes) or "stacking" in content or "rigging" in content:
                categories.append("Material Handling & Rigging Non-Compliance")
            if any("interlock" in rc.lower() or "bypass" in rc.lower() for rc in root_causes) or "interlock" in content or "fire" in content:
                categories.append("Safety Interlock & Burner Safeguard Bypass")

            if not categories:
                categories.append("Operational Standard Deviation")

            for cat in categories:
                if cat not in pattern_clusters:
                    pattern_clusters[cat] = []
                # Avoid duplicate doc entry per category
                if not any(d.get("id") == doc.get("id") for d in pattern_clusters[cat]):
                    pattern_clusters[cat].append(doc)

        detected_patterns = []
        for p_title, matched_docs in pattern_clusters.items():
            count = len(matched_docs)
            if count == 0:
                continue

            # Determine severity based on incident frequency
            if count >= 3:
                severity = "CRITICAL"
                badge = "🔴"
                summary = f"Systemic safety culture issue detected across {count} incidents spanning recent operations. Immediate operational audit required."
            elif count == 2:
                severity = "MEDIUM"
                badge = "🟠"
                summary = f"Recurring procedural violation identified across {count} separate incident reports. Escalation warning active."
            else:
                severity = "LOW"
                badge = "🟡"
                summary = f"Single incident logged. Isolated occurrence monitoring."

            doc_ids = [str(d.get("id")) for d in matched_docs]
            doc_names = [d.get("filename") for d in matched_docs]
            dates = [d.get("upload_date", "")[:10] for d in matched_docs]

            pattern_record = {
                "id": f"pat_{p_title.lower().replace(' ', '_')}",
                "title": p_title,
                "severity": severity,
                "badge": badge,
                "occurrence_count": count,
                "document_ids": doc_ids,
                "document_names": doc_names,
                "first_detected": min(dates) if dates else "2024-01-01",
                "last_detected": max(dates) if dates else "2024-09-30",
                "summary": summary,
                "recommendation": f"Enforce mandatory audit against regulatory standard for {p_title} across all asset sites."
            }

            DatabaseManager.save_pattern(pattern_record)
            detected_patterns.append(pattern_record)

        return sorted(detected_patterns, key=lambda x: x["occurrence_count"], reverse=True)
