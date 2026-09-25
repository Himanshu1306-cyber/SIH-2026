/* =========================================================
   SCAN SETU
   Rule Engine / Declaration Checks
========================================================= */


/* ---------------------------------------------------------
   Rule data
--------------------------------------------------------- */

const declarationRules = [

  {
    number: "01",
    title: "Manufacturer / packer / importer details",
    description: "Presence + formatting",
    type: "Identity",
    enabled: true
  },

  {
    number: "02",
    title: "Common / generic product name",
    description: "Presence + readability",
    type: "Declaration",
    enabled: true
  },

  {
    number: "03",
    title: "Net quantity / standard unit",
    description: "Presence + unit consistency",
    type: "Quantity",
    enabled: true
  },

  {
    number: "04",
    title: "Maximum Retail Price (MRP)",
    description: "Presence + prescribed format",
    type: "Price",
    enabled: true
  },

  {
    number: "05",
    title: "Month & year of manufacture / packing / import",
    description: "Presence + date pattern",
    type: "Date",
    enabled: true
  },

  {
    number: "06",
    title: "Consumer care contact details",
    description: "Presence + readability",
    type: "Consumer",
    enabled: true
  },

  {
    number: "07",
    title: "Mandatory declaration placement",
    description: "Region + visibility",
    type: "Layout",
    enabled: true
  },

  {
    number: "08",
    title: "Font size & readability",
    description: "Pixel height + contrast",
    type: "Typography",
    enabled: false
  },

  {
    number: "09",
    title: "Misleading / non-standard representation",
    description: "Pattern + rule checks",
    type: "Risk",
    enabled: false
  }

];


/* ---------------------------------------------------------
   Make rules available globally
--------------------------------------------------------- */

window.SCAN_SETU_RULES =
  declarationRules;


/* ---------------------------------------------------------
   Render rule cards
--------------------------------------------------------- */

function renderRules() {

  const ruleList =
    document.getElementById(
      "ruleList"
    );


  if (!ruleList) {

    console.error(
      "SCAN SETU: #ruleList element not found."
    );

    return;

  }


  ruleList.innerHTML = "";


  declarationRules.forEach(
    (rule, index) => {

      const card =
        document.createElement(
          "div"
        );


      card.className =
        "rule-card";


      card.innerHTML = `

        <!-- Rule number -->

        <div class="rule-num">
          ${rule.number}
        </div>


        <!-- Rule information -->

        <div class="rule-copy">

          <strong>
            ${rule.title}
          </strong>

          <p>
            ${rule.description}
          </p>

        </div>


        <!-- Rule category -->

        <span class="rule-type">
          ${rule.type}
        </span>


        <!-- Toggle -->

        <button
          class="
            rule-toggle
            ${rule.enabled ? "on" : ""}
          "
          type="button"
          data-rule-index="${index}"
          aria-label="Toggle ${rule.title}"
          aria-pressed="${rule.enabled}"
        ></button>

      `;


      ruleList.appendChild(
        card
      );

    }
  );


  /* -------------------------------------------------------
     Toggle listeners
  ------------------------------------------------------- */

  const toggles =
    ruleList.querySelectorAll(
      ".rule-toggle"
    );


  toggles.forEach(
    toggle => {

      toggle.addEventListener(
        "click",
        () => {

          const index =
            Number(
              toggle.dataset.ruleIndex
            );


          const rule =
            declarationRules[index];


          rule.enabled =
            !rule.enabled;


          toggle.classList.toggle(
            "on",
            rule.enabled
          );


          toggle.setAttribute(
            "aria-pressed",
            String(
              rule.enabled
            )
          );


          showToast(

            `Rule ${
              rule.enabled
                ? "enabled"
                : "disabled"
            } for this demo session.`,

            "Rule updated"

          );

        }
      );

    }
  );

}


/* ---------------------------------------------------------
   Run render when DOM is ready
--------------------------------------------------------- */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    renderRules();

  }
);


/* ---------------------------------------------------------
   Export
--------------------------------------------------------- */

window.renderRules =
  renderRules;
