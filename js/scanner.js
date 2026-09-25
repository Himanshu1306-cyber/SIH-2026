(function () {

  let lastResults = [];
  let lastImageData = "";


  const defaultStatuses = {

    manufacturer: "ok",

    commodity: "ok",

    quantity: "ok",

    consumer: "ok",

    mrp: "bad",

    date: "warn",

    font: "warn",

    grouping: "ok"

  };


  const messages = {

    ok:
      "Detected in the demo analysis and marked compliant.",

    warn:
      "Detected, but a readability / presentation review is required.",

    bad:
      "Not detected or flagged for manual verification in the demo analysis."

  };


  function getFileInput() {

    return document.getElementById(
      "fileInput"
    );

  }


  window.attachScanner = function () {

    getFileInput()
      .addEventListener(
        "change",
        handleFiles
      );


    const dropZone =
      document.getElementById(
        "dropZone"
      );


    [
      "dragenter",
      "dragover"
    ].forEach((eventName) => {

      dropZone.addEventListener(
        eventName,
        (event) => {

          event.preventDefault();

          dropZone.classList.add(
            "dragging"
          );

        }
      );

    });


    [
      "dragleave",
      "drop"
    ].forEach((eventName) => {

      dropZone.addEventListener(
        eventName,
        (event) => {

          event.preventDefault();

          dropZone.classList.remove(
            "dragging"
          );

        }
      );

    });


    dropZone.addEventListener(
      "drop",
      (event) => {

        const files =
          [
            ...event.dataTransfer.files
          ]
          .filter(
            file =>
              file.type.startsWith(
                "image/"
              )
          );


        renderFiles(files);

      }
    );


    document
      .getElementById("scanBtn")
      .addEventListener(
        "click",
        runScan
      );

  };


  function handleFiles(event) {

    renderFiles(
      [...event.target.files]
    );

  }


  function renderFiles(files) {

    const wrap =
      document.getElementById(
        "previewGrid"
      );


    wrap.innerHTML = "";

    lastImageData = "";


    files
      .slice(0, 6)
      .forEach(
        (file, index) => {

          const reader =
            new FileReader();


          reader.onload = function () {

            const item =
              document.createElement(
                "div"
              );


            item.className =
              "preview-item";


            item.innerHTML = `

              <img
                src="${reader.result}"
                alt="Package panel ${index + 1}"
              />

              <span>
                Panel ${index + 1}
              </span>

            `;


            wrap.appendChild(item);


            if (index === 0) {

              lastImageData =
                reader.result;


              document
                .getElementById(
                  "evidenceImage"
                )
                .src =
                reader.result;

            }

          };


          reader.readAsDataURL(file);

        }
      );


    if (files.length) {

      window.showToast(
        `${files.length} image${
          files.length > 1
            ? "s"
            : ""
        } added for inspection.`
      );

    }

  }


  function runScan() {

    const product =
      document
        .getElementById(
          "productName"
        )
        .value
        .trim() ||
      "Sample Packaged Commodity";


    const base =
      {
        ...defaultStatuses
      };


    if (
      document
        .getElementById(
          "productCategory"
        )
        .value
        .includes("Personal")
    ) {

      base.consumer = "warn";

    }


    lastResults =
      window.LabelGuardRules.map(
        rule => ({

          ...rule,

          status:
            base[rule.id],

          note:
            messages[
              base[rule.id]
            ]

        })
      );


    window.__lastScan = {

      id:
        "LG-" +
        (
          20500 +
          Math.floor(
            Math.random() * 400
          )
        ),

      product,

      category:
        document
          .getElementById(
            "productCategory"
          )
          .value,

      channel:
        document
          .getElementById(
            "salesChannel"
          )
          .value,

      location:
        document
          .getElementById(
            "location"
          )
          .value,

      date:
        new Date(),

      results:
        lastResults,

      image:
        lastImageData || ""

    };


    renderResults(
      window.__lastScan
    );


    window.renderReport(
      window.__lastScan
    );


    window.showView(
      "report"
    );


    window.showToast(
      "Demo compliance analysis completed."
    );


    persistCase(
      window.__lastScan
    );

  }


  function renderResults(scan) {

    document
      .querySelectorAll(
        "#stepper .step"
      )
      .forEach(
        (step) => {

          step.classList.add(
            "active"
          );

        }
      );


    document
      .getElementById(
        "analysisSub"
      )
      .textContent =
      `${scan.id} · ${scan.product}`;


    const passed =
      scan.results.filter(
        result =>
          result.status === "ok"
      ).length;


    const score =
      Math.round(
        (
          passed /
          scan.results.length
        ) *
        100
      );


    const status =
      score >= 80
        ? "ok"
        : score >= 60
          ? "warn"
          : "bad";


    const chip =
      document.getElementById(
        "analysisStatus"
      );


    chip.className =
      `status-chip ${status}`;


    chip.textContent =
      status === "ok"
        ? "Mostly compliant"
        : status === "warn"
          ? "Review required"
          : "Violation found";


    document.getElementById(
      "checklist"
    ).innerHTML =

      scan.results
        .map(
          result => `

            <div class="check-item">

              <div
                class="
                  check-icon
                  status-${result.status}
                "
              >
                ${
                  result.status === "ok"
                    ? "✓"
                    : result.status === "warn"
                      ? "!"
                      : "×"
                }
              </div>


              <div class="check-main">

                <strong>
                  ${result.title}
                </strong>

                <span>
                  ${result.note}
                </span>

                <span class="rule-code">
                  ${result.rule}
                </span>

              </div>

            </div>
          `
        )
        .join("");


    const ringColor =
      status === "ok"
        ? "#267752"
        : status === "warn"
          ? "#9b7417"
          : "#b43a3a";


    document
      .getElementById(
        "scoreRing"
      )
      .style.background =
      `
        conic-gradient(
          ${ringColor}
          ${score * 3.6}deg,
          #e9edf2
          ${score * 3.6}deg
        )
      `;


    document
      .getElementById(
        "scoreRing"
      )
      .innerHTML = `

        <span>
          ${score}%
        </span>

        <small>
          compliance
        </small>

      `;


    document
      .getElementById(
        "scoreTitle"
      )
      .textContent =
      status === "ok"
        ? "Ready for closure"
        : status === "warn"
          ? "Manual review required"
          : "Violation review required";


    document
      .getElementById(
        "scoreText"
      )
      .textContent =
      `${passed} of ${
        scan.results.length
      } prototype checks passed. Findings must be verified against the physical package and official rule interpretation.`;


    if (lastImageData) {

      document
        .getElementById(
          "evidencePanel"
        )
        .hidden = false;


      document
        .getElementById(
          "evidenceImage"
        )
        .src =
        lastImageData;

    }

  }


  function persistCase(scan) {

    try {

      const existing =
        JSON.parse(
          localStorage.getItem(
            "labelguard_cases"
          ) || "[]"
        );


      existing.unshift({

        id:
          scan.id,

        product:
          scan.product,

        manufacturer:
          "Demo manufacturer",

        category:
          scan.category,

        status:
          scoreStatus(
            scan.results
          ),

        date:
          scan.date.toISOString(),

        officer:
          "R. Sharma"

      });


      localStorage.setItem(
        "labelguard_cases",
        JSON.stringify(
          existing.slice(
            0,
            50
          )
        )
      );

    } catch (error) {

      console.warn(
        "Could not save case history.",
        error
      );

    }

  }


  function scoreStatus(results) {

    const passed =
      results.filter(
        result =>
          result.status === "ok"
      ).length;


    const score =
      passed /
      results.length;


    if (score >= 0.8) {
      return "ok";
    }


    if (score >= 0.6) {
      return "warn";
    }


    return "bad";

  }


  window.getLastResults =
    () => lastResults;


  window.getLastImage =
    () => lastImageData;

})();