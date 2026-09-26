/**
 * LabelGuard AI — Packaging Scanner & OCR Matrix Controller
 * Connects to backend API for real OCR, falls back to demo if unavailable.
 * After analysis, saves product + report to state for Repository & Report Center.
 */

const API_BASE = 'http://localhost:8000';

function initScanner() {
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('fileInput');
  const analyzeBtn = document.getElementById('analyzeBtn');

  if (!dropzone || !fileInput) return;

  // Drag events
  ['dragenter', 'dragover'].forEach(function(evt) {
    dropzone.addEventListener(evt, function(e) {
      e.preventDefault();
      e.stopPropagation();
      dropzone.style.borderColor = '#6b69ee';
      dropzone.style.background = '#f7f7ff';
    });
  });

  ['dragleave', 'drop'].forEach(function(evt) {
    dropzone.addEventListener(evt, function(e) {
      e.preventDefault();
      e.stopPropagation();
      dropzone.style.borderColor = '';
      dropzone.style.background = '';
    });
  });

  dropzone.addEventListener('drop', function(e) {
    handleFiles(e.dataTransfer.files);
  });

  // Click to browse — guard against recursive loop
  dropzone.addEventListener('click', function(e) {
    if (e.target === fileInput) return;
    fileInput.value = '';
    fileInput.click();
  });

  // File selected
  fileInput.addEventListener('change', function() {
    handleFiles(fileInput.files);
  });

  // Analyze button
  if (analyzeBtn) {
    analyzeBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      runAnalysis();
    });
  }
}

function handleFiles(fileList) {
  if (!fileList || fileList.length === 0) return;
  var images = [];
  for (var i = 0; i < fileList.length; i++) {
    if (/^image\/(png|jpeg|jpg|webp)$/.test(fileList[i].type)) {
      images.push(fileList[i]);
    }
  }
  images = images.slice(0, 4);
  state.files = images;

  var thumbs = document.getElementById('thumbs');
  if (thumbs) {
    thumbs.innerHTML = '';
    for (var j = 0; j < images.length; j++) {
      var url = URL.createObjectURL(images[j]);
      var d = document.createElement('div');
      d.className = 'thumb';
      d.innerHTML = '<img src="' + url + '" alt="Package image"><span>✓</span>';
      thumbs.appendChild(d);
    }
  }

  var analyzeBtn = document.getElementById('analyzeBtn');
  if (analyzeBtn) analyzeBtn.disabled = images.length === 0;

  if (images.length > 0 && typeof showToast === 'function') {
    showToast(images.length + ' image(s) ready for analysis.', 'Images uploaded');
  }
}

function runAnalysis() {
  // Try state.files first, fall back to reading fileInput directly
  var files = state.files;
  if (!files || files.length === 0) {
    var fileInput = document.getElementById('fileInput');
    if (fileInput && fileInput.files && fileInput.files.length > 0) {
      files = [];
      for (var i = 0; i < fileInput.files.length; i++) {
        files.push(fileInput.files[i]);
      }
      state.files = files;
    }
  }

  if (!files || files.length === 0) {
    if (typeof showToast === 'function') showToast('Please upload at least one image first.', 'No image');
    return;
  }

  var analyzeBtn = document.getElementById('analyzeBtn');
  if (analyzeBtn) analyzeBtn.disabled = true;

  // Show scanning state
  showScanningState();

  // Try backend first, then demo
  var formData = new FormData();
  formData.append('file', files[0]);

  fetch(API_BASE + '/scan', {
    method: 'POST',
    body: formData,
  })
  .then(function(response) {
    if (!response.ok) throw new Error('Server returned ' + response.status);
    return response.json();
  })
  .then(function(report) {
    finishAnalysis(report, true);
  })
  .catch(function(err) {
    console.log('Backend unavailable, using demo:', err.message);
    var demoReport = generateDemoReport(files[0].name || 'image.jpg');
    finishAnalysis(demoReport, false);
  });
}

