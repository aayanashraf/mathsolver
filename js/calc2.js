/* MathSolveIQ calculators, part 2. Loads after calc.js and adds more engines. */
(function () {
  var E = window.MSIQ = window.MSIQ || {};
  var G = function (a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a; };
  var n = function (v) { return +(+v).toFixed(6); };
  var step = function (t, d) { return '<div class="step"><b>' + t + "</b><br>" + d + "</div>"; };
  var list = function (s) { return String(s).split(/[,\s]+/).filter(Boolean).map(Number); };
  var fin = function (a) { return a.length > 0 && a.every(function (x) { return isFinite(x); }); };
  function parseM(s) {
    var rows = String(s).split(/;|\n/).map(function (r) { return r.trim(); }).filter(Boolean).map(list);
    if (!rows.length || !rows.every(function (r) { return fin(r) && r.length === rows[0].length; })) throw new Error("Write a matrix like 1,2;3,4 (rows separated by ;, numbers by commas).");
    return rows;
  }
  function tbl(M) { return '<table style="width:auto;display:inline-table">' + M.map(function (r) { return "<tr>" + r.map(function (x) { return "<td>" + n(x) + "</td>"; }).join("") + "</tr>"; }).join("") + "</table>"; }
  function sq(M, name) { if (M.length !== M[0].length || M.length < 2 || M.length > 3) throw new Error(name + " must be a 2x2 or 3x3 square matrix, like 1,2;3,4"); }
  function det3(M) { return M[0][0] * (M[1][1] * M[2][2] - M[1][2] * M[2][1]) - M[0][1] * (M[1][0] * M[2][2] - M[1][2] * M[2][0]) + M[0][2] * (M[1][0] * M[2][1] - M[1][1] * M[2][0]); }
  function det(M) { return M.length === 2 ? M[0][0] * M[1][1] - M[0][1] * M[1][0] : det3(M); }
  function frac(a, b) { if (!Number.isInteger(a) || !Number.isInteger(b)) return String(n(a / b)); var g = G(a, b) || 1; a /= g; b /= g; if (b < 0) { a = -a; b = -b; } return b === 1 ? String(a) : a + "/" + b; }

  E.determinant = { fields: [{ id: "m", label: "Square matrix (2x2 or 3x3), rows separated by ;", type: "text", value: "1,2,3;0,1,4;5,6,0" }],
    solve: function (v) {
      var M = parseM(v.m); sq(M, "The matrix"); var S = [];
      S.push(step("Matrix", tbl(M)));
      if (M.length === 2) {
        S.push(step("1. Formula for a 2x2 matrix", "det = ad − bc"));
        S.push(step("2. Substitute", "(" + M[0][0] + ")(" + M[1][1] + ") − (" + M[0][1] + ")(" + M[1][0] + ") = <b>" + n(det(M)) + "</b>"));
      } else {
        S.push(step("1. Expand along the first row", "det = a(ei − fh) − b(di − fg) + c(dh − eg)"));
        var t = [0, 1, 2].map(function (j) {
          var c = [0, 1, 2].filter(function (k) { return k !== j; });
          var minor = M[1][c[0]] * M[2][c[1]] - M[1][c[1]] * M[2][c[0]];
          return (j === 1 ? "−" : "+") + " " + M[0][j] + " × (" + n(minor) + ")";
        }).join(" ");
        S.push(step("2. Substitute the minors", t));
        S.push(step("3. Result", "det = <b>" + n(det3(M)) + "</b>"));
      }
      S.push(step("Meaning", det(M) === 0 ? "The determinant is 0, so the matrix is singular and has no inverse." : "The determinant is not 0, so the matrix has an inverse."));
      return S.join("");
    } };

  E["inverse-matrix"] = { fields: [{ id: "m", label: "Square matrix (2x2 or 3x3), rows separated by ;", type: "text", value: "2,1;5,3" }],
    solve: function (v) {
      var M = parseM(v.m); sq(M, "The matrix"); var S = [], d = det(M), N = M.length;
      S.push(step("Matrix A", tbl(M)));
      S.push(step("1. Determinant", "det(A) = <b>" + n(d) + "</b>"));
      if (d === 0) { S.push(step("Result", "The determinant is 0, so A is singular and <b>has no inverse</b>.")); return S.join(""); }
      var adj;
      if (N === 2) { adj = [[M[1][1], -M[0][1]], [-M[1][0], M[0][0]]]; S.push(step("2. Adjugate (swap a and d, negate b and c)", tbl(adj))); }
      else {
        var C = M.map(function (r, i) { return r.map(function (_, j) { var rows = [0, 1, 2].filter(function (k) { return k !== i; }), cols = [0, 1, 2].filter(function (k) { return k !== j; }); return Math.pow(-1, i + j) * (M[rows[0]][cols[0]] * M[rows[1]][cols[1]] - M[rows[0]][cols[1]] * M[rows[1]][cols[0]]); }); });
        S.push(step("2. Cofactor matrix", tbl(C)));
        adj = C[0].map(function (_, j) { return C.map(function (r) { return r[j]; }); });
        S.push(step("3. Adjugate (transpose of the cofactors)", tbl(adj)));
      }
      var inv = adj.map(function (r) { return r.map(function (x) { return x / d; }); });
      S.push(step("Inverse = adjugate ÷ det", "A⁻¹ = (1/" + n(d) + ") × adjugate<br>" + tbl(inv)));
      var prod = M.map(function (r) { return inv[0].map(function (_, j) { return Math.round(r.reduce(function (s, x, k) { return s + x * inv[k][j]; }, 0) * 1e9) / 1e9; }); });
      S.push(step("Check: A × A⁻¹", tbl(prod) + "<br>This should be the identity matrix."));
      return S.join("");
    } };

  E.matrix = { fields: [{ id: "a", label: "Matrix A (rows separated by ;)", type: "text", value: "1,2;3,4" },
    { id: "op", label: "Operation", type: "select", options: ["A + B", "A − B", "A × B", "Transpose of A"] },
    { id: "b", label: "Matrix B (not needed for transpose)", type: "text", value: "5,6;7,8" }],
    solve: function (v) {
      var A = parseM(v.a), S = [];
      S.push(step("A", tbl(A)));
      if (v.op === "Transpose of A") {
        var T = A[0].map(function (_, j) { return A.map(function (r) { return r[j]; }); });
        S.push(step("Swap rows and columns", tbl(T))); return S.join("");
      }
      var B = parseM(v.b); S.push(step("B", tbl(B)));
      if (v.op === "A + B" || v.op === "A − B") {
        if (A.length !== B.length || A[0].length !== B[0].length) throw new Error("A and B must have the same size to " + (v.op === "A + B" ? "add" : "subtract") + ".");
        var s = v.op === "A + B" ? 1 : -1;
        S.push(step(v.op === "A + B" ? "Add matching entries" : "Subtract matching entries", tbl(A.map(function (r, i) { return r.map(function (x, j) { return x + s * B[i][j]; }); }))));
      } else {
        if (A[0].length !== B.length) throw new Error("For A × B, the number of columns in A (" + A[0].length + ") must equal the number of rows in B (" + B.length + ").");
        var P = A.map(function (r) { return B[0].map(function (_, j) { return r.reduce(function (t, x, k) { return t + x * B[k][j]; }, 0); }); });
        S.push(step("How each entry is made", "Row of A times column of B. For example, the top-left entry is " + A[0].map(function (x, k) { return "(" + x + ")(" + B[k][0] + ")"; }).join(" + ") + " = " + n(P[0][0])));
        S.push(step("A × B", tbl(P)));
      }
      return S.join("");
    } };

  E["dot-product"] = { fields: [{ id: "u", label: "Vector u (numbers separated by commas)", type: "text", value: "1, 2, 3" }, { id: "w", label: "Vector v", type: "text", value: "4, -5, 6" }],
    solve: function (v) {
      var u = list(v.u), w = list(v.w), S = [];
      if (!fin(u) || !fin(w) || u.length !== w.length) throw new Error("Enter two vectors with the same number of entries.");
      var d = u.reduce(function (s, x, i) { return s + x * w[i]; }, 0);
      S.push(step("1. Multiply matching entries", u.map(function (x, i) { return "(" + x + ")(" + w[i] + ")"; }).join(" + ")));
      S.push(step("2. Add", "u · v = <b>" + n(d) + "</b>"));
      var mu = Math.sqrt(u.reduce(function (s, x) { return s + x * x; }, 0)), mw = Math.sqrt(w.reduce(function (s, x) { return s + x * x; }, 0));
      if (mu && mw) { var c = Math.max(-1, Math.min(1, d / (mu * mw))); S.push(step("3. Angle between them", "cos θ = u·v / (|u||v|) = " + n(c) + ", so θ ≈ <b>" + n(Math.acos(c) * 180 / Math.PI) + "°</b>")); }
      S.push(step("Meaning", d === 0 ? "The dot product is 0, so the vectors are perpendicular." : d > 0 ? "Positive: the angle is less than 90°." : "Negative: the angle is more than 90°."));
      return S.join("");
    } };

  E["cross-product"] = { fields: [{ id: "u", label: "Vector u (3 numbers)", type: "text", value: "1, 2, 3" }, { id: "w", label: "Vector v (3 numbers)", type: "text", value: "4, 5, 6" }],
    solve: function (v) {
      var u = list(v.u), w = list(v.w), S = [];
      if (!fin(u) || !fin(w) || u.length !== 3 || w.length !== 3) throw new Error("Enter exactly 3 numbers for each vector.");
      var c = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]];
      S.push(step("1. Formula", "u × v = (u₂v₃ − u₃v₂, u₃v₁ − u₁v₃, u₁v₂ − u₂v₁)"));
      S.push(step("2. Substitute", "i: " + u[1] + "·" + w[2] + " − " + u[2] + "·" + w[1] + " = " + n(c[0]) + "<br>j: " + u[2] + "·" + w[0] + " − " + u[0] + "·" + w[2] + " = " + n(c[1]) + "<br>k: " + u[0] + "·" + w[1] + " − " + u[1] + "·" + w[0] + " = " + n(c[2])));
      S.push(step("3. Result", "u × v = <b>(" + n(c[0]) + ", " + n(c[1]) + ", " + n(c[2]) + ")</b>"));
      S.push(step("4. Magnitude", "|u × v| = <b>" + n(Math.sqrt(c[0] * c[0] + c[1] * c[1] + c[2] * c[2])) + "</b>, which is the area of the parallelogram the vectors make."));
      S.push(step("Check", "The dot product with u is " + n(c[0] * u[0] + c[1] * u[1] + c[2] * u[2]) + " and with v is " + n(c[0] * w[0] + c[1] * w[1] + c[2] * w[2]) + ". Both should be 0 (perpendicular)."));
      return S.join("");
    } };

  E["systems-of-equations"] = { fields: [
    { id: "a1", label: "Equation 1: a₁", value: 2 }, { id: "b1", label: "b₁", value: 3 }, { id: "c1", label: "= c₁", value: 12 },
    { id: "a2", label: "Equation 2: a₂", value: 1 }, { id: "b2", label: "b₂", value: -1 }, { id: "c2", label: "= c₂", value: 1 }],
    solve: function (v) {
      var a1 = +v.a1, b1 = +v.b1, c1 = +v.c1, a2 = +v.a2, b2 = +v.b2, c2 = +v.c2, S = [];
      if (![a1, b1, c1, a2, b2, c2].every(isFinite)) throw new Error("Enter numbers in all six boxes.");
      S.push(step("System", eq(a1, b1, c1) + "<br>" + eq(a2, b2, c2)));
      var D = a1 * b2 - a2 * b1;
      S.push(step("1. Determinant of the coefficients", "D = a₁b₂ − a₂b₁ = (" + a1 + ")(" + b2 + ") − (" + a2 + ")(" + b1 + ") = " + n(D)));
      if (D === 0) {
        var bad = (a1 === 0 && b1 === 0 && c1 !== 0) || (a2 === 0 && b2 === 0 && c2 !== 0), same = a1 * c2 === a2 * c1 && b1 * c2 === b2 * c1;
        S.push(step("Result", bad || !same ? "D = 0 and the equations disagree: <b>no solution</b> (parallel lines)." : "D = 0 and the equations describe the same line: <b>infinitely many solutions</b>."));
        return S.join("");
      }
      S.push(step("2. Eliminate y", "Multiply equation 1 by " + b2 + " and equation 2 by " + b1 + ", then subtract. The y terms cancel and leave " + n(D) + "x = " + n(c1 * b2 - c2 * b1)));
      var x = (c1 * b2 - c2 * b1) / D, y = (a1 * c2 - a2 * c1) / D;
      S.push(step("3. Solve for x", "x = " + n(c1 * b2 - c2 * b1) + " / " + n(D) + " = <b>" + n(x) + "</b>"));
      S.push(step("4. Solve for y", "y = (a₁c₂ − a₂c₁) / D = " + n(a1 * c2 - a2 * c1) + " / " + n(D) + " = <b>" + n(y) + "</b>"));
      S.push(step("5. Check", "Equation 1: " + n(a1 * x + b1 * y) + " (should be " + c1 + "). Equation 2: " + n(a2 * x + b2 * y) + " (should be " + c2 + ")."));
      return S.join("");
    } };

  function eq(a, b, c) { var t = ""; if (a !== 0) t += (a === 1 ? "" : a === -1 ? "-" : n(a)) + "x"; if (b !== 0) t += (t ? (b < 0 ? " − " : " + ") : (b < 0 ? "-" : "")) + (Math.abs(b) === 1 ? "" : n(Math.abs(b))) + "y"; return (t || "0") + " = " + n(c); }
  function poly(a, b, c) { var t = (a === 1 ? "" : a === -1 ? "-" : a) + "x²"; if (b !== 0) t += (b < 0 ? " − " : " + ") + (Math.abs(b) === 1 ? "" : Math.abs(b)) + "x"; if (c !== 0) t += (c < 0 ? " − " : " + ") + Math.abs(c); return t; }
  function lin(q, p) { var s = (q === 1 ? "" : q === -1 ? "-" : q) + "x"; if (p > 0) s += " − " + p; else if (p < 0) s += " + " + (-p); return "(" + s + ")"; }
  E.factoring = { fields: [{ id: "a", label: "a (for ax² + bx + c)", value: 1 }, { id: "b", label: "b", value: -5 }, { id: "c", label: "c", value: 6 }],
    solve: function (v) {
      var a = +v.a, b = +v.b, c = +v.c, S = [];
      if (![a, b, c].every(Number.isInteger)) throw new Error("Use whole numbers for a, b and c.");
      if (a === 0) throw new Error("a cannot be 0 for a quadratic.");
      S.push(step("Expression", poly(a, b, c)));
      var g = G(G(a, b), c) * (a < 0 ? -1 : 1);
      if (Math.abs(g) !== 1) S.push(step("1. Take out the common factor", "The GCF of the coefficients is " + g + ", so the expression is " + g + "(" + poly(a / g, b / g, c / g) + ")"));
      var A = a / g, B = b / g, C = c / g, D = B * B - 4 * A * C;
      S.push(step((Math.abs(g) !== 1 ? "2. " : "1. ") + "Discriminant", "D = b² − 4ac = " + D + (D < 0 ? " (negative, so it cannot be factored over the real numbers)" : "")));
      var r = Math.round(Math.sqrt(D));
      if (D < 0 || r * r !== D) { S.push(step("Result", "It <b>does not factor</b> into integer factors. Use the quadratic formula for its roots.")); return S.join(""); }
      var n1 = -B + r, n2 = -B - r, d = 2 * A, g1 = G(n1, d) || 1, g2 = G(n2, d) || 1;
      var p1 = n1 / g1, q1 = d / g1, p2 = n2 / g2, q2 = d / g2;
      if (q1 < 0) { p1 = -p1; q1 = -q1; } if (q2 < 0) { p2 = -p2; q2 = -q2; }
      if (p1 / q1 > p2 / q2) { var tp = p1, tq = q1; p1 = p2; q1 = q2; p2 = tp; q2 = tq; n1 = -B - r; n2 = -B + r; }
      S.push(step("Roots", "x = " + frac(n1, d) + " and x = " + frac(n2, d)));
      var k = g * (A / (q1 * q2));
      var out = (k === 1 ? "" : k === -1 ? "-" : k) + lin(q1, p1) + lin(q2, p2);
      S.push(step("Factored form", "<b>" + out + "</b>"));
      S.push(step("Check", "Expanding the factors gives back " + poly(a, b, c) + "."));
      return S.join("");
    } };

  E["complete-the-square"] = { fields: [{ id: "a", label: "a (for ax² + bx + c)", value: 1 }, { id: "b", label: "b", value: 6 }, { id: "c", label: "c", value: 5 }],
    solve: function (v) {
      var a = +v.a, b = +v.b, c = +v.c, S = [];
      if (![a, b, c].every(isFinite)) throw new Error("Enter numbers for a, b and c.");
      if (a === 0) throw new Error("a cannot be 0.");
      S.push(step("1. Factor a out of the x terms", a + "(x² + " + n(b / a) + "x) + " + c));
      var h = b / (2 * a);
      S.push(step("2. Half of the x coefficient, squared", "(" + n(b / a) + " / 2)² = " + n(h * h) + ". Add and subtract it inside the bracket."));
      var k = c - b * b / (4 * a);
      S.push(step("3. Write the perfect square", a + "(x + " + n(h) + ")² + " + n(k)));
      S.push(step("Vertex form", "<b>y = " + n(a) + "(x " + (h < 0 ? "− " + n(-h) : "+ " + n(h)) + ")² " + (k < 0 ? "− " + n(-k) : "+ " + n(k)) + "</b>"));
      S.push(step("Vertex", "(" + n(-h) + ", " + n(k) + "), the parabola opens " + (a > 0 ? "upward" : "downward") + "."));
      return S.join("");
    } };

  E.inequality = { fields: [{ id: "a", label: "a (for ax + b)", value: -2 }, { id: "b", label: "b", value: 3 },
    { id: "op", label: "Sign", type: "select", options: ["<", "≤", ">", "≥"] }, { id: "c", label: "c", value: 11 }],
    solve: function (v) {
      var a = +v.a, b = +v.b, c = +v.c, op = v.op, S = [];
      if (![a, b, c].every(isFinite)) throw new Error("Enter numbers for a, b and c.");
      S.push(step("Inequality", a + "x + " + b + " " + op + " " + c));
      if (a === 0) { var ok = op === "<" ? b < c : op === "≤" ? b <= c : op === ">" ? b > c : b >= c; S.push(step("Result", "x disappears, and the statement " + b + " " + op + " " + c + " is " + (ok ? "<b>always true</b> (all real numbers)." : "<b>never true</b> (no solution)."))); return S.join(""); }
      S.push(step("1. Subtract b", a + "x " + op + " " + n(c - b)));
      var flip = a < 0, nop = flip ? { "<": ">", "≤": "≥", ">": "<", "≥": "≤" }[op] : op, val = (c - b) / a;
      S.push(step("2. Divide by " + a, flip ? "Dividing by a negative number <b>flips the sign</b>: x " + nop + " " + n(val) : "x " + nop + " " + n(val)));
      var iv = nop === "<" ? "(−∞, " + n(val) + ")" : nop === "≤" ? "(−∞, " + n(val) + "]" : nop === ">" ? "(" + n(val) + ", ∞)" : "[" + n(val) + ", ∞)";
      S.push(step("Answer", "<b>x " + nop + " " + n(val) + "</b><br>Interval notation: <b>" + iv + "</b>"));
      return S.join("");
    } };

  E.logarithm = { fields: [{ id: "b", label: "Base", value: 2 }, { id: "x", label: "Number (x)", value: 32 }],
    solve: function (v) {
      var b = +v.b, x = +v.x, S = [];
      if (!isFinite(b) || !isFinite(x)) throw new Error("Enter numbers for the base and x.");
      if (b <= 0 || b === 1) throw new Error("The base must be above 0 and not equal to 1.");
      if (x <= 0) throw new Error("You can only take the log of a number above 0.");
      S.push(step("Question", "log base " + b + " of " + x + " asks: " + b + " to what power gives " + x + "?"));
      var r = Math.log(x) / Math.log(b), ri = Math.round(r);
      if (Math.abs(Math.pow(b, ri) - x) < 1e-9 * Math.max(1, x)) S.push(step("1. Exact answer", b + "<sup>" + ri + "</sup> = " + x + ", so the log is <b>" + ri + "</b>"));
      S.push(step("2. Change of base formula", "log<sub>" + b + "</sub>(x) = ln(x) / ln(" + b + ") = " + n(Math.log(x)) + " / " + n(Math.log(b)) + " = <b>" + n(r) + "</b>"));
      S.push(step("Also", "ln(" + x + ") = " + n(Math.log(x)) + " and log₁₀(" + x + ") = " + n(Math.log10(x))));
      return S.join("");
    } };

  E["law-of-cosines"] = { fields: [{ id: "mode", label: "What do you know?", type: "select", options: ["Sides a, b and angle C: find side c", "Sides a, b and c: find angle C"] },
    { id: "a", label: "Side a", value: 5 }, { id: "b", label: "Side b", value: 7 }, { id: "ang", label: "Angle C in degrees (first option)", value: 60 }, { id: "c", label: "Side c (second option)", value: 6 }],
    solve: function (v) {
      var a = +v.a, b = +v.b, S = [], R = Math.PI / 180;
      if (!(a > 0 && b > 0)) throw new Error("Sides a and b must be above 0.");
      S.push(step("Formula", "c² = a² + b² − 2ab·cos C"));
      if (v.mode.indexOf("find side") > -1) {
        var C = +v.ang; if (!(C > 0 && C < 180)) throw new Error("Angle C must be between 0° and 180°.");
        var c2 = a * a + b * b - 2 * a * b * Math.cos(C * R);
        S.push(step("1. Substitute", "c² = " + n(a * a) + " + " + n(b * b) + " − 2(" + a + ")(" + b + ")cos(" + C + "°) = " + n(c2)));
        S.push(step("2. Square root", "c = <b>" + n(Math.sqrt(c2)) + "</b>"));
      } else {
        var c = +v.c; if (!(c > 0)) throw new Error("Side c must be above 0.");
        if (c >= a + b || a >= b + c || b >= a + c) throw new Error("These sides cannot form a triangle: each side must be shorter than the other two added.");
        var cs = (a * a + b * b - c * c) / (2 * a * b);
        S.push(step("1. Rearrange for cos C", "cos C = (a² + b² − c²) / (2ab) = (" + n(a * a) + " + " + n(b * b) + " − " + n(c * c) + ") / " + n(2 * a * b) + " = " + n(cs)));
        S.push(step("2. Inverse cosine", "C = <b>" + n(Math.acos(cs) / R) + "°</b>"));
      }
      return S.join("");
    } };

  var EX = { 0: ["0", "1", "0"], 30: ["1/2", "√3/2", "√3/3"], 45: ["√2/2", "√2/2", "1"], 60: ["√3/2", "1/2", "√3"], 90: ["1", "0", "undefined"] };
  E["unit-circle"] = { fields: [{ id: "deg", label: "Angle in degrees", value: 150 }],
    solve: function (v) {
      var t = +v.deg, S = [];
      if (!isFinite(t)) throw new Error("Enter an angle in degrees.");
      var a = ((t % 360) + 360) % 360, q = a === 0 || a === 90 || a === 180 || a === 270 ? "on an axis" : a < 90 ? "I" : a < 180 ? "II" : a < 270 ? "III" : "IV";
      S.push(step("1. Coterminal angle (0° to 360°)", n(t) + "° ≡ <b>" + n(a) + "°</b>"));
      S.push(step("2. Quadrant", q === "on an axis" ? "The angle lies on an axis." : "Quadrant " + q));
      var ref = a <= 90 ? a : a <= 180 ? 180 - a : a <= 270 ? a - 180 : 360 - a;
      S.push(step("3. Reference angle", "<b>" + n(ref) + "°</b>"));
      var rad = a * Math.PI / 180, cs = Math.cos(rad), sn = Math.sin(rad);
      if (Math.abs(cs) < 1e-12) cs = 0; if (Math.abs(sn) < 1e-12) sn = 0;
      S.push(step("4. Coordinates (cos θ, sin θ)", "(" + n(cs) + ", " + n(sn) + ")"));
      var e = EX[ref];
      if (e) {
        var sS = sn < 0 ? "−" : "", cS = cs < 0 ? "−" : "", tn = Math.abs(cs) < 1e-12 ? "undefined" : (cs * sn < 0 ? "−" : "") + e[2];
        var sx = ref === a || ref === 180 - a || true ? e[0] : e[0];
        S.push(step("5. Exact values", "sin = " + (sn === 0 ? "0" : sS + sx) + "<br>cos = " + (cs === 0 ? "0" : cS + e[1]) + "<br>tan = " + (sn === 0 && cs !== 0 ? "0" : tn)));
      } else {
        S.push(step("5. Values", "sin = " + n(sn) + "<br>cos = " + n(cs) + "<br>tan = " + (Math.abs(cs) < 1e-12 ? "undefined" : n(sn / cs)) + "<br>This angle has no simple exact form, so decimals are shown."));
      }
      S.push(step("In radians", n(a * Math.PI / 180) + " rad"));
      return S.join("");
    } };

  /* ---- derivative and integral of sums of simple terms ---- */
  function parseExpr(src) {
    var s = String(src).toLowerCase().replace(/\s+/g, "").replace(/−/g, "-").replace(/\*\*/g, "^");
    if (!s) throw new Error("Type an expression such as 3x^4 - 2x^2 + 5x - 7");
    var parts = s.match(/[+-]?[^+-]+/g) || [];
    if (parts.join("") !== s) throw new Error("Could not read that. Use terms like 3x^4, -2x, sin(x), cos(x), e^x, ln(x) or a number, joined by + or -.");
    return parts.map(function (p) {
      var m = p.match(/^([+-]?)(\d*\.?\d*)\*?(x\^(\d+\.?\d*)|x|sin\(x\)|cos\(x\)|e\^x|ln\(x\)|)$/);
      if (!m || (m[2] === "" && m[3] === "")) throw new Error("Cannot read the term \"" + p + "\". Use terms like 3x^4, -2x, sin(x), cos(x), e^x, ln(x) or a number.");
      var coef = (m[1] === "-" ? -1 : 1) * (m[2] === "" ? 1 : parseFloat(m[2]));
      if (m[3] === "") return { c: coef, f: "const" };
      if (m[3] === "x") return { c: coef, f: "pow", p: 1 };
      if (m[4] !== undefined) return { c: coef, f: "pow", p: parseFloat(m[4]) };
      return { c: coef, f: m[3] === "sin(x)" ? "sin" : m[3] === "cos(x)" ? "cos" : m[3] === "e^x" ? "exp" : "ln" };
    });
  }
  function cf(c, body) { if (c === 0) return "0"; var a = Math.abs(c), s = a === 1 && body ? "" : String(n(a)); return (c < 0 ? "−" : "") + s + body; }
  function pw(p) { return p === 0 ? "" : p === 1 ? "x" : "x<sup>" + n(p) + "</sup>"; }
  function joinT(ts) { var out = ""; ts.forEach(function (t, i) { if (!t || t === "0") return; var neg = t.charAt(0) === "−"; out += i === 0 || !out ? t : (neg ? " − " + t.slice(1) : " + " + t); }); return out || "0"; }
  function showTerm(t) { return t.f === "const" ? cf(t.c, "") : t.f === "pow" ? cf(t.c, pw(t.p)) : cf(t.c, t.f === "exp" ? "e<sup>x</sup>" : t.f + "(x)" ); }

  E.derivative = { fields: [{ id: "f", label: "f(x) as a sum of terms", type: "text", value: "3x^4 - 2x^2 + 5x - 7" }],
    solve: function (v) {
      var T = parseExpr(v.f), S = [], res = [];
      S.push(step("Function", "f(x) = " + joinT(T.map(showTerm))));
      T.forEach(function (t, i) {
        var d, rule;
        if (t.f === "const") { d = "0"; rule = "The derivative of a constant is 0."; }
        else if (t.f === "pow") { d = t.p === 1 ? cf(t.c, "") : cf(t.c * t.p, pw(t.p - 1)); if (t.p === 1) d = cf(t.c, ""); rule = "Power rule: d/dx xⁿ = n·xⁿ⁻¹, so " + n(t.c) + " × " + n(t.p) + " = " + n(t.c * t.p) + " and the power drops to " + n(t.p - 1) + "."; }
        else if (t.f === "sin") { d = cf(t.c, "cos(x)"); rule = "d/dx sin x = cos x."; }
        else if (t.f === "cos") { d = cf(-t.c, "sin(x)"); rule = "d/dx cos x = −sin x."; }
        else if (t.f === "exp") { d = cf(t.c, "e<sup>x</sup>"); rule = "d/dx eˣ = eˣ."; }
        else { d = cf(t.c, "") + (Math.abs(t.c) === 1 ? "" : "") ; d = (t.c < 0 ? "−" : "") + (Math.abs(t.c) === 1 ? "" : n(Math.abs(t.c))) + "/x"; if (Math.abs(t.c) === 1) d = (t.c < 0 ? "−" : "") + "1/x"; rule = "d/dx ln x = 1/x."; }
        res.push(d);
        S.push(step((i + 1) + ". Term " + showTerm(t), rule + "<br>Result: " + d));
      });
      S.push(step("Answer", "f′(x) = <b>" + joinT(res) + "</b>"));
      return S.join("");
    } };

  function anti(T) {
    return T.map(function (t) {
      if (t.f === "const") return { s: cf(t.c, "x"), ev: function (x) { return t.c * x; }, why: "The integral of a constant c is c·x." };
      if (t.f === "pow") {
        if (t.p === -1) throw new Error("x to the power −1 is not supported here.");
        var q = t.p + 1, cc = t.c / q, intgr = Number.isInteger(t.c) && Number.isInteger(q);
        var coefS = intgr ? (function () { var g = G(t.c, q), a = t.c / g, b = q / g; if (b < 0) { a = -a; b = -b; } return b === 1 ? cf(a, pw(q)) : (a < 0 ? "−" : "") + (Math.abs(a) === 1 ? "" : Math.abs(a)) + pw(q) + "/" + b; })() : cf(cc, pw(q));
        return { s: coefS, ev: function (x) { return cc * Math.pow(x, q); }, why: "Power rule: ∫ xⁿ dx = xⁿ⁺¹/(n + 1). Here n = " + n(t.p) + ", so the new power is " + n(q) + "." };
      }
      if (t.f === "sin") return { s: cf(-t.c, "cos(x)"), ev: function (x) { return -t.c * Math.cos(x); }, why: "∫ sin x dx = −cos x." };
      if (t.f === "cos") return { s: cf(t.c, "sin(x)"), ev: function (x) { return t.c * Math.sin(x); }, why: "∫ cos x dx = sin x." };
      if (t.f === "exp") return { s: cf(t.c, "e<sup>x</sup>"), ev: function (x) { return t.c * Math.exp(x); }, why: "∫ eˣ dx = eˣ." };
      return { s: cf(t.c, "(x ln x − x)"), ev: function (x) { if (x <= 0) throw new Error("ln(x) needs x above 0 on the whole interval."); return t.c * (x * Math.log(x) - x); }, why: "∫ ln x dx = x ln x − x (integration by parts)." };
    });
  }
  E.integral = { fields: [{ id: "f", label: "f(x) as a sum of terms", type: "text", value: "3x^2 + 2x - 5" },
    { id: "lo", label: "Lower bound (leave empty for an indefinite integral)", type: "text", value: "" }, { id: "hi", label: "Upper bound", type: "text", value: "" }],
    solve: function (v) {
      var T = parseExpr(v.f), A = anti(T), S = [];
      S.push(step("Function", "f(x) = " + joinT(T.map(showTerm))));
      A.forEach(function (a, i) { S.push(step((i + 1) + ". Term " + showTerm(T[i]), a.why + "<br>Result: " + a.s)); });
      var F = joinT(A.map(function (a) { return a.s; }));
      var hasB = String(v.lo).trim() !== "" || String(v.hi).trim() !== "";
      if (!hasB) { S.push(step("Answer", "∫ f(x) dx = <b>" + F + " + C</b>")); return S.join(""); }
      var lo = parseFloat(v.lo), hi = parseFloat(v.hi);
      if (!isFinite(lo) || !isFinite(hi)) throw new Error("For a definite integral enter both bounds as numbers.");
      var F2 = function (x) { return A.reduce(function (s, a) { return s + a.ev(x); }, 0); };
      var res = F2(hi) - F2(lo);
      S.push(step("Antiderivative", "F(x) = " + F));
      S.push(step("Evaluate F(b) − F(a)", "F(" + n(hi) + ") − F(" + n(lo) + ") = " + n(F2(hi)) + " − (" + n(F2(lo)) + ")"));
      S.push(step("Answer", "∫ from " + n(lo) + " to " + n(hi) + " = <b>" + n(res) + "</b>"));
      return S.join("");
    } };
})();
