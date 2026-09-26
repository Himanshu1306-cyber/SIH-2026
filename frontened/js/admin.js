/**
 * LabelGuard AI — Admin Portal & Inspector Management Controller
 */

function renderAdminOverview() {
  const totalInspectors = state.inspectors.filter(i => i.status === 'Active').length;
  const totalInspections = state.inspectors.reduce((s, i) => s + i.inspections, 0);
  const totalFlags = state.inspectors.reduce((s, i) => s + i.flags, 0);
  const complianceRate = totalInspections > 0 ? Math.round(((totalInspections - totalFlags) / totalInspections) * 100) : 0;

  const el = $('#adminStatsGrid');
  if (el) {
    el.innerHTML = `
      <article class="stat-card"><div class="stat-icon indigo">👥</div><div><span>Active Inspectors</span><strong>${totalInspectors}</strong><small>Registered officers</small></div></article>
      <article class="stat-card"><div class="stat-icon green">📋</div><div><span>Total Inspections</span><strong>${totalInspections}</strong><small>Across all inspectors</small></div></article>
      <article class="stat-card"><div class="stat-icon red">⚠</div><div><span>Total Violations</span><strong>${totalFlags}</strong><small>Flagged items</small></div></article>
      <article class="stat-card"><div class="stat-icon amber">📊</div><div><span>Compliance Rate</span><strong>${complianceRate}%</strong><small>Overall performance</small></div></article>
    `;
  }

  // Inspector performance cards
  const perfGrid = $('#inspectorPerfGrid');
  if (perfGrid) {
    perfGrid.innerHTML = state.inspectors.filter(i => i.status === 'Active').map(ins => `
      <div class="inspector-perf-card">
        <div class="inspector-perf-avatar">${ins.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}</div>
        <div class="inspector-perf-info">
          <strong>${ins.name}</strong>
          <span>${ins.email}</span>
        </div>
        <div class="inspector-perf-stats">
          <div><span>Inspections</span><strong>${ins.inspections}</strong></div>
          <div><span>Flags</span><strong class="${ins.flags > 10 ? 'text-danger' : ''}">${ins.flags}</strong></div>
        </div>
      </div>
    `).join('');
  }

  // Violation feed
  const violationFeed = $('#violationFeed');
  if (violationFeed) {
    const violations = state.products.filter(p => p.status !== 'Compliant');
    violationFeed.innerHTML = violations.map(p => `
      <div class="violation-feed-item">
        <div class="violation-feed-icon">${p.category.slice(0, 3).toUpperCase()}</div>
        <div class="violation-feed-info">
          <strong>${p.name}</strong>
          <span>${p.id} · ${p.flags} flag${p.flags !== 1 ? 's' : ''} · Inspector: ${p.inspector}</span>
        </div>
        ${badge(p.status)}
      </div>
    `).join('') || '<p style="color:#8b95a3;text-align:center;padding:20px">No violations found.</p>';
  }
}

function renderAdminInspectors() {
  const tbody = $('#adminInspectorTable');
  if (!tbody) return;

  tbody.innerHTML = state.inspectors.map((ins, i) => `
    <tr>
      <td>
        <div class="product-cell">
          <div class="product-thumb" style="background:linear-gradient(135deg,#6a68ff,#24b8a2);color:#fff">${ins.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}</div>
          <div><strong>${ins.name}</strong><span>${ins.email}</span></div>
        </div>
      </td>
      <td>${ins.phone}</td>
      <td>${ins.address}</td>
      <td>${ins.inspections}</td>
      <td>${ins.flags ? `<span class="status-badge fail">${ins.flags}</span>` : '<span class="status-badge ok">0</span>'}</td>
      <td><span class="status-badge ${ins.status === 'Active' ? 'ok' : 'fail'}">${ins.status}</span></td>
      <td>${ins.joined}</td>
      <td><button class="btn-remove-inspector" data-inspector-index="${i}" title="Remove inspector">✕</button></td>
    </tr>
  `).join('');

  // Bind remove buttons
  $$('.btn-remove-inspector').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = Number(btn.dataset.inspectorIndex);
      removeInspector(idx);
    });
  });
}

function removeInspector(index) {
  const ins = state.inspectors[index];
  if (!ins) return;
  if (!confirm(`Remove inspector "${ins.name}"? This action cannot be undone.`)) return;

  state.inspectors.splice(index, 1);
  renderAdminInspectors();
  renderAdminOverview();
  if (typeof showToast === 'function') showToast(`Inspector "${ins.name}" has been removed.`, 'Inspector removed');
}

function initAddInspectorForm() {
  const form = $('#addInspectorForm');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = $('#inspectorName').value.trim();
    const phone = $('#inspectorPhone').value.trim();
    const address = $('#inspectorAddress').value.trim();
    const email = $('#inspectorEmail').value.trim();
    const password = $('#inspectorPassword').value.trim();

    if (!name || !phone || !address || !email || !password) {
      if (typeof showToast === 'function') showToast('Please fill in all fields.', 'Validation error');
      return;
    }

    // Check duplicate email
    if (state.inspectors.some(i => i.email.toLowerCase() === email.toLowerCase())) {
      if (typeof showToast === 'function') showToast('An inspector with this email already exists.', 'Duplicate email');
      return;
    }

    const newId = state.inspectors.length > 0 ? Math.max(...state.inspectors.map(i => i.id)) + 1 : 1;
    const today = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const joinedDate = `${String(today.getDate()).padStart(2, '0')} ${months[today.getMonth()]} ${today.getFullYear()}`;

    state.inspectors.push({
      id: newId,
      name,
      phone,
      address,
      email,
      password,
      inspections: 0,
      flags: 0,
      joined: joinedDate,
      status: 'Active'
    });

    // Reset form and close modal
    form.reset();
    if (typeof closeModal === 'function') closeModal('addInspectorModal');

    renderAdminInspectors();
    renderAdminOverview();
    if (typeof showToast === 'function') showToast(`Inspector "${name}" added successfully.`, 'Inspector added');
  });
}
