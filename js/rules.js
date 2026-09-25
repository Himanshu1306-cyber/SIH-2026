function renderRules(){

  const ruleList =
    document.getElementById(
      "ruleList"
    );


  ruleList.innerHTML =
    state.rules
      .map(
        (r, i) => `

          <div class="rule-card">

            <div class="rule-num">
              ${r[0]}
            </div>


            <div class="rule-copy">

              <strong>
                ${r[1]}
              </strong>

              <p>
                ${r[2]}
              </p>

            </div>


            <span class="rule-type">
              ${r[3]}
            </span>


            <button
              class="
                rule-toggle
                ${i < 8 ? "on" : ""}
              "
              aria-label="Toggle rule"
            ></button>

          </div>

        `
      )
      .join("");


  $$(".rule-toggle")
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            button.classList.toggle(
              "on"
            );


            showToast(
              `Rule ${
                button.classList.contains(
                  "on"
                )
                  ? "enabled"
                  : "disabled"
              } for demo session.`,
              "Rule updated"
            );

          }
        );

      }
    );

}


window.renderRules =
  renderRules;
