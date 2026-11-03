/* MathSolveIQ calculators, part 5: guided word problems. Load after calc3.js (needs window.MSIQLIB).
   Adds: word-problem-solver. */
(function () {
  var E = window.MSIQ = window.MSIQ || {};
  var L = window.MSIQLIB;
  if (!L) { if (window.console) console.error("calc5.js needs calc3.js to be loaded first."); return; }
  var n = L.n, step = L.step, M = "−";
  var isInt = function (x) { return Math.abs(x - Math.round(x)) < 1e-9; };
  var money = function (x) { return String(n(Math.round(x * 100) / 100)); };

  /* Each type lists what Value 1..4 mean. A label ending in "(optional)" may be left blank. */
  var TYPES = [
    { name: "Speed, distance and time (leave one box blank)", vars: ["speed", "distance", "time"] },
    { name: "Two travellers moving towards each other", vars: ["speed of the first", "speed of the second", "distance between them at the start"] },
    { name: "One traveller catching up with another", vars: ["speed of the faster one", "speed of the slower one", "gap between them at the start"] },
    { name: "Percentage of an amount, increase and decrease", vars: ["amount", "percent"] },
    { name: "Find the original amount before a percent change", vars: ["amount after the change", "percent change (use a minus sign for a decrease)"] },
    { name: "Simple and compound interest", vars: ["money at the start (principal)", "yearly rate in percent", "number of years", "times compounded per year (optional, default 1)"] },
    { name: "Two numbers from their sum and difference", vars: ["sum of the two numbers", "difference of the two numbers (larger minus smaller)"] },
    { name: "Consecutive numbers with a given sum", vars: ["sum of the numbers", "how many numbers", "step between them (optional, 1 = consecutive, 2 = even or odd)"] },
    { name: "Age problem: parent and child", vars: ["how many times older the parent is than the child now", "number of years later", "how many times older the parent will be then"] },
    { name: "Working together (jobs and pipes)", vars: ["hours worker A needs alone", "hours worker B needs alone", "hours worker C needs alone (optional)"] },
    { name: "Two kinds of items: total count and total value", vars: ["total number of items", "total value", "price of one item of the first kind", "price of one item of the second kind"] },
    { name: "Rectangle from perimeter and how much longer the length is", vars: ["perimeter", "how much longer the length is than the width"] }
  ];
  window.MSIQ_WP_TYPES = TYPES;

  function val(s, label) {
    s = String(s == null ? "" : s).trim().replace(/%$/, "").replace(/−/g, "-");
    if (s === "") return null;
    var m = s.match(/^(-?\d+\.?\d*)\s*\/\s*(\d+\.?\d*)$/), x;
    if (m) { if (parseFloat(m[2]) === 0) throw new Error("Division by zero in the box for " + label + "."); x = parseFloat(m[1]) / parseFloat(m[2]); }
    else x = Number(s);
    if (!isFinite(x)) throw new Error("'" + s + "' is not a number (box for " + label + ").");
    return x;
  }
  function guide(t) { return t.vars.map(function (l, i) { return "Value " + (i + 1) + " = " + l; }).join("; "); }
  function pos(x, label) { if (!(x > 0)) throw new Error("The " + label + " must be greater than 0."); }

  var RUN = [
    /* 0 speed, distance, time */
    function (a) {
      var blanks = a.filter(function (x, i) { return i < 3 && x === null; }).length, S = [];
      if (blanks !== 1) throw new Error("Leave exactly one of Value 1, 2, 3 blank (the one you want to find) and fill in the other two.");
      S.push(step("1. The relationship", "distance = speed × time"));
      if (a[0] === null) { pos(a[2], "time"); var s = a[1] / a[2]; S.push(step("2. Solve for speed", "speed = distance / time = " + n(a[1]) + " / " + n(a[2]) + " = <b>" + n(s) + "</b>")); a[0] = s; }
      else if (a[1] === null) { var d = a[0] * a[2]; S.push(step("2. Solve for distance", "distance = speed × time = " + n(a[0]) + " × " + n(a[2]) + " = <b>" + n(d) + "</b>")); a[1] = d; }
      else { pos(a[0], "speed"); var t = a[1] / a[0]; S.push(step("2. Solve for time", "time = distance / speed = " + n(a[1]) + " / " + n(a[0]) + " = <b>" + n(t) + "</b>")); a[2] = t; }
      S.push(step("Check", n(a[0]) + " × " + n(a[2]) + " = " + n(a[0] * a[2]) + ", which equals the distance " + n(a[1]) + "."));
      return S;
    },
    /* 1 towards each other */
    function (a) {
      pos(a[0], "first speed"); pos(a[1], "second speed"); pos(a[2], "starting distance");
      var close = a[0] + a[1], t = a[2] / close, d1 = a[0] * t, d2 = a[1] * t;
      return [step("1. Closing speed", "They move towards each other, so the gap shrinks by " + n(a[0]) + " + " + n(a[1]) + " = " + n(close) + " per unit of time."),
        step("2. Time until they meet", "time = distance / closing speed = " + n(a[2]) + " / " + n(close) + " = <b>" + n(t) + "</b>"),
        step("3. Where they meet", "The first has travelled " + n(a[0]) + " × " + n(t) + " = <b>" + n(d1) + "</b>, the second " + n(a[1]) + " × " + n(t) + " = <b>" + n(d2) + "</b>."),
        step("Check", n(d1) + " + " + n(d2) + " = " + n(d1 + d2) + ", which equals the starting distance " + n(a[2]) + ".")];
    },
    /* 2 catching up */
    function (a) {
      pos(a[0], "faster speed"); pos(a[1], "slower speed"); if (a[2] < 0) throw new Error("The gap cannot be negative.");
      if (a[0] <= a[1]) throw new Error("The faster one must really be faster than the slower one, otherwise it never catches up.");
      var rel = a[0] - a[1], t = a[2] / rel;
      return [step("1. Relative speed", "They move in the same direction, so the gap shrinks by " + n(a[0]) + " " + M + " " + n(a[1]) + " = " + n(rel) + " per unit of time."),
        step("2. Time to catch up", "time = gap / relative speed = " + n(a[2]) + " / " + n(rel) + " = <b>" + n(t) + "</b>"),
        step("3. Distance covered by the faster one", n(a[0]) + " × " + n(t) + " = <b>" + n(a[0] * t) + "</b>"),
        step("Check", "In that time the slower one covers " + n(a[1] * t) + ". Adding the gap " + n(a[2]) + " gives " + n(a[1] * t + a[2]) + ", the same as the faster one.")];
    },
    /* 3 percentage */
    function (a) {
      var p = a[1] / 100;
      return [step("1. Turn the percent into a decimal", n(a[1]) + "% = " + n(a[1]) + " / 100 = " + n(p)),
        step("2. The percent of the amount", n(a[0]) + " × " + n(p) + " = <b>" + n(a[0] * p) + "</b>"),
        step("3. Increase by " + n(a[1]) + "%", n(a[0]) + " × (1 + " + n(p) + ") = <b>" + n(a[0] * (1 + p)) + "</b>"),
        step("4. Decrease by " + n(a[1]) + "%", n(a[0]) + " × (1 " + M + " " + n(p) + ") = <b>" + n(a[0] * (1 - p)) + "</b>")];
    },
    /* 4 original before a change */
    function (a) {
      var f = 1 + a[1] / 100;
      if (Math.abs(f) < 1e-12) throw new Error("A decrease of 100% leaves nothing, so the original cannot be found.");
      var o = a[0] / f;
      return [step("1. Set up the equation", "original × (1 " + (a[1] < 0 ? M + " " + n(-a[1] / 100) : "+ " + n(a[1] / 100)) + ") = " + n(a[0])),
        step("2. Solve for the original", "original = " + n(a[0]) + " / " + n(f) + " = <b>" + n(o) + "</b>"),
        step("Check", n(o) + " × " + n(f) + " = " + n(o * f) + ".")];
    },
    /* 5 interest */
    function (a) {
      var P = a[0], r = a[1], y = a[2], m = a[3] === null ? 1 : a[3];
      if (P < 0 || r < 0 || y < 0) throw new Error("Principal, rate and years must not be negative.");
      if (!isInt(m) || m < 1) throw new Error("Times compounded per year must be a whole number, 1 or more.");
      var I = P * r * y / 100, A = P * Math.pow(1 + r / (100 * m), m * y);
      return [step("1. Simple interest", "I = P × r × t / 100 = " + n(P) + " × " + n(r) + " × " + n(y) + " / 100 = <b>" + money(I) + "</b><br>Total = " + money(P + I)),
        step("2. Compound interest", "A = P × (1 + r / (100m))<sup>m·t</sup> with m = " + m + "<br>A = " + n(P) + " × (1 + " + n(r / (100 * m)) + ")<sup>" + n(m * y) + "</sup> = <b>" + money(A) + "</b><br>Interest earned = " + money(A - P)),
        step("Compare", "Compounding earns " + money(A - P - I) + " more than simple interest over " + n(y) + " years.")];
    },
    /* 6 sum and difference */
    function (a) {
      var big = (a[0] + a[1]) / 2, small = (a[0] - a[1]) / 2;
      return [step("1. Set up", "Let the numbers be x (larger) and y (smaller).<br>x + y = " + n(a[0]) + "<br>x " + M + " y = " + n(a[1])),
        step("2. Add the two equations", "2x = " + n(a[0] + a[1]) + ", so x = <b>" + n(big) + "</b>"),
        step("3. Find y", "y = " + n(a[0]) + " " + M + " " + n(big) + " = <b>" + n(small) + "</b>"),
        step("Check", n(big) + " + " + n(small) + " = " + n(big + small) + " and " + n(big) + " " + M + " " + n(small) + " = " + n(big - small) + ".")];
    },
    /* 7 consecutive numbers */
    function (a) {
      var S = a[0], N = a[1], st = a[2] === null ? 1 : a[2];
      if (!isInt(N) || N < 1 || N > 1000) throw new Error("How many numbers must be a whole number from 1 to 1000.");
      if (!isInt(st) || st < 1) throw new Error("The step must be a whole number, 1 or more.");
      var first = (S - st * N * (N - 1) / 2) / N, out = [];
      out.push(step("1. Set up", "Let the first number be x. The numbers are x, x + " + st + ", x + " + 2 * st + ", …<br>Their sum is " + N + "x + " + n(st * N * (N - 1) / 2) + " = " + n(S)));
      out.push(step("2. Solve for x", "x = (" + n(S) + " " + M + " " + n(st * N * (N - 1) / 2) + ") / " + N + " = <b>" + n(first) + "</b>"));
      if (!isInt(first)) { out.push(step("Result", "x is not a whole number, so <b>there is no list of whole numbers</b> with these properties.")); return out; }
      var list = [], i; for (i = 0; i < Math.min(N, 20); i++) list.push(Math.round(first) + i * st);
      out.push(step("3. The numbers", "<b>" + list.join(", ") + (N > 20 ? ", …" : "") + "</b>" + (st === 2 ? "<br>These are " + (Math.round(first) % 2 === 0 ? "even" : "odd") + " numbers." : "")));
      out.push(step("Check", "Sum = " + n(N * first + st * N * (N - 1) / 2) + "."));
      return out;
    },
    /* 8 age */
    function (a) {
      var k = a[0], yrs = a[1], m = a[2];
      if (k <= 1 || m <= 1) throw new Error("A parent is more than 1 times as old as the child, so the first and third values must be above 1.");
      if (Math.abs(k - m) < 1e-12) throw new Error("The two multiples must be different, otherwise the ages cannot be found.");
      var c = yrs * (m - 1) / (k - m);
      var out = [step("1. Set up", "Let the child's age now be c. Then the parent is " + n(k) + "c.<br>In " + n(yrs) + " years: parent " + n(k) + "c + " + n(yrs) + ", child c + " + n(yrs) + ".<br>" + n(k) + "c + " + n(yrs) + " = " + n(m) + "(c + " + n(yrs) + ")"),
        step("2. Solve for c", n(k) + "c " + M + " " + n(m) + "c = " + n(m) + " × " + n(yrs) + " " + M + " " + n(yrs) + "<br>c = " + n(yrs * (m - 1)) + " / " + n(k - m) + " = <b>" + n(c) + "</b>")];
      if (!(c > 0) || (yrs < 0 && c <= 0)) { out.push(step("Result", "The answer is not a sensible age. Check the numbers you entered.")); return out; }
      out.push(step("3. The ages", "Child now: <b>" + n(c) + "</b><br>Parent now: <b>" + n(k * c) + "</b>"));
      out.push(step("Check", "In " + n(yrs) + " years: parent " + n(k * c + yrs) + ", child " + n(c + yrs) + ". " + n(k * c + yrs) + " / " + n(c + yrs) + " = " + n((k * c + yrs) / (c + yrs)) + ", which is " + n(m) + " times."));
      return out;
    },
    /* 9 work together */
    function (a) {
      var ts = [a[0], a[1]].concat(a[2] === null ? [] : [a[2]]), names = ["A", "B", "C"];
      ts.forEach(function (t, i) { pos(t, "time for worker " + names[i]); });
      var rate = ts.reduce(function (s, t) { return s + 1 / t; }, 0), T = 1 / rate;
      return [step("1. Work per hour", ts.map(function (t, i) { return "Worker " + names[i] + " does 1/" + n(t) + " = " + n(1 / t) + " of the job per hour."; }).join("<br>")),
        step("2. Add the rates", "Together: " + ts.map(function (t) { return "1/" + n(t); }).join(" + ") + " = " + n(rate) + " of the job per hour."),
        step("3. Time together", "time = 1 / " + n(rate) + " = <b>" + n(T) + "</b> hours"),
        step("Check", ts.map(function (t, i) { return "Worker " + names[i] + " does " + n(T / t); }).join(", ") + " of the job. These add up to " + n(ts.reduce(function (s, t) { return s + T / t; }, 0)) + ".")];
    },
    /* 10 two kinds of items */
    function (a) {
      var N = a[0], V = a[1], p1 = a[2], p2 = a[3];
      if (N < 0 || !isInt(N)) throw new Error("The total number of items must be a whole number, 0 or more.");
      if (Math.abs(p1 - p2) < 1e-12) throw new Error("The two prices must be different.");
      var x = (V - p2 * N) / (p1 - p2), y = N - x;
      var out = [step("1. Set up", "Let x be the number of the first kind and y the second kind.<br>x + y = " + n(N) + "<br>" + n(p1) + "x + " + n(p2) + "y = " + n(V)),
        step("2. Replace y with " + n(N) + " " + M + " x", n(p1) + "x + " + n(p2) + "(" + n(N) + " " + M + " x) = " + n(V) + "<br>(" + n(p1) + " " + M + " " + n(p2) + ")x = " + n(V - p2 * N) + "<br>x = <b>" + n(x) + "</b>"),
        step("3. Find y", "y = " + n(N) + " " + M + " " + n(x) + " = <b>" + n(y) + "</b>")];
      if (x < -1e-9 || y < -1e-9 || !isInt(x)) out.push(step("Result", "These are not whole, non-negative counts, so <b>no real combination</b> gives this total. Check the numbers."));
      else out.push(step("Check", n(p1) + " × " + n(x) + " + " + n(p2) + " × " + n(y) + " = " + n(p1 * x + p2 * y) + ", which equals " + n(V) + "."));
      return out;
    },
    /* 11 rectangle */
    function (a) {
      var P = a[0], d = a[1];
      if (!(P > 0)) throw new Error("The perimeter must be greater than 0.");
      var w = (P / 2 - d) / 2, l = w + d;
      var out = [step("1. Set up", "Let the width be w. Then the length is w + " + n(d) + ".<br>Perimeter = 2(w + (w + " + n(d) + ")) = " + n(P)),
        step("2. Solve for w", "4w + " + n(2 * d) + " = " + n(P) + "<br>w = (" + n(P) + " " + M + " " + n(2 * d) + ") / 4 = <b>" + n(w) + "</b>")];
      if (!(w > 0) || !(l > 0)) { out.push(step("Result", "The width comes out zero or negative, so <b>no rectangle</b> fits these numbers.")); return out; }
      out.push(step("3. The sides", "Width = <b>" + n(w) + "</b>, length = <b>" + n(l) + "</b><br>Area = " + n(w * l)));
      out.push(step("Check", "2 × (" + n(w) + " + " + n(l) + ") = " + n(2 * (w + l)) + "."));
      return out;
    }
  ];
  var REQUIRED = [[], [0, 1, 2], [0, 1, 2], [0, 1], [0, 1], [0, 1, 2], [0, 1], [0, 1], [0, 1, 2], [0, 1], [0, 1, 2, 3], [0, 1]];

  E["word-problem-solver"] = { fields: [
    { id: "type", label: "Type of problem", type: "select", options: TYPES.map(function (t) { return t.name; }) },
    { id: "v1", label: "Value 1", type: "text", value: "" },
    { id: "v2", label: "Value 2", type: "text", value: "120" },
    { id: "v3", label: "Value 3", type: "text", value: "2" },
    { id: "v4", label: "Value 4 (only for interest and two kinds of items)", type: "text", value: "" }],
    solve: function (v) {
      var idx = 0, i;
      for (i = 0; i < TYPES.length; i++) if (TYPES[i].name === v.type) idx = i;
      var t = TYPES[idx], a = [v.v1, v.v2, v.v3, v.v4].map(function (s, j) { return val(s, "Value " + (j + 1)); });
      var need = REQUIRED[idx];
      if (idx > 0) {
        need.forEach(function (j) { if (a[j] === null) throw new Error("Fill in Value " + (j + 1) + " (" + t.vars[j] + "). This type uses: " + guide(t) + "."); });
      }
      var used = [], j; for (j = 0; j < t.vars.length; j++) used.push("Value " + (j + 1) + " \u00b7 " + t.vars[j] + ": " + (a[j] === null ? "not given" : n(a[j])));
      var steps = RUN[idx](a.slice());
      return step("Problem type", t.name + "<br>" + used.join("<br>")) + steps.join("");
    } };
})();
