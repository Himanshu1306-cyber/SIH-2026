(function () {


  function badge(status) {

    return `
      <span class="status-chip ${status}">
        ${
          status === "ok"
            ? "Compliant"
            : status === "warn"
              ? "Review"
              : "Violation"
        }
      </span>
    `;

  }


  function escapeHTML(value) {

    return String(value).replace(
      /[&<>"']/g,

      function (character) {

        return {

          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#039;"

        }[character];

      }
    );

  }


  window.renderReport =
    function (scan) {

      if (!scan) {
        return;
      }


      const passed =
        scan.results.filter(
          item =>
            item.status === "ok"
        ).length;


      const warnings =
        scan.results.filter(
          item =>
            item.status === "warn"
        ).length;


      const violations =
        scan.results.filter(
          item =>
            item.status === "bad"
        ).length;


      const score =
        Math.round(
          (
            passed /
            scan.results.length
          ) *
          100
        );


      document.getElementById(
        "reportProduct"
      ).textContent =
        scan.product;


      document.getElementById(
        "reportMeta"
      ).textContent =
        `${scan.id} · ${scan.category} · ${scan.channel} · ${scan.location}`;


      document.getElementById(
        "reportScore"
      ).textContent =
        `${score}%`;


      document.getElementById(
        "reportSummary"
      ).innerHTML = `

        <div class="summary-box">

          <strong>
            ${passed}
          </strong>

          <span>
            Passed checks
          </span>

        </div>


        <div class="summary-box">

          <strong>
            ${warnings}
          </strong>

          <span>
            Review flags
          </span>

        </div>


        <div class="summary-box">

          <strong>
            ${violations}
          </strong>

          <span>
            Violations
          </span>

        </div>

      `;


      document.getElementById(
        "reportTable"
      ).innerHTML =

        scan.results
          .map(
            result => `

              <tr>

                <td>
                  ${escapeHTML(
                    result.title
                  )}
                </td>

                <td>
                  <code>
                    ${escapeHTML(
                      result.rule
                    )}
                  </code>
                </td>

                <td>
                  ${badge(
                    result.status
                  )}
                </td>

                <td>
                  ${escapeHTML(
                    result.note
                  )}
                </td>

              </tr>

            `
          )
          .join("");


      document.getElementById(
        "reportCaseId"
      ).textContent =
        scan.id;


      document.getElementById(
        "reportGenerated"
      ).textContent =
        scan.date.toLocaleString(
          "en-IN"
        );


      document.getElementById(
        "rulesReference"
      ).innerHTML =

        window.LabelGuardRuleReference
          .map(
            rule => `

              <div class="rule-ref">

                <b>
                  ${rule[0]}
                </b>

                <span>
                  ${rule[1]}
                </span>

              </div>

            `
          )
          .join("");

    };


  window.attachReport =
    function () {

      document
        .getElementById(
          "printBtn"
        )
        .addEventListener(
          "click",
          function () {

            window.showView(
              "report"
            );

            setTimeout(
              () =>
                window.print(),
              50
            );

          }
        );


      document
        .getElementById(
          "docBtn"
        )
        .addEventListener(
          "click",
          exportEditable
        );

    };


  function exportEditable() {

    const scan =
      window.__lastScan;


    if (!scan) {

      window.showToast(
        "Run a scan first."
      );

      return;

    }


    const html = `

      <html>

      <head>

        <meta charset="UTF-8">

        <title>
          ${escapeHTML(scan.id)}
          Compliance Report
        </title>

      </head>

      <body>

        <h1>
          LabelGuard AI — Compliance Report
        </h1>

        <h2>
          ${escapeHTML(
            scan.product
          )}
        </h2>

        <p>
          ${escapeHTML(scan.id)}
          |
          ${escapeHTML(scan.category)}
          |
          ${escapeHTML(scan.channel)}
          |
          ${escapeHTML(scan.location)}
        </p>

        <table
          border="1"
          cellpadding="7"
          cellspacing="0"
        >

          <tr>

            <th>
              Declaration / Check
            </th>

            <th>
              Rule
            </th>

            <th>
              Status
            </th>

            <th>
              Finding
            </th>

          </tr>


          ${scan.results
            .map(
              result => `

                <tr>

                  <td>
                    ${escapeHTML(
                      result.title
                    )}
                  </td>

                  <td>
                    ${escapeHTML(
                      result.rule
                    )}
                  </td>

                  <td>
                    ${escapeHTML(
                      result.status
                    )}
                  </td>

                  <td>
                    ${escapeHTML(
                      result.note
                    )}
                  </td>

                </tr>

              `
            )
            .join("")}

        </table>


        <p>
          Officer: R. Sharma
        </p>

      </body>

      </html>

    `;


    const blob =
      new Blob(
        [html],
        {
          type:
            "application/msword"
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
      `${scan.id}_Compliance_Report.doc`;


    link.click();


    URL.revokeObjectURL(
      link.href
    );


    window.showToast(
      "Editable report downloaded."
    );

  }

})();