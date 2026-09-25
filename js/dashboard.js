(function () {

  const D = window.LabelGuardData;


  function statusLabel(status) {

    if (status === "ok") {
      return "Compliant";
    }

    if (status === "bad") {
      return "Violation";
    }

    return "Partial";
  }


  function makeRow(row) {

    return `
      <tr>

        <td>
          <strong>${row[0]}</strong>
        </td>

        <td>
          ${row[1]}
        </td>

        <td>
          ${row[2]}
        </td>

        <td>

          <span class="status-chip ${row[4]}">
            ${statusLabel(row[4])}
          </span>

        </td>

        <td>
          ${row[5]}
        </td>

        <td>

          <button
            class="btn btn-secondary btn-sm"
            data-open-case="${row[0]}"
          >
            Open
          </button>

        </td>

      </tr>
    `;
  }


  window.renderDashboard = function () {

    const total = 2847;
    const compliant = 2190;
    const flagged = 657;
    const pending = 34;


    document.getElementById("statsGrid").innerHTML = [

      [
        "Products scanned",
        total,
        "▲ 128 this week",
        "delta-up"
      ],

      [
        "Compliant",
        compliant,
        "76.9% pass rate",
        "delta-up"
      ],

      [
        "Violations flagged",
        flagged,
        "▲ 6.2% vs last month",
        "delta-down"
      ],

      [
        "Reports pending review",
        pending,
        "Avg. 1.4 days to close",
        ""
      ]

    ]

      .map(
        (item) => `

          <div class="stat-card">

            <div class="stat-label">
              ${item[0]}
            </div>

            <div class="stat-value">
              ${item[1].toLocaleString()}
            </div>

            <div class="stat-delta ${item[3]}">
              ${item[2]}
            </div>

          </div>
        `
      )
      .join("");


    const max =
      Math.max(...D.dashboard.scans);


    document.getElementById("barsChart").innerHTML =
      D.dashboard.days
        .map(
          (day, i) => `

            <div
              style="
                flex:1;
                display:flex;
                flex-direction:column;
                align-items:center;
              "
            >

              <div class="bar-group">

                <div
                  class="bar scan"
                  style="
                    height:
                    ${(D.dashboard.scans[i] / max) * 145}px
                  "
                ></div>

                <div
                  class="bar violation"
                  style="
                    height:
                    ${(D.dashboard.violations[i] / max) * 145}px
                  "
                ></div>

              </div>

              <div class="bar-label">
                ${day}
              </div>

            </div>
          `
        )
        .join("");


    document.getElementById("violationsList").innerHTML =
      D.violationTypes
        .map(
          (item) => `

            <div class="viol-row">

              <div class="viol-name">
                ${item[0]}
              </div>

              <div class="viol-count ${item[2]}">
                ${item[1]}
              </div>

            </div>
          `
        )
        .join("");


    document.getElementById("recentTable").innerHTML =
      D.repo.slice(0, 5)
        .map(makeRow)
        .join("");
  };


  document.addEventListener("click", function (event) {

    const button =
      event.target.closest("[data-open-case]");

    if (!button) {
      return;
    }

    window.openRepositoryCase(
      button.dataset.openCase
    );

  });


})();