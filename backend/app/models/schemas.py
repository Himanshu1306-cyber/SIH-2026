"""
Pydantic models for OCR API request/response shapes.
"""

from __future__ import annotations

from pydantic import BaseModel, Field


class BoundingBox(BaseModel):
    """Four-corner bounding box returned by EasyOCR."""
    points: list[list[int]] = Field(
        ...,
        description="Four [x, y] corner points of the detected text region.",
        min_length=4,
        max_length=4,
    )


class OCRDetection(BaseModel):
    """Single text detection from EasyOCR."""
    bbox: list[list[int]] = Field(..., description="Four [x,y] corners.")
    text: str
    confidence: float = Field(..., ge=0.0, le=1.0)


class ExtractedField(BaseModel):
    """A mandatory declaration field extracted via regex."""
    value: str
    source_text: str
    confidence: float | None = None


class OCRResponse(BaseModel):
    """Full response from the /ocr/scan endpoint."""
    filename: str
    detections: list[OCRDetection]
    fields: dict[str, ExtractedField]
    raw_text: str
    total_detections: int
    missing_fields: list[str] = Field(
        default_factory=list,
        description="Mandatory fields that were NOT detected.",
    )
