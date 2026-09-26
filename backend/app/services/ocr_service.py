"""
OCR Service – EasyOCR wrapper with basic field detection.

Responsibilities
────────────────
1. Load EasyOCR reader (singleton, lazy-init).
2. Run OCR on an in-memory image and return raw detections.
3. Post-process raw text to extract mandatory Legal Metrology fields
   (MRP, Net Quantity, Manufacturer/Packer, Date of Mfg/Packing,
    Consumer Care, FSSAI, Batch/Lot No., Country of Origin).
"""

from __future__ import annotations

import io
import re
from typing import Any

import easyocr
import numpy as np
from PIL import Image

# ---------------------------------------------------------------------------
# Devanagari → ASCII digit normalisation
# ---------------------------------------------------------------------------
# EasyOCR with Hindi enabled often reads Arabic numerals as Devanagari
# (e.g. 120 → १२०).  We normalise before regex matching.
_DEVANAGARI_DIGITS = str.maketrans("०१२३४५६७८९", "0123456789")


def _normalise_text(text: str) -> str:
    """Translate Devanagari digits to ASCII and normalise whitespace."""
    text = text.translate(_DEVANAGARI_DIGITS)
    # Also replace the Devanagari visarga (ः / \u0903) which EasyOCR
    # sometimes emits instead of a colon
    text = text.replace("\u0903", ":")
    # Replace Devanagari 'र' that sometimes appears instead of ₹
    # Only when followed by digits (with optional whitespace).
    # We use a capturing group approach instead of lookbehind.
    text = re.sub(r"(^|\s)र(?=\s*\d)", r"\1₹", text)
    return text

# ---------------------------------------------------------------------------
# Singleton reader – initialised once on first call
# ---------------------------------------------------------------------------
_reader: easyocr.Reader | None = None


def _get_reader() -> easyocr.Reader:
    """Return a cached EasyOCR Reader instance (English + Hindi)."""
    global _reader
    if _reader is None:
        _reader = easyocr.Reader(["en", "hi"], gpu=False)
    return _reader


# ---------------------------------------------------------------------------
# Raw OCR
# ---------------------------------------------------------------------------

def run_ocr(image_bytes: bytes) -> list[dict[str, Any]]:
    """
    Run EasyOCR on raw image bytes.

    Returns a list of detections, each containing:
        - bbox   : [[x1,y1],[x2,y2],[x3,y3],[x4,y4]]
        - text   : recognised string
        - confidence : float 0-1
    """
    reader = _get_reader()
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img_np = np.array(img)

    results = reader.readtext(img_np)

    detections: list[dict[str, Any]] = []
    for bbox, text, confidence in results:
        # EasyOCR returns numpy coords – convert to plain lists
        detections.append(
            {
                "bbox": [[int(pt[0]), int(pt[1])] for pt in bbox],
                "text": text.strip(),
                "confidence": round(float(confidence), 4),
            }
        )
    return detections


# ---------------------------------------------------------------------------
# Field extraction helpers (regex-based)
# ---------------------------------------------------------------------------

