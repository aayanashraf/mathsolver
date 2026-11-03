/* MathSolveIQ calculators, part 4. Load after calc.js, calc2.js and calc3.js (needs window.MSIQLIB from calc3.js).
   Adds: solve-for-x, exponent, polynomial, trig-identities, limit, probability, graphing. */
(function () {
  var E = window.MSIQ = window.MSIQ || {};
  var L = window.MSIQLIB;
  if (!L) { if (window.console) console.error("calc4.js needs calc3.js to be loaded first."); return; }
  var n = L.n, step = L.step, parsePoly = L.parsePoly, arrOf = L.arrOf, fromArr = L.fromArr, ptostr = L.ptostr;
  var roots = L.roots, cstr = L.cstr, peval = L.peval, padd = L.padd, pmul = L.pmul;
  var h = function (s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); };
  var MINUS = "−";
  var fmt = function (v) {
    if (!isFinite(v)) return String(v);
    var a = Math.abs(v);
    return (a !== 0 && (a >= 1e12 || a < 1e-6)) ? v.toExponential(6) : String(n(v));
  };
  function parseVal(s, name) {
    s = String(s).trim().replace(/−/g, "-");
    var m = s.match(/^(-?\d+\.?\d*)\s*\/\s*(\d+\.?\d*)$/);
    if (m) { var d = parseFloat(m[2]); if (d === 0) throw new Error("Division by zero in " + name + "."); return parseFloat(m[1]) / d; }
    var v = Number(s);
    if (s === "" || !isFinite(v)) throw new Error("Enter a number for " + name + ".");
    return v;
  }
  function trimLead(a) { a = a.slice(); while (a.length > 1 && Math.abs(a[0]) < 1e-12) a.shift(); return a; }
  function hor(a, x) { var r = 0; for (var i = 0; i < a.length; i++) r = r * x + a[i]; return r; }
  function synDiv(a, r) { var b = [a[0]]; for (var i = 1; i < a.length - 1; i++) b.push(a[i] + r * b[i - 1]); return b; }
  function zeroAt(a, x) {
    var scale = 1; for (var i = 0; i < a.length; i++) scale += Math.abs(a[i]) * Math.pow(Math.abs(x), a.length - 1 - i);
    return Math.abs(hor(a, x)) < 1e-9 * scale;
  }
  var sup = function (k) { return k > 1 ? "<sup>" + k + "</sup>" : ""; };

  /* ---------- 1. Solve for x ---------- */
  E["solve-for-x"] = { fields: [{ id: "eq", label: "Equation in x (use ^ for powers and = for equals)", type: "text", value: "2x^2 - 5x - 3 = 0" }],
    solve: function (v) {
      var parts = String(v.eq).split("="), S = [];
      if (parts.length !== 2) throw new Error("Write an equation with one = sign, like 3x + 5 = 20.");
      var left = parsePoly(parts[0], ["x"]), right = parsePoly(parts[1], ["x"]);
      var c = arrOf(padd(left, right, -1));
      c = trimLead(c);
      var deg = c.length - 1;
      S.push(step("Equation", h(v.eq)));
      if (deg === 0 && Math.abs(c[0]) < 1e-12) return S.join("") + step("Result", "Both sides are equal for every x, so <b>every real number is a solution</b>.");
      if (deg === 0) return S.join("") + step("Result", "After moving everything to one side you get " + n(c[0]) + " = 0, which is false. <b>There is no solution</b>.");
      if (deg > 8) throw new Error("This calculator handles equations up to degree 8.");
      S.push(step("1. Move everything to one side", ptostr(fromArr(c)) + " = 0"));
      var sols = [];
      if (deg === 1) {
        S.push(step("2. Isolate x", "ax + b = 0 gives x = " + MINUS + "b / a<br>x = " + MINUS + "(" + n(c[1]) + ") / " + n(c[0]) + " = <b>" + n(-c[1] / c[0]) + "</b>"));
        sols.push([-c[1] / c[0], 0]);
      } else if (deg === 2) {
        var a = c[0], b = c[1], k = c[2], D = b * b - 4 * a * k;
        if (Math.abs(D) < 1e-12) D = 0;
        S.push(step("2. Quadratic formula", "x = (" + MINUS + "b ± √(b² " + MINUS + " 4ac)) / 2a<br>Here a = " + n(a) + ", b = " + n(b) + ", c = " + n(k)));
        S.push(step("3. Discriminant", "D = b² " + MINUS + " 4ac = " + n(D) + (D > 0 ? ", which is positive, so there are two real solutions." : D === 0 ? ", which is 0, so there is one repeated solution." : ", which is negative, so there are no real solutions (two complex ones).")));
        if (D > 0) {
          var r1 = (-b + Math.sqrt(D)) / (2 * a), r2 = (-b - Math.sqrt(D)) / (2 * a);
          S.push(step("4. Solutions", "x = (" + n(-b) + " ± √" + n(D) + ") / " + n(2 * a) + "<br>x = <b>" + n(r1) + "</b> or x = <b>" + n(r2) + "</b>"));
          sols.push([r1, 0], [r2, 0]);
        } else if (D === 0) {
          var r0 = -b / (2 * a); S.push(step("4. Solution", "x = " + MINUS + "b / 2a = <b>" + n(r0) + "</b>")); sols.push([r0, 0]);
        } else {
          var re = -b / (2 * a), im = Math.sqrt(-D) / (2 * Math.abs(a));
          S.push(step("4. Complex solutions", "x = " + n(re) + " ± " + n(im) + "i"));
        }
      } else {
        var rs = roots(c), seen = [];
        rs.forEach(function (z) { if (!seen.some(function (q) { return Math.abs(q[0] - z[0]) < 1e-3 && Math.abs(q[1] - z[1]) < 1e-3; })) seen.push(z); });
        S.push(step("2. Solutions", seen.map(function (z) { return "x = <b>" + cstr(z) + "</b>"; }).join("<br>") + "<br>These are found numerically, so they are accurate to about 6 decimal places."));
        seen.forEach(function (z) { if (!z[1]) sols.push(z); });
      }
      if (sols.length) {
        S.push(step("Check by substitution", sols.slice(0, 4).map(function (z) {
          return "x = " + n(z[0]) + ": left side = " + n(peval(left, z[0], 0)) + ", right side = " + n(peval(right, z[0], 0));
        }).join("<br>")));
      }
      return S.join("");
    } };

  /* ---------- 2. Exponent ---------- */
  var EXO = ["Evaluate a^b", "Multiply: a^m × a^n", "Divide: a^m ÷ a^n", "Power of a power: (a^m)^n"];
  E.exponent = { fields: [
    { id: "op", label: "What do you want to do?", type: "select", options: EXO },
    { id: "a", label: "Base a", type: "text", value: "2" },
    { id: "b", label: "Exponent b (or m). Fractions such as 1/2 are allowed", type: "text", value: "10" },
    { id: "c", label: "Second exponent n (only for the three rules)", type: "text", value: "3" }],
    solve: function (v) {
      var op = v.op || EXO[0], a = parseVal(v.a, "the base a"), S = [];
      if (op === EXO[0]) {
        var b = parseVal(v.b, "the exponent b"), bs = h(String(v.b).trim()), res, txt = "", fr = String(v.b).match(/^\s*(-?\d+)\s*\/\s*(\d+)\s*$/);
        S.push(step("Expression", fmt(a) + "<sup>" + bs + "</sup>"));
        if (a === 0) {
          if (b > 0) S.push(step("Result", "0 to a positive power is <b>0</b>."));
          else if (b === 0) S.push(step("Result", "0<sup>0</sup> is <b>undefined</b>."));
          else S.push(step("Result", "0 to a negative power means dividing by 0, so it is <b>undefined</b>."));
          return S.join("");
        }
        if (b === 0) return S.join("") + step("Rule", "Any non-zero number to the power 0 is 1.") + step("Result", "<b>1</b>");
        if (Number.isInteger(b) && b > 0) {
          if (b <= 6) S.push(step("1. Repeated multiplication", Array(b + 1).join(fmt(a) + " × ").replace(/ × $/, "")));
          if (Number.isInteger(a) && b <= 400) {
            var big = (BigInt(a) ** BigInt(b)).toString();
            S.push(step("Result", big.length > 40 ? "<b>" + Math.pow(a, b).toExponential(6) + "</b> (an integer with " + big.replace("-", "").length + " digits)" : "<b>" + big + "</b>"));
          } else S.push(step("Result", "<b>" + fmt(Math.pow(a, b)) + "</b>"));
        } else if (Number.isInteger(b)) {
          S.push(step("1. Negative exponent rule", "a<sup>" + MINUS + "n</sup> = 1 / a<sup>n</sup><br>" + fmt(a) + "<sup>" + b + "</sup> = 1 / " + fmt(a) + "<sup>" + (-b) + "</sup>"));
          var exact = "";
          if (Number.isInteger(a) && -b <= 30) { var den = (BigInt(a) ** BigInt(-b)).toString(); exact = " = " + (den.charAt(0) === "-" ? MINUS + "1/" + den.slice(1) : "1/" + den); }
          S.push(step("Result", "<b>" + fmt(Math.pow(a, b)) + "</b>" + exact));
        } else if (fr) {
          var p = parseInt(fr[1], 10), q = parseInt(fr[2], 10);
          S.push(step("1. Fractional exponent rule", "a<sup>p/q</sup> = (q-th root of a)<sup>p</sup><br>Here p = " + p + ", q = " + q));
          if (a < 0 && q % 2 === 0) S.push(step("Result", "An even root of a negative number is <b>not a real number</b>."));
          else {
            var root = a < 0 ? -Math.pow(-a, 1 / q) : Math.pow(a, 1 / q);
            res = Math.pow(root, p);
            S.push(step("2. Take the root, then the power", "Root: " + fmt(root) + "<br>" + fmt(root) + "<sup>" + p + "</sup> = <b>" + fmt(res) + "</b>"));
          }
        } else {
          res = Math.pow(a, b);
          S.push(step("Result", isFinite(res) ? "<b>" + fmt(res) + "</b>" : "A negative base with a non-whole exponent is <b>not a real number</b>."));
        }
        return S.join("");
      }
      var m = parseVal(v.b, "the exponent m"), nn = parseVal(v.c, "the exponent n"), e, rule, direct;
      if (op === EXO[1]) { e = m + nn; rule = "a<sup>m</sup> × a<sup>n</sup> = a<sup>m+n</sup>"; direct = Math.pow(a, m) * Math.pow(a, nn); }
      else if (op === EXO[2]) { if (a === 0) throw new Error("The base a must not be 0 when dividing."); e = m - nn; rule = "a<sup>m</sup> ÷ a<sup>n</sup> = a<sup>m" + MINUS + "n</sup>"; direct = Math.pow(a, m) / Math.pow(a, nn); }
      else { e = m * nn; rule = "(a<sup>m</sup>)<sup>n</sup> = a<sup>m×n</sup>"; direct = Math.pow(Math.pow(a, m), nn); }
      var val = Math.pow(a, e);
      S.push(step("Expression", op === EXO[1] ? fmt(a) + "<sup>" + n(m) + "</sup> × " + fmt(a) + "<sup>" + n(nn) + "</sup>" : op === EXO[2] ? fmt(a) + "<sup>" + n(m) + "</sup> ÷ " + fmt(a) + "<sup>" + n(nn) + "</sup>" : "(" + fmt(a) + "<sup>" + n(m) + "</sup>)<sup>" + n(nn) + "</sup>"));
      S.push(step("1. Exponent rule", rule));
      S.push(step("2. Combine the exponents", "New exponent = " + n(e) + "<br>" + fmt(a) + "<sup>" + n(e) + "</sup>"));
      S.push(step("Result", isFinite(val) ? "<b>" + fmt(val) + "</b>" : "Not a real number for this base and exponent."));
      if (isFinite(val) && isFinite(direct)) S.push(step("Check", "Working it out step by step gives " + fmt(direct) + (Math.abs(direct - val) <= 1e-9 * Math.max(1, Math.abs(val)) ? ", which matches." : ".")));
      return S.join("");
    } };

  /* ---------- 3. Polynomial ---------- */
  var PO = ["Find roots and factors of A", "Add: A + B", "Subtract: A − B", "Multiply: A × B", "Divide: A ÷ B (quotient and remainder)"];
  E.polynomial = { fields: [
    { id: "op", label: "What do you want to do?", type: "select", options: PO },
    { id: "a", label: "Polynomial A (in x)", type: "text", value: "x^3 - 6x^2 + 11x - 6" },
    { id: "b", label: "Polynomial B (not needed for roots)", type: "text", value: "x - 1" }],
    solve: function (v) {
      var op = v.op || PO[0], A = parsePoly(v.a, ["x"]), S = [];
      S.push(step("Polynomial A", ptostr(A)));
      if (op === PO[0]) {
        var c = trimLead(arrOf(A)), deg = c.length - 1;
        if (deg < 1) throw new Error("Enter a polynomial of degree 1 or higher.");
        if (deg > 8) throw new Error("This calculator handles degree 8 or lower.");
        S.push(step("1. Degree and leading coefficient", "Degree " + deg + ", leading coefficient " + n(c[0])));
        var rs = roots(c), groups = [];
        rs.forEach(function (z) {
          var g = groups.filter(function (q) { return Math.abs(q.z[0] - z[0]) < 1e-3 && Math.abs(q.z[1] - z[1]) < 1e-3; })[0];
          if (g) g.m++; else groups.push({ z: z, m: 1 });
        });
        S.push(step("2. Roots", groups.map(function (g) { return "x = " + cstr(g.z) + (g.m > 1 ? " (multiplicity " + g.m + ")" : ""); }).join("<br>")));
        var fac = c[0] === 1 ? "" : (c[0] === -1 ? MINUS : n(c[0]));
        groups.forEach(function (g) {
          if (g.z[1] > 0) { var pp = g.z[0], q2 = pp * pp + g.z[1] * g.z[1]; fac += "(" + ptostr(fromArr([1, -2 * pp, q2])) + ")" + sup(g.m); }
          else if (g.z[1] === 0 || Math.abs(g.z[1]) < 1e-12) fac += g.z[0] === 0 ? "x" + sup(g.m) : "(x " + (g.z[0] < 0 ? "+ " + n(-g.z[0]) : MINUS + " " + n(g.z[0])) + ")" + sup(g.m);
        });
        S.push(step("3. Factored form", "<b>" + fac + "</b>" + (groups.some(function (g) { return g.z[1] > 0; }) ? "<br>A pair of complex roots appears as one quadratic factor that has no real roots." : "")));
        var sum = rs.reduce(function (s, z) { return s + z[0]; }, 0);
        S.push(step("Check", "The roots add up to " + n(sum) + ", which equals " + MINUS + "b/a = " + n(-c[1] / c[0]) + "."));
        return S.join("");
      }
      var B = parsePoly(v.b, ["x"]);
      S.push(step("Polynomial B", ptostr(B)));
      if (op === PO[1]) S.push(step("A + B", "<b>" + ptostr(padd(A, B, 1)) + "</b>"));
      else if (op === PO[2]) S.push(step("A " + MINUS + " B", "<b>" + ptostr(padd(A, B, -1)) + "</b>"));
      else if (op === PO[3]) S.push(step("A × B", "Multiply every term of A by every term of B, then collect like terms.<br><b>" + ptostr(pmul(A, B)) + "</b>"));
      else {
        var Ac = trimLead(arrOf(A)), Bc = trimLead(arrOf(B));
        if (Bc.length === 1 && Math.abs(Bc[0]) < 1e-12) throw new Error("Polynomial B must not be 0.");
        var q = Ac.length < Bc.length ? [0] : L.divP(Ac, Bc), Q = fromArr(q), R = padd(A, pmul(Q, B), -1);
        S.push(step("1. Long division", "Divide the leading terms, subtract, and repeat until the degree of the remainder is lower than the degree of B."));
        S.push(step("2. Quotient Q", "<b>" + ptostr(Q) + "</b>"));
        S.push(step("3. Remainder R", "<b>" + ptostr(R) + "</b>"));
        S.push(step("Check", "A = Q × B + R, that is (" + ptostr(Q) + ")(" + ptostr(B) + ") + (" + ptostr(R) + ")"));
      }
      return S.join("");
    } };

  /* ---------- 4. Trig identities ---------- */
  function angleExpr(s) {
    s = String(s).toLowerCase().replace(/\s+/g, "").replace(/π/g, "pi").replace(/−/g, "-").replace(/(\d|pi)(?=pi)/g, "$1*");
    if (!s) throw new Error("Enter an angle.");
    var tk = s.split(/(?=[*\/])/), val = null, i;
    function term(t) { var sg = 1; if (t.charAt(0) === "-") { sg = -1; t = t.slice(1); } else if (t.charAt(0) === "+") t = t.slice(1); var x = t === "pi" ? Math.PI : Number(t); if (t === "" || !isFinite(x)) throw new Error("I could not read the angle. Try 30, pi/6 or 2pi/3."); return sg * x; }
    for (i = 0; i < tk.length; i++) {
      var t = tk[i], op = "*";
      if (i > 0) { op = t.charAt(0); t = t.slice(1); }
      var x = term(t);
      if (val === null) val = x; else if (op === "*") val *= x; else { if (x === 0) throw new Error("Division by zero in the angle."); val /= x; }
    }
    return val;
  }
  var SIN = { 0: "0", 30: "1/2", 45: "√2/2", 60: "√3/2", 90: "1" }, COS = { 0: "1", 30: "√3/2", 45: "√2/2", 60: "1/2", 90: "0" };
  var TAN = { 0: "0", 30: "√3/3", 45: "1", 60: "√3", 90: "undefined" }, CSC = { 0: "undefined", 30: "2", 45: "√2", 60: "2√3/3", 90: "1" };
  var SEC = { 0: "1", 30: "2√3/3", 45: "√2", 60: "2", 90: "undefined" }, COT = { 0: "undefined", 30: "√3", 45: "1", 60: "√3/3", 90: "0" };
  function exactSet(d) {
    d = ((Math.round(d) % 360) + 360) % 360;
    var ref = d <= 90 ? d : d <= 180 ? 180 - d : d <= 270 ? d - 180 : 360 - d;
    var sNeg = d > 180, cNeg = d > 90 && d < 270, tNeg = sNeg !== cNeg;
    var sg = function (txt, neg) { return (neg && txt !== "0" && txt !== "undefined") ? MINUS + txt : txt; };
    return { sin: sg(SIN[ref], sNeg), cos: sg(COS[ref], cNeg), tan: sg(TAN[ref], tNeg), csc: sg(CSC[ref], sNeg), sec: sg(SEC[ref], cNeg), cot: sg(COT[ref], tNeg) };
  }
  E["trig-identities"] = { fields: [
    { id: "ang", label: "Angle (for radians you can type pi/6, 2pi/3 and so on)", type: "text", value: "30" },
    { id: "unit", label: "Unit", type: "select", options: ["degrees", "radians"] }],
    solve: function (v) {
      var raw = angleExpr(v.ang), isDeg = (v.unit || "degrees") === "degrees";
      var th = isDeg ? raw * Math.PI / 180 : raw, dg = isDeg ? raw : raw * 180 / Math.PI;
      var s = Math.sin(th), c = Math.cos(th), S = [];
      var cz = Math.abs(c) < 1e-12, sz = Math.abs(s) < 1e-12;
      var vals = { sin: s, cos: c, tan: cz ? NaN : s / c, csc: sz ? NaN : 1 / s, sec: cz ? NaN : 1 / c, cot: sz ? NaN : c / s };
      var rd = Math.round(dg), ex = (Math.abs(dg - rd) < 1e-9 && (rd % 30 === 0 || rd % 45 === 0)) ? exactSet(rd) : null;
      S.push(step("Angle", n(dg) + "° = " + n(th) + " radians"));
      var rows = ["sin", "cos", "tan", "csc", "sec", "cot"].map(function (k) {
        return "<tr><td>" + k + " θ</td><td>" + (isFinite(vals[k]) ? n(vals[k]) : "undefined") + "</td>" + (ex ? "<td>" + ex[k] + "</td>" : "") + "</tr>";
      }).join("");
      S.push(step("1. The six trig values", '<table style="width:auto;display:inline-table"><tr><th>Function</th><th>Decimal</th>' + (ex ? "<th>Exact</th>" : "") + "</tr>" + rows + "</table>" + (ex ? "" : "<br>Exact values are shown for multiples of 30° and 45°.")));
      var ids = [];
      function id(label, l, r, need) {
        if (!isFinite(l) || !isFinite(r) || need === false) { ids.push(label + ": undefined at this angle"); return; }
        ids.push(label + ": " + n(l) + " = " + n(r) + (Math.abs(l - r) < 1e-9 ? " ✓" : " ✗"));
      }
      id("sin²θ + cos²θ = 1", s * s + c * c, 1);
      id("1 + tan²θ = sec²θ", 1 + vals.tan * vals.tan, vals.sec * vals.sec);
      id("1 + cot²θ = csc²θ", 1 + vals.cot * vals.cot, vals.csc * vals.csc);
      id("sin 2θ = 2 sinθ cosθ", Math.sin(2 * th), 2 * s * c);
      id("cos 2θ = cos²θ − sin²θ", Math.cos(2 * th), c * c - s * s);
      id("cos 2θ = 1 − 2sin²θ", Math.cos(2 * th), 1 - 2 * s * s);
      id("tan θ = sinθ / cosθ", Math.tan(th), cz ? NaN : s / c, !cz);
      id("sin(−θ) = −sinθ", Math.sin(-th), -s);
      id("cos(90° − θ) = sinθ", Math.cos(Math.PI / 2 - th), s);
      S.push(step("2. Identities checked at this angle", ids.join("<br>")));
      S.push(step("Note", "This checks each identity at one angle. It is a numerical test and does not prove the identity for all angles."));
      return S.join("");
    } };

  /* ---------- 5. Limit ---------- */
  function parseLim(s) {
    var t = String(s).trim().toLowerCase().replace(/\s+/g, "").replace(/−/g, "-");
    if (/^\+?(inf|infinity|∞)$/.test(t)) return Infinity;
    if (/^-(inf|infinity|∞)$/.test(t)) return -Infinity;
    return parseVal(s, "the limit point");
  }
  var SIDES = ["both sides", "from the right (x → a⁺)", "from the left (x → a⁻)"];
  E.limit = { fields: [
    { id: "num", label: "Numerator (polynomial in x)", type: "text", value: "x^2 - 1" },
    { id: "den", label: "Denominator (polynomial in x, use 1 for none)", type: "text", value: "x - 1" },
    { id: "at", label: "x approaches (a number, inf or -inf)", type: "text", value: "1" },
    { id: "side", label: "Direction", type: "select", options: SIDES }],
    solve: function (v) {
      var P = trimLead(arrOf(parsePoly(v.num, ["x"]))), Q = trimLead(arrOf(parsePoly(v.den, ["x"]))), a = parseLim(v.at), side = v.side || SIDES[0], S = [];
      if (Q.length === 1 && Math.abs(Q[0]) < 1e-12) throw new Error("The denominator must not be the zero polynomial.");
      var ps = ptostr(fromArr(P)), qs = ptostr(fromArr(Q));
      S.push(step("Limit", "lim<sub>x→" + (a === Infinity ? "∞" : a === -Infinity ? MINUS + "∞" : n(a)) + "</sub> (" + ps + ") / (" + qs + ")"));
      if (P.length === 1 && Math.abs(P[0]) < 1e-12) return S.join("") + step("Result", "The numerator is 0, so the limit is <b>0</b>.");
      if (!isFinite(a)) {
        var dp = P.length - 1, dq = Q.length - 1, lp = P[0], lq = Q[0];
        S.push(step("1. Compare the highest powers", "Numerator degree " + dp + " (leading " + n(lp) + "), denominator degree " + dq + " (leading " + n(lq) + ")."));
        if (dp < dq) S.push(step("Result", "The denominator grows faster, so the limit is <b>0</b>."));
        else if (dp === dq) S.push(step("Result", "Equal degrees: the limit is the ratio of leading coefficients, " + n(lp) + " / " + n(lq) + " = <b>" + n(lp / lq) + "</b>."));
        else {
          var sg = Math.sign(lp / lq) * (a === -Infinity && (dp - dq) % 2 === 1 ? -1 : 1);
          S.push(step("Result", "The numerator grows faster, so the limit is <b>" + (sg > 0 ? "∞" : MINUS + "∞") + "</b> (it does not exist as a finite number)."));
        }
        return S.join("");
      }
      var pa = hor(P, a), qa = hor(Q, a);
      S.push(step("1. Try direct substitution", "Numerator at " + n(a) + " = " + n(pa) + "<br>Denominator at " + n(a) + " = " + n(qa)));
      if (!zeroAt(Q, a)) return S.join("") + step("Result", "The denominator is not 0, so the limit is " + n(pa) + " / " + n(qa) + " = <b>" + n(pa / qa) + "</b>.");
      var cancelled = 0;
      while (P.length > 1 && Q.length > 1 && zeroAt(P, a) && zeroAt(Q, a)) { P = synDiv(P, a); Q = synDiv(Q, a); cancelled++; }
      if (cancelled) {
        S.push(step("2. Cancel the common factor (x " + (a < 0 ? "+ " + n(-a) : MINUS + " " + n(a)) + ")" + (cancelled > 1 ? " " + cancelled + " times" : ""), "(" + ptostr(fromArr(P)) + ") / (" + ptostr(fromArr(Q)) + ")"));
        if (!zeroAt(Q, a)) return S.join("") + step("Result", "Substitute again: " + n(hor(P, a)) + " / " + n(hor(Q, a)) + " = <b>" + n(hor(P, a) / hor(Q, a)) + "</b>.");
      }
      var m = 0, Qs = Q;
      while (Qs.length > 1 && zeroAt(Qs, a)) { Qs = synDiv(Qs, a); m++; }
      var pv = hor(P, a), qv = hor(Qs, a);
      S.push(step((cancelled ? "3" : "2") + ". The denominator still goes to 0", "The numerator tends to " + n(pv) + " (not 0) while the denominator has the factor (x " + MINUS + " a) " + (m > 1 ? m + " times" : "once") + ", so the fraction grows without bound."));
      var sr = Math.sign(pv) * Math.sign(qv), sl = sr * (m % 2 === 0 ? 1 : -1);
      var nm = function (s2) { return s2 > 0 ? "∞" : MINUS + "∞"; };
      if (side === SIDES[1]) S.push(step("Result", "From the right the limit is <b>" + nm(sr) + "</b>."));
      else if (side === SIDES[2]) S.push(step("Result", "From the left the limit is <b>" + nm(sl) + "</b>."));
      else if (sr === sl) S.push(step("Result", "Both sides go to " + nm(sr) + ", so the limit is <b>" + nm(sr) + "</b> (infinite, so no finite limit exists)."));
      else S.push(step("Result", "From the right the limit is " + nm(sr) + " and from the left it is " + nm(sl) + ", so the two-sided limit <b>does not exist</b>."));
      return S.join("");
    } };

  /* ---------- 6. Probability ---------- */
  var PRO = ["Simple: favourable ÷ total", "Two events A and B", "Binomial: exactly k successes", "Binomial: at most k successes"];
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a; }
  function logC(N, k) { var s = 0, i; k = Math.min(k, N - k); for (i = 1; i <= k; i++) s += Math.log((N - k + i) / i); return s; }
  function binomP(N, k, p) {
    if (p === 0) return k === 0 ? 1 : 0;
    if (p === 1) return k === N ? 1 : 0;
    return Math.exp(logC(N, k) + k * Math.log(p) + (N - k) * Math.log(1 - p));
  }
  var pc = function (x) { return n(x * 100) + "%"; };
  E.probability = { fields: [
    { id: "mode", label: "Type of problem", type: "select", options: PRO },
    { id: "v1", label: "Value 1 (favourable | P(A) | n trials)", type: "text", value: "3" },
    { id: "v2", label: "Value 2 (total | P(B) | p, chance of success)", type: "text", value: "10" },
    { id: "v3", label: "Value 3 (not used | P(A and B), blank if independent | k)", type: "text", value: "" }],
    solve: function (v) {
      var mode = v.mode || PRO[0], S = [];
      if (mode === PRO[0]) {
        var f = parseVal(v.v1, "favourable outcomes"), t = parseVal(v.v2, "total outcomes");
        if (!Number.isInteger(f) || !Number.isInteger(t) || f < 0 || t <= 0 || f > t) throw new Error("Use whole numbers with 0 ≤ favourable ≤ total, and total above 0.");
        var g = gcd(f, t) || 1;
        S.push(step("Formula", "P(event) = favourable outcomes / total outcomes"));
        S.push(step("1. Substitute", "P = " + f + " / " + t + (g > 1 ? " = " + (f / g) + " / " + (t / g) : "")));
        S.push(step("2. Write it three ways", "Decimal: <b>" + n(f / t) + "</b><br>Percentage: <b>" + pc(f / t) + "</b>"));
        S.push(step("3. Complement", "P(not the event) = 1 " + MINUS + " " + n(f / t) + " = " + n(1 - f / t) + "<br>Odds for the event = " + f + " : " + (t - f)));
        return S.join("");
      }
      if (mode === PRO[1]) {
        var A = parseVal(v.v1, "P(A)"), B = parseVal(v.v2, "P(B)"), ind = String(v.v3).trim() === "";
        if (A < 0 || A > 1 || B < 0 || B > 1) throw new Error("Probabilities must be between 0 and 1.");
        var AB = ind ? A * B : parseVal(v.v3, "P(A and B)");
        if (AB < Math.max(0, A + B - 1) - 1e-12 || AB > Math.min(A, B) + 1e-12) throw new Error("P(A and B) must be between " + n(Math.max(0, A + B - 1)) + " and " + n(Math.min(A, B)) + " for these values.");
        S.push(step("Given", "P(A) = " + n(A) + ", P(B) = " + n(B) + ", P(A and B) = " + n(AB) + (ind ? " (assumed independent, so P(A) × P(B))" : "")));
        S.push(step("1. Union", "P(A or B) = P(A) + P(B) " + MINUS + " P(A and B) = <b>" + n(A + B - AB) + "</b>"));
        S.push(step("2. Neither", "P(neither) = 1 " + MINUS + " P(A or B) = <b>" + n(1 - (A + B - AB)) + "</b><br>P(exactly one) = " + n(A + B - 2 * AB)));
        S.push(step("3. Conditional", (B > 0 ? "P(A | B) = P(A and B) / P(B) = <b>" + n(AB / B) + "</b>" : "P(A | B) is undefined because P(B) = 0") + "<br>" + (A > 0 ? "P(B | A) = <b>" + n(AB / A) + "</b>" : "P(B | A) is undefined because P(A) = 0")));
        S.push(step("4. Relationship", (Math.abs(AB - A * B) < 1e-9 ? "P(A and B) = P(A) × P(B), so A and B are <b>independent</b>." : "P(A and B) ≠ P(A) × P(B), so A and B are <b>not independent</b>.") + (AB === 0 ? "<br>They are also mutually exclusive." : "")));
        return S.join("");
      }
      var N = parseVal(v.v1, "n"), p = parseVal(v.v2, "p"), k = parseVal(v.v3, "k");
      if (!Number.isInteger(N) || N < 1 || N > 1000) throw new Error("n must be a whole number from 1 to 1000.");
      if (p < 0 || p > 1) throw new Error("p must be between 0 and 1.");
      if (!Number.isInteger(k) || k < 0 || k > N) throw new Error("k must be a whole number from 0 to n.");
      S.push(step("Given", "n = " + N + " trials, success chance p = " + n(p) + ", k = " + k));
      S.push(step("Formula", "P(X = k) = C(n, k) · p<sup>k</sup> · (1 " + MINUS + " p)<sup>n" + MINUS + "k</sup>"));
      if (mode === PRO[2]) {
        S.push(step("1. Substitute", "C(" + N + ", " + k + ") = " + (logC(N, k) < 40 ? n(Math.round(Math.exp(logC(N, k)))) : "a very large number") + "<br>P(X = " + k + ") = <b>" + n(binomP(N, k, p)) + "</b> (" + pc(binomP(N, k, p)) + ")"));
      } else {
        var tot = 0, i; for (i = 0; i <= k; i++) tot += binomP(N, i, p);
        tot = Math.min(1, tot);
        S.push(step("1. Add P(X = 0) up to P(X = " + k + ")", "P(X ≤ " + k + ") = <b>" + n(tot) + "</b> (" + pc(tot) + ")<br>P(X > " + k + ") = " + n(1 - tot)));
      }
      S.push(step("2. Mean and spread", "Expected successes = n·p = " + n(N * p) + "<br>Standard deviation = √(n·p·(1 " + MINUS + " p)) = " + n(Math.sqrt(N * p * (1 - p)))));
      return S.join("");
    } };

  /* ---------- 7. Graphing ---------- */
  function compile(src) {
    var s = String(src).toLowerCase().replace(/[−–]/g, "-").replace(/[×·]/g, "*").replace(/π/g, "pi").replace(/\s+/g, "").replace(/^(y|f\(x\))=/, "");
    if (!s) throw new Error("Type a function of x, such as sin(x) or x^2 - 4.");
    var NAMES = ["asin", "acos", "atan", "sqrt", "sin", "cos", "tan", "abs", "exp", "log", "ln", "pi"], toks = [], i = 0, m, k, hit;
    while (i < s.length) {
      var ch = s.charAt(i);
      if (/[0-9.]/.test(ch)) { m = /^(\d+\.?\d*|\.\d+)/.exec(s.slice(i)); if (!m) throw new Error("I could not read the number near '" + ch + "'."); toks.push({ t: "n", v: parseFloat(m[1]) }); i += m[1].length; continue; }
      if ("+-*/^()".indexOf(ch) >= 0) { toks.push({ t: ch }); i++; continue; }
      hit = null; for (k = 0; k < NAMES.length; k++) if (s.substr(i, NAMES[k].length) === NAMES[k]) { hit = NAMES[k]; break; }
      if (hit) { toks.push(hit === "pi" ? { t: "c", v: Math.PI } : { t: "f", v: hit }); i += hit.length; continue; }
      if (ch === "x") { toks.push({ t: "v" }); i++; continue; }
      if (ch === "e") { toks.push({ t: "c", v: Math.E }); i++; continue; }
      throw new Error("I do not know '" + ch + "'. Use x, numbers, + - * / ^, brackets and sin, cos, tan, asin, acos, atan, sqrt, abs, exp, ln, log, pi, e.");
    }
    var pos = 0, FN = { asin: Math.asin, acos: Math.acos, atan: Math.atan, sqrt: Math.sqrt, sin: Math.sin, cos: Math.cos, tan: Math.tan, abs: Math.abs, exp: Math.exp, log: Math.log10, ln: Math.log };
    var peek = function () { return toks[pos]; };
    var mk = function (l, r, op) { return op === "+" ? function (x) { return l(x) + r(x); } : op === "-" ? function (x) { return l(x) - r(x); } : op === "*" ? function (x) { return l(x) * r(x); } : function (x) { return l(x) / r(x); }; };
    function expr() { var l = term(); while (peek() && (peek().t === "+" || peek().t === "-")) { var op = toks[pos++].t; l = mk(l, term(), op); } return l; }
    function term() {
      var l = unary();
      for (;;) {
        var t = peek(); if (!t) break;
        if (t.t === "*" || t.t === "/") { pos++; l = mk(l, unary(), t.t); }
        else if (t.t === "n" || t.t === "v" || t.t === "c" || t.t === "f" || t.t === "(") l = mk(l, power(), "*");
        else break;
      }
      return l;
    }
    function unary() { var t = peek(); if (t && t.t === "-") { pos++; var u = unary(); return function (x) { return -u(x); }; } if (t && t.t === "+") { pos++; return unary(); } return power(); }
    function power() { var b = atom(); if (peek() && peek().t === "^") { pos++; var e = unary(); return function (x) { return Math.pow(b(x), e(x)); }; } return b; }
    function atom() {
      var t = toks[pos++];
      if (!t) throw new Error("The expression ends too early. Check for a missing number or bracket.");
      if (t.t === "n" || t.t === "c") { var val = t.v; return function () { return val; }; }
      if (t.t === "v") return function (x) { return x; };
      if (t.t === "f") {
        if (!peek() || peek().t !== "(") throw new Error("Use brackets after " + t.v + ", like " + t.v + "(x).");
        pos++; var inner = expr(); if (!peek() || peek().t !== ")") throw new Error("A bracket is not closed."); pos++;
        var fn = FN[t.v]; return function (x) { return fn(inner(x)); };
      }
      if (t.t === "(") { var r = expr(); if (!peek() || peek().t !== ")") throw new Error("A bracket is not closed."); pos++; return r; }
      throw new Error("Unexpected '" + t.t + "'. Check the expression.");
    }
    var f = expr();
    if (pos < toks.length) throw new Error("Unexpected '" + toks[pos].t + "'. Check the brackets and operators.");
    return f;
  }
  function niceStep(range) {
    var raw = range / 6, mag = Math.pow(10, Math.floor(Math.log10(raw))), r = raw / mag;
    return (r < 1.5 ? 1 : r < 3.5 ? 2 : r < 7.5 ? 5 : 10) * mag;
  }
  var tickTxt = function (t) { return String(+t.toFixed(8)); };
  E.graphing = { fields: [
    { id: "f1", label: "y = f(x)", type: "text", value: "x^2 - 4" },
    { id: "f2", label: "Second function (optional)", type: "text", value: "2x + 1" },
    { id: "xmin", label: "x from", type: "text", value: "-6" },
    { id: "xmax", label: "x to", type: "text", value: "6" },
    { id: "ymin", label: "y from (leave blank for automatic)", type: "text", value: "" },
    { id: "ymax", label: "y to (leave blank for automatic)", type: "text", value: "" }],
    solve: function (v) {
      var x0 = parseVal(v.xmin, "x from"), x1 = parseVal(v.xmax, "x to"), S = [];
      if (x0 >= x1) throw new Error("x from must be smaller than x to.");
      if (x1 - x0 > 1e6) throw new Error("Choose a smaller x range (at most 1,000,000 wide).");
      var srcs = [v.f1, v.f2].filter(function (s) { return String(s || "").trim() !== ""; });
      if (!srcs.length) throw new Error("Type at least one function.");
      var fns = srcs.map(compile), NS = 800, curves = fns.map(function (f) {
        var pts = [], i; for (i = 0; i <= NS; i++) { var x = x0 + (x1 - x0) * i / NS, y = f(x); pts.push([x, isFinite(y) && Math.abs(y) < 1e12 ? y : NaN]); } return pts;
      });
      var all = []; curves.forEach(function (c) { c.forEach(function (p) { if (!isNaN(p[1])) all.push(p[1]); }); });
      if (!all.length) throw new Error("These functions have no real values in the chosen x range.");
      all.sort(function (a, b) { return a - b; });
      var lo = all[Math.floor(0.02 * (all.length - 1))], hi = all[Math.ceil(0.98 * (all.length - 1))];
      if (hi - lo < 1e-9) { lo -= 1; hi += 1; }
      var pad = (hi - lo) * 0.12, y0 = lo - pad, y1 = hi + pad;
      if (String(v.ymin).trim() !== "") y0 = parseVal(v.ymin, "y from");
      if (String(v.ymax).trim() !== "") y1 = parseVal(v.ymax, "y to");
      if (y0 >= y1) throw new Error("y from must be smaller than y to.");
      var W = 640, H = 420, ml = 46, mr = 14, mt = 14, mb = 30;
      var px = function (x) { return ml + (x - x0) / (x1 - x0) * (W - ml - mr); }, py = function (y) { return mt + (y1 - y) / (y1 - y0) * (H - mt - mb); };
      var svg = '<svg viewBox="0 0 ' + W + " " + H + '" style="width:100%;height:auto;max-width:640px" role="img" aria-label="Graph"><defs><clipPath id="gclip"><rect x="' + ml + '" y="' + mt + '" width="' + (W - ml - mr) + '" height="' + (H - mt - mb) + '"/></clipPath></defs>';
      svg += '<rect x="' + ml + '" y="' + mt + '" width="' + (W - ml - mr) + '" height="' + (H - mt - mb) + '" style="fill:none;stroke:var(--line,#ccc)"/>';
      var sx = niceStep(x1 - x0), sy = niceStep(y1 - y0), t;
      for (t = Math.ceil(x0 / sx) * sx; t <= x1 + 1e-9; t += sx) svg += '<line x1="' + px(t).toFixed(1) + '" y1="' + mt + '" x2="' + px(t).toFixed(1) + '" y2="' + (H - mb) + '" style="stroke:var(--line,#ccc);opacity:.45"/><text x="' + px(t).toFixed(1) + '" y="' + (H - 10) + '" text-anchor="middle" font-size="11" style="fill:var(--mute,#666)">' + tickTxt(t) + "</text>";
      for (t = Math.ceil(y0 / sy) * sy; t <= y1 + 1e-9; t += sy) svg += '<line x1="' + ml + '" y1="' + py(t).toFixed(1) + '" x2="' + (W - mr) + '" y2="' + py(t).toFixed(1) + '" style="stroke:var(--line,#ccc);opacity:.45"/><text x="' + (ml - 5) + '" y="' + (py(t) + 4).toFixed(1) + '" text-anchor="end" font-size="11" style="fill:var(--mute,#666)">' + tickTxt(t) + "</text>";
      if (y0 < 0 && y1 > 0) svg += '<line x1="' + ml + '" y1="' + py(0).toFixed(1) + '" x2="' + (W - mr) + '" y2="' + py(0).toFixed(1) + '" style="stroke:var(--mute,#666);stroke-width:1.4"/>';
      if (x0 < 0 && x1 > 0) svg += '<line x1="' + px(0).toFixed(1) + '" y1="' + mt + '" x2="' + px(0).toFixed(1) + '" y2="' + (H - mb) + '" style="stroke:var(--mute,#666);stroke-width:1.4"/>';
      var COL = ["var(--acc,#2563eb)", "#e11d48"], rng = y1 - y0;
      curves.forEach(function (c, ci) {
        var d = "", pen = false, prev = null;
        c.forEach(function (p) {
          if (isNaN(p[1]) || (prev !== null && Math.abs(p[1] - prev) > 3 * rng)) pen = false;
          if (isNaN(p[1])) { prev = null; return; }
          var Y = Math.max(-1e4, Math.min(1e4, py(p[1])));
          d += (pen ? "L" : "M") + px(p[0]).toFixed(1) + " " + Y.toFixed(1); pen = true; prev = p[1];
        });
        svg += '<g clip-path="url(#gclip)"><path d="' + d + '" fill="none" style="stroke:' + COL[ci] + ';stroke-width:2.2"/></g>';
      });
      svg += "</svg>";
      S.push('<div class="step">' + svg + "</div>");
      S.push(step("Legend", srcs.map(function (s, i) { return '<span style="color:' + COL[i] + '">■</span> y = ' + h(s); }).join("<br>")));
      fns.forEach(function (f, fi) {
        var y00 = f(0), rts = [], c = curves[fi], i;
        for (i = 1; i < c.length && rts.length < 8; i++) {
          var a = c[i - 1], b = c[i];
          if (isNaN(a[1]) || isNaN(b[1])) continue;
          if (a[1] === 0) { rts.push(a[0]); continue; }
          if (a[1] * b[1] < 0 && Math.abs(a[1] - b[1]) < 3 * Math.max(rng, 1e-9) * 10) {
            var l = a[0], r = b[0], k2;
            for (k2 = 0; k2 < 60; k2++) { var mid = (l + r) / 2, fm = f(mid); if (f(l) * fm <= 0) r = mid; else l = mid; }
            var rx = (l + r) / 2; if (Math.abs(f(rx)) < 1e-6) rts.push(rx);
          }
        }
        if (y00 === 0) rts.push(0);
        var uniq = []; rts.forEach(function (x) { if (!uniq.some(function (u) { return Math.abs(u - x) < 1e-6; })) uniq.push(x); });
        S.push(step("Features of y = " + h(srcs[fi]), "y-intercept: " + (isFinite(y00) ? "(0, " + n(y00) + ")" : "none (not defined at x = 0)") + "<br>x-intercepts in this window: " + (uniq.length ? uniq.map(function (x) { return "x ≈ " + n(x); }).join(", ") : "none found")));
      });
      S.push(step("Note", "The curve is drawn from 800 sample points. Very narrow peaks or gaps can be missed, so zoom in with a smaller x range to check."));
      return S.join("");
    } };
})();
