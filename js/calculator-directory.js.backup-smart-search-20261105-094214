(function () {
  "use strict";

  var search = document.getElementById("calculatorSearch");
  var filters = document.getElementById("categoryFilters");
  var count = document.getElementById("calculatorCount");
  var empty = document.getElementById("calculatorEmpty");

  if (!search || !filters) return;

  var cards = Array.from(document.querySelectorAll(".calculator-card"));
  var sections = Array.from(document.querySelectorAll(".category-section"));
  var activeCategory = "all";

  function applyFilters() {
    var query = search.value.toLowerCase().trim();
    var visible = 0;

    cards.forEach(function (card) {
      var categoryMatch = activeCategory === "all" ||
        card.dataset.category === activeCategory;

      var textMatch = (card.dataset.search || "").indexOf(query) !== -1;
      var show = categoryMatch && textMatch;

      card.hidden = !show;
      if (show) visible++;
    });

    sections.forEach(function (section) {
      section.hidden =
        section.querySelectorAll(".calculator-card:not([hidden])").length === 0;
    });

    if (count) count.textContent =
      visible + (visible === 1 ? " calculator found" : " calculators found");

    if (empty) empty.hidden = visible !== 0;
  }

  filters.addEventListener("click", function (event) {
    var button = event.target.closest(".filter-btn");
    if (!button) return;

    activeCategory = button.dataset.filter || "all";

    filters.querySelectorAll(".filter-btn").forEach(function (item) {
      var selected = item === button;
      item.classList.toggle("is-active", selected);
      item.setAttribute("aria-pressed", selected ? "true" : "false");
    });

    applyFilters();
  });

  search.addEventListener("input", applyFilters);
  applyFilters();
})();