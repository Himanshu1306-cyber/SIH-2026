"""
LabelGuard AI — OCR Image Scanner Module
Uses Tesseract OCR to extract text from product packaging images
and smart regex-based field extraction for mandatory declarations.
"""

import re
import pytesseract
from PIL import Image


def scan_image(image_path: str) -> str:
    """Run Tesseract OCR on an image and return raw extracted text."""
    try:
        img = Image.open(image_path)
        # Convert to RGB if needed (handles RGBA PNGs)
        if img.mode != "RGB":
            img = img.convert("RGB")
        raw_text = pytesseract.image_to_string(img, lang="eng")
        return raw_text.strip()
    except Exception as e:
        return f"[OCR ERROR] {str(e)}"


def extract_fields(raw_text: str) -> dict:
    """
    Extract structured fields from raw OCR text using regex patterns.
    Returns a dictionary of detected fields with their values.
    """
    text_lower = raw_text.lower()
    fields = {}

    # 1. Manufacturer / Packer / Importer name & address
    manufacturer_value = _extract_manufacturer(raw_text, text_lower)
    fields["manufacturer"] = manufacturer_value

    # 2. Product Name (first prominent line or common name keywords)
    fields["product_name"] = _extract_product_name(raw_text)

    # 3. Net Quantity
    fields["net_quantity"] = _extract_net_quantity(raw_text)

    # 4. MRP (Maximum Retail Price)
    fields["mrp"] = _extract_mrp(raw_text)

    # 5. Date of manufacture / packing / expiry
    fields["dates"] = _extract_dates(raw_text)

    # 6. Consumer care / helpline
    fields["consumer_care"] = _extract_consumer_care(raw_text, text_lower)

    # 7. Country of origin
    fields["country_of_origin"] = _extract_country_of_origin(text_lower)

    # 8. FSSAI License Number
    fields["fssai"] = _extract_fssai(raw_text, text_lower)

    # 9. Batch / Lot Number
    fields["batch_number"] = _extract_batch_number(raw_text, text_lower)

    return fields


def _extract_manufacturer(raw_text: str, text_lower: str) -> str | None:
    """Extract manufacturer/packer/importer name and address."""
    patterns = [
        r"(?:mfg\.?\s*(?:by|:)|manufactured\s*by|packed\s*by|packer\s*:|marketed\s*by|imported\s*by)\s*[:\-]?\s*(.+?)(?:\n|$)",
        r"(?:m/s\.?|pvt\.?\s*ltd\.?|limited|inc\.|llp|industries|enterprises|foods|products)\b.+",
    ]
    for pattern in patterns:
        match = re.search(pattern, raw_text, re.IGNORECASE | re.MULTILINE)
        if match:
            return match.group(0).strip()[:200]

    # Try to find address patterns (pincode, state names)
    pincode = re.search(r"\b\d{6}\b", raw_text)
    if pincode:
        # Get surrounding context
        start = max(0, pincode.start() - 100)
        return raw_text[start:pincode.end()].strip()

    return None


def _extract_product_name(raw_text: str) -> str | None:
    """Extract product/commodity name from the text."""
    lines = [l.strip() for l in raw_text.split("\n") if l.strip() and len(l.strip()) > 2]
    if lines:
        # First non-trivial line is often the product name
        for line in lines[:5]:
            # Skip lines that look like barcodes or numbers only
            if not re.match(r"^[\d\s\-\.]+$", line) and len(line) > 3:
                return line[:100]
    return None


def _extract_net_quantity(raw_text: str) -> str | None:
    """Extract net quantity with standard units."""
    patterns = [
        r"(?:net\s*(?:wt\.?|weight|qty\.?|quantity|content)\s*[:\-]?\s*)(\d+\.?\d*\s*(?:g|gm|gms|gram|grams|kg|kgs|ml|l|ltr|litre|litres|liter|liters|cc|oz|pieces?|pcs?|nos?|units?))\b",
        r"(\d+\.?\d*\s*(?:g|gm|gms|kg|kgs|ml|l|ltr)\b)",
    ]
    for pattern in patterns:
        match = re.search(pattern, raw_text, re.IGNORECASE)
        if match:
            return match.group(1).strip() if match.lastindex else match.group(0).strip()
    return None


def _extract_mrp(raw_text: str) -> str | None:
    """Extract Maximum Retail Price."""
    patterns = [
        r"(?:m\.?r\.?p\.?\s*[:\-]?\s*(?:rs\.?|₹|inr)?\s*)(\d+[\.,]?\d*)",
        r"(?:rs\.?|₹|inr)\s*(\d+[\.,]?\d*)",
        r"(?:maximum\s*retail\s*price)\s*[:\-]?\s*(?:rs\.?|₹|inr)?\s*(\d+[\.,]?\d*)",
        r"(?:price\s*[:\-]?\s*(?:rs\.?|₹|inr)?\s*)(\d+[\.,]?\d*)",
    ]
    for pattern in patterns:
        match = re.search(pattern, raw_text, re.IGNORECASE)
        if match:
            price = match.group(1).replace(",", "")
            return f"₹{price}"
    return None


