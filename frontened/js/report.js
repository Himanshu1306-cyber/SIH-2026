function renderReports(){

  const grid =
    document.getElementById(
      "reportGrid"
    );


  grid.innerHTML =
    state.reports
      .map(
        (r, i) => `

          <article
            class="report-card"
          >

            <div class="report-top">

              <div class="report-file">
                PDF
              </div>


              ${
                r.status === "Final"

                  ? `
                    <span class="status-badge ok">
                      Final
                    </span>
                  `

                  : `
                    <span class="status-badge warning">
                      Draft
                    </span>
                  `
              }

            </div>


            <h3>
              ${r.title}
            </h3>


            <p>
              ${r.id}
            </p>


            <div class="report-meta">

              <span>
                ${r.meta}
              </span>

              <span>
                •
              </span>

              <span>
                ${r.date}
              </span>

            </div>


            <div class="report-actions">

              <button
                class="btn"
                onclick="downloadReport(${i})"
              >
                Export
              </button>

            </div>

          </article>

        `
      )
      .join("");

}


function generateReport(
  product
){

  const report = {

    title:
      `${product.name} — Inspection Report`,

    id:
      `REP-2026-${
        Math.floor(
          420 +
          Math.random() *
          80
        )
      }`,

    status:
      "Draft",

    meta:
      `${
        Math.max(
          6,
          product.flags + 5
        )
      } declarations · ${
        product.flags
      } flags`,

    date:
      "25 Sep 2026"

  };


  state.reports.unshift(
    report
  );


  renderReports();


  showToast(
    "Digital report created. Open Report Center to export.",
    "Report generated"
  );


  go(
    "reports"
  );

}


function downloadReport(
  index
){

  const report =
    state.reports[index];


  const content = `

SCAN SETU AI — COMPLIANCE REPORT

Report:
${report.title}

Report ID:
${report.id}

Status:
${report.status}

Generated:
${report.date}

Summary:
${report.meta}


DEMO NOTE

This is a frontend demonstration report.
Actual OCR, legal rule validation and official
inspection workflow must be connected to your
backend/rule engine.

  `;


  const blob =
    new Blob(
      [content],
      {
        type:
          "text/plain"
      }
    );


  const link =
    document.createElement(
      "a"
    );


  link.href =
    URL.createObjectURL(
      blob
    );


  link.download =
    `${report.id}.txt`;


  link.click();


  URL.revokeObjectURL(
    link.href
  );


  showToast(
    "Demo report exported as a text file.",
    "Export complete"
  );

}


