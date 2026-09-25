"""
OCR Router – image upload & scan endpoint.
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.models.schemas import ExtractedField, OCRDetection, OCRResponse
from app.services.ocr_service import extract_fields, run_ocr

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ocr", tags=["OCR"])

# Mandatory fields under Legal Metrology (Packaged Commodities) Rules, 2011
MANDATORY_FIELDS: list[str] = [
    "mrp",
    "net_quantity",
    "manufacturer_name",
    "date_of_manufacture",
    "consumer_care",
    "country_of_origin",
]

ALLOWED_CONTENT_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/bmp",
    "image/tiff",
}

MAX_FILE_SIZE_MB = 10


@router.post(
    "/scan",
    response_model=OCRResponse,
    summary="Scan a packaged commodity label",
    description=(
        "Upload an image of a packaged product label. "
        "The system will run EasyOCR, extract mandatory declarations, "
        "and flag any missing fields per Legal Metrology Rules."
    ),
)
async def scan_label(file: UploadFile = File(..., description="Product label image")):
    """Accept an image, run OCR, extract fields, return structured result."""
    # ── validate content type ──
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{file.content_type}'. Allowed: {', '.join(sorted(ALLOWED_CONTENT_TYPES))}",
        )

    # ── read & validate size ──
    try:
        image_bytes = await file.read()
    except Exception as exc:
        logger.exception("Failed to read uploaded file")
        raise HTTPException(status_code=400, detail="Could not read uploaded file.") from exc

    if len(image_bytes) > MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum allowed size is {MAX_FILE_SIZE_MB} MB.",
        )

    # ── run OCR ──
    try:
        detections = run_ocr(image_bytes)
    except Exception as exc:
        logger.exception("OCR processing failed")
        raise HTTPException(status_code=500, detail="OCR processing failed.") from exc

    # ── extract fields ──
    try:
        extraction = extract_fields(detections)
    except Exception as exc:
        logger.exception("Field extraction failed")
        raise HTTPException(status_code=500, detail="Field extraction failed.") from exc

    # ── determine missing mandatory fields ──
    detected_field_names = set(extraction["fields"].keys())
    missing = [f for f in MANDATORY_FIELDS if f not in detected_field_names]

    return OCRResponse(
        filename=file.filename or "unknown",
        detections=[OCRDetection(**d) for d in detections],
        fields={k: ExtractedField(**v) for k, v in extraction["fields"].items()},
        raw_text=extraction["raw_text"],
        total_detections=len(detections),
        missing_fields=missing,
    )
