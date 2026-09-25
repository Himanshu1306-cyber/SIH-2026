# LabelGuard AI — Frontend Prototype

A multi-file frontend prototype for a Legal Metrology packaged
commodity compliance workflow.

## Run

Open `index.html` in a modern browser.

No build step is required.

## Project Structure

- `index.html` — application shell and screens
- `css/style.css` — main UI styles
- `css/responsive.css` — responsive/mobile/print styles

### JavaScript

- `js/data.js`
  - Dashboard demo data
  - Repository demo data
  - Role demo data

- `js/rules.js`
  - Prototype rule/check definitions

- `js/dashboard.js`
  - Dashboard rendering
  - Statistics
  - Charts
  - Recent inspections

- `js/scanner.js`
  - Image upload
  - Drag & drop
  - Image preview
  - Demo compliance analysis
  - Compliance score
  - Local inspection history

- `js/report.js`
  - Compliance report
  - Rule findings
  - Print / Save PDF
  - Editable report export

- `js/repository.js`
  - Search
  - Filters
  - Inspection history
  - Case opening

- `js/app.js`
  - Navigation
  - Theme
  - Mobile sidebar
  - Toast notifications
  - Application initialization

### Assets

- `assets/logo.svg`
  - LabelGuard AI logo

## Important

This is a frontend prototype.

The current scan workflow is a demo analysis and does not represent
official OCR, computer vision or legal determination.

For a production implementation, connect:

1. OCR / computer-vision service
2. Server-side rule engine
3. Authoritative legal-rule dataset
4. Database and inspection history API
5. Real authentication and authorization
6. Server-generated PDF
7. Audit logging
8. Evidence storage