function openProduct(
  index
){

  const product =
    state.products[index];


  const findings = [

    [
      "ok",
      "Product identity",
      "Product name is detectable in the source image."
    ],

    [
      "ok",
      "Net quantity",
      "A numeric quantity and unit were detected."
    ],

    [

      product.status === "Compliant"
        ? "ok"
        : "fail",

      "MRP declaration",

      product.status === "Compliant"

        ? "MRP text is visible in the demo record."

        : "MRP region needs closer review for formatting / visibility."

    ],

    [

      product.flags > 2
        ? "fail"
        : "warn",

      "Typography",

      "Estimated label text size should be verified against the applicable rule configuration."

    ]

  ];


  document.getElementById(
    "modalBody"
  ).innerHTML = `

    <div class="detail-head">

      <div class="product-icon">

        ${product.category
          .slice(0,3)
          .toUpperCase()}

      </div>


      <div>

        <h2>
          ${product.name}
        </h2>

        <p>
          ${product.id}
          ·
          ${product.category}
          ·
          last updated
          ${product.updated}
        </p>

      </div>


      ${badge(product.status)}

    </div>


    <div class="detail-stats">

      <div class="detail-stat">

        <span>
          Net quantity
        </span>

        <strong>
          ${product.net}
        </strong>

      </div>


      <div class="detail-stat">

        <span>
          MRP
        </span>

        <strong>
          ${product.mrp}
        </strong>

      </div>


      <div class="detail-stat">

        <span>
          Flags
        </span>

        <strong>
          ${product.flags}
        </strong>

      </div>

    </div>


    <div style="margin-top:18px">

      <span class="section-kicker">
        FINDINGS
      </span>


      ${findings
        .map(
          finding => `

            <div
              class="
                finding
                ${finding[0]}
              "
            >

              <b>

                ${
                  finding[0] === "ok"
                    ? "✓"
                    : finding[0] === "fail"
                      ? "!"
                      : "~"
                }

              </b>


              <div>

                <strong>
                  ${finding[1]}
                </strong>

                <p>
                  ${finding[2]}
                </p>

              </div>

            </div>

          `
        )
        .join("")}

    </div>


    <div style="display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:8px; margin-top:20px; padding-top:14px; border-top:1px solid rgba(255,255,255,0.08)">
      <div style="display:flex; gap:8px;">
        <button class="btn" style="background:#10b981; color:#fff; border:none; font-weight:600;" onclick="updateProductStatus(${index}, 'Compliant')">✓ Mark Compliant</button>
        <button class="btn" style="background:#ef4444; color:#fff; border:none; font-weight:600;" onclick="updateProductStatus(${index}, 'Non-compliant')">✗ Mark Non-compliant</button>
      </div>
      <div style="display:flex; gap:8px;">
        <button class="btn" onclick="window.print()">Print</button>
        <button class="btn primary" onclick="toggleReviewForm(${index})">Start review →</button>
      </div>
    </div>
    <div id="reviewFormArea-${index}" style="display:none; margin-top:14px; padding:12px; background:rgba(255,255,255,0.03); border-radius:12px; border:1px solid rgba(255,255,255,0.08);">
      <h4 style="margin:0 0 8px 0; font-size:14px;">Adjudicate Compliance Status</h4>
      <div style="display:flex; gap:10px; margin-bottom:10px;">
        <label style="cursor:pointer;"><input type="radio" name="revStatus-${index}" value="Compliant" checked> Compliant</label>
        <label style="cursor:pointer;"><input type="radio" name="revStatus-${index}" value="Review needed"> Review needed</label>
        <label style="cursor:pointer;"><input type="radio" name="revStatus-${index}" value="Non-compliant"> Non-compliant</label>
      </div>
      <button class="btn primary" style="width:100%;" onclick="submitReviewForm(${index})">Save Review & Update Status</button>
    </div>
  `;

  openModal("detailModal");
}

window.updateProductStatus = function(index, newStatus) {
  if (typeof state !== 'undefined' && state.products && state.products[index]) {
    var prod = state.products[index];
    prod.status = newStatus;
    if (newStatus === 'Compliant') prod.flags = 0;
    
    // Also update matching report in state.reports
    if (state.reports) {
      for (var r = 0; r < state.reports.length; r++) {
        if (state.reports[r].id === prod.id || state.reports[r].title.indexOf(prod.name) !== -1) {
          state.reports[r].status = newStatus;
        }
      }
    }
    
    if (typeof showToast === 'function') {
      showToast(prod.name + ' updated to ' + newStatus + '.', 'Status Updated');
    }
    closeModal('detailModal');
    
    // Re-render views
    if (typeof renderRepo === 'function') renderRepo();
    if (typeof renderReports === 'function') renderReports();
    if (typeof renderRecent === 'function') renderRecent();
    if (typeof setPageData === 'function') setPageData();
  }
};

window.toggleReviewForm = function(index) {
  var el = document.getElementById('reviewFormArea-' + index);
  if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
};

window.submitReviewForm = function(index) {
  var radios = document.getElementsByName('revStatus-' + index);
  var val = 'Compliant';
  for (var i = 0; i < radios.length; i++) {
    if (radios[i].checked) val = radios[i].value;
  }
  updateProductStatus(index, val);
};


function openModal(
  id
){

  const modal =
    document.getElementById(
      id
    );


  if (!modal) return;


  modal.classList.add(
    "open"
  );


  modal.setAttribute(
    "aria-hidden",
    "false"
  );

}


function closeModal(
  id
){

  const modal =
    document.getElementById(
      id
    );


  if (!modal) return;


  modal.classList.remove(
    "open"
  );


  modal.setAttribute(
    "aria-hidden",
    "true"
  );

}


window.renderReports =
  renderReports;

window.generateReport =
  generateReport;

window.downloadReport =
  downloadReport;

window.openProduct =
  openProduct;

window.openModal =
  openModal;

window.closeModal =
  closeModal;