const state = {

  currentPage: "overview",

  files: [],

  inspected: false,


  products: [

    {
      name: "AquaPure Drinking Water",
      category: "Beverages",
      id: "LM-2026-00821",
      status: "Review needed",
      flags: 3,
      inspector: "D. Raj",
      updated: "25 Sep 2026",
      net: "1 L",
      mrp: "₹20.00"
    },

    {
      name: "DailyHarvest Basmati Rice",
      category: "Grocery",
      id: "LM-2026-00820",
      status: "Compliant",
      flags: 0,
      inspector: "A. Kumar",
      updated: "25 Sep 2026",
      net: "5 kg",
      mrp: "₹640.00"
    },

    {
      name: "FreshGlow Face Wash",
      category: "Personal Care",
      id: "LM-2026-00817",
      status: "Non-compliant",
      flags: 4,
      inspector: "R. Singh",
      updated: "24 Sep 2026",
      net: "100 ml",
      mrp: "₹145.00"
    },

    {
      name: "HomeCare Floor Cleaner",
      category: "Household",
      id: "LM-2026-00812",
      status: "Compliant",
      flags: 0,
      inspector: "S. Das",
      updated: "24 Sep 2026",
      net: "1 L",
      mrp: "₹110.00"
    },

    {
      name: "NutriBite Oats",
      category: "Grocery",
      id: "LM-2026-00808",
      status: "Review needed",
      flags: 2,
      inspector: "M. Patel",
      updated: "23 Sep 2026",
      net: "500 g",
      mrp: "₹99.00"
    },

    {
      name: "PureSip Fruit Drink",
      category: "Beverages",
      id: "LM-2026-00801",
      status: "Non-compliant",
      flags: 5,
      inspector: "D. Raj",
      updated: "22 Sep 2026",
      net: "750 ml",
      mrp: "₹75.00"
    }

  ],


  reports: [

    {
      title: "AquaPure — Inspection Report",
      id: "REP-2026-0418",
      status: "Draft",
      meta: "6 declarations · 3 flags",
      date: "25 Sep 2026"
    },

    {
      title: "FreshGlow Face Wash — Violation Summary",
      id: "REP-2026-0414",
      status: "Final",
      meta: "7 declarations · 4 flags",
      date: "24 Sep 2026"
    },

    {
      title: "DailyHarvest Basmati Rice — Compliance",
      id: "REP-2026-0411",
      status: "Final",
      meta: "7 declarations · 0 flags",
      date: "24 Sep 2026"
    },

    {
      title: "Monthly Enforcement Snapshot — September",
      id: "REP-2026-0402",
      status: "Final",
      meta: "128 inspections · 266 flags",
      date: "23 Sep 2026"
    }

  ],


  rules: [

    [
      "01",
      "Manufacturer / packer / importer details",
      "Presence + formatting",
      "Identity"
    ],

    [
      "02",
      "Common / generic product name",
      "Presence + readability",
      "Declaration"
    ],

    [
      "03",
      "Net quantity / standard unit",
      "Presence + unit consistency",
      "Quantity"
    ],

    [
      "04",
      "Maximum Retail Price (MRP)",
      "Presence + prescribed format",
      "Price"
    ],

    [
      "05",
      "Month & year of manufacture / packing / import",
      "Presence + date pattern",
      "Date"
    ],

    [
      "06",
      "Consumer care contact details",
      "Presence + readability",
      "Consumer"
    ],

    [
      "07",
      "Mandatory declaration placement",
      "Region + visibility",
      "Layout"
    ],

    [
      "08",
      "Font size & readability",
      "Pixel height + contrast",
      "Typography"
    ],

    [
      "09",
      "Misleading / non-standard representation",
      "Pattern + rule checks",
      "Risk"
    ]

  ]

};


const $ =
  (
    selector,
    root = document
  ) =>
    root.querySelector(selector);


const $$ =
  (
    selector,
    root = document
  ) =>
    [
      ...root.querySelectorAll(selector)
    ];


function showToast(
  text,
  title = "Done"
){

  const toast =
    document.getElementById(
      "toast"
    );

  if (!toast) return;


  const toastText =
    document.getElementById(
      "toastText"
    );

  if (toastText){
    toastText.textContent =
      text;
  }


  const strong =
    toast.querySelector(
      "strong"
    );

  if (strong){
    strong.textContent =
      title;
  }


  toast.classList.add(
    "show"
  );


  clearTimeout(
    showToast.t
  );


  showToast.t =
    setTimeout(
      () =>
        toast.classList.remove(
          "show"
        ),
      3000
    );

}


function badge(
  status
){

  const c =
    status === "Compliant"
      ? "ok"
      : status === "Non-compliant"
        ? "fail"
        : "warning";


  return `
    <span
      class="status-badge ${c}"
    >
      ${status}
    </span>
  `;

}


window.showToast =
  showToast;

window.badge =
  badge;
