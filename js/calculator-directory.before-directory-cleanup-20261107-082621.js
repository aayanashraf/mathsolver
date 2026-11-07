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

  // Keep category button counts synchronized with actual calculator cards.
  filters.querySelectorAll(".filter-btn").forEach(function (button) {
    var category = button.getAttribute("data-filter");
    var total = category === "all"
      ? cards.length
      : cards.filter(function (card) {
          return card.getAttribute("data-category") === category;
        }).length;

    var badge = button.querySelector("span");
    if (badge) badge.textContent = String(total);
  });

  function normalize(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/&amp;/g, " and ")
      .replace(/&[^;]+;/g, " ")
      .replace(/[^a-z0-9\u0600-\u06ff\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function distance(a, b) {
    if (a === b) return 0;
    if (!a || !b) return 99;

    var prev = Array.from({ length: b.length + 1 }, function (_, i) { return i; });

    for (var i = 1; i <= a.length; i++) {
      var curr = [i];

      for (var j = 1; j <= b.length; j++) {
        curr[j] = Math.min(
          curr[j - 1] + 1,
          prev[j] + 1,
          prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
        );
      }

      prev = curr;
    }

    return prev[b.length];
  }

  function similar(a, b) {
    if (a === b) return true;
    if (a.length >= 4 && b.indexOf(a) === 0) return true;

    var limit = Math.max(a.length, b.length) >= 9 ? 2 : 1;
    return Math.abs(a.length - b.length) <= limit && distance(a, b) <= limit;
  }

  var stopWords = new Set([
    "a", "an", "the", "i", "am", "is", "are", "my", "me", "for",
    "to", "of", "and", "in", "on", "with", "want", "need", "how",
    "what", "calculate", "calculator", "find", "show", "please",
    "ka", "ki", "ke", "ko", "hai", "hain", "mera", "meri",
    "mujhe", "karna", "karo", "kya", "aur", "se", "mein",
    "bir", "ve", "icin", "hesapla"
  ]);

  var intents = [
    {
      keys: ["business", "businesses", "shop", "store", "dukan", "dukaan", "karobar", "tijarat", "isletme", "dukkan"],
      terms: ["revenue", "net profit", "gross margin", "sales commission", "cogs", "vat", "cagr", "cash flow", "profit margin", "markup", "break even", "roi", "sales tax", "discount", "simple interest", "compound interest", "loan payment"]
    },
    {
      keys: ["profit", "munafa", "kar"],
      terms: ["profit margin", "net profit", "gross margin", "markup", "break even", "revenue", "roi", "cogs"]
    },
    {
      keys: ["sales", "selling", "sell", "farokht", "sale"],
      terms: ["sales commission", "sales tax", "revenue", "discount", "profit margin", "markup", "net profit"]
    },
    {
      keys: ["income", "earning", "earnings", "kamai", "aamdani", "gelir"],
      terms: ["revenue", "net profit", "gross margin", "cash flow", "sales commission"]
    },
    {
      keys: ["loan", "qarza", "qarz", "kredi", "borrow"],
      terms: ["loan payment", "simple interest", "compound interest"]
    },
    {
      keys: ["interest", "sood", "faida"],
      terms: ["simple interest", "compound interest", "loan payment"]
    },
    {
      keys: ["house", "home", "ghar", "property", "building"],
      terms: ["loan payment", "concrete volume", "paint estimator", "flooring estimator", "tile estimator", "roof pitch", "stair calculator"]
    },
    {
      keys: ["construction", "tameer", "mistri", "renovation"],
      terms: ["concrete volume", "paint estimator", "flooring estimator", "tile estimator", "roof pitch", "stair calculator", "fence post"]
    },
    {
      keys: ["student", "school", "college", "university", "talib", "taleem", "education", "marks"],
      terms: ["grade calculator", "weighted average", "percentage", "gpa", "mean median mode", "standard deviation"]
    },
    {
      keys: ["statistics", "data analysis", "stats", "statistical"],
      terms: ["mean median mode", "standard deviation", "z score", "quartile", "coefficient of variation", "standard error", "normal distribution", "binomial probability"]
    },
    {
      keys: ["travel", "safar", "journey", "trip", "car journey"],
      terms: ["average speed", "distance travelled", "travel time", "fuel cost", "fuel economy"]
    },
    {
      keys: ["car", "vehicle", "petrol", "fuel", "gasoline", "diesel"],
      terms: ["fuel cost", "fuel economy", "average speed", "distance travelled", "travel time"]
    },
    {
      keys: ["electricity", "bijli", "electrical", "circuit"],
      terms: ["ohm law", "voltage divider", "electric power", "series resistor", "parallel resistor"]
    },
    {
      keys: ["chemistry", "chemical", "lab", "solution"],
      terms: ["molar mass", "molarity", "molality", "dilution", "percent yield", "solution concentration", "ideal gas law", "ph"]
    },
    {
      keys: ["computer", "programming", "binary", "network", "internet", "ip address"],
      terms: ["binary to decimal", "decimal to binary", "hexadecimal to decimal", "decimal to hexadecimal", "binary addition", "ascii converter", "data transfer time", "ipv4 subnet"]
    },
    {
      keys: ["date", "calendar", "birthday", "age", "time"],
      terms: ["days between dates", "date add or subtract", "working days", "time duration", "hours to decimal", "age calculator"]
    },
    {
      keys: ["food", "restaurant", "restaurant bill", "dinner"],
      terms: ["tip calculator", "bill split calculator"]
    },
    {
      keys: ["math", "mathematics", "algebra", "equation"],
      terms: ["fraction", "percentage", "quadratic equation", "factoring", "inequality", "logarithm", "matrix", "derivative", "integral"]
    },
    {
      keys: ["area", "room size", "zamin", "land", "zameen"],
      terms: ["area converter", "paint estimator", "flooring estimator", "tile estimator"]
    },
    {
      keys: ["average", "avg", "avrage", "ortalama"],
      terms: ["mean median mode", "weighted average", "average speed"]
    },
    {
      keys: ["percentage", "percent", "persentage", "percentaje", "yuzde", "yüzde"],
      terms: ["percentage calculator", "sales tax", "discount", "percent yield"]
    }
  ];

  function getIntentTerms(query, queryTokens) {
    var terms = [];

    intents.forEach(function (intent) {
      var matched = intent.keys.some(function (key) {
        if (query.indexOf(key) !== -1) return true;

        var keyWords = key.split(" ");
        return keyWords.length === 1 && queryTokens.some(function (token) {
          return similar(token, key);
        });
      });

      if (matched) terms = terms.concat(intent.terms);
    });

    return Array.from(new Set(terms));
  }

  function scoreCard(card, query, queryTokens, intentTerms) {
    var title = normalize(card.querySelector("b")?.textContent || "");
    var description = normalize(card.querySelector("p")?.textContent || "");
    var category = normalize(card.dataset.category || "");
    var haystack = normalize(
      (card.dataset.search || "") + " " +
      card.textContent + " " +
      category
    );

    var score = 0;

    if (haystack.indexOf(query) !== -1) score += 100;
    if (title.indexOf(query) !== -1) score += 80;

    queryTokens.forEach(function (token) {
      var words = haystack.split(" ");
      var exact = words.some(function (word) {
        return word === token || (token.length >= 4 && word.indexOf(token) === 0);
      });

      if (exact) {
        score += title.indexOf(token) !== -1 ? 30 : 18;
        return;
      }

      var best = 99;
      words.forEach(function (word) {
        if (word.length < 3) return;
        best = Math.min(best, distance(token, word));
      });

      var limit = token.length >= 9 ? 2 : 1;
      if (best <= limit) score += 13 - best * 3;
    });

    intentTerms.forEach(function (term) {
      var normalizedTerm = normalize(term);
      if (haystack.indexOf(normalizedTerm) !== -1) {
        score += title.indexOf(normalizedTerm) !== -1 ? 20 : 12;
      }
    });

    if (description.indexOf(query) !== -1) score += 15;

    return score;
  }

  function applyFilters() {
    var query = normalize(search.value);
    var queryTokens = query.split(" ").filter(function (token) {
      return token.length >= 2 && !stopWords.has(token);
    });

    var intentTerms = getIntentTerms(query, queryTokens);
    var visible = 0;

    var ranked = cards.map(function (card) {
      return {
        card: card,
        score: query ? scoreCard(card, query, queryTokens, intentTerms) : 0
      };
    });

    ranked.sort(function (a, b) {
      return b.score - a.score;
    });

    ranked.forEach(function (item, index) {
      var categoryMatch = activeCategory === "all" ||
        item.card.dataset.category === activeCategory;

      var textMatch = !query || item.score > 0;
      var show = categoryMatch && textMatch;

      item.card.hidden = !show;
      item.card.style.order = String(index);

      if (show) visible++;
    });

    sections.forEach(function (section) {
      section.hidden =
        section.querySelectorAll(".calculator-card:not([hidden])").length === 0;
    });

    if (count) {
      count.textContent = visible +
        (visible === 1 ? " calculator found" : " calculators found");
    }

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