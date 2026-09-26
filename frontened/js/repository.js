function renderRepo(){

  const search =
    (
      document.getElementById(
        "repoSearch"
      )?.value || ""
    ).toLowerCase();


  const status =
    document.getElementById(
      "statusFilter"
    )?.value || "all";


  const category =
    document.getElementById(
      "categoryFilter"
    )?.value || "all";


  const rows =
    state.products

      .map(
        (product, index) => ({
          ...product,
          index
        })
      )

      .filter(
        product => {

          const text =
            `
              ${product.name}
              ${product.id}
              ${product.category}
            `
            .toLowerCase();


          const searchMatch =
            !search ||
            text.includes(
              search
            );


          const statusMatch =
            status === "all" ||
            product.status ===
              status;


          const categoryMatch =
            category === "all" ||
            product.category ===
              category;


          return (
            searchMatch &&
            statusMatch &&
            categoryMatch
          );

        }
      );


  document.getElementById(
    "repoTable"
  ).innerHTML =

    rows.length

      ? rows
          .map(
            product => `

              <tr
                data-product-index="${product.index}"
              >

                <td>

                  <div class="product-cell">

                    <div class="product-thumb">

                      ${product.category
                        .slice(0,3)
                        .toUpperCase()}

                    </div>


                    <div>

                      <strong>
                        ${product.name}
                      </strong>

                      <span>
                        ${product.net}
                        ·
                        ${product.mrp}
                      </span>

                    </div>

                  </div>

                </td>


                <td>
                  ${product.category}
                </td>


                <td>
                  ${product.id}
                </td>


                <td>
                  ${badge(product.status)}
                </td>


                <td>

                  ${
                    product.flags

                      ? `
                        <span class="status-badge fail">
                          ${product.flags}
                          flag${
                            product.flags > 1
                              ? "s"
                              : ""
                          }
                        </span>
                      `

                      : `
                        <span class="status-badge ok">
                          0 flags
                        </span>
                      `
                  }

                </td>


                <td>
                  ${product.inspector}
                </td>


                <td>
                  ${product.updated}
                </td>


                <td>

                  <button
                    class="action-link"
                    data-action="open"
                    data-index="${product.index}"
                  >
                    View
                  </button>

                </td>

              </tr>

            `
          )
          .join("")

      : `

          <tr>

            <td
              colspan="8"
              style="
                text-align:center;
                padding:32px;
                color:#9099a7
              "
            >

              No matching products.

            </td>

          </tr>

        `;

}


window.renderRepo =
  renderRepo;