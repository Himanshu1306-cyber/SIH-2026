/**
 * LabelGuard AI — Application Main Controller & Router
 */

let showToastTimer = null;
const PAGE_KEY = 'labelguard_page';

function showToast(text, title = 'Done') {
  const toastText = $('#toastText');
  const toastTitle = $('#toast strong');
  const toast = $('#toast');
  if (!toast) return;

  if (toastText) toastText.textContent = text;
  if (toastTitle) toastTitle.textContent = title;
  toast.classList.add('show');

  clearTimeout(showToastTimer);
  showToastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}

function go(page) {
  state.currentPage = page;

  // Persist current page so reloads return here
  try { sessionStorage.setItem(PAGE_KEY, page); } catch(e) {}

  $$('.page').forEach(p => p.classList.toggle('active', p.id === `page-${page}`));
  $$('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.page === page));

  const names = {
    'overview': 'Compliance Overview',
    'inspection': 'New Inspection',
    'repository': 'Product Repository',
    'reports': 'Report Center',
    'rules': 'Rule Engine',
    'admin-overview': 'Admin Dashboard',
    'admin-inspectors': 'Inspector Management'
  };

  const titleEl = $('#pageTitle');
  if (titleEl) titleEl.textContent = names[page] || 'SCAN SETU AI';

  const eyebrow = $('#pageEyebrow');
  if (eyebrow) {
    if (page.startsWith('admin')) {
      eyebrow.textContent = 'ADMIN CONSOLE';
    } else {
      eyebrow.textContent = 'ENFORCEMENT CONSOLE';
    }
  }

  // Render admin pages on navigation
  if (page === 'admin-overview' && typeof renderAdminOverview === 'function') renderAdminOverview();
  if (page === 'admin-inspectors' && typeof renderAdminInspectors === 'function') renderAdminInspectors();

  // Close mobile sidebar if open
  const sidebar = $('.sidebar');
  if (sidebar) sidebar.classList.remove('open');

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleMobileSidebar() {
  const sidebar = $('.sidebar');
  if (sidebar) sidebar.classList.toggle('open');
}

document.addEventListener('DOMContentLoaded', () => {
  // Check if session exists BEFORE hiding app shell
  const hasAuth = sessionStorage.getItem('labelguard_auth');
  const appShell = $('#appShell');
  const authPage = $('#page-auth');

  if (!hasAuth && !state.user) {
    if (appShell) appShell.style.display = 'none';
    if (authPage) authPage.style.display = 'flex';
  } else {
    if (appShell) appShell.style.display = 'flex';
    if (authPage) authPage.style.display = 'none';
  }

  // Initialize auth system (auto-restores session from sessionStorage)
  if (typeof initAuth === 'function') initAuth();
  if (typeof initAddInspectorForm === 'function') initAddInspectorForm();

  // Boot data for inspector views
  if (typeof setPageData === 'function') setPageData();
  if (typeof initScanner === 'function') initScanner();

  // Restore page state from sessionStorage if logged in
  if (state.user || hasAuth) {
    const savedPage = sessionStorage.getItem(PAGE_KEY);
    if (savedPage && savedPage !== 'auth') {
      go(savedPage);
    } else {
      go(state.user && state.user.role === 'admin' ? 'admin-overview' : 'scan');
    }
  }

  // Mobile menu button binding
  const menuBtn = $('#mobileMenuBtn');
  if (menuBtn) menuBtn.addEventListener('click', toggleMobileSidebar);

  // Logout button
  const logoutBtn = $('#logoutBtn');
  if (logoutBtn) logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof logout === 'function') logout();
    try { sessionStorage.removeItem(PAGE_KEY); } catch(ex) {}
    if (typeof showToast === 'function') showToast('You have been signed out.', 'Logged out');
  });

  // Global event delegation
  document.addEventListener('click', e => {
    const pageBtn = e.target.closest('[data-page]');
    if (pageBtn) {
      e.preventDefault();
      go(pageBtn.dataset.page);
      return; // stop further processing
    }

    const close = e.target.closest('[data-close]');
    if (close) {
      if (typeof closeModal === 'function') closeModal(close.dataset.close);
      if (close.dataset.page) go(close.dataset.page);
      return;
    }

    const row = e.target.closest('[data-product-index]');
    if (row && !e.target.closest('button')) {
      if (typeof openProduct === 'function') openProduct(Number(row.dataset.productIndex));
      return;
    }

    const action = e.target.closest('[data-action]');
    if (action) {
      const i = Number(action.dataset.index);
      const p = state.products[i];
      if (action.dataset.action === 'open' && typeof openProduct === 'function') openProduct(i);
      if (action.dataset.action === 'report' && typeof generateReport === 'function') generateReport(p);
      return;
    }

    // Open Add Inspector Modal
    const addInspBtn = e.target.closest('#addInspectorBtn');
    if (addInspBtn && typeof openModal === 'function') {
      openModal('addInspectorModal');
      return;
    }
  });

  // Additional action bindings
  const generateReportBtn = $('#generateReport');
  if (generateReportBtn) generateReportBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof generateReport === 'function') generateReport(state.products[0]);
  });

  const addEvidenceBtn = $('#addEvidence');
  if (addEvidenceBtn) addEvidenceBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    showToast('Evidence slot added to the inspection record.', 'Evidence attached');
  });

  const watchDemoBtn = $('#watchDemo');
  if (watchDemoBtn) watchDemoBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof openModal === 'function') openModal('demoModal');
  });

  const notifyBtn = $('#notifyBtn');
  if (notifyBtn) notifyBtn.addEventListener('click', () => showToast('3 items are waiting for inspector review.', 'Notifications'));

  const profileBtn = $('#profileBtn');
  if (profileBtn) profileBtn.addEventListener('click', () => {
    if (state.user) showToast(`Signed in as ${state.user.name} (${state.user.role}).`, 'Account');
  });

  const newReportBtn = $('#newReportBtn');
  if (newReportBtn) newReportBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof generateReport === 'function') generateReport(state.products[0]);
  });

  const repoSearch = $('#repoSearch');
  if (repoSearch) repoSearch.addEventListener('input', () => { if (typeof renderRepo === 'function') renderRepo(); });

  const statusFilter = $('#statusFilter');
  if (statusFilter) statusFilter.addEventListener('change', () => { if (typeof renderRepo === 'function') renderRepo(); });

  const categoryFilter = $('#categoryFilter');
  if (categoryFilter) categoryFilter.addEventListener('change', () => { if (typeof renderRepo === 'function') renderRepo(); });

  const globalSearch = $('#globalSearch');
  if (globalSearch) {
    globalSearch.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const q = e.target.value.trim();
        const repoSearchInput = $('#repoSearch');
        if (repoSearchInput) repoSearchInput.value = q;
        go('repository');
        if (typeof renderRepo === 'function') renderRepo();
        showToast(q ? `Showing results for "${q}".` : 'Repository opened.', 'Search');
      }
    });
  }
});