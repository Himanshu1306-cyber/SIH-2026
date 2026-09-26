"""
LabelGuard AI — Legal Metrology Rules 2011 Validation Engine
Checks extracted OCR fields against 9 mandatory declaration rules.
"""


# Complete list of Legal Metrology (Packaged Commodities) Rules, 2011
RULES = [
    {
        "rule_id": "R1",
        "rule_name": "Manufacturer / Packer / Importer Name & Address",
        "section": "Rule 6(1)(a)",
        "description": "Every package shall bear the name and complete address of the manufacturer or packer, or in case of imported packages, the importer.",
        "field_key": "manufacturer",
    },
    {
        "rule_id": "R2",
        "rule_name": "Common or Generic Product Name",
        "section": "Rule 6(1)(b)",
        "description": "The common or generic name of the commodity contained in the package must be declared.",
        "field_key": "product_name",
    },
    {
        "rule_id": "R3",
        "rule_name": "Net Quantity in Standard Units",
        "section": "Rule 6(1)(c)",
        "description": "Net quantity of the commodity in terms of standard units of weight, measure or number.",
        "field_key": "net_quantity",
    },
    {
        "rule_id": "R4",
        "rule_name": "Maximum Retail Price (MRP)",
        "section": "Rule 6(1)(d)",
        "description": "The retail sale price of the package (MRP inclusive of all taxes) must be prominently declared.",
        "field_key": "mrp",
    },
    {
        "rule_id": "R5",
        "rule_name": "Month & Year of Manufacture / Packing",
        "section": "Rule 6(1)(e)",
        "description": "The month and year in which the commodity is manufactured, packed or imported shall be mentioned.",
        "field_key": "dates",
    },
    {
        "rule_id": "R6",
        "rule_name": "Consumer Care / Helpline Details",
        "section": "Rule 6(1)(f)",
        "description": "Contact details including address, telephone, and/or email for consumer complaints.",
        "field_key": "consumer_care",
    },
    {
        "rule_id": "R7",
        "rule_name": "Country of Origin",
        "section": "Rule 6(1)(g)",
        "description": "For imported goods, the country of origin must be declared. For domestic, 'Made in India' is recommended.",
        "field_key": "country_of_origin",
    },
    {
        "rule_id": "R8",
        "rule_name": "FSSAI License Number (Food Products)",
        "section": "FSSAI Act 2006 / Rule 6",
        "description": "Food products must display a valid FSSAI license number on the package.",
        "field_key": "fssai",
    },
    {
        "rule_id": "R9",
        "rule_name": "Batch / Lot Identification Number",
        "section": "Rule 6(1)(h)",
        "description": "A batch, lot, or code number for traceability must be marked on the package.",
        "field_key": "batch_number",
    },
]


def validate_compliance(extracted_fields: dict) -> dict:
    """
    Validate extracted OCR fields against all 9 Legal Metrology rules.

    Returns:
        {
            "results": [ { rule_id, rule_name, section, status, detail, extracted_value } ],
            "total_rules": 9,
            "passed": int,
            "failed": int,
            "compliance_percentage": float
        }
    """
    results = []
    passed = 0
    failed = 0

    for rule in RULES:
        field_key = rule["field_key"]
        value = extracted_fields.get(field_key)

        # Determine pass/fail
        is_present = _check_field_present(value)

        if is_present:
            status = "pass"
            detail = f"✓ Detected on label"
            passed += 1
        else:
            status = "fail"
            detail = f"✗ Not found on label — required under {rule['section']}"
            failed += 1

        # Format extracted value for display
        display_value = _format_display_value(field_key, value)

        results.append({
            "rule_id": rule["rule_id"],
            "rule_name": rule["rule_name"],
            "section": rule["section"],
            "description": rule["description"],
            "status": status,
            "detail": detail,
            "extracted_value": display_value,
        })

    total = len(RULES)
    compliance_pct = round((passed / total) * 100, 1) if total > 0 else 0

    return {
        "results": results,
        "total_rules": total,
        "passed": passed,
        "failed": failed,
        "compliance_percentage": compliance_pct,
    }


def _check_field_present(value) -> bool:
    """Check if a field value is meaningfully present."""
    if value is None:
        return False
    if isinstance(value, str):
        return len(value.strip()) > 0
    if isinstance(value, dict):
        return len(value) > 0
    if isinstance(value, list):
        return len(value) > 0
    return bool(value)


def _format_display_value(field_key: str, value) -> str:
    """Format extracted value for human-readable display."""
    if value is None:
        return "Not detected"

    if field_key == "dates" and isinstance(value, dict):
        parts = []
        for k, v in value.items():
            label = k.replace("_", " ").title()
            parts.append(f"{label}: {v}")
        return " | ".join(parts) if parts else "Not detected"

    if field_key == "consumer_care" and isinstance(value, dict):
        parts = []
        if "phone" in value:
            parts.append(f"Phone: {value['phone']}")
        if "email" in value:
            parts.append(f"Email: {value['email']}")
        if "website" in value:
            parts.append(f"Web: {value['website']}")
        return " | ".join(parts) if parts else "Not detected"

    if isinstance(value, str):
        return value[:150]

    return str(value)


def get_rules_list() -> list:
    """Return the list of all rules for the GET /rules endpoint."""
    return [
        {
            "rule_id": r["rule_id"],
            "rule_name": r["rule_name"],
            "section": r["section"],
            "description": r["description"],
        }
        for r in RULES
    ]
