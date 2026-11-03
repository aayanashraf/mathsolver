/* MathSolveIQ calculators, part 3. Load after calc.js and calc2.js.
   Adds: simplify, function-composition, partial-derivative, implicit-differentiation,
   eigenvalue, taylor-series, series-convergence, inverse-function, domain-and-range,
   rational-expression. */
(function () {
  var E = window.MSIQ = window.MSIQ || {};
  var EPS = 1e-9;
  var n = function (v) { v = +(+v).toFixed(6); return Object.is(v, -0) ? 0 : v; };
  var esc = function (s) { return String(s).replace(/<(?![a-zA-Z\/!])/g, "&lt;"); };
  var step = function (t, d) { return '<div class="step"><b>' + esc(t) + "</b><br>" + esc(d) + "</div>"; };
  var co = function (a) { return a === 1 ? "" : (a === -1 ? "\u2212" : String(n(a))); };
  var sgn = function (b) { return b === 0 ? "" : (b < 0 ? " \u2212 " + n(-b) : " + " + n(b)); };
  var lin = function (a, b) { return a === 0 ? String(n(b)) : co(a) + "x" + sgn(b); };
  var num = function (s, name) {
    var v = Number(String(s).trim());
    if (String(s).trim() === "" || !isFinite(v)) throw new Error("Enter a number for " + name + ".");
    return v;
  };
  var sup = function (k) { return k > 1 ? "<sup>" + k + "</sup>" : ""; };

  /* ---------- polynomial in x and y: {"i,j": coefficient} ---------- */
  function pclean(p) { var o = {}; Object.keys(p).forEach(function (k) { if (Math.abs(p[k]) > EPS) o[k] = p[k]; }); return o; }
  function pconst(c) { return pclean({ "0,0": c }); }
  function padd(a, b, s) {
    var o = {}; s = s || 1;
    Object.keys(a).forEach(function (k) { o[k] = (o[k] || 0) + a[k]; });
    Object.keys(b).forEach(function (k) { o[k] = (o[k] || 0) + s * b[k]; });
    return pclean(o);
  }
  function pmul(a, b) {
    var o = {};
    Object.keys(a).forEach(function (k) {
      Object.keys(b).forEach(function (m) {
        var A = k.split(",").map(Number), B = m.split(",").map(Number), key = (A[0] + B[0]) + "," + (A[1] + B[1]);
        o[key] = (o[key] || 0) + a[k] * b[m];
      });
    });
    return pclean(o);
  }
  function ppow(a, e) { var r = pconst(1); for (var i = 0; i < e; i++) r = pmul(r, a); return r; }
  function pscale(a, s) { var o = {}; Object.keys(a).forEach(function (k) { o[k] = a[k] * s; }); return pclean(o); }
  function pder(p, v) {
    var o = {}, idx = v === "x" ? 0 : 1;
    Object.keys(p).forEach(function (k) {
      var e = k.split(",").map(Number); if (!e[idx]) return;
      var c = p[k] * e[idx]; e[idx]--; var key = e[0] + "," + e[1]; o[key] = (o[key] || 0) + c;
    });
    return pclean(o);
  }
  function peval(p, x, y) {
    return Object.keys(p).reduce(function (s, k) { var e = k.split(",").map(Number); return s + p[k] * Math.pow(x, e[0]) * Math.pow(y, e[1]); }, 0);
  }
  function ptostr(p) {
    var keys = Object.keys(p);
    if (!keys.length) return "0";
    keys.sort(function (a, b) {
      var A = a.split(",").map(Number), B = b.split(",").map(Number);
      return (B[0] + B[1]) - (A[0] + A[1]) || B[0] - A[0];
    });
    var out = "";
    keys.forEach(function (k, i) {
      var e = k.split(",").map(Number), c = p[k], neg = c < 0, a = Math.abs(c), mon = "";
      if (e[0]) mon += "x" + sup(e[0]);
      if (e[1]) mon += "y" + sup(e[1]);
      var cs = (Math.abs(a - 1) < EPS && mon) ? "" : String(n(a));
      out += (i ? (neg ? " − " : " + ") : (neg ? "−" : "")) + cs + mon;
    });
    return out;
  }

  /* parser: + - * ^ ( ) numbers, variables, implicit multiplication */
  function parsePoly(str, vars) {
    var s = String(str).toLowerCase().replace(/[−–]/g, "-").replace(/[×·]/g, "*").replace(/\*\*/g, "^").replace(/\s+/g, "");
    if (!s) throw new Error("Type an expression first.");
    var toks = [], re = /(\d+\.?\d*|\.\d+)|([a-z])|([+\-*^()])/g, m, used = 0;
    while ((m = re.exec(s))) {
      if (m.index !== used) throw new Error("I could not read '" + s.charAt(used) + "'. Use only numbers, " + vars.join(", ") + ", + − * ^ and brackets.");
      used = re.lastIndex;
      if (m[1] !== undefined) toks.push({ t: "n", v: parseFloat(m[1]) });
      else if (m[2]) {
        if (vars.indexOf(m[2]) < 0) throw new Error("Only the variable" + (vars.length > 1 ? "s " : " ") + vars.join(" and ") + " can be used here (found '" + m[2] + "'). This calculator handles polynomials, so sin, cos, ln and similar are not supported.");
        toks.push({ t: "v", v: m[2] });
      } else toks.push({ t: m[3] });
    }
    if (used !== s.length) throw new Error("I could not read '" + s.charAt(used) + "'.");
    var i = 0;
    function peek() { return toks[i]; }
    function expr() {
      var r = term();
      while (peek() && (peek().t === "+" || peek().t === "-")) { var op = toks[i++].t; var t = term(); r = padd(r, t, op === "+" ? 1 : -1); }
      return r;
    }
    function term() {
      var r = unary();
      for (;;) {
        var k = peek();
        if (!k) break;
        if (k.t === "*") { i++; r = pmul(r, unary()); }
        else if (k.t === "(" || k.t === "v") r = pmul(r, power());
        else break;
      }
      return r;
    }
    function unary() {
      var k = peek();
      if (k && k.t === "-") { i++; return pscale(unary(), -1); }
      if (k && k.t === "+") { i++; return unary(); }
      return power();
    }
    function power() {
      var b = atom();
      if (peek() && peek().t === "^") {
        i++;
        var neg = false; if (peek() && peek().t === "-") { neg = true; i++; }
        var e = peek();
        if (!e || e.t !== "n" || neg || e.v !== Math.floor(e.v) || e.v > 12) throw new Error("Exponents must be whole numbers from 0 to 12.");
        i++; return ppow(b, e.v);
      }
      return b;
    }
    function atom() {
      var k = toks[i++];
      if (!k) throw new Error("The expression ends too early. Check for a missing number or bracket.");
      if (k.t === "n") return pconst(k.v);
      if (k.t === "v") { var o = {}; o[k.v === "x" ? "1,0" : "0,1"] = 1; return o; }
      if (k.t === "(") { var r = expr(); if (!peek() || peek().t !== ")") throw new Error("A bracket is not closed."); i++; return r; }
      throw new Error("Unexpected '" + k.t + "'. Check the expression.");
    }
    var res = expr();
    if (i < toks.length) throw new Error("Unexpected '" + toks[i].t + "'. Check the brackets.");
    return res;
  }
  function arrOf(p) { // univariate in x, highest degree first
    var d = 0; Object.keys(p).forEach(function (k) { var e = k.split(",").map(Number); if (e[1]) throw new Error("Use only x here."); d = Math.max(d, e[0]); });
    var a = []; for (var i = d; i >= 0; i--) a.push(p[i + ",0"] || 0); return a;
  }
  function fromArr(a) { var p = {}; a.forEach(function (c, i) { p[(a.length - 1 - i) + ",0"] = c; }); return pclean(p); }

  /* roots of a real polynomial (highest degree first), Durand-Kerner */
  function roots(c) {
    c = c.slice(); while (c.length > 1 && Math.abs(c[0]) < EPS) c.shift();
    var d = c.length - 1; if (d < 1) return [];
    var a = c.map(function (v) { return v / c[0]; }), z = [], cur = [1, 0], z0 = [0.4, 0.9], i, j;
    for (i = 0; i < d; i++) { z.push(cur); cur = [cur[0] * z0[0] - cur[1] * z0[1], cur[0] * z0[1] + cur[1] * z0[0]]; }
    for (var it = 0; it < 2000; it++) {
      var delta = 0;
      for (i = 0; i < d; i++) {
        var r = [1, 0];
        for (j = 1; j <= d; j++) r = [r[0] * z[i][0] - r[1] * z[i][1] + a[j], r[0] * z[i][1] + r[1] * z[i][0]];
        var dn = [1, 0];
        for (j = 0; j < d; j++) if (j !== i) { var df = [z[i][0] - z[j][0], z[i][1] - z[j][1]]; dn = [dn[0] * df[0] - dn[1] * df[1], dn[0] * df[1] + dn[1] * df[0]]; }
        var q = dn[0] * dn[0] + dn[1] * dn[1]; if (q < 1e-300) q = 1e-300;
        var w = [(r[0] * dn[0] + r[1] * dn[1]) / q, (r[1] * dn[0] - r[0] * dn[1]) / q];
        z[i] = [z[i][0] - w[0], z[i][1] - w[1]]; delta = Math.max(delta, Math.abs(w[0]) + Math.abs(w[1]));
      }
      if (delta < 1e-14) break;
    }
    return z.map(function (v) {
      var re = v[0], im = v[1];
      if (Math.abs(im) < 1e-4 * (1 + Math.abs(re))) im = 0;
      if (Math.abs(re - Math.round(re)) < 1e-4) re = Math.round(re);
      if (Math.abs(im - Math.round(im)) < 1e-4) im = Math.round(im);
      return [re, im];
    }).sort(function (p, q) { return p[0] - q[0] || p[1] - q[1]; });
  }
  function cstr(z) {
    if (!z[1]) return String(n(z[0]));
    var re = z[0] ? String(n(z[0])) + (z[1] < 0 ? " − " : " + ") : (z[1] < 0 ? "−" : "");
    var im = Math.abs(z[1]); return re + (Math.abs(im - 1) < EPS ? "" : String(n(im))) + "i";
  }

  /* ---------- 1. Simplify ---------- */
  E.simplify = { fields: [{ id: "e", label: "Polynomial expression in x and y (use ^ for powers)", type: "text", value: "(x+2)(x-3) + 2x(x-1) - 4" }],
    solve: function (v) {
      var p = parsePoly(v.e, ["x", "y"]), S = [];
      S.push(step("Expression", String(v.e).replace(/</g, "&lt;")));
      S.push(step("1. Expand every bracket", "Multiply each term inside one bracket by each term in the next one."));
      S.push(step("2. Collect like terms", "Add the coefficients of terms that have the same powers of x and y."));
      S.push(step("Simplified form", "<b>" + ptostr(p) + "</b>"));
      var t = [[2, 3], [-1, 4]].map(function (q) { return "x = " + q[0] + ", y = " + q[1] + " gives " + n(peval(p, q[0], q[1])); }).join("<br>");
      S.push(step("Quick check", "Evaluate the simplified form at sample points:<br>" + t));
      return S.join("");
    } };

  /* ---------- 2. Function composition ---------- */
  E["function-composition"] = { fields: [
    { id: "f", label: "f(x)", type: "text", value: "x^2 + 1" },
    { id: "g", label: "g(x)", type: "text", value: "2x - 3" },
    { id: "x0", label: "Optional: evaluate at x =", type: "text", value: "2" }],
    solve: function (v) {
      var f = parsePoly(v.f, ["x"]), g = parsePoly(v.g, ["x"]), S = [];
      var fa = arrOf(f), ga = arrOf(g);
      function comp(outer, inner) {
        var r = {}; outer.forEach(function (c, i) { var e = outer.length - 1 - i; r = padd(r, pscale(ppow(inner, e), c)); }); return r;
      }
      var fg = comp(fa, g), gf = comp(ga, f);
      S.push(step("Given", "f(x) = " + ptostr(f) + "<br>g(x) = " + ptostr(g)));
      S.push(step("1. (f ∘ g)(x) = f(g(x))", "Replace every x in f with g(x) = (" + ptostr(g) + ").<br>= <b>" + ptostr(fg) + "</b>"));
      S.push(step("2. (g ∘ f)(x) = g(f(x))", "Replace every x in g with f(x) = (" + ptostr(f) + ").<br>= <b>" + ptostr(gf) + "</b>"));
      S.push(step("Note", ptostr(fg) === ptostr(gf) ? "Here f∘g and g∘f are equal, which is unusual." : "f∘g and g∘f are different, so the order of composition matters."));
      if (String(v.x0).trim() !== "") {
        var x0 = num(v.x0, "x"), gv = peval(g, x0, 0), fv = peval(f, x0, 0);
        S.push(step("3. Values at x = " + n(x0), "g(" + n(x0) + ") = " + n(gv) + ", so f(g(" + n(x0) + ")) = f(" + n(gv) + ") = <b>" + n(peval(f, gv, 0)) + "</b><br>f(" + n(x0) + ") = " + n(fv) + ", so g(f(" + n(x0) + ")) = g(" + n(fv) + ") = <b>" + n(peval(g, fv, 0)) + "</b>"));
      }
      return S.join("");
    } };

  /* ---------- 3. Partial derivative ---------- */
  E["partial-derivative"] = { fields: [
    { id: "f", label: "f(x, y) (polynomial, use ^ for powers)", type: "text", value: "3x^2y + 2xy^3 - 5y + 4" },
    { id: "pt", label: "Optional point: x, y", type: "text", value: "1, 2" }],
    solve: function (v) {
      var f = parsePoly(v.f, ["x", "y"]), S = [];
      var fx = pder(f, "x"), fy = pder(f, "y"), fxx = pder(fx, "x"), fyy = pder(fy, "y"), fxy = pder(fx, "y");
      S.push(step("f(x, y)", ptostr(f)));
      S.push(step("1. ∂f/∂x (treat y as a constant)", "Differentiate each term with respect to x only.<br><b>f<sub>x</sub> = " + ptostr(fx) + "</b>"));
      S.push(step("2. ∂f/∂y (treat x as a constant)", "<b>f<sub>y</sub> = " + ptostr(fy) + "</b>"));
      S.push(step("3. Second derivatives", "f<sub>xx</sub> = " + ptostr(fxx) + "<br>f<sub>yy</sub> = " + ptostr(fyy) + "<br>f<sub>xy</sub> = " + ptostr(fxy) + " (equals f<sub>yx</sub> for polynomials)"));
      if (String(v.pt).trim() !== "") {
        var q = String(v.pt).split(/[,;\s]+/).filter(Boolean).map(Number);
        if (q.length !== 2 || !q.every(isFinite)) throw new Error("Write the point as two numbers, like 1, 2.");
        S.push(step("4. At (" + n(q[0]) + ", " + n(q[1]) + ")", "f = " + n(peval(f, q[0], q[1])) + "<br>f<sub>x</sub> = " + n(peval(fx, q[0], q[1])) + "<br>f<sub>y</sub> = " + n(peval(fy, q[0], q[1]))));
      }
      return S.join("");
    } };

  /* ---------- 4. Implicit differentiation ---------- */
  E["implicit-differentiation"] = { fields: [
    { id: "eq", label: "Equation in x and y (with =)", type: "text", value: "x^2 + y^2 = 25" },
    { id: "pt", label: "Optional point on the curve: x, y", type: "text", value: "3, 4" }],
    solve: function (v) {
      var parts = String(v.eq).split("="), S = [];
      if (parts.length > 2) throw new Error("Use one = sign.");
      var F = padd(parsePoly(parts[0], ["x", "y"]), parts.length === 2 ? parsePoly(parts[1], ["x", "y"]) : {}, -1);
      var Fx = pder(F, "x"), Fy = pder(F, "y");
      if (!Object.keys(Fy).length) throw new Error("y does not appear in this equation, so there is no dy/dx to find.");
      S.push(step("Equation", String(v.eq).replace(/</g, "&lt;")));
      S.push(step("1. Move everything to one side", "F(x, y) = " + ptostr(F) + " = 0"));
      S.push(step("2. Differentiate both sides with respect to x", "Each y-term gets a factor dy/dx by the chain rule, so<br>F<sub>x</sub> + F<sub>y</sub>·(dy/dx) = 0."));
      S.push(step("3. Partial derivatives", "F<sub>x</sub> = " + ptostr(Fx) + "<br>F<sub>y</sub> = " + ptostr(Fy)));
      S.push(step("4. Solve for dy/dx", "<b>dy/dx = −(" + ptostr(Fx) + ") / (" + ptostr(Fy) + ")</b>"));
      if (String(v.pt).trim() !== "") {
        var q = String(v.pt).split(/[,;\s]+/).filter(Boolean).map(Number);
        if (q.length !== 2 || !q.every(isFinite)) throw new Error("Write the point as two numbers, like 3, 4.");
        var on = Math.abs(peval(F, q[0], q[1])) < 1e-6, fy = peval(Fy, q[0], q[1]);
        var t = on ? "" : "<br><b>Warning:</b> this point does not lie on the curve (F = " + n(peval(F, q[0], q[1])) + " there).";
        S.push(step("5. Slope at (" + n(q[0]) + ", " + n(q[1]) + ")", Math.abs(fy) < EPS ? "F<sub>y</sub> = 0 here, so the tangent is vertical and dy/dx is undefined." + t : "dy/dx = −(" + n(peval(Fx, q[0], q[1])) + ") / (" + n(fy) + ") = <b>" + n(-peval(Fx, q[0], q[1]) / fy) + "</b>" + t));
      }
      return S.join("");
    } };

  /* ---------- 5. Eigenvalue ---------- */
  function parseSq(s) {
    var rows = String(s).split(/;|\n/).map(function (r) { return r.trim(); }).filter(Boolean).map(function (r) { return r.split(/[,\s]+/).filter(Boolean).map(Number); });
    var N = rows.length;
    if ((N !== 2 && N !== 3) || !rows.every(function (r) { return r.length === N && r.every(isFinite); })) throw new Error("Write a 2x2 or 3x3 matrix like 2,1;1,2 (rows separated by ;).");
    return rows;
  }
  function nullspace(B) {
    var m = B.map(function (r) { return r.slice(); }), R = m.length, C = m[0].length, piv = [], r = 0, c, i, j;
    var scale = Math.max(1, Math.max.apply(null, m.map(function (row) { return Math.max.apply(null, row.map(Math.abs)); }))), tol = 1e-5 * scale;
    for (c = 0; c < C && r < R; c++) {
      var best = r; for (i = r + 1; i < R; i++) if (Math.abs(m[i][c]) > Math.abs(m[best][c])) best = i;
      if (Math.abs(m[best][c]) < tol) continue;
      var tmp = m[r]; m[r] = m[best]; m[best] = tmp;
      var pv = m[r][c]; for (j = 0; j < C; j++) m[r][j] /= pv;
      for (i = 0; i < R; i++) if (i !== r) { var f = m[i][c]; for (j = 0; j < C; j++) m[i][j] -= f * m[r][j]; }
      piv.push(c); r++;
    }
    var out = [];
    for (c = 0; c < C; c++) if (piv.indexOf(c) < 0) {
      var vec = []; for (j = 0; j < C; j++) vec.push(0); vec[c] = 1;
      piv.forEach(function (pc, ri) { vec[pc] = -m[ri][c]; });
      out.push(vec);
    }
    return out;
  }
  function niceVec(v) {
    var nz = v.filter(function (x) { return Math.abs(x) > 1e-7; }).map(Math.abs);
    if (!nz.length) return v;
    var mn = Math.min.apply(null, nz), w = v.map(function (x) { return x / mn; });
    var first = w.filter(function (x) { return Math.abs(x) > 1e-7; })[0]; if (first < 0) w = w.map(function (x) { return -x; });
    for (var s = 1; s <= 12; s++) {
      if (w.every(function (x) { var y = x * s; return Math.abs(y - Math.round(y)) < 1e-4; })) return w.map(function (x) { return Math.round(x * s); });
    }
    return w.map(n);
  }
  E.eigenvalue = { fields: [{ id: "m", label: "Square matrix (2x2 or 3x3), rows separated by ;", type: "text", value: "2,1;1,2" }],
    solve: function (v) {
      var A = parseSq(v.m), N = A.length, S = [], poly, lam;
      S.push(step("Matrix A", A.map(function (r) { return r.map(n).join("&nbsp;&nbsp;"); }).join("<br>")));
      var tr = A.reduce(function (s, r, i) { return s + r[i]; }, 0);
      if (N === 2) {
        var d2 = A[0][0] * A[1][1] - A[0][1] * A[1][0]; poly = [1, -tr, d2];
        S.push(step("1. Characteristic polynomial", "det(A − λI) = λ² − (trace)λ + det(A)<br>= λ² − (" + n(tr) + ")λ + (" + n(d2) + ")"));
      } else {
        var M = A, minors = (M[0][0] * M[1][1] - M[0][1] * M[1][0]) + (M[0][0] * M[2][2] - M[0][2] * M[2][0]) + (M[1][1] * M[2][2] - M[1][2] * M[2][1]);
        var d3 = M[0][0] * (M[1][1] * M[2][2] - M[1][2] * M[2][1]) - M[0][1] * (M[1][0] * M[2][2] - M[1][2] * M[2][0]) + M[0][2] * (M[1][0] * M[2][1] - M[1][1] * M[2][0]);
        poly = [1, -tr, minors, -d3];
        S.push(step("1. Characteristic polynomial", "det(A − λI) = λ³ − (trace)λ² + (sum of 2x2 minors)λ − det(A)<br>= λ³ − (" + n(tr) + ")λ² + (" + n(minors) + ")λ − (" + n(d3) + ")"));
      }
      lam = roots(poly);
      S.push(step("2. Eigenvalues (roots of the polynomial)", lam.map(function (z, i) { return "λ<sub>" + (i + 1) + "</sub> = <b>" + cstr(z) + "</b>"; }).join("<br>")));
      var done = {}, out = [];
      lam.forEach(function (z) {
        var key = String(n(z[0])) + "," + String(n(z[1]));
        if (done[key]) return; done[key] = 1;
        if (z[1]) { out.push("λ = " + cstr(z) + ": complex eigenvector (not shown here)."); return; }
        var B = A.map(function (r, i) { return r.map(function (x, j) { return i === j ? x - z[0] : x; }); });
        var ns = nullspace(B);
        out.push("λ = " + n(z[0]) + ": " + (ns.length ? ns.map(function (w) { return "v = [" + niceVec(w).join(", ") + "]<sup>T</sup>"; }).join(" and ") : "no eigenvector found (try a cleaner matrix)"));
      });
      S.push(step("3. Eigenvectors (solve (A − λI)v = 0)", out.join("<br>")));
      var sumL = lam.reduce(function (s, z) { return s + z[0]; }, 0);
      S.push(step("Check", "The eigenvalues add up to " + n(sumL) + ", which equals the trace " + n(tr) + "."));
      return S.join("");
    } };

  /* ---------- 6. Taylor series ---------- */
  var FNS = ["e^x", "sin(x)", "cos(x)", "ln(x)", "1/x", "sqrt(x)", "1/(1−x)"];
  function fact(k) { var r = 1; for (var i = 2; i <= k; i++) r *= i; return r; }
  function derivAt(fn, k, a) {
    switch (fn) {
      case "e^x": return Math.exp(a);
      case "sin(x)": return Math.sin(a + k * Math.PI / 2);
      case "cos(x)": return Math.cos(a + k * Math.PI / 2);
      case "ln(x)": return k === 0 ? Math.log(a) : (k % 2 ? 1 : -1) * fact(k - 1) / Math.pow(a, k);
      case "1/x": return (k % 2 ? -1 : 1) * fact(k) / Math.pow(a, k + 1);
      case "sqrt(x)": { var c = 1; for (var j = 0; j < k; j++) c *= (0.5 - j); return c * Math.pow(a, 0.5 - k); }
      case "1/(1−x)": return fact(k) / Math.pow(1 - a, k + 1);
    }
  }
  function trueF(fn, x) { return { "e^x": Math.exp, "sin(x)": Math.sin, "cos(x)": Math.cos, "ln(x)": Math.log, "1/x": function (t) { return 1 / t; }, "sqrt(x)": Math.sqrt, "1/(1−x)": function (t) { return 1 / (1 - t); } }[fn](x); }
  function frac(x) {
    if (Math.abs(x - Math.round(x)) < 1e-9) return [Math.round(x), 1];
    var s = x < 0 ? -1 : 1, y = Math.abs(x), h1 = 1, h0 = 0, k1 = 0, k0 = 1, b = y;
    for (var i = 0; i < 30; i++) {
      var a = Math.floor(b), h2 = a * h1 + h0, k2 = a * k1 + k0; h0 = h1; h1 = h2; k0 = k1; k1 = k2;
      if (Math.abs(y - h1 / k1) < 1e-10 * Math.max(1, y)) return k1 > 1e7 ? null : [s * h1, k1];
      if (b - a < 1e-12) break; b = 1 / (b - a); if (k1 > 1e7) return null;
    }
    return null;
  }
  function cs(c) { var f = frac(c); return f && f[1] !== 1 ? "(" + f[0] + "/" + f[1] + ")" : String(n(c)); }
  E["taylor-series"] = { fields: [
    { id: "fn", label: "Function f(x)", type: "select", options: FNS },
    { id: "a", label: "Centre a (0 gives a Maclaurin series)", type: "text", value: "0" },
    { id: "N", label: "Highest power n (0 to 12)", type: "text", value: "5" },
    { id: "x0", label: "Optional: approximate f at x =", type: "text", value: "0.5" }],
    solve: function (v) {
      var a = num(v.a, "a"), N = Math.round(num(v.N, "n")), fn = v.fn || FNS[0], S = [];
      if (N < 0 || N > 12) throw new Error("Choose n between 0 and 12.");
      if ((fn === "ln(x)" || fn === "sqrt(x)") && a <= 0) throw new Error(fn + " needs a centre a greater than 0.");
      if (fn === "1/x" && a === 0) throw new Error("1/x is not defined at a = 0. Choose another centre.");
      if (fn === "1/(1−x)" && a === 1) throw new Error("1/(1−x) is not defined at a = 1. Choose another centre.");
      var rows = "", terms = [], cf = [];
      for (var k = 0; k <= N; k++) {
        var d = derivAt(fn, k, a), c = d / fact(k); cf.push(c);
        rows += "<tr><td>" + k + "</td><td>" + n(d) + "</td><td>" + cs(c) + "</td></tr>";
      }
      var base = a === 0 ? "x" : "(x " + (a < 0 ? "+ " + n(-a) : "− " + n(a)) + ")";
      cf.forEach(function (c, k) {
        if (Math.abs(c) < 1e-12) return;
        var mon = k === 0 ? "" : base + sup(k), neg = c < 0, ac = Math.abs(c);
        var body = k === 0 ? cs(ac) : (Math.abs(ac - 1) < 1e-12 ? mon : cs(ac) + mon);
        terms.push((terms.length ? (neg ? " − " : " + ") : (neg ? "−" : "")) + body);
      });
      S.push(step("Formula", "f(x) ≈ Σ f<sup>(k)</sup>(a)/k! · (x − a)<sup>k</sup>, for k = 0 to n"));
      S.push(step("1. Derivatives at a = " + n(a) + " for f(x) = " + fn, '<table style="width:auto;display:inline-table"><tr><th>k</th><th>f<sup>(k)</sup>(a)</th><th>f<sup>(k)</sup>(a)/k!</th></tr>' + rows + "</table>"));
      S.push(step("2. Taylor polynomial of degree " + N, "<b>P<sub>" + N + "</sub>(x) = " + (terms.join("") || "0") + "</b>"));
      if (String(v.x0).trim() !== "") {
        var x0 = num(v.x0, "x"), approx = cf.reduce(function (s, c, k) { return s + c * Math.pow(x0 - a, k); }, 0), tv = trueF(fn, x0);
        var ok = isFinite(tv);
        S.push(step("3. Approximation at x = " + n(x0), "P<sub>" + N + "</sub>(" + n(x0) + ") = <b>" + n(approx) + "</b>" + (ok ? "<br>Exact f(" + n(x0) + ") = " + n(tv) + "<br>Error ≈ " + n(Math.abs(tv - approx)) : "<br>f is not defined at this x.")));
        if (fn === "ln(x)" || fn === "sqrt(x)" || fn === "1/x" || fn === "1/(1−x)") S.push(step("Note", "These series only converge near the centre. Far from a, adding more terms can make the answer worse."));
      }
      return S.join("");
    } };

  /* ---------- 7. Series convergence ---------- */
  function compileA(src) {
    var s = String(src).toLowerCase().replace(/[−–]/g, "-").replace(/[×·]/g, "*").replace(/π/g, "pi").replace(/\^/g, "**").replace(/\s+/g, "");
    if (!s) throw new Error("Type a(n), for example n^2/2^n.");
    s = s.replace(/\(([^()]*)\)!/g, "fact($1)").replace(/\bn!/g, "fact(n)");
    var rest = s.replace(/\b(sin|cos|tan|exp|ln|log|sqrt|abs|fact|pi|n)\b/g, "");
    if (!/^[0-9+\-*\/().,]*$/.test(rest)) throw new Error("I could not read a(n). Use n, numbers, + − * / ^, brackets and sin, cos, exp, ln, sqrt, abs, n!.");
    s = s.replace(/(\d|\)|n|pi)(?=\(|[a-z])/g, function (m, p, off) { return m + "*"; }).replace(/\*\*\*/g, "**");
    s = s.replace(/\b(sin|cos|tan|exp|ln|log|sqrt|abs|fact)\*\(/g, "$1(").replace(/\b(sin|cos|tan|exp|ln|log|sqrt|abs|fact)\*/g, "$1");
    s = s.replace(/(\)|\d)(?=\b(sin|cos|tan|exp|ln|log|sqrt|abs|fact|pi)\b)/g, "$1*");
    var f;
    try {
      f = new Function("n", "sin", "cos", "tan", "exp", "ln", "log", "sqrt", "abs", "fact", "pi", '"use strict"; return (' + s + ");");
    } catch (e) { throw new Error("I could not read a(n). Check brackets and operators."); }
    return function (k) {
      var r = f(k, Math.sin, Math.cos, Math.tan, Math.exp, Math.log, Math.log10, Math.sqrt, Math.abs, fact, Math.PI);
      return r;
    };
  }
  E["series-convergence"] = { fields: [
    { id: "kind", label: "Series type", type: "select", options: ["Geometric: Σ a·r^n", "p-series: Σ 1/n^p", "Ratio test on my own a(n)"] },
    { id: "a", label: "a (first term, geometric only)", type: "text", value: "3" },
    { id: "r", label: "r (geometric) or p (p-series)", type: "text", value: "0.5" },
    { id: "expr", label: "a(n) for the ratio test, e.g. n^2/2^n or 2^n/n!", type: "text", value: "n^2/2^n" }],
    solve: function (v) {
      var S = [], kind = v.kind || "Geometric: Σ a·r^n";
      if (kind.indexOf("Geometric") === 0) {
        var a = num(v.a, "a"), r = num(v.r, "r");
        S.push(step("Series", "Σ " + n(a) + " · (" + n(r) + ")<sup>n</sup>, n = 0, 1, 2, …"));
        S.push(step("1. Geometric series test", "A geometric series converges exactly when |r| < 1. Here |r| = " + n(Math.abs(r)) + "."));
        if (a === 0) S.push(step("Result", "Every term is 0, so the sum is <b>0</b> and it converges."));
        else if (Math.abs(r) < 1) S.push(step("Result", "<b>Converges</b>. Sum = a / (1 − r) = " + n(a) + " / " + n(1 - r) + " = <b>" + n(a / (1 - r)) + "</b>."));
        else S.push(step("Result", "<b>Diverges</b>, since |r| ≥ 1 and the terms do not shrink to 0."));
      } else if (kind.indexOf("p-series") === 0) {
        var p = num(v.r, "p");
        S.push(step("Series", "Σ 1 / n<sup>" + n(p) + "</sup>, n = 1, 2, 3, …"));
        S.push(step("1. p-series test", "Σ 1/n<sup>p</sup> converges exactly when p > 1. Here p = " + n(p) + "."));
        S.push(step("Result", p > 1 ? "<b>Converges</b> (p > 1)." : "<b>Diverges</b> (p ≤ 1)." + (p === 1 ? " This is the harmonic series." : "")));
      } else {
        var f = compileA(v.expr), best = null, k, ns = [1000, 300, 100, 60, 30];
        S.push(step("Series", "Σ a(n) with a(n) = " + String(v.expr).replace(/</g, "&lt;")));
        for (var i = 0; i < ns.length && !best; i++) {
          k = ns[i]; var x0 = f(k), x1 = f(k + 1);
          if (isFinite(x0) && isFinite(x1) && x0 !== 0) best = { k: k, a0: x0, L: Math.abs(x1 / x0) };
        }
        if (!best) throw new Error("I could not evaluate a(n) for large n. Check the formula.");
        S.push(step("1. Ratio test", "Compute L = lim |a(n+1) / a(n)|. At n = " + best.k + ", the ratio is " + n(best.L) + ", which is the estimate for L."));
        var L = best.L, res;
        if (L < 0.995) res = "L < 1, so the series <b>converges absolutely</b> by the ratio test.";
        else if (L > 1.005) res = "L > 1, so the series <b>diverges</b> by the ratio test.";
        else res = "L is about 1, so the ratio test is <b>inconclusive</b>. Try the integral test, comparison test or p-series.";
        S.push(step("Result", res));
        if (Math.abs(best.a0) > 0.01 && L >= 0.995) S.push(step("Test for divergence", "a(" + best.k + ") = " + n(best.a0) + " is not close to 0. If the terms do not tend to 0, the series diverges."));
        S.push(step("Note", "L is estimated numerically at a large n, so treat it as strong evidence and confirm with the limit by hand."));
      }
      return S.join("");
    } };

  /* ---------- 8. Inverse function ---------- */
  var INV = ["a·x + b", "(a·x + b)/(c·x + d)", "a·x³ + b", "a·e^x + b", "a·ln(x) + b"];
  E["inverse-function"] = { fields: [
    { id: "form", label: "Form of f(x)", type: "select", options: INV },
    { id: "a", label: "a", type: "text", value: "2" },
    { id: "b", label: "b", type: "text", value: "3" },
    { id: "c", label: "c (second form only)", type: "text", value: "1" },
    { id: "d", label: "d (second form only)", type: "text", value: "-4" }],
    solve: function (v) {
      var form = v.form || INV[0], a = num(v.a, "a"), b = num(v.b, "b"), S = [], inv, desc, chk;
      var c = 0, d = 0;
      if (form === INV[1]) { c = num(v.c, "c"); d = num(v.d, "d"); }
      if (a === 0 && form !== INV[1]) throw new Error("a = 0 makes f a constant, which has no inverse.");
      var one = function (x) { return x === 1 ? "" : (x === -1 ? "−" : n(x)); };
      var f, g;
      if (form === INV[0]) {
        desc = one(a) + "x " + (b < 0 ? "− " + n(-b) : "+ " + n(b));
        S.push(step("f(x)", desc)); S.push(step("1. Write y = f(x), then swap x and y", "x = " + one(a) + "y " + (b < 0 ? "− " + n(-b) : "+ " + n(b))));
        S.push(step("2. Solve for y", "y = (x " + (b < 0 ? "+ " + n(-b) : "− " + n(b)) + ") / " + n(a)));
        f = function (x) { return a * x + b; }; g = function (y) { return (y - b) / a; };
        S.push(step("Inverse", "<b>f<sup>−1</sup>(x) = (x " + (b < 0 ? "+ " + n(-b) : "− " + n(b)) + ") / " + n(a) + "</b><br>Domain and range: all real numbers."));
      } else if (form === INV[1]) {
        if (Math.abs(a * d - b * c) < EPS) throw new Error("ad − bc = 0, so f is constant (or undefined) and has no inverse.");
        S.push(step("f(x)", "(" + lin(a, b) + ") / (" + lin(c, d) + ")"));
        S.push(step("1. Write y = f(x), then swap x and y", "x = (a·y + b) / (c·y + d)"));
        S.push(step("2. Clear the fraction and collect y", "x(c·y + d) = a·y + b<br>y(c·x − a) = b − d·x"));
        S.push(step("3. Solve for y", "y = (b − d·x) / (c·x − a) = (d·x − b) / (a − c·x)"));
        f = function (x) { return (a * x + b) / (c * x + d); }; g = function (y) { return (d * y - b) / (a - c * y); };
        S.push(step("Inverse", "<b>f<sup>−1</sup>(x) = (" + lin(d, -b) + ") / (" + lin(-c, a) + ")</b>" + (c !== 0 ? "<br>Domain: x ≠ " + n(a / c) + ". Range: y ≠ " + n(-d / c) + "." : "")));
      } else if (form === INV[2]) {
        S.push(step("f(x)", one(a) + "x³ " + (b < 0 ? "− " + n(-b) : "+ " + n(b))));
        S.push(step("1. Write y = f(x), then swap x and y", "x = " + one(a) + "y³ " + (b < 0 ? "− " + n(-b) : "+ " + n(b))));
        S.push(step("2. Solve for y", "y³ = (x " + (b < 0 ? "+ " + n(-b) : "− " + n(b)) + ") / " + n(a) + ", so y = cube root of that"));
        f = function (x) { return a * x * x * x + b; }; g = function (y) { return Math.cbrt((y - b) / a); };
        S.push(step("Inverse", "<b>f<sup>−1</sup>(x) = ∛((x " + (b < 0 ? "+ " + n(-b) : "− " + n(b)) + ") / " + n(a) + ")</b><br>Domain and range: all real numbers."));
      } else if (form === INV[3]) {
        S.push(step("f(x)", one(a) + "e<sup>x</sup> " + (b < 0 ? "− " + n(-b) : "+ " + n(b))));
        S.push(step("1. Write y = f(x), then swap x and y", "x = " + one(a) + "e<sup>y</sup> " + (b < 0 ? "− " + n(-b) : "+ " + n(b))));
        S.push(step("2. Solve for y", "e<sup>y</sup> = (x " + (b < 0 ? "+ " + n(-b) : "− " + n(b)) + ") / " + n(a) + ", so y = ln of that"));
        f = function (x) { return a * Math.exp(x) + b; }; g = function (y) { return Math.log((y - b) / a); };
        S.push(step("Inverse", "<b>f<sup>−1</sup>(x) = ln((x " + (b < 0 ? "+ " + n(-b) : "− " + n(b)) + ") / " + n(a) + ")</b><br>Domain: " + (a > 0 ? "x > " + n(b) : "x < " + n(b)) + ". Range: all real numbers."));
      } else {
        S.push(step("f(x)", one(a) + "ln(x) " + (b < 0 ? "− " + n(-b) : "+ " + n(b))));
        S.push(step("1. Write y = f(x), then swap x and y", "x = " + one(a) + "ln(y) " + (b < 0 ? "− " + n(-b) : "+ " + n(b))));
        S.push(step("2. Solve for y", "ln(y) = (x " + (b < 0 ? "+ " + n(-b) : "− " + n(b)) + ") / " + n(a) + ", so y = e to that power"));
        f = function (x) { return a * Math.log(x) + b; }; g = function (y) { return Math.exp((y - b) / a); };
        S.push(step("Inverse", "<b>f<sup>−1</sup>(x) = e<sup>(x " + (b < 0 ? "+ " + n(-b) : "− " + n(b)) + ") / " + n(a) + "</sup></b><br>Domain: all real numbers. Range: y > 0."));
      }
      var t = form === INV[3] ? n(b + 2 * a) : (form === INV[4] ? 1.5 : 1.5), ft = f(g(t));
      S.push(step("Check", "f(f<sup>−1</sup>(" + t + ")) = " + (isFinite(ft) ? n(ft) : "not defined at this test point") + (Math.abs(ft - t) < 1e-6 ? ", which returns " + t + " as it should." : ".")));
      return S.join("");
    } };

  /* ---------- 9. Domain and range ---------- */
  var DR = ["a·x² + b·x + c", "√(a·x + b)", "1/(a·x + b)", "ln(a·x + b)", "(a·x + b)/(c·x + d)", "a·e^x + b"];
  E["domain-and-range"] = { fields: [
    { id: "form", label: "Form of f(x)", type: "select", options: DR },
    { id: "a", label: "a", type: "text", value: "1" },
    { id: "b", label: "b", type: "text", value: "-4" },
    { id: "c", label: "c (first and fifth forms only)", type: "text", value: "3" },
    { id: "d", label: "d (fifth form only)", type: "text", value: "0" }],
    solve: function (v) {
      var form = v.form || DR[0], a = num(v.a, "a"), b = num(v.b, "b"), S = [], dom, rng, why = [];
      var c = (form === DR[0] || form === DR[4]) ? num(v.c, "c") : 0, d = form === DR[4] ? num(v.d, "d") : 0, r = n;
      if (form === DR[0]) {
        S.push(step("f(x)", (a === 0 ? "" : co(a) + "x²") + (b === 0 ? "" : (b < 0 ? " − " : (a === 0 ? "" : " + ")) + (Math.abs(b) === 1 ? "" : n(Math.abs(b))) + "x") + (c === 0 ? (a === 0 && b === 0 ? "0" : "") : sgn(c))));
        dom = "all real numbers, (−∞, ∞)"; why.push("A polynomial is defined for every x.");
        if (a === 0) { if (b === 0) rng = "{" + r(c) + "} (a constant)"; else rng = "all real numbers (a line)"; why.push("a = 0, so this is not a parabola."); }
        else { var h = -b / (2 * a), k = c - b * b / (4 * a); why.push("The vertex is at x = −b/(2a) = " + r(h) + ", where f = " + r(k) + "."); rng = a > 0 ? "[" + r(k) + ", ∞)" : "(−∞, " + r(k) + "]"; why.push(a > 0 ? "a > 0, so the parabola opens up and " + r(k) + " is the minimum." : "a < 0, so the parabola opens down and " + r(k) + " is the maximum."); }
      } else if (form === DR[1]) {
        S.push(step("f(x)", "√(" + lin(a, b) + ")"));
        if (a === 0) { dom = b >= 0 ? "all real numbers" : "no real numbers"; rng = b >= 0 ? "{" + r(Math.sqrt(b)) + "}" : "empty"; why.push("a = 0, so the expression under the root is the constant " + r(b) + "."); }
        else { var x0 = -b / a; why.push("The expression under the root must be ≥ 0: " + lin(a, b) + " ≥ 0, so x " + (a > 0 ? "≥ " : "≤ ") + r(x0) + "."); dom = a > 0 ? "[" + r(x0) + ", ∞)" : "(−∞, " + r(x0) + "]"; rng = "[0, ∞)"; why.push("A square root is never negative, and it reaches every value from 0 upward."); }
      } else if (form === DR[2]) {
        S.push(step("f(x)", "1 / (" + lin(a, b) + ")"));
        if (a === 0) { if (b === 0) { dom = "no real numbers"; rng = "empty"; } else { dom = "all real numbers"; rng = "{" + r(1 / b) + "}"; } why.push("a = 0, so the denominator is constant."); }
        else { var x1 = -b / a; why.push("The denominator cannot be 0, so x ≠ " + r(x1) + "."); dom = "all real numbers except x = " + r(x1); rng = "all real numbers except y = 0"; why.push("1 divided by something is never 0, but it takes every other value."); }
      } else if (form === DR[3]) {
        S.push(step("f(x)", "ln(" + lin(a, b) + ")"));
        if (a === 0) { dom = b > 0 ? "all real numbers" : "no real numbers"; rng = b > 0 ? "{" + r(Math.log(b)) + "}" : "empty"; why.push("a = 0, so the log argument is the constant " + r(b) + "."); }
        else { var x2 = -b / a; why.push("The argument of ln must be positive: " + lin(a, b) + " > 0, so x " + (a > 0 ? "> " : "< ") + r(x2) + "."); dom = a > 0 ? "(" + r(x2) + ", ∞)" : "(−∞, " + r(x2) + ")"; rng = "all real numbers"; why.push("ln takes every real value as its argument ranges over the positive numbers."); }
      } else if (form === DR[4]) {
        S.push(step("f(x)", "(" + lin(a, b) + ") / (" + lin(c, d) + ")"));
        if (c === 0) {
          if (d === 0) { dom = "no real numbers"; rng = "empty"; why.push("The denominator is always 0."); }
          else { dom = "all real numbers"; rng = (a === 0 ? "{" + r(b / d) + "}" : "all real numbers"); why.push("c = 0, so the denominator is constant and f is a line."); }
        } else {
          var xs = -d / c; dom = "all real numbers except x = " + r(xs); why.push("The denominator is 0 when x = " + r(xs) + ".");
          if (Math.abs(a * d - b * c) < EPS) { rng = "{" + r(a / c) + "}"; why.push("ad − bc = 0, so the fraction cancels to the constant " + r(a / c) + "."); }
          else { rng = "all real numbers except y = " + r(a / c); why.push("The horizontal asymptote is y = a/c = " + r(a / c) + ", and f never reaches it."); }
        }
      } else {
        S.push(step("f(x)", co(a) + "e<sup>x</sup>" + sgn(b)));
        dom = "all real numbers"; why.push("e<sup>x</sup> is defined for every x.");
        if (a === 0) rng = "{" + r(b) + "}"; else { rng = a > 0 ? "(" + r(b) + ", ∞)" : "(−∞, " + r(b) + ")"; why.push("e<sup>x</sup> is always positive, so f stays " + (a > 0 ? "above " : "below ") + r(b) + " and never reaches it."); }
      }
      S.push(step("Reasoning", why.join("<br>")));
      S.push(step("Domain", "<b>" + dom + "</b>"));
      S.push(step("Range", "<b>" + rng + "</b>"));
      return S.join("");
    } };

  /* ---------- 10. Rational expression ---------- */
  function trim(a, tol) { a = a.slice(); while (a.length > 1 && Math.abs(a[0]) < tol) a.shift(); return a; }
  function remP(a, b, tol) {
    a = a.slice();
    while (a.length >= b.length) { var f = a[0] / b[0]; for (var i = 0; i < b.length; i++) a[i] -= f * b[i]; a.shift(); }
    return a.length ? trim(a, tol) : [0];
  }
  function divP(a, b) {
    a = a.slice(); var q = [];
    while (a.length >= b.length) { var f = a[0] / b[0]; q.push(f); for (var i = 0; i < b.length; i++) a[i] -= f * b[i]; a.shift(); }
    return q.length ? q : [0];
  }
  E["rational-expression"] = { fields: [
    { id: "num", label: "Numerator (polynomial in x)", type: "text", value: "x^2 - 1" },
    { id: "den", label: "Denominator (polynomial in x)", type: "text", value: "x^2 - x" }],
    solve: function (v) {
      var P = arrOf(parsePoly(v.num, ["x"])), Q = arrOf(parsePoly(v.den, ["x"])), S = [];
      var tol = 1e-8 * Math.max(1, Math.max.apply(null, P.concat(Q).map(Math.abs)));
      P = trim(P, tol); Q = trim(Q, tol);
      if (Q.length === 1 && Math.abs(Q[0]) < tol) throw new Error("The denominator is 0, which is not allowed.");
      S.push(step("Expression", "(" + ptostr(fromArr(P)) + ") / (" + ptostr(fromArr(Q)) + ")"));
      var a = P, b = Q, g;
      if (P.length === 1 && Math.abs(P[0]) < tol) g = Q;
      else {
        if (a.length < b.length) { var t = a; a = b; b = t; }
        while (!(b.length === 1 && Math.abs(b[0]) < tol)) { var r = remP(a, b, tol); a = b; b = r; }
        g = a;
      }
      g = g.map(function (x) { return x / g[0]; });
      var rt = roots(Q).filter(function (z) { return !z[1]; }).map(function (z) { return z[0]; });
      var uniq = []; rt.forEach(function (x) { if (!uniq.some(function (u) { return Math.abs(u - x) < 1e-4; })) uniq.push(x); });
      if (g.length > 1) {
        var N2 = divP(P, g), D2 = divP(Q, g), sc = D2[0]; N2 = N2.map(function (x) { return x / sc; }); D2 = D2.map(function (x) { return x / sc; });
        S.push(step("1. Find the common factor", "Using the Euclidean algorithm on the two polynomials, the greatest common factor is<br><b>" + ptostr(fromArr(g)) + "</b>"));
        S.push(step("2. Cancel it from top and bottom", "Numerator ÷ factor = " + ptostr(fromArr(N2)) + "<br>Denominator ÷ factor = " + ptostr(fromArr(D2))));
        S.push(step("Simplified", "<b>(" + ptostr(fromArr(N2)) + ") / (" + ptostr(fromArr(D2)) + ")</b>"));
        var holes = roots(g).filter(function (z) { return !z[1]; }).map(function (z) { return n(z[0]); });
        if (holes.length) S.push(step("Holes", "The cancelled factor is 0 at x = " + holes.join(", ") + ", so the graph has a hole there (the simplified form is defined, the original is not)."));
      } else {
        S.push(step("1. Look for common factors", "The numerator and denominator share no common polynomial factor, so the expression is <b>already in simplest form</b>."));
      }
      S.push(step("Excluded values", uniq.length ? "The original denominator is 0 at x = <b>" + uniq.map(n).join(", ") + "</b>. These x values are not allowed." : "The denominator has no real zeros, so every real x is allowed."));
      return S.join("");
    } };
  /* helpers shared with calc4.js */
  window.MSIQLIB = { n: n, step: step, num: num, esc: esc, co: co, sgn: sgn, lin: lin, sup: sup,
    parsePoly: parsePoly, arrOf: arrOf, fromArr: fromArr, ptostr: ptostr, roots: roots, cstr: cstr,
    peval: peval, padd: padd, pmul: pmul, pscale: pscale, ppow: ppow, trim: trim, remP: remP, divP: divP };
})();
