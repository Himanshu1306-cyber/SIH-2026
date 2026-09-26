/**
 * LabelGuard AI — Dashboard Controller
 */

function renderRecent() {
  const tableEl = $('#recentTable');
  if (!tableEl) return;
  tableEl.innerHTML = state.products.slice(0, 5).map((p, i) => `
    <tr data-product-index="${i}">
      <td>
        <div class="product-cell">
          <div class="product-thumb">${p.category.slice(0, 3).toUpperCase()}</div>
          <div><strong>${p.name}</strong><span>${p.category}</span></div>
        </div>
      </td>
      <td>${p.id}</td>
      <td>${badge(p.status)}</td>
      <td>${p.updated}</td>
      <td><button class="action-link" data-action="open" data-index="${i}">Open</button></td>
    </tr>
  `).join('');
}

function renderChecks() {
  const checkGrid = $('#checkGrid');
  if (!checkGrid) return;
  const names = [
    ['⌗', 'Declaration presence', 'All mandatory fields', '92%'],
    ['Aa', 'Typography', 'Readability + size', '88%'],
    ['₹', 'MRP format', 'Price + visibility', '96%'],
    ['◫', 'Placement', 'Expected label region', '91%']
  ];
  checkGrid.innerHTML = names.map(n => `
    <div class="check-card">
      <div class="check-top">
        <div class="check-icon">${n[0]}</div>
        <span class="score ${Number(n[3].replace('%', '')) > 94 ? 'good' : 'warn'}">${n[3]}</span>
      </div>
      <strong>${n[1]}</strong>
      <span>${n[2]}</span>
    </div>
  `).join('');
}

function setPageData() {
  renderRecent();
  renderChecks();
  if (typeof renderRepo === 'function') renderRepo();
  if (typeof renderReports === 'function') renderReports();
  if (typeof renderRules === 'function') renderRules();
}