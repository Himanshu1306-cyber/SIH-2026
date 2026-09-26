/**
 * LabelGuard AI — Packaging Scanner & OCR Matrix Controller
 * Unified controller to prevent duplicate event listeners between external JS and inline index.html script.
 */

(function() {
  var API_BASE = 'http://localhost:8000';

  // Delegate initScanner to the global setupScanner defined in index.html if available
  window.initScanner = function() {
    if (typeof window.setupScanner === 'function') {
      window.setupScanner();
    }
  };

  // Export helper functions globally
  window.runScannerAnalysis = function() {
    if (typeof window.doAnalysis === 'function') {
      window.doAnalysis();
    }
  };
})();