def _extract_dates(raw_text: str) -> dict:
    """Extract manufacturing, packing, expiry dates."""
    dates = {}
    date_patterns = [
        (r"(?:mfg\.?\s*(?:dt?\.?|date)?|manufactured?\s*(?:on|date)?|mfd\.?)\s*[:\-]?\s*(\d{1,2}[\s/\-\.]\d{1,2}[\s/\-\.]\d{2,4}|\w+[\s/\-\.]\d{2,4}|\d{1,2}[\s/\-\.]\d{2,4})", "manufacturing_date"),
        (r"(?:pkg\.?\s*(?:dt?\.?|date)?|packed?\s*(?:on|date)?)\s*[:\-]?\s*(\d{1,2}[\s/\-\.]\d{1,2}[\s/\-\.]\d{2,4}|\w+[\s/\-\.]\d{2,4}|\d{1,2}[\s/\-\.]\d{2,4})", "packing_date"),
        (r"(?:exp\.?\s*(?:dt?\.?|date)?|expiry\s*(?:date)?|best\s*before|use\s*(?:by|before))\s*[:\-]?\s*(\d{1,2}[\s/\-\.]\d{1,2}[\s/\-\.]\d{2,4}|\w+[\s/\-\.]\d{2,4}|\d{1,2}[\s/\-\.]\d{2,4})", "expiry_date"),
    ]
    for pattern, key in date_patterns:
        match = re.search(pattern, raw_text, re.IGNORECASE)
        if match:
            dates[key] = match.group(1).strip()

    # Fallback: look for any date-like patterns
    if not dates:
        generic_dates = re.findall(r"\b(\d{1,2}[\s/\-\.]\d{1,2}[\s/\-\.]\d{2,4})\b", raw_text)
        if generic_dates:
            dates["detected_date"] = generic_dates[0]
        month_year = re.findall(r"\b((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*[\s/\-\.]\d{4})\b", raw_text, re.IGNORECASE)
        if month_year:
            dates["detected_date"] = month_year[0]

    return dates


def _extract_consumer_care(raw_text: str, text_lower: str) -> dict:
    """Extract consumer care contact details."""
    care = {}

    # Phone numbers (Indian 10-digit or toll-free 1800)
    phones = re.findall(r"\b(1800[\-\s]?\d{3}[\-\s]?\d{3,4}|\+?91[\-\s]?\d{10}|\b\d{10}\b)", raw_text)
    if phones:
        care["phone"] = phones[0]

    # Email
    emails = re.findall(r"[\w\.\-]+@[\w\.\-]+\.\w+", raw_text)
    if emails:
        care["email"] = emails[0]

    # Website
    websites = re.findall(r"(?:www\.[\w\.\-]+\.\w+|https?://[\w\.\-]+\.\w+)", raw_text, re.IGNORECASE)
    if websites:
        care["website"] = websites[0]

    # Customer care keywords
    if any(kw in text_lower for kw in ["customer care", "consumer care", "helpline", "toll free", "grievance"]):
        care["has_care_mention"] = True

    return care


def _extract_country_of_origin(text_lower: str) -> str | None:
    """Extract country of origin declaration."""
    patterns = [
        r"(?:country\s*of\s*origin\s*[:\-]?\s*)(\w[\w\s]+)",
        r"(?:made\s*in|product\s*of|origin\s*[:\-]?)\s*(\w[\w\s]+)",
    ]
    for pattern in patterns:
        match = re.search(pattern, text_lower)
        if match:
            return match.group(1).strip().title()[:50]
    if "india" in text_lower:
        return "India"
    return None


def _extract_fssai(raw_text: str, text_lower: str) -> str | None:
    """Extract FSSAI license number."""
    if "fssai" in text_lower or "lic" in text_lower:
        # FSSAI is typically a 14-digit number
        match = re.search(r"\b(\d{14})\b", raw_text)
        if match:
            return match.group(1)
        # Or any long number near FSSAI keyword
        match = re.search(r"(?:fssai|lic\.?\s*no\.?)\s*[:\-]?\s*(\d{7,14})", raw_text, re.IGNORECASE)
        if match:
            return match.group(1)
    return None


def _extract_batch_number(raw_text: str, text_lower: str) -> str | None:
    """Extract batch or lot number."""
    patterns = [
        r"(?:batch\s*(?:no\.?)?|lot\s*(?:no\.?)?|b\.?\s*no\.?)\s*[:\-]?\s*([\w\-/]+)",
    ]
    for pattern in patterns:
        match = re.search(pattern, raw_text, re.IGNORECASE)
        if match:
            return match.group(1).strip()
    return None
