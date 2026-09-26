"""
LabelGuard AI — FastAPI Backend Server
Endpoints for image scanning, compliance validation, and report generation.
"""

import os
import uuid
import shutil
from pathlib import Path

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse

from ocr_scanner import scan_image, extract_fields
from rules_engine import validate_compliance, get_rules_list
from report_generator import generate_report, export_text


# Setup
UPLOAD_DIR = Path(__file__).parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

app = FastAPI(
    title="LabelGuard AI — Compliance API",
    description="OCR-based Legal Metrology (Packaged Commodities) Rules 2011 compliance checker",
    version="1.0.0",
)

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "service": "LabelGuard AI — Compliance API",
        "status": "running",
        "version": "1.0.0",
    }


@app.get("/rules")
async def list_rules():
    """Return all Legal Metrology rules used for validation."""
    return {
        "total": 9,
        "rules": get_rules_list(),
    }


@app.post("/scan")
async def scan_package(file: UploadFile = File(...)):
    """
    Upload a product packaging image, run OCR extraction,
    validate against Legal Metrology Rules 2011,
    and return a full compliance report.
    """
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/jpg"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type: {file.content_type}. Only JPG/PNG images are accepted.",
        )

    # Save uploaded file
    file_ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    saved_name = f"{uuid.uuid4().hex}.{file_ext}"
    saved_path = UPLOAD_DIR / saved_name

    try:
        with open(saved_path, "wb") as f:
            shutil.copyfileobj(file.file, f)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

    try:
        # Step 1: OCR — Extract raw text from image
        raw_text = scan_image(str(saved_path))

        if raw_text.startswith("[OCR ERROR]"):
            raise HTTPException(status_code=500, detail=raw_text)

        if not raw_text.strip():
            # Return report with all fails if no text detected
            raw_text = "(No text detected in image)"

        # Step 2: Extract structured fields from OCR text
        extracted_fields = extract_fields(raw_text)

        # Step 3: Validate against Legal Metrology Rules 2011
        rule_results = validate_compliance(extracted_fields)

        # Step 4: Generate compliance report
        report = generate_report(
            raw_text=raw_text,
            extracted_fields=extracted_fields,
            rule_results=rule_results,
            filename=file.filename,
        )

        return report

    finally:
        # Cleanup uploaded file
        if saved_path.exists():
            os.remove(saved_path)


@app.post("/scan/text-report")
async def scan_package_text(file: UploadFile = File(...)):
    """
    Same as /scan but returns a plain-text formatted report.
    """
    # Reuse the /scan logic
    allowed_types = ["image/jpeg", "image/png", "image/jpg"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Only JPG/PNG images accepted.")

    file_ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    saved_name = f"{uuid.uuid4().hex}.{file_ext}"
    saved_path = UPLOAD_DIR / saved_name

    try:
        with open(saved_path, "wb") as f:
            shutil.copyfileobj(file.file, f)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

    try:
        raw_text = scan_image(str(saved_path))
        if raw_text.startswith("[OCR ERROR]"):
            raise HTTPException(status_code=500, detail=raw_text)
        if not raw_text.strip():
            raw_text = "(No text detected in image)"

        extracted_fields = extract_fields(raw_text)
        rule_results = validate_compliance(extracted_fields)
        report = generate_report(raw_text, extracted_fields, rule_results, file.filename)
        text_output = export_text(report)

        return PlainTextResponse(content=text_output)

    finally:
        if saved_path.exists():
            os.remove(saved_path)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
