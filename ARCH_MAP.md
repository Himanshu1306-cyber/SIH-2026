# ARCH_MAP – SIH-2026 Legal Metrology Compliance Engine

## Project Overview
OCR-based compliance checker for packaged commodity labels under the Legal Metrology (Packaged Commodities) Rules, 2011.

## Current State
- **Phase**: Step 1 – EasyOCR extraction + basic field detection
- **Stack**: Python 3.10+, FastAPI, EasyOCR, Pydantic v2

## Directory Layout
```
SIH-2026/
├── backend/
│   ├── requirements.txt          # pinned Python deps
│   └── app/
│       ├── main.py               # FastAPI entry point (CORS, health, router mount)
│       ├── routers/
│       │   └── ocr_router.py     # POST /api/v1/ocr/scan
│       ├── services/
│       │   └── ocr_service.py    # EasyOCR wrapper + regex field extractor
│       └── models/
│           └── schemas.py        # Pydantic request/response models
├── css/                          # Frontend styles (style.css, responsive.css)
├── js/                           # Frontend modules (app, scanner, dashboard, report, etc.)
├── index.html                    # LabelGuard AI frontend prototype entry point
└── README.md
```

## API Endpoints
| Method | Path               | Description                         |
|--------|--------------------|-------------------------------------|
| GET    | /health            | Liveness probe                      |
| POST   | /api/v1/ocr/scan   | Upload image → OCR → field extract  |

## Key Design Decisions
- EasyOCR reader is a **module-level singleton** (lazy-init, `gpu=False` default for dev).
- Field extraction is **pure regex** for now; will be replaced by ML classifier in later phases.
- Mandatory fields list (`MANDATORY_FIELDS` in `ocr_router.py`) drives the `missing_fields` response key.

## Change Log
- **2026-09-25**: Scaffolded backend – FastAPI + EasyOCR OCR service, regex field extraction for 9 Legal Metrology declaration types, Pydantic v2 schemas, single `/ocr/scan` endpoint.
- **2026-09-25**: Fetched and fast-forward merged latest remote changes from `origin/main` containing the frontend web application (`index.html`, CSS, and JS modules). Verified local branch synchronization with zero merge conflicts.
