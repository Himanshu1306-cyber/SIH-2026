function go(
  page
){

  state.currentPage =
    page;


  $$(".page")
    .forEach(
      section => {

        section.classList.toggle(
          "active",
          section.id ===
            `page-${page}`
        );

      }
    );


  $$(".nav-item")
    .forEach(
      item => {

        item.classList.toggle(
          "active",
          item.dataset.page ===
            page
        );

      }
    );


  const names = {

    overview:
      "Compliance Overview",

    inspection:
      "New Inspection",

    repository:
      "Product Repository",

    reports:
      "Report Center",

    rules:
      "Rule Engine"

  };


  document.getElementById(
    "pageTitle"
  ).textContent =
    names[page] ||
    "Compliance Overview";


  window.scrollTo({
    top:0,
    behavior:"smooth"
  });

}


document.addEventListener(
  "click",
  event => {

    const pageButton =
      event.target.closest(
        "[data-page]"
      );


    if (
      pageButton
    ){

      event.preventDefault();


      go(
        pageButton.dataset.page
      );

    }


    const closeButton =
      event.target.closest(
        "[data-close]"
      );


    if (
      closeButton
    ){

      closeModal(
        closeButton.dataset.close
      );


      if (
        closeButton.dataset.page
      ){

        go(
          closeButton.dataset.page
        );

      }

    }


    const row =
      event.target.closest(
        "[data-product-index]"
      );


    if (
      row &&
      !event.target.closest(
        "button"
      )
    ){

      openProduct(
        Number(
          row.dataset.productIndex
        )
      );

    }


    const action =
      event.target.closest(
        "[data-action]"
      );


    if (
      action
    ){

      const index =
        Number(
          action.dataset.index
        );


      const product =
        state.products[index];


      if (
        action.dataset.action ===
        "open"
      ){

        openProduct(
          index
        );

      }


      if (
        action.dataset.action ===
        "report"
      ){

        generateReport(
          product
        );

      }

    }

  }
);


function setPageData(){

  renderRecent();

  renderRepo();

  renderReports();

  renderChecks();

  renderRules();

}


document
  .getElementById(
    "watchDemo"
  )
  .addEventListener(
    "click",
    () =>
      openModal(
        "demoModal"
      )
  );


document
  .getElementById(
    "notifyBtn"
  )
  .addEventListener(
    "click",
    () =>
      showToast(
        "3 items are waiting for inspector review.",
        "Notifications"
      )
  );


document
  .getElementById(
    "profileBtn"
  )
  .addEventListener(
    "click",
    () =>
      showToast(
        "Signed in as Demo Inspector.",
        "Account"
      )
  );


document
  .getElementById(
    "newReportBtn"
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
    "repoSearch"
  )
  .addEventListener(
    "input",
    renderRepo
  );


document
  .getElementById(
    "statusFilter"
  )
  .addEventListener(
    "change",
    renderRepo
  );


document
  .getElementById(
    "categoryFilter"
  )
  .addEventListener(
    "change",
    renderRepo
  );


document
  .getElementById(
    "globalSearch"
  )
  .addEventListener(
    "keydown",
    event => {

      if (
        event.key ===
        "Enter"
      ){

        const query =
          event.target
            .value
            .trim();


        document.getElementById(
          "repoSearch"
        ).value =
          query;


        go(
          "repository"
        );


        renderRepo();


        showToast(

          query

            ? `Showing results for “${query}”.`

            : "Repository opened.",

          "Search"

        );

      }

    }
  );


window.go =
  go;


window.setPageData =
  setPageData;


setPageData();
