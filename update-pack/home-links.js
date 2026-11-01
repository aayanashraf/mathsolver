/* MathSolveIQ: fills "Popular calculators" on the home page with links to the real calculator pages. */
(function () {
  var LIST = [
    ["Fraction", "Add, subtract, multiply, divide", "/calculator/fraction"],
    ["Percentage", "Percent of, percent change", "/calculator/percentage"],
    ["Quadratic Equation", "Roots, discriminant, vertex", "/calculator/quadratic-equation"],
    ["Factoring", "Factor ax² + bx + c", "/calculator/factoring"],
    ["Systems of Equations", "Two equations, two unknowns", "/calculator/systems-of-equations"],
    ["Inequality", "Sign flips and intervals", "/calculator/inequality"],
    ["Logarithm", "Any base, change of base", "/calculator/logarithm"],
    ["Derivative", "Rules shown per term", "/calculator/derivative"],
    ["Integral", "Indefinite and definite", "/calculator/integral"],
    ["Determinant", "2x2 and 3x3", "/calculator/determinant"],
    ["Inverse Matrix", "With a multiplication check", "/calculator/inverse-matrix"],
    ["Standard Deviation", "Sample and population", "/calculator/standard-deviation"],
    ["Slope", "Slope and line equation", "/calculator/slope"],
    ["Law of Cosines", "Missing side or angle", "/calculator/law-of-cosines"]
  ];
  function build() {
    var box = document.getElementById("popular");
    if (!box) {
      var hs = document.querySelectorAll("h2,h3"), h = null;
      for (var i = 0; i < hs.length; i++) { if (/popular calculators/i.test(hs[i].textContent)) { h = hs[i]; break; } }
      if (!h) return;
      box = document.createElement("div"); box.id = "popular"; box.className = "grid";
      h.parentNode.insertBefore(box, h.nextSibling);
    }
    box.innerHTML = "";
    LIST.forEach(function (c) {
      var a = document.createElement("a");
      a.href = c[2];
      var b = document.createElement("b"); b.textContent = c[0];
      a.appendChild(b); a.appendChild(document.createTextNode(c[1]));
      box.appendChild(a);
    });
    var more = document.createElement("p");
    more.innerHTML = '<a href="/calculator">Browse all calculators →</a>';
    if (!box.nextElementSibling || box.nextElementSibling.textContent.indexOf("Browse all") === -1) box.parentNode.insertBefore(more, box.nextSibling);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { setTimeout(build, 0); });
  else setTimeout(build, 0);
})();
