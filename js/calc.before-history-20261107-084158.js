/* MathSolveIQ calculators: runs in the browser, no server needed. */
(function () {
  var G = function (a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a; };
  var n = function (v) { return +(+v).toFixed(6); };
  var esc = function (s) { return String(s).replace(/[&<>]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; }); };
  var step = function (t, d) { return '<div class="step"><b>' + t + "</b><br>" + d + "</div>"; };
  var list = function (s) { return String(s).split(/[,\s;]+/).filter(Boolean).map(Number); };
  var okList = function (a) { return a.length && a.every(function (x) { return isFinite(x); }); };
  function factor(x) { var f = [], p = 2; while (x > 1 && p * p <= x) { while (x % p === 0) { f.push(p); x /= p; } p++; } if (x > 1) f.push(x); return f; }
  function fstr(f) { if (!f.length) return "1"; var m = {}; f.forEach(function (p) { m[p] = (m[p] || 0) + 1; }); return Object.keys(m).map(function (p) { return m[p] > 1 ? p + "<sup>" + m[p] + "</sup>" : p; }).join(" × "); }
  function simpRad(k) { var out = 1, r = k; for (var i = 2; i * i <= r; i++) { while (r % (i * i) === 0) { r /= i * i; out *= i; } } return [out, r]; }
  function erf(x) { var s = x < 0 ? -1 : 1; x = Math.abs(x); var t = 1 / (1 + 0.3275911 * x); var y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x); return s * y; }

  var E = {};

  E.fraction = { fields: [
    { id: "n1", label: "Numerator 1", value: 1 }, { id: "d1", label: "Denominator 1", value: 2 },
    { id: "op", label: "Operation", type: "select", options: ["+", "-", "×", "÷"] },
    { id: "n2", label: "Numerator 2", value: 1 }, { id: "d2", label: "Denominator 2", value: 3 }],
    solve: function (v) {
      var a = +v.n1, b = +v.d1, c = +v.n2, d = +v.d2, op = v.op, S = [], num, den;
      if ([a, b, c, d].some(function (x) { return !Number.isInteger(x); })) throw new Error("Use whole numbers for numerators and denominators.");
      if (b === 0 || d === 0) throw new Error("A denominator cannot be 0.");
      S.push(step("Problem", a + "/" + b + " " + op + " " + c + "/" + d));
      if (op === "+" || op === "-") {
        var l = Math.abs(b * d) / G(b, d), x = a * (l / b), y = c * (l / d);
        S.push(step("1. Find a common denominator", "The least common multiple of " + b + " and " + d + " is <b>" + l + "</b>. So " + a + "/" + b + " = " + x + "/" + l + " and " + c + "/" + d + " = " + y + "/" + l + "."));
        num = op === "+" ? x + y : x - y; den = l;
        S.push(step("2. " + (op === "+" ? "Add" : "Subtract") + " the numerators", x + " " + op + " " + y + " = " + num + ", so the result is " + num + "/" + den + "."));
      } else if (op === "×") {
        num = a * c; den = b * d;
        S.push(step("1. Multiply across", "Numerators: " + a + " × " + c + " = " + num + ". Denominators: " + b + " × " + d + " = " + den + "."));
      } else {
        if (c === 0) throw new Error("You cannot divide by a fraction whose numerator is 0.");
        num = a * d; den = b * c;
        S.push(step("1. Flip the second fraction and multiply", a + "/" + b + " × " + d + "/" + c + " = " + num + "/" + den + "."));
      }
      if (den < 0) { num = -num; den = -den; }
      var g = G(num, den) || 1, sn = num / g, sd = den / g;
      S.push(step("Simplify", "The greatest common factor of " + Math.abs(num) + " and " + den + " is " + g + ". Result: <b>" + sn + "/" + sd + "</b>"));
      if (sd !== 1 && Math.abs(sn) > sd) { S.push(step("Mixed number", "<b>" + (sn < 0 ? "-" : "") + Math.floor(Math.abs(sn) / sd) + " " + (Math.abs(sn) % sd) + "/" + sd + "</b>")); }
      S.push(step("Decimal", "<b>" + n(sn / sd) + "</b>"));
      return S.join("");
    } };

  E.percentage = { fields: [
    { id: "mode", label: "What do you want?", type: "select", options: ["X% of Y", "X is what % of Y", "Percent change from X to Y"] },
    { id: "x", label: "X", value: 20 }, { id: "y", label: "Y", value: 150 }],
    solve: function (v) {
      var x = +v.x, y = +v.y, S = [];
      if (!isFinite(x) || !isFinite(y)) throw new Error("Enter numbers for X and Y.");
      if (v.mode === "X% of Y") {
        S.push(step("1. Turn the percent into a fraction", x + "% = " + x + "/100"));
        S.push(step("2. Multiply by Y", "(" + x + "/100) × " + y + " = <b>" + n(x / 100 * y) + "</b>"));
      } else if (v.mode === "X is what % of Y") {
        if (y === 0) throw new Error("Y cannot be 0.");
        S.push(step("1. Divide X by Y", x + " ÷ " + y + " = " + n(x / y)));
        S.push(step("2. Multiply by 100", n(x / y) + " × 100 = <b>" + n(x / y * 100) + "%</b>"));
      } else {
        if (x === 0) throw new Error("The starting value X cannot be 0.");
        S.push(step("1. Find the change", y + " − " + x + " = " + n(y - x)));
        S.push(step("2. Divide by the starting value", n(y - x) + " ÷ " + x + " = " + n((y - x) / x)));
        S.push(step("3. Multiply by 100", "<b>" + n((y - x) / x * 100) + "%</b> " + (y >= x ? "increase" : "decrease")));
      }
      return S.join("");
    } };

  E["gcf-lcm"] = { fields: [{ id: "nums", label: "Numbers (separated by commas)", type: "text", value: "12, 18, 30" }],
    solve: function (v) {
      var a = list(v.nums), S = [];
      if (!okList(a) || a.length < 2 || a.some(function (x) { return !Number.isInteger(x) || x < 1; })) throw new Error("Enter two or more whole numbers above 0, like 12, 18.");
      if (a.length > 8) throw new Error("Please use at most 8 numbers.");
      S.push(step("1. Prime factorisation", a.map(function (x) { return x + " = " + fstr(factor(x)); }).join("<br>")));
      var g = a.reduce(G), l = a.reduce(function (p, c) { return p / G(p, c) * c; });
      S.push(step("2. GCF (greatest common factor)", "Take the shared primes with the smallest powers, or use the Euclidean algorithm. GCF = <b>" + g + "</b>"));
      S.push(step("3. LCM (least common multiple)", "Take every prime with its largest power. LCM = <b>" + l + "</b>"));
      return S.join("");
    } };

  E["standard-deviation"] = { fields: [
    { id: "nums", label: "Data (separated by commas)", type: "text", value: "4, 8, 15, 16, 23, 42" },
    { id: "kind", label: "Type", type: "select", options: ["Sample", "Population"] }],
    solve: function (v) {
      var a = list(v.nums), S = [];
      if (!okList(a) || a.length < 2) throw new Error("Enter at least two numbers.");
      if (a.length > 30) throw new Error("Please use at most 30 numbers.");
      var N = a.length, m = a.reduce(function (p, c) { return p + c; }, 0) / N;
      S.push(step("1. Mean", "Sum ÷ count = " + n(m * N) + " ÷ " + N + " = <b>" + n(m) + "</b>"));
      var ss = 0, rows = a.map(function (x) { var d = x - m; ss += d * d; return "<tr><td>" + x + "</td><td>" + n(d) + "</td><td>" + n(d * d) + "</td></tr>"; }).join("");
      S.push(step("2. Deviations", '<div style="overflow-x:auto"><table><tr><th>x</th><th>x − mean</th><th>(x − mean)²</th></tr>' + rows + "</table></div>Sum of squares = " + n(ss)));
      var den = v.kind === "Sample" ? N - 1 : N, vr = ss / den;
      S.push(step("3. Variance", "Divide by " + (v.kind === "Sample" ? "n − 1 = " : "n = ") + den + ": " + n(ss) + " ÷ " + den + " = <b>" + n(vr) + "</b>"));
      S.push(step("4. Standard deviation", "√" + n(vr) + " = <b>" + n(Math.sqrt(vr)) + "</b>"));
      return S.join("");
    } };

  E["mean-median-mode"] = { fields: [{ id: "nums", label: "Numbers (separated by commas)", type: "text", value: "3, 7, 7, 2, 9, 10, 7" }],
    solve: function (v) {
      var a = list(v.nums), S = [];
      if (!okList(a)) throw new Error("Enter numbers separated by commas.");
      var s = a.slice().sort(function (x, y) { return x - y; }), N = a.length, sum = a.reduce(function (p, c) { return p + c; }, 0);
      S.push(step("1. Sort", s.join(", ")));
      S.push(step("2. Mean", sum + " ÷ " + N + " = <b>" + n(sum / N) + "</b>"));
      var med = N % 2 ? s[(N - 1) / 2] : (s[N / 2 - 1] + s[N / 2]) / 2;
      S.push(step("3. Median", (N % 2 ? "The middle value" : "The average of the two middle values") + " is <b>" + n(med) + "</b>"));
      var c = {}; a.forEach(function (x) { c[x] = (c[x] || 0) + 1; });
      var mx = Math.max.apply(null, Object.keys(c).map(function (k) { return c[k]; })), mo = Object.keys(c).filter(function (k) { return c[k] === mx; });
      S.push(step("4. Mode", mx > 1 ? "Most frequent: <b>" + mo.join(", ") + "</b> (appears " + mx + " times)" : "<b>No mode</b> (every value appears once)"));
      S.push(step("5. Range", s[N - 1] + " − " + s[0] + " = <b>" + n(s[N - 1] - s[0]) + "</b>"));
      return S.join("");
    } };

  E["z-score"] = { fields: [{ id: "x", label: "Value (x)", value: 85 }, { id: "mu", label: "Mean (μ)", value: 70 }, { id: "sd", label: "Standard deviation (σ)", value: 10 }],
    solve: function (v) {
      var x = +v.x, mu = +v.mu, sd = +v.sd, S = [];
      if (![x, mu, sd].every(isFinite)) throw new Error("Enter numbers in all fields.");
      if (sd <= 0) throw new Error("Standard deviation must be above 0.");
      var z = (x - mu) / sd;
      S.push(step("1. Formula", "z = (x − μ) / σ"));
      S.push(step("2. Substitute", "z = (" + x + " − " + mu + ") / " + sd + " = <b>" + n(z) + "</b>"));
      S.push(step("3. Meaning", "The value is " + n(Math.abs(z)) + " standard deviations " + (z >= 0 ? "above" : "below") + " the mean."));
      var p = 0.5 * (1 + erf(z / Math.SQRT2));
      S.push(step("4. Percentile (normal distribution)", "About <b>" + n(p * 100) + "%</b> of values are below this one, if the data is roughly normal."));
      return S.join("");
    } };

  E["permutation-combination"] = { fields: [{ id: "n", label: "n (total items)", value: 10 }, { id: "r", label: "r (items chosen)", value: 3 }],
    solve: function (v) {
      var N = +v.n, R = +v.r, S = [];
      if (!Number.isInteger(N) || !Number.isInteger(R) || N < 0 || R < 0) throw new Error("n and r must be whole numbers, 0 or more.");
      if (R > N) throw new Error("r cannot be larger than n.");
      if (N > 100) throw new Error("Please use n up to 100.");
      var f = function (k) { var p = 1n; for (var i = 2n; i <= BigInt(k); i++) p *= i; return p; };
      var P = f(N) / f(N - R), C = P / f(R);
      S.push(step("1. Permutations (order matters)", "nPr = n! / (n − r)! = " + N + "! / " + (N - R) + "! = <b>" + P.toString() + "</b>"));
      S.push(step("2. Combinations (order does not matter)", "nCr = n! / (r! × (n − r)!) = " + N + "! / (" + R + "! × " + (N - R) + "!) = <b>" + C.toString() + "</b>"));
      S.push(step("Tip", "Ask: does the order of choosing change the result? If yes use nPr, if no use nCr."));
      return S.join("");
    } };

  E.slope = { fields: [{ id: "x1", label: "x₁", value: 1 }, { id: "y1", label: "y₁", value: 2 }, { id: "x2", label: "x₂", value: 4 }, { id: "y2", label: "y₂", value: 8 }],
    solve: function (v) {
      var x1 = +v.x1, y1 = +v.y1, x2 = +v.x2, y2 = +v.y2, S = [];
      if (![x1, y1, x2, y2].every(isFinite)) throw new Error("Enter numbers in all four fields.");
      S.push(step("1. Formula", "m = (y₂ − y₁) / (x₂ − x₁)"));
      if (x1 === x2) {
        S.push(step("2. Substitute", "x₂ − x₁ = " + x2 + " − " + x1 + " = 0, and you cannot divide by 0."));
        S.push(step("Result", "The line is <b>vertical</b>. The slope is undefined, and the equation is <b>x = " + n(x1) + "</b>."));
        return S.join("");
      }
      var m = (y2 - y1) / (x2 - x1), b = y1 - m * x1;
      S.push(step("2. Substitute", "m = (" + y2 + " − " + y1 + ") / (" + x2 + " − " + x1 + ") = " + n(y2 - y1) + " / " + n(x2 - x1) + " = <b>" + n(m) + "</b>"));
      S.push(step("3. Find the y-intercept", "b = y₁ − m·x₁ = " + y1 + " − " + n(m) + "·" + x1 + " = " + n(b)));
      S.push(step("4. Equation of the line", "<b>y = " + n(m) + "x " + (b < 0 ? "− " : "+ ") + n(Math.abs(b)) + "</b>"));
      return S.join("");
    } };

  E["distance-formula"] = { fields: [{ id: "x1", label: "x₁", value: 1 }, { id: "y1", label: "y₁", value: 2 }, { id: "x2", label: "x₂", value: 4 }, { id: "y2", label: "y₂", value: 6 }],
    solve: function (v) {
      var x1 = +v.x1, y1 = +v.y1, x2 = +v.x2, y2 = +v.y2, S = [];
      if (![x1, y1, x2, y2].every(isFinite)) throw new Error("Enter numbers in all four fields.");
      var dx = x2 - x1, dy = y2 - y1, k = dx * dx + dy * dy;
      S.push(step("1. Formula", "d = √((x₂ − x₁)² + (y₂ − y₁)²)"));
      S.push(step("2. Substitute", "d = √((" + n(dx) + ")² + (" + n(dy) + ")²) = √(" + n(dx * dx) + " + " + n(dy * dy) + ") = √" + n(k)));
      var exact = "";
      if (Number.isInteger(k)) { var r = simpRad(k); exact = r[1] === 1 ? String(r[0]) : (r[0] === 1 ? "" : r[0]) + "√" + r[1]; }
      S.push(step("3. Answer", (exact ? "Exact: <b>" + exact + "</b><br>" : "") + "Decimal: <b>" + n(Math.sqrt(k)) + "</b>"));
      S.push(step("Midpoint", "((" + x1 + " + " + x2 + ")/2, (" + y1 + " + " + y2 + ")/2) = <b>(" + n((x1 + x2) / 2) + ", " + n((y1 + y2) / 2) + ")</b>"));
      return S.join("");
    } };

  E["pythagorean-theorem"] = { fields: [{ id: "a", label: "Side a", value: 3 }, { id: "b", label: "Side b", value: 4 }, { id: "c", label: "Hypotenuse c (leave empty to find it)", value: "" }],
    solve: function (v) {
      var raw = [v.a, v.b, v.c], blank = raw.filter(function (x) { return String(x).trim() === ""; }).length, S = [];
      if (blank !== 1) throw new Error("Leave exactly one of the three boxes empty.");
      var a = +v.a, b = +v.b, c = +v.c;
      S.push(step("1. Formula", "a² + b² = c²"));
      if (String(v.c).trim() === "") {
        if (!(a > 0 && b > 0)) throw new Error("Sides must be above 0.");
        S.push(step("2. Find c", "c² = " + a + "² + " + b + "² = " + n(a * a + b * b) + ", so c = <b>" + n(Math.sqrt(a * a + b * b)) + "</b>"));
      } else {
        var known = String(v.a).trim() === "" ? b : a, name = String(v.a).trim() === "" ? "a" : "b";
        if (!(known > 0 && c > 0)) throw new Error("Sides must be above 0.");
        if (c <= known) throw new Error("The hypotenuse must be longer than the other side.");
        S.push(step("2. Find " + name, name + "² = c² − " + (name === "a" ? "b" : "a") + "² = " + c + "² − " + known + "² = " + n(c * c - known * known) + ", so " + name + " = <b>" + n(Math.sqrt(c * c - known * known)) + "</b>"));
      }
      return S.join("");
    } };

  E["quadratic-equation"] = { fields: [{ id: "a", label: "a", value: 1 }, { id: "b", label: "b", value: -5 }, { id: "c", label: "c", value: 6 }],
    solve: function (v) {
      var a = +v.a, b = +v.b, c = +v.c, S = [];
      if (![a, b, c].every(isFinite)) throw new Error("Enter numbers for a, b and c.");
      if (a === 0) throw new Error("With a = 0 this is not quadratic. It is the linear equation " + b + "x + " + c + " = 0.");
      var D = b * b - 4 * a * c;
      S.push(step("1. Formula", "x = (−b ± √(b² − 4ac)) / 2a"));
      S.push(step("2. Discriminant", "D = (" + b + ")² − 4·(" + a + ")·(" + c + ") = <b>" + n(D) + "</b><br>" + (D > 0 ? "D > 0: two real roots" : D === 0 ? "D = 0: one repeated root" : "D < 0: two complex roots")));
      if (D >= 0) {
        var r1 = (-b + Math.sqrt(D)) / (2 * a), r2 = (-b - Math.sqrt(D)) / (2 * a);
        S.push(step("3. Roots", "x₁ = <b>" + n(r1) + "</b>, x₂ = <b>" + n(r2) + "</b>"));
        S.push(step("4. Check", "a·x₁² + b·x₁ + c = " + n(a * r1 * r1 + b * r1 + c) + " ≈ 0 ✓"));
      } else {
        S.push(step("3. Complex roots", "x = " + n(-b / (2 * a)) + " ± " + n(Math.sqrt(-D) / (2 * Math.abs(a))) + "i"));
      }
      S.push(step("Vertex", "(" + n(-b / (2 * a)) + ", " + n(c - b * b / (4 * a)) + ")"));
      return S.join("");
    } };

  window.MSIQ = E;
  window.calcInit = function (slug) {
    var spec = E[slug], form = document.getElementById("form"), out = document.getElementById("result");
    if (!spec || !form) return;
    var html = '<div class="row">';
    spec.fields.forEach(function (f) {
      if (f.type === "select") {
        html += '<div><label for="' + f.id + '">' + f.label + '</label><select id="' + f.id + '">' + f.options.map(function (o) { return "<option>" + esc(o) + "</option>"; }).join("") + "</select></div>";
      } else {
        html += '<div><label for="' + f.id + '">' + f.label + '</label><input id="' + f.id + '" type="' + (f.type === "text" ? "text" : "text") + '" inputmode="' + (f.type === "text" ? "text" : "decimal") + '" value="' + esc(f.value === undefined ? "" : f.value) + '"></div>';
      }
    });
    form.innerHTML = html + '</div><div class="row"><button class="btn fit" id="go" type="button">Calculate with steps</button></div>';
    function run() {
      var v = {}; spec.fields.forEach(function (f) { v[f.id] = document.getElementById(f.id).value; });
      try { out.innerHTML = spec.solve(v); } catch (e) { out.innerHTML = '<span class="err">' + esc(e.message) + "</span>"; }
    }
    document.getElementById("go").onclick = run;
    form.addEventListener("keydown", function (e) { if (e.key === "Enter") run(); });
    run();
  };
})();