# Patterns keyed by field name.
# IMPORTANT: For fields like manufacturer/address/consumer-care/country we
# intentionally keep a *per-line* variant (.+) that is applied line-by-line
# first (see extract_fields).  The concatenated-blob search uses (.+?) to
# avoid over-matching.
_FIELD_PATTERNS_PER_LINE: dict[str, list[re.Pattern[str]]] = {
    "mrp": [
        re.compile(
            r"(?:M\.?\s*R\.?\s*P\.?|Maximum\s+Retail\s+Price)"
            r"[:\s₹Rs.]*(\d[\d,]*\.?\d*)",
            re.IGNORECASE,
        ),
        re.compile(r"[₹]\s*(\d[\d,]*\.?\d*)"),
    ],
    "net_quantity": [
        re.compile(
            r"(?:Net\s+(?:Wt|Weight|Qty|Quantity|Content|Vol|Volume))"
            r"[:\s.]*(\d[\d.]*\s*(?:g|gm|gms|gram|grams|kg|kgs|ml|mL|l|L|ltr|litre|litres|oz|pieces|pcs|units|nos)\.?)",
            re.IGNORECASE,
        ),
    ],
    "manufacturer_name": [
        re.compile(
            r"(?:Mfg\.?\s*(?:by|:)|Manufactured\s+by|Packed\s+by|Packer|Marketed\s+by|Imported\s+by)"
            r"[:\s]*(.+)",
            re.IGNORECASE,
        ),
    ],
    "manufacturer_address": [
        re.compile(
            r"(?:Address|Addr)[:\s]*(.+)",
            re.IGNORECASE,
        ),
    ],
    "date_of_manufacture": [
        re.compile(
            r"(?:Mfg\.?\s*(?:Date|Dt)|Date\s+of\s+(?:Mfg|Manufacture|Manufacturing|Packing|Pkg)|Mfd|DOM)"
            r"[:\s.-]*(\d{1,2}[\s/.-]\d{1,2}[\s/.-]\d{2,4}|\w{3,9}[\s/.-]\d{2,4})",
            re.IGNORECASE,
        ),
        # Fallback: "Mfg Date: MM/YYYY" (no day component)
        re.compile(
            r"(?:Mfg\.?\s*(?:Date|Dt)|DOM)"
            r"[:\s.-]*(\d{1,2}[\s/.-]\d{2,4})",
            re.IGNORECASE,
        ),
    ],
    "expiry_date": [
        re.compile(
            r"(?:Exp(?:iry)?\.?\s*(?:Date|Dt)?|Best\s+Before|Use\s+Before|BB)"
            r"[:\s.-]*(\d{1,2}[\s/.-]\d{1,2}[\s/.-]\d{2,4}|\w{3,9}[\s/.-]\d{2,4}|\d+\s*(?:months?|days?|years?))",
            re.IGNORECASE,
        ),
    ],
    "consumer_care": [
        re.compile(
            r"(?:Consumer\s+Care|Customer\s+Care|Helpline|Toll\s*Free|Contact\s*Us)"
            r"[:\s]*(.+)",
            re.IGNORECASE,
        ),
    ],
    "fssai_license": [
        re.compile(
            r"(?:FSSAI\s*(?:Lic|License|Licence)?\.?\s*(?:No\.?)?)[:\s]*(\d{10,14})",
            re.IGNORECASE,
        ),
        re.compile(r"\b(\d{14})\b"),
    ],
    "batch_lot_number": [
        re.compile(
            r"(?:Batch|Lot)\s*(?:No\.?|Number)?[:\s]*([A-Za-z0-9/.-]{3,})",
            re.IGNORECASE,
        ),
    ],
    "country_of_origin": [
        re.compile(
            r"(?:Country\s+of\s+Origin|Made\s+in|Product\s+of)"
            r"[:\s]*(.+)",
            re.IGNORECASE,
        ),
    ],
}


def extract_fields(detections: list[dict[str, Any]]) -> dict[str, Any]:
    """
    Given raw OCR detections, concatenate nearby text and apply regex
    patterns to extract mandatory declaration fields.

    Strategy
    --------
    1. Normalise every detection's text (Devanagari → ASCII digits, etc.).
    2. Try each regex **per detection line first** — this avoids greedy
       `.+` patterns swallowing multiple lines when run on the concatenated
       blob.
    3. Fall back to matching against the full concatenated text only if
       per-line matching didn't work.

    Returns a dict with two keys:
        - ``fields``   : {field_name: {value, source_text, confidence}}
        - ``raw_text``  : full concatenated OCR text (normalised)
    """
    # Normalise all detection text
    norm_detections: list[dict[str, Any]] = []
    for d in detections:
        norm_detections.append({
            **d,
            "text": _normalise_text(d["text"]),
        })

    per_line_texts: list[str] = [d["text"] for d in norm_detections]
    full_text = " ".join(per_line_texts)

    fields: dict[str, dict[str, Any]] = {}

    for field_name, patterns in _FIELD_PATTERNS_PER_LINE.items():
        found = False
        for pattern in patterns:
            if found:
                break

            # ── Pass 1: per-detection-line match (preferred) ──
            for det in norm_detections:
                match = pattern.search(det["text"])
                if match:
                    value = (
                        match.group(1).strip()
                        if match.lastindex
                        else match.group(0).strip()
                    )
                    fields[field_name] = {
                        "value": value,
                        "source_text": match.group(0).strip(),
                        "confidence": det["confidence"],
                    }
                    found = True
                    break

            if found:
                break

            # ── Pass 2: full concatenated text (fallback) ──
            match = pattern.search(full_text)
            if match:
                value = (
                    match.group(1).strip()
                    if match.lastindex
                    else match.group(0).strip()
                )
                # Find contributing detections for confidence
                source_dets = [
                    d
                    for d in norm_detections
                    if d["text"] and d["text"] in match.group(0)
                ]
                avg_conf = (
                    round(
                        sum(d["confidence"] for d in source_dets)
                        / len(source_dets),
                        4,
                    )
                    if source_dets
                    else None
                )
                fields[field_name] = {
                    "value": value,
                    "source_text": match.group(0).strip(),
                    "confidence": avg_conf,
                }
                found = True

    return {"fields": fields, "raw_text": full_text}
