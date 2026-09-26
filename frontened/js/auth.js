/**
 * LabelGuard AI — Authentication Controller
 * Login state is persisted in sessionStorage to survive page reloads.
 */

const AUTH_KEY = 'labelguard_auth';

function initAuth() {
  const loginForm = $('#loginForm');
  const loginError = $('#loginError');
  const roleTabs = $$('.auth-role-tab');

  let selectedRole = 'inspector';

  // ── Restore session on page load ──
  const saved = sessionStorage.getItem(AUTH_KEY);
  if (saved) {
    try {
      const session = JSON.parse(saved);
      if (session && session.role && session.name && session.email) {
        loginAs(session.role, session.name, session.email, true);
        return; // Skip showing auth form
      }
    } catch (e) { /* ignore corrupt data */ }
  }

  // Role tab switching
  roleTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      selectedRole = tab.dataset.role;
      roleTabs.forEach(t => t.classList.toggle('active', t.dataset.role === selectedRole));
      if (loginError) loginError.textContent = '';
    });
  });

  // Login form submit
  if (loginForm) {
    loginForm.addEventListener('submit', e => {
      e.preventDefault();
      const email = $('#loginEmail').value.trim();
      const password = $('#loginPassword').value.trim();

      if (!email || !password) {
        if (loginError) loginError.textContent = 'Please enter both email and password.';
        return;
      }

      if (selectedRole === 'admin') {
        if (email === state.adminAccount.email && password === state.adminAccount.password) {
          loginAs('admin', state.adminAccount.name, email);
        } else {
          if (loginError) loginError.textContent = 'Invalid admin credentials.';
        }
      } else {
        const inspector = state.inspectors.find(i => i.email === email && i.password === password && i.status === 'Active');
        if (inspector) {
          loginAs('inspector', inspector.name, email);
        } else {
          if (loginError) loginError.textContent = 'Invalid inspector credentials or account inactive.';
        }
      }
    });
  }

  // Quick login buttons
  const quickAdmin = $('#quickAdmin');
  if (quickAdmin) quickAdmin.addEventListener('click', () => {
    loginAs('admin', state.adminAccount.name, state.adminAccount.email);
  });

  const quickInspector = $('#quickInspector');
  if (quickInspector) quickInspector.addEventListener('click', () => {
    const first = state.inspectors[0];
    if (first) loginAs('inspector', first.name, first.email);
  });
}

function loginAs(role, name, email, isRestore) {
  state.user = { role, name, email };

  // Persist to sessionStorage
  if (!isRestore) {
    sessionStorage.setItem(AUTH_KEY, JSON.stringify({ role, name, email }));
  }

  // Hide auth page, show app shell
  const authPage = $('#page-auth');
  const appShell = $('#appShell');
  if (authPage) authPage.style.display = 'none';
  if (appShell) appShell.style.display = 'flex';

  // Update profile display
  const avatarEl = $('.avatar');
  if (avatarEl) avatarEl.textContent = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  const profileName = $('.profile-copy strong');
  if (profileName) profileName.textContent = name;

  const profileRole = $('.profile-copy small');
  if (profileRole) profileRole.textContent = role === 'admin' ? 'System Administrator' : 'Enforcement Officer';

  // Show/hide nav items based on role
  updateNavForRole(role);

  // Navigate to default page (only on fresh login, not session restore)
  if (!isRestore) {
    if (role === 'admin') {
      go('admin-overview');
    } else {
      go('overview');
    }
    showToast(`Welcome back, ${name}.`, 'Signed in');
  }
}

function updateNavForRole(role) {
  $$('.nav-inspector').forEach(el => el.style.display = role === 'inspector' ? '' : 'none');
  $$('.nav-admin').forEach(el => el.style.display = role === 'admin' ? '' : 'none');
}

function logout() {
  state.user = null;
  state.currentPage = 'auth';

  // Clear persisted session
  sessionStorage.removeItem(AUTH_KEY);

  const authPage = $('#page-auth');
  const appShell = $('#appShell');
  if (authPage) authPage.style.display = '';
  if (appShell) appShell.style.display = 'none';

  // Clear form
  const loginEmail = $('#loginEmail');
  const loginPassword = $('#loginPassword');
  const loginError = $('#loginError');
  if (loginEmail) loginEmail.value = '';
  if (loginPassword) loginPassword.value = '';
  if (loginError) loginError.textContent = '';
}