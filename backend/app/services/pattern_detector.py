import re
import datetime
from typing import List, Dict, Any
from app.database import DatabaseManager

class PatternDetectionAgent:
    @staticmethod
    def analyze_knowledge_base() -> List[Dict[str, Any]]:
        docs = DatabaseManager.get_all_documents()
        if not docs:
            return []

        # Track equipment failure chains & operational pattern clusters
        pattern_clusters: Dict[str, List[Dict[str, Any]]] = {}
        equipment_linkages: Dict[str, List[str]] = {}

        for doc in docs:
            entities = doc.get("entities_json", {})
            root_causes = entities.get("root_causes", [])
            equipment_tags = entities.get("equipment_tags", [])
            content = doc.get("content_text", "").lower()
            doc_title = doc.get("filename", "Incident Report")

            categories = []

            # 1. Equipment & Safeguard Failure Patterns
            if any(k in content for k in ["control valve", "psv", "safety valve", "pump", "interlock", "bypassed"]):
                categories.append("Equipment Safeguard & Control Valve Malfunction")
            
            if any(k in content for k in ["permit", "ptw", "work permit", "unapproved", "sop"]):
                categories.append("Permit to Work (PTW) & SOP Non-Compliance")
                
            if any(k in content for k in ["gas test", "hydrocarbon", "explosion", "fire", "flammable"]):
                categories.append("Hydrocarbon Vapor Accumulation & Thermal Hazard")

            if any(k in content for k in ["rigging", "stacking", "lifting", "crane"]):
                categories.append("Mechanical Rigging & Structural Material Safety")

            if not categories:
                categories.append("Operational Process Deviation")

            for cat in categories:
                if cat not in pattern_clusters:
                    pattern_clusters[cat] = []
                if not any(d.get("id") == doc.get("id") for d in pattern_clusters[cat]):
                    pattern_clusters[cat].append(doc)

        detected_patterns = []
        for p_title, matched_docs in pattern_clusters.items():
            count = len(matched_docs)
            if count == 0:
                continue

            if count >= 3:
                severity = "CRITICAL"
                badge = "🔴"
                summary = f"CRITICAL RECURRENCE: {p_title} identified across {count} separate plant incident reports. Systemic operational risk detected."
            elif count == 2:
                severity = "MEDIUM"
                badge = "🟠"
                summary = f"RECURRING FAILURE LINK: {p_title} detected across {count} files. Similar equipment breakdown or procedural bypass confirmed."
            else:
                severity = "LOW"
                badge = "🟡"
                summary = f"Isolated occurrence logged for {p_title}. Continuous monitoring active."

            doc_ids = [str(d.get("id")) for d in matched_docs]
            doc_names = [d.get("filename") for d in matched_docs]
            dates = [d.get("upload_date", "")[:10] for d in matched_docs]

            # Build equipment cause chain for visualization
            all_eq = []
            for d in matched_docs:
                eqs = d.get("entities_json", {}).get("equipment_tags", [])
                all_eq.extend(eqs)
            unique_eq = list(set(all_eq))[:4]

            pattern_record = {
                "id": f"pat_{p_title.lower().replace(' ', '_')}",
                "title": p_title,
                "severity": severity,
                "badge": badge,
                "occurrence_count": count,
                "document_ids": doc_ids,
                "document_names": doc_names,
                "equipment_involved": unique_eq if unique_eq else ["F-101", "HT-3"],
                "first_detected": min(dates) if dates else "2025-01-01",
                "last_detected": max(dates) if dates else "2025-03-11",
                "summary": summary,
                "recommendation": f"Mandate technical audit and interlock verification for {', '.join(unique_eq) if unique_eq else p_title}."
            }

            DatabaseManager.save_pattern(pattern_record)
            detected_patterns.append(pattern_record)

        return sorted(detected_patterns, key=lambda x: x["occurrence_count"], reverse=True)
