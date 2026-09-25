const dropzone =
  document.getElementById(
    "dropzone"
  );


const fileInput =
  document.getElementById(
    "fileInput"
  );


function handleFiles(
  fileList
){

  const images =
    [...fileList]

      .filter(
        file =>
          /^image\/(png|jpeg|jpg)$/
            .test(
              file.type
            )
      )

      .slice(
        0,
        4
      );


  state.files =
    images;


  const thumbs =
    document.getElementById(
      "thumbs"
    );


  thumbs.innerHTML =
    "";


  images.forEach(
    file => {

      const url =
        URL.createObjectURL(
          file
        );


      const div =
        document.createElement(
          "div"
        );


      div.className =
        "thumb";


      div.innerHTML = `

        <img
          src="${url}"
          alt="Package image"
        >

        <span>
          ✓
        </span>

      `;


      thumbs.appendChild(
        div
      );

    }
  );


  document.getElementById(
    "analyzeBtn"
  ).disabled =
    images.length === 0;


  if (images.length){

    showToast(

      `
        ${
          images.length
        }
        package image${
          images.length > 1
            ? "s"
            : ""
        }
        ready for analysis.
      `,

      "Images uploaded"

    );

  }

}


function buildMatrix(){

  const rows = [

    [
      "Product name",
      "AquaPure Drinking Water",
      "ok",
      "Detected"
    ],

    [
      "Manufacturer / packer",
      "AquaPure Foods Pvt. Ltd. · Patna, Bihar",
      "ok",
      "Detected"
    ],

    [
      "Net quantity",
      "1 L",
      "ok",
      "Detected"
    ],

    [
      "MRP",
      "₹20.00 (inclusive of all taxes)",
      "warn",
      "Review"
    ],

    [
      "Month / year",
      "08 / 2026",
      "ok",
      "Detected"
    ],

    [
      "Consumer care",
      "1800-000-2026 · care@aquapure.demo",
      "ok",
      "Detected"
    ],

    [
      "Font / readability",
      "Estimated 7 px on label crop",
      "fail",
      "Check"
    ],

    [
      "Placement / visibility",
      "MRP partly obscured in crop",
      "fail",
      "Flag"
    ]

  ];


  document.getElementById(
    "matrix"
  ).innerHTML =

    rows
      .map(
        row => `

          <div class="matrix-row">

            <div class="label">
              ${row[0]}
            </div>

            <div class="value">
              ${row[1]}
            </div>

            <span
              class="
                matrix-check
                ${row[2]}
              "
            >
              ${row[3]}
            </span>

          </div>

        `
      )
      .join("");


  document.getElementById(
    "overallBadge"
  ).textContent =
    "2 review flags";


  document.getElementById(
    "overallBadge"
  ).className =
    "status-badge warning";

}


function runScan(){

  document.getElementById(
    "analyzeBtn"
  ).disabled =
    true;


  document
    .querySelector(
      ".stepper .step:nth-of-type(1)"
    )
    ?.classList.remove(
      "active"
    );


  document.getElementById(
    "scanState"
  ).innerHTML = `

    <div class="scan-art">

      <div class="scan-line"></div>

      <div class="scan-corner c1"></div>
      <div class="scan-corner c2"></div>
      <div class="scan-corner c3"></div>
      <div class="scan-corner c4"></div>

      <span>
        SCANNING
      </span>

    </div>


    <h3>
      Extracting declarations…
    </h3>


    <p>
      OCR, field normalization and
      rule checks are running in the demo engine.
    </p>

  `;


  setTimeout(
    () => {

      state.inspected =
        true;


      document
        .querySelector(
          ".stepper .step:nth-of-type(3)"
        )
        ?.classList.add(
          "active"
        );


      document.getElementById(
        "scanState"
      ).classList.add(
        "hidden"
      );


      document.getElementById(
        "analysisContent"
      ).classList.remove(
        "hidden"
      );


      buildMatrix();


      document.getElementById(
        "analyzeBtn"
      ).disabled =
        false;


      showToast(
        "Extraction complete. 6 declarations reviewed.",
        "Analysis complete"
      );

    },

    1100

  );

}


if (
  dropzone &&
  fileInput
){

  [
    "dragenter",
    "dragover"

  ].forEach(
    eventName => {

      dropzone.addEventListener(
        eventName,
        event => {

          event.preventDefault();


          dropzone.style.borderColor =
            "#6b69ee";


          dropzone.style.background =
            "#f7f7ff";

        }
      );

    }
  );


  [
    "dragleave",
    "drop"

  ].forEach(
    eventName => {

      dropzone.addEventListener(
        eventName,
        event => {

          event.preventDefault();


          dropzone.style.borderColor =
            "";


          dropzone.style.background =
            "";

        }
      );

    }
  );


  dropzone.addEventListener(
    "drop",
    event => {

      handleFiles(
        event.dataTransfer.files
      );

    }
  );


  fileInput.addEventListener(
    "change",
    event => {

      handleFiles(
        event.target.files
      );

    }
  );

}


document
  .getElementById(
    "analyzeBtn"
  )
  .addEventListener(
    "click",
    runScan
  );


document
  .getElementById(
    "generateReport"
  )
  .addEventListener(
    "click",
    () =>
      generateReport(
        state.products[0]
      )
  );


document
  .getElementById(
    "addEvidence"
  )
  .addEventListener(
    "click",
    () =>
      showToast(
        "Evidence slot added to the inspection record.",
        "Evidence attached"
      )
  );


window.handleFiles =
  handleFiles;

window.buildMatrix =
  buildMatrix;

window.runScan =
  runScan;