function finishAnalysis(report, usedBackend) {
  state.lastReport = report;
  state.inspected = true;

  // Show results in the matrix
  showAnalysisResults(report, usedBackend);

  // Save to Product Repository + Report Center
  saveToProductRepository(report);
  saveToReportCenter(report);

  // Re-render views
  if (typeof renderRepo === 'function') renderRepo();
  if (typeof renderReports === 'function') renderReports();
  if (typeof renderRecent === 'function') renderRecent();

  var analyzeBtn = document.getElementById('analyzeBtn');
  if (analyzeBtn) analyzeBtn.disabled = false;

  if (typeof showToast === 'function') {
    showToast('Scan complete — ' + report.compliance_percentage + '% compliance.', usedBackend ? 'OCR Analysis' : 'Demo Analysis');
  }
}

function showScanningState() {
  var scanState = document.getElementById('scanState');
  if (scanState) {
    scanState.style.display = '';
    scanState.className = 'scan-state';
    scanState.innerHTML = '<div class="scan-art"><div class="scan-line"></div><div class="scan-corner c1"></div><div class="scan-corner c2"></div><div class="scan-corner c3"></div><div class="scan-corner c4"></div><span>SCANNING</span></div><h3>Analyzing with OCR engine…</h3><p>Extracting text and running Legal Metrology rule checks.</p>';
  }
  var analysisContent = document.getElementById('analysisContent');
  if (analysisContent) analysisContent.style.display = 'none';
}

function showAnalysisResults(report, usedBackend) {
  // Update stepper
  var steps = document.querySelectorAll('.stepper .step');
  for (var i = 0; i < steps.length; i++) {
    steps[i].classList.toggle('active', i <= 2);
  }

  // Hide scan state, show results
  var scanState = document.getElementById('scanState');
  if (scanState) scanState.style.display = 'none';
  var analysisContent = document.getElementById('analysisContent');
  if (analysisContent) analysisContent.style.display = '';

  // Update product strip
  var pName = (report.extracted_fields && report.extracted_fields.product_name) || report.source_file || 'Scanned Product';
  var productNameEl = document.getElementById('productName');
  var productMetaEl = document.getElementById('productMeta');
  if (productNameEl) productNameEl.textContent = pName;
  if (productMetaEl) productMetaEl.textContent = (report.source_file || 'Image') + ' · ' + report.compliance_percentage + '% compliance' + (usedBackend ? '' : ' (demo)');

  // Update overall badge
  var overallBadge = document.getElementById('overallBadge');
  if (overallBadge) {
    overallBadge.textContent = report.overall_status;
    var cls = report.overall_status === 'Compliant' ? 'ok' : report.overall_status === 'Non-compliant' ? 'fail' : 'warning';
    overallBadge.className = 'status-badge ' + cls;
  }

  // Render declaration matrix
  var matrix = document.getElementById('matrix');
  if (matrix && report.rule_results) {
    var html = '';
    for (var j = 0; j < report.rule_results.length; j++) {
      var r = report.rule_results[j];
      var sc = r.status === 'pass' ? 'ok' : 'fail';
      var sl = r.status === 'pass' ? 'Pass' : 'Fail';
      html += '<div class="matrix-row"><div class="label">' + r.rule_id + ' · ' + r.rule_name + '</div><div class="value">' + r.extracted_value + '</div><span class="matrix-check ' + sc + '">' + sl + '</span></div>';
    }

    var pctClass = report.compliance_percentage >= 90 ? 'ok' : report.compliance_percentage >= 60 ? 'warn' : 'fail';
    html += '<div class="matrix-row" style="background:#f8f9fc;font-weight:700"><div class="label">OVERALL COMPLIANCE</div><div class="value">' + report.rules_passed + '/' + report.total_rules + ' rules passed</div><span class="matrix-check ' + pctClass + '">' + report.compliance_percentage + '%</span></div>';

    matrix.innerHTML = html;
  }
}

function saveToProductRepository(report) {
  var pName = (report.extracted_fields && report.extracted_fields.product_name) || report.source_file || 'Scanned Product';
  var inspectorName = state.user ? state.user.name : 'Inspector';
  var now = new Date();
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var dateStr = now.getDate() + ' ' + months[now.getMonth()] + ' ' + now.getFullYear();

  var newProduct = {
    name: pName,
    category: 'Scanned',
    id: report.report_id || ('LM-' + now.getFullYear() + '-' + String(now.getHours()).padStart(2,'0') + String(now.getMinutes()).padStart(2,'0') + String(now.getSeconds()).padStart(2,'0')),
    status: report.overall_status || 'Review needed',
    flags: report.rules_failed || 0,
    inspector: inspectorName,
    updated: dateStr,
    net: (report.extracted_fields && report.extracted_fields.net_quantity) || '—',
    mrp: (report.extracted_fields && report.extracted_fields.mrp) || '—',
    image: null
  };

  state.products.unshift(newProduct);
}

function saveToReportCenter(report) {
  var pName = (report.extracted_fields && report.extracted_fields.product_name) || report.source_file || 'Scanned Product';
  var now = new Date();
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var dateStr = now.getDate() + ' ' + months[now.getMonth()] + ' ' + now.getFullYear();

  var newReport = {
    title: pName + ' — Inspection Report',
    id: report.report_id || ('REP-' + now.getFullYear() + '-' + String(now.getHours()).padStart(2,'0') + String(now.getMinutes()).padStart(2,'0')),
    status: 'Final',
    meta: (report.total_rules || 9) + ' declarations · ' + (report.rules_failed || 0) + ' flags',
    date: dateStr
  };

  state.reports.unshift(newReport);
}

function generateDemoReport(filename) {
  var now = new Date();
  return {
    report_id: 'REP-' + now.getFullYear() + '-' + String(now.getMonth()+1).padStart(2,'0') + String(now.getDate()).padStart(2,'0') + String(now.getHours()).padStart(2,'0') + String(now.getMinutes()).padStart(2,'0'),
    generated_at: now.toISOString(),
    source_file: filename,
    overall_status: 'Review needed',
    compliance_percentage: 77.8,
    total_rules: 9,
    rules_passed: 7,
    rules_failed: 2,
    extracted_fields: {
      manufacturer: 'AquaPure Foods Pvt. Ltd., Patna, Bihar - 800001',
      product_name: 'AquaPure Drinking Water',
      net_quantity: '1 L',
      mrp: '₹20.00',
      dates: 'Manufacturing Date: 08/2026',
      consumer_care: 'Phone: 1800-000-2026 | Email: care@aquapure.demo',
      country_of_origin: 'India',
      fssai: 'Not detected',
      batch_number: 'B.No: AQ-2026-0821'
    },
    rule_results: [
      { rule_id: 'R1', rule_name: 'Manufacturer / Packer / Importer', section: 'Rule 6(1)(a)', status: 'pass', detail: 'Detected on label', extracted_value: 'AquaPure Foods Pvt. Ltd., Patna, Bihar' },
      { rule_id: 'R2', rule_name: 'Common Product Name', section: 'Rule 6(1)(b)', status: 'pass', detail: 'Detected on label', extracted_value: 'AquaPure Drinking Water' },
      { rule_id: 'R3', rule_name: 'Net Quantity', section: 'Rule 6(1)(c)', status: 'pass', detail: 'Detected on label', extracted_value: '1 L' },
      { rule_id: 'R4', rule_name: 'MRP', section: 'Rule 6(1)(d)', status: 'pass', detail: 'Detected on label', extracted_value: '₹20.00 (inclusive of all taxes)' },
      { rule_id: 'R5', rule_name: 'Mfg / Pkg Date', section: 'Rule 6(1)(e)', status: 'pass', detail: 'Detected on label', extracted_value: '08 / 2026' },
      { rule_id: 'R6', rule_name: 'Consumer Care', section: 'Rule 6(1)(f)', status: 'pass', detail: 'Detected on label', extracted_value: '1800-000-2026 · care@aquapure.demo' },
      { rule_id: 'R7', rule_name: 'Country of Origin', section: 'Rule 6(1)(g)', status: 'pass', detail: 'Detected on label', extracted_value: 'India' },
      { rule_id: 'R8', rule_name: 'FSSAI License', section: 'FSSAI Act 2006', status: 'fail', detail: 'Not found on label', extracted_value: 'Not detected' },
      { rule_id: 'R9', rule_name: 'Batch / Lot Number', section: 'Rule 6(1)(h)', status: 'fail', detail: 'Not found on label', extracted_value: 'Not detected' }
    ],
    raw_ocr_text: '(Demo mode — connect backend for real OCR)'
  };
}