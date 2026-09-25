(function () {

  let filter = "all";


  function allData() {

    let base = [
      ...window.LabelGuardData.repo
    ];


    try {

      const saved =
        JSON.parse(
          localStorage.getItem(
            "labelguard_cases"
          ) || "[]"
        );


      base = [
        ...saved,
        ...base
      ];

    } catch (error) {

      console.warn(
        "Could not load local history.",
        error
      );

    }


    return base;

  }


  function statusLabel(status) {

    if (status === "ok") {
      return "Compliant";
    }

    if (status === "bad") {
      return "Violation";
    }

    return "Partial";

  }


  function formatDate(dateValue) {

    const date =
      new Date(dateValue);


    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return dateValue;
    }


    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }
    );

  }


  window.renderRepository =
    function () {

      const query =
        (
          document
            .getElementById(
              "repoSearch"
            )
            .value || ""
        )
        .toLowerCase();


      const rows =
        allData().filter(
          (row) => {

            const text =
              row
                .join(" ")
                .toLowerCase();


            const queryMatch =
              !query ||
              text.includes(query);


            const filterMatch =
              filter === "all" ||
              row[4] === filter;


            return (
              queryMatch &&
              filterMatch
            );

          }
        );


      document.getElementById(
        "repoTable"
      ).innerHTML =

        rows.length

          ? rows
              .map(
                row => `

                  <tr>

                    <td>
                      <code>
                        ${row[0]}
                      </code>
                    </td>

                    <td>
                      <strong>
                        ${row[1]}
                      </strong>
                    </td>

                    <td>
                      ${row[2]}
                    </td>

                    <td>
                      ${row[3]}
                    </td>

                    <td>

                      <span
                        class="
                          status-chip
                          ${row[4]}
                        "
                      >
                        ${statusLabel(
                          row[4]
                        )}
                      </span>

                    </td>

                    <td>
                      ${formatDate(
                        row[5]
                      )}
                    </td>

                    <td>
                      ${row[6]}
                    </td>

                    <td>

                      <button
                        class="
                          btn
                          btn-secondary
                          btn-sm
                        "
                        data-repo-open="${row[0]}"
                      >
                        Open
                      </button>

                    </td>

                  </tr>

                `
              )
              .join("")

          : `

              <tr>

                <td colspan="8">

                  <div class="no-results">

                    No matching
                    inspections found.

                  </div>

                </td>

              </tr>

            `;

    };


  window.attachRepository =
    function () {

      document
        .getElementById(
          "repoSearch"
        )
        .addEventListener(
          "input",
          window.renderRepository
        );


      const filters = [

        [
          "all",
          "All"
        ],

        [
          "ok",
          "Compliant"
        ],

        [
          "warn",
          "Partial"
        ],

        [
          "bad",
          "Violation"
        ]

      ];


      document.getElementById(
        "filterRow"
      ).innerHTML =

        filters
          .map(
            filterItem => `

              <button
                class="
                  filter-chip
                  ${
                    filterItem[0] === "all"
                      ? "active"
                      : ""
                  }
                "
                data-filter="${filterItem[0]}"
              >
                ${filterItem[1]}
              </button>

            `
          )
          .join("");


      document
        .querySelectorAll(
          "[data-filter]"
        )
        .forEach(
          button => {

            button.addEventListener(
              "click",
              function () {

                document
                  .querySelectorAll(
                    "[data-filter]"
                  )
                  .forEach(
                    item =>
                      item.classList.remove(
                        "active"
                      )
                  );


                button.classList.add(
                  "active"
                );


                filter =
                  button.dataset.filter;


                window.renderRepository();

              }
            );

          }
        );


      window.renderRepository();

    };


  window.openRepositoryCase =
    function (id) {

      const row =
        allData().find(
          item =>
            item[0] === id
        );


      if (!row) {

        window.showToast(
          "Case not found."
        );

        return;

      }


      if (
        window.__lastScan &&
        window.__lastScan.id === id
      ) {

        window.renderReport(
          window.__lastScan
        );

      } else {

        window.renderReport({

          id: row[0],

          product: row[1],

          category: row[3],

          channel: "—",

          location: "—",

          date:
            new Date(row[5]),

          results:
            window.LabelGuardRules
              .map(
                rule => ({

                  title:
                    rule.title,

                  rule:
                    rule.rule,

                  status:
                    row[4] === "ok"
                      ? "ok"
                      : row[4] === "bad"
                        ? "bad"
                        : "warn",

                  note:
                    row[4] === "ok"
                      ? "Repository case marked compliant."
                      : row[4] === "bad"
                        ? "Repository case contains a violation flag."
                        : "Repository case requires review."

                })
              )

        });

      }


      window.showView(
        "report"
      );

    };

})();