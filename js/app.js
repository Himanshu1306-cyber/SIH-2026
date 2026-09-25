(function () {


  const titles = {

    dashboard: [
      "Enforcement Dashboard",
      "Legal Metrology (Packaged Commodities) Rules, 2011"
    ],

    scan: [
      "Scan Product Label",
      "Upload package panels and review prototype findings"
    ],

    report: [
      "Compliance Report",
      "Rule-based validation output and case evidence"
    ],

    repository: [
      "Product Repository",
      "Scanned products and inspection history"
    ],

    access: [
      "Officer Access",
      "Role-based permissions and secure-sign-in interface"
    ]

  };


  window.showView =
    function (name) {

      document
        .querySelectorAll(
          ".view"
        )
        .forEach(
          view =>
            view.classList.remove(
              "active"
            )
        );


      const target =
        document.getElementById(
          `view-${name}`
        );


      if (target) {

        target.classList.add(
          "active"
        );

      }


      document
        .querySelectorAll(
          ".nav-item"
        )
        .forEach(
          item =>
            item.classList.toggle(
              "active",
              item.dataset.view === name
            )
        );


      if (titles[name]) {

        document.getElementById(
          "pageTitle"
        ).textContent =
          titles[name][0];


        document.getElementById(
          "pageSubtitle"
        ).textContent =
          titles[name][1];

      }


      document
        .getElementById(
          "sidebar"
        )
        .classList.remove(
          "open"
        );


      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });

    };


  window.showToast =
    function (message) {

      const toast =
        document.getElementById(
          "toast"
        );


      toast.textContent =
        message;


      toast.classList.add(
        "show"
      );


      clearTimeout(
        window.__toastTimer
      );


      window.__toastTimer =
        setTimeout(
          function () {

            toast.classList.remove(
              "show"
            );

          },
          2400
        );

    };


  function init() {


    /* Navigation */

    document
      .querySelectorAll(
        ".nav-item"
      )
      .forEach(
        button => {

          button.addEventListener(
            "click",
            function () {

              window.showView(
                button.dataset.view
              );

            }
          );

        }
      );


    /* Internal buttons */

    document
      .querySelectorAll(
        "[data-go]"
      )
      .forEach(
        button => {

          button.addEventListener(
            "click",
            function () {

              window.showView(
                button.dataset.go
              );

            }
          );

        }
      );


    /* Mobile menu */

    document
      .getElementById(
        "menuBtn"
      )
      .addEventListener(
        "click",
        function () {

          document
            .getElementById(
              "sidebar"
            )
            .classList.toggle(
              "open"
            );

        }
      );


    /* Theme */

    document
      .getElementById(
        "themeBtn"
      )
      .addEventListener(
        "click",
        function () {

          document.body.classList.toggle(
            "dark"
          );


          localStorage.setItem(
            "labelguard_theme",
            document.body.classList.contains(
              "dark"
            )
              ? "dark"
              : "light"
          );

        }
      );


    if (
      localStorage.getItem(
        "labelguard_theme"
      ) === "dark"
    ) {

      document.body.classList.add(
        "dark"
      );

    }


    /* Sign in */

    document
      .getElementById(
        "signInBtn"
      )
      .addEventListener(
        "click",
        function () {

          const officerID =
            document
              .getElementById(
                "officerId"
              )
              .value
              .trim();


          const otp =
            document
              .getElementById(
                "otp"
              )
              .value
              .trim();


          const note =
            document.getElementById(
              "authNote"
            );


          if (
            officerID &&
            otp
          ) {

            note.textContent =
              "Demo sign-in successful. In production, authentication must be server-validated and audited.";

            window.showToast(
              "Demo authentication successful."
            );

          } else {

            note.textContent =
              "Enter Officer ID and OTP for the demo sign-in.";

            window.showToast(
              "Please complete the fields."
            );

          }

        }
      );


    /* Initial render */

    window.renderDashboard();

    window.attachScanner();

    window.attachReport();

    window.attachRepository();

  }


  /* Repository buttons */

  document.addEventListener(
    "click",
    function (event) {

      const button =
        event.target.closest(
          "[data-repo-open]"
        );


      if (!button) {
        return;
      }


      window.openRepositoryCase(
        button.dataset.repoOpen
      );

    }
  );


  document.addEventListener(
    "DOMContentLoaded",
    init
  );

})();