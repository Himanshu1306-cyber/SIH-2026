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


    <div
      style="
        display:flex;
        justify-content:flex-end;
        gap:8px;
        margin-top:15px
      "
    >

      <button
        class="btn"
        onclick="window.print()"
      >
        Print
      </button>


      <button
        class="btn primary"
        onclick="
          showToast(
            'Evidence review opened for ${product.id}.',
            'Review started'
          );
          closeModal('detailModal')
        "
      >
        Start review →
      </button>

    </div>

  `;


  openModal(
    "detailModal"
  );

}


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