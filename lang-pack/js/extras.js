/* MathSolveIQ extras: (1) clear "microphone is ON" indicator, (2) full on-page scientific calculator.
   Load AFTER js/app.js and js/solve.js. */
(function () {
  "use strict";

  /* ================= safe expression evaluator (no eval) ================= */
  function evalExpr(src, deg, ans) {
    var s = String(src).toLowerCase().replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-").replace(/π/g, "pi").replace(/√/g, "sqrt").replace(/\s+/g, "");
    if (!s) throw new Error("empty");
    var toks = [], i = 0, m;
    while (i < s.length) {
      var rest = s.slice(i);
      if ((m = rest.match(/^(\d+\.?\d*|\.\d+)(e[+-]?\d+)?/))) { toks.push({ t: "n", v: parseFloat(m[0]) }); i += m[0].length; }
      else if ((m = rest.match(/^[a-z]+/))) { toks.push({ t: "w", v: m[0] }); i += m[0].length; }
      else if ("+-*/^()!%,".indexOf(s[i]) > -1) { toks.push({ t: "s", v: s[i] }); i++; }
      else throw new Error("bad character");
    }
    var p = 0;
    var peek = function () { return toks[p]; };
    var isS = function (c) { return toks[p] && toks[p].t === "s" && toks[p].v === c; };
    var F = {
      sin: function (x) { return Math.sin(deg ? x * Math.PI / 180 : x); },
      cos: function (x) { return Math.cos(deg ? x * Math.PI / 180 : x); },
      tan: function (x) { return Math.tan(deg ? x * Math.PI / 180 : x); },
      asin: function (x) { var r = Math.asin(x); return deg ? r * 180 / Math.PI : r; },
      acos: function (x) { var r = Math.acos(x); return deg ? r * 180 / Math.PI : r; },
      atan: function (x) { var r = Math.atan(x); return deg ? r * 180 / Math.PI : r; },
      sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh,
      ln: Math.log, log: Math.log10, sqrt: Math.sqrt, cbrt: Math.cbrt, abs: Math.abs, exp: Math.exp
    };
    function fact(x) { if (x < 0 || Math.floor(x) !== x || x > 170) throw new Error("factorial"); var r = 1; for (var k = 2; k <= x; k++) r *= k; return r; }
    function primary() {
      var t = peek(); if (!t) throw new Error("unexpected end");
      if (t.t === "n") { p++; return t.v; }
      if (t.t === "w") {
        p++;
        if (t.v === "pi") return Math.PI;
        if (t.v === "e") return Math.E;
        if (t.v === "ans") return ans || 0;
        if (F[t.v]) { if (!isS("(")) throw new Error("use brackets after " + t.v); p++; var a = expr(); if (!isS(")")) throw new Error("missing )"); p++; return F[t.v](a); }
        throw new Error("unknown name " + t.v);
      }
      if (isS("(")) { p++; var v = expr(); if (!isS(")")) throw new Error("missing )"); p++; return v; }
      throw new Error("unexpected " + t.v);
    }
    function postfix() { var v = primary(); while (isS("!") || isS("%")) { if (peek().v === "!") v = fact(v); else v = v / 100; p++; } return v; }
    function power() { var b = postfix(); if (isS("^")) { p++; return Math.pow(b, unary()); } return b; }
    function unary() { if (isS("-")) { p++; return -unary(); } if (isS("+")) { p++; return unary(); } return power(); }
    function term() {
      var v = unary();
      for (;;) {
        if (isS("*")) { p++; v *= unary(); }
        else if (isS("/")) { p++; v /= unary(); }
        else if (peek() && (peek().t === "n" || peek().t === "w" || isS("("))) { v *= unary(); }
        else return v;
      }
    }
    function expr() { var v = term(); while (isS("+") || isS("-")) { var op = peek().v; p++; var r = term(); v = op === "+" ? v + r : v - r; } return v; }
    var out = expr();
    if (p < toks.length) throw new Error("unexpected " + toks[p].v);
    if (!isFinite(out)) throw new Error("not a real number");
    return out;
  }
  function show(x) {
    if (Math.abs(x) < 1e-12) return "0";
    if (Math.abs(x) >= 1e12 || Math.abs(x) < 1e-9) return x.toExponential(8).replace(/\.?0+e/, "e");
    return String(parseFloat(x.toPrecision(12)));
  }
  if (typeof module !== "undefined" && module.exports) { module.exports = { evalExpr: evalExpr, show: show }; return; }

  var $ = function (i) { return document.getElementById(i); };
  var css = document.createElement("style");
  css.textContent = [
    "@keyframes msiqPulse{0%{box-shadow:0 0 0 0 rgba(220,38,38,.55)}100%{box-shadow:0 0 0 14px rgba(220,38,38,0)}}",
    "button.mic-on,.mic-on{background:#dc2626!important;background-image:none!important;border-color:#dc2626!important;color:#fff!important;animation:msiqPulse 1.2s infinite}",
    ".mic-status{display:none;align-items:center;gap:10px;margin-top:10px;padding:10px 14px;border-radius:12px;background:#fee2e2;color:#991b1b;font-weight:600}",
    ".mic-status.on{display:flex}.mic-dot{width:12px;height:12px;border-radius:50%;background:#dc2626;animation:msiqPulse 1.2s infinite;flex:none}",
    ".mic-status small{font-weight:400;display:block;color:#7f1d1d}",
    "@media(prefers-color-scheme:dark){.mic-status{background:#450a0a;color:#fecaca}.mic-status small{color:#fca5a5}}",
    ".calc-fab{position:fixed;right:16px;bottom:16px;z-index:40;border:0;border-radius:999px;padding:13px 18px;background:var(--acc);color:var(--bg);font:600 16px system-ui;cursor:pointer;box-shadow:0 6px 20px rgba(0,0,0,.25)}",
    ".calc-back{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:60;display:none;align-items:flex-end;justify-content:center}",
    ".calc-back.on{display:flex}",
    ".calc-box{width:min(440px,100%);max-height:96vh;overflow:auto;background:var(--card);color:var(--ink);border:1px solid var(--line);border-radius:20px 20px 0 0;padding:14px 14px 18px}",
    "@media(min-width:700px){.calc-back{align-items:center}.calc-box{border-radius:20px}}",
    ".calc-top{display:flex;justify-content:space-between;align-items:center;gap:8px}.calc-top b{font:700 18px Georgia,serif}",
    ".calc-x{border:0;background:var(--acc2);color:var(--acc);border-radius:10px;padding:6px 12px;cursor:pointer;font:600 15px system-ui}",
    ".calc-in{width:100%;margin-top:10px;font:600 20px ui-monospace,Consolas,monospace;padding:10px;border-radius:12px;border:1px solid var(--line);background:var(--bg);color:var(--ink)}",
    ".calc-res{min-height:40px;text-align:right;font:700 30px Georgia,serif;color:var(--acc);padding:6px 4px;word-break:break-all}.calc-res.err{color:var(--bad);font-size:16px}",
    ".calc-keys{display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin-top:6px}",
    ".calc-keys button{border:1px solid var(--line);background:var(--bg);color:var(--ink);border-radius:10px;padding:11px 0;font:600 15px system-ui;cursor:pointer}",
    ".calc-keys button:hover{border-color:var(--acc)}.calc-keys .op{background:var(--acc2);color:var(--acc)}.calc-keys .eq{background:var(--acc);color:var(--bg);border-color:var(--acc)}.calc-keys .fn{font-size:13px}",
    ".calc-hist{margin-top:10px;max-height:110px;overflow:auto;font-size:14px;color:var(--mute)}.calc-hist div{padding:3px 0;cursor:pointer;border-bottom:1px dashed var(--line)}",
    ".calc-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}.calc-row a,.calc-row button{flex:1 1 auto;text-align:center;text-decoration:none;border:1px solid var(--line);background:var(--acc2);color:var(--acc);border-radius:10px;padding:9px 10px;font:600 14px system-ui;cursor:pointer}"
  ].join("");
  document.head.appendChild(css);

  /* ================= 1. microphone indicator ================= */
  var micBtn = $("micBtn"), q = $("q");
  if (!micBtn) {
    Array.prototype.forEach.call(document.querySelectorAll("button"), function (b) { if (!micBtn && /🎤|speak|voice|\bmic/i.test(b.textContent + " " + (b.id || "") + " " + (b.getAttribute("aria-label") || ""))) micBtn = b; });
  }
  if (!q) q = document.querySelector("textarea");
  if (micBtn && q) {
    /* remove any older click handlers so only this one runs */
    var fresh = micBtn.cloneNode(true); micBtn.parentNode.replaceChild(fresh, micBtn); micBtn = fresh;
    var status = document.createElement("div");
    status.className = "mic-status"; status.setAttribute("role", "status"); status.setAttribute("aria-live", "polite");
    status.innerHTML = '<span class="mic-dot"></span><span><span id="micMsg">Microphone is ON. Speak now…</span><small id="micLive"></small></span>';
    micBtn.parentNode.parentNode.insertBefore(status, micBtn.parentNode.nextSibling);
    var rec = null, on = false, baseTitle = document.title, normalLabel = micBtn.textContent;
    var LMAP = { "Turkish": "tr-TR", "English": "en-US" };
    var setOn = function (v, msg) {
      on = v; micBtn.classList.toggle("mic-on", v); status.classList.toggle("on", v || !!msg);
      micBtn.textContent = v ? "● Listening… tap to stop" : normalLabel; micBtn.setAttribute("aria-pressed", v ? "true" : "false");
      $("micMsg").textContent = msg || "Microphone is ON. Speak now…"; if (!v && !msg) $("micLive").textContent = "";
      document.title = v ? "🎤 Listening… " + baseTitle : baseTitle;
    };
    var tickId = null, autoOff = false, stopping = false, lastVoice = 0, SILENCE = 5000, forceTimer = null;
    var clearTick = function () { if (tickId) { clearInterval(tickId); tickId = null; } if (forceTimer) { clearTimeout(forceTimer); forceTimer = null; } };
    micBtn.onclick = function () {
      if (on) {                       /* manual stop: turn the button off RIGHT NOW */
        stopping = true; clearTick(); setOn(false);
        try { rec.stop(); } catch (x) {}
        return;
      }
      var R = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!R) { setOn(false, "Voice input is not supported in this browser. Try Chrome or Edge."); return; }
      var r = new R(); rec = r; r.lang = LMAP[window.MSIQ_LANG || "English"] || "en-US"; r.interimResults = true; r.continuous = true;
      autoOff = false; stopping = false;
      var before = q.value ? q.value.replace(/\s+$/, "") + " " : "";
      var alive = function () { return rec === r && !stopping; };   /* ignore events from an old session */
      r.onstart = function () {
        if (!alive()) return;
        lastVoice = Date.now(); setOn(true); clearTick();
        tickId = setInterval(function () {
          var left = Math.ceil((SILENCE - (Date.now() - lastVoice)) / 1000);
          if (left <= 0) { autoOff = true; clearTick(); setOn(false, "Mic turned off: no voice for 5 seconds. Tap the mic to start again."); try { r.stop(); } catch (x) {} }
          else { $("micMsg").textContent = "Microphone is ON. Speak now… (turns off in " + left + "s if silent)"; }
        }, 250);
      };
      r.onresult = function (e) {
        if (!alive()) return;
        lastVoice = Date.now();
        var t = ""; for (var k = 0; k < e.results.length; k++) t += e.results[k][0].transcript;
        $("micLive").textContent = "“" + t + "”"; q.value = before + t;
      };
      r.onerror = function (e) {
        if (rec !== r) return;
        clearTick();
        if (stopping || e.error === "aborted") return;
        var m = e.error === "not-allowed" || e.error === "service-not-allowed" ? "Microphone is blocked. Click the lock icon in the address bar and allow the microphone."
          : e.error === "no-speech" ? "I did not hear anything. Tap the mic and try again."
          : e.error === "audio-capture" ? "No microphone was found on this device." : "Voice input stopped (" + e.error + ").";
        setOn(false, m);
      };
      r.onend = function () {
        if (rec !== r) return;
        clearTick();
        if (on && !stopping && !autoOff) setOn(false);     /* ended by itself */
      };
      try { r.start(); setOn(true); lastVoice = Date.now(); } catch (err) { setOn(false, "Could not start the microphone. Try again."); }
    };
  }

  /* ================= 2. scientific calculator ================= */
  var back = document.createElement("div"); back.className = "calc-back";
  back.innerHTML = '<div class="calc-box" role="dialog" aria-modal="true" aria-label="Calculator">' +
    '<div class="calc-top"><b>Calculator</b><span><button class="calc-x" id="cMode" type="button">DEG</button> <button class="calc-x" id="cClose" type="button">Close ✕</button></span></div>' +
    '<input class="calc-in" id="cIn" autocomplete="off" inputmode="text" placeholder="e.g. sin(30)+2^3/4" aria-label="Expression">' +
    '<div class="calc-res" id="cRes" aria-live="polite">0</div>' +
    '<div class="calc-keys" id="cKeys"></div>' +
    '<div class="calc-hist" id="cHist"></div>' +
    '<div class="calc-row"><button type="button" id="cSend">Send to solver</button><button type="button" id="cCopy">Copy result</button><a href="/calculator">All calculators →</a></div></div>';
  document.body.appendChild(back);

  var KEYS = [
    ["sin(", "fn", "sin"], ["cos(", "fn", "cos"], ["tan(", "fn", "tan"], ["ln(", "fn", "ln"], ["log(", "fn", "log"],
    ["asin(", "fn", "sin⁻¹"], ["acos(", "fn", "cos⁻¹"], ["atan(", "fn", "tan⁻¹"], ["exp(", "fn", "eˣ"], ["abs(", "fn", "|x|"],
    ["sqrt(", "fn", "√"], ["^2", "fn", "x²"], ["^", "fn", "xʸ"], ["!", "fn", "n!"], ["%", "fn", "%"],
    ["pi", "fn", "π"], ["e", "fn", "e"], ["(", "op", "("], [")", "op", ")"], ["ANS", "fn", "Ans"],
    ["7", "", "7"], ["8", "", "8"], ["9", "", "9"], ["/", "op", "÷"], ["BACK", "op", "⌫"],
    ["4", "", "4"], ["5", "", "5"], ["6", "", "6"], ["*", "op", "×"], ["AC", "op", "AC"],
    ["1", "", "1"], ["2", "", "2"], ["3", "", "3"], ["-", "op", "−"], ["MR", "fn", "MR"],
    ["0", "", "0"], [".", "", "."], ["10^", "fn", "10ˣ"], ["+", "op", "+"], ["=", "eq", "="],
    ["M+", "fn", "M+"], ["M-", "fn", "M−"], ["MC", "fn", "MC"], ["1/(", "fn", "1/x"], ["cbrt(", "fn", "∛"]
  ];
  var cIn = $("cIn"), cRes = $("cRes"), keys = $("cKeys"), hist = $("cHist"), deg = true, lastAns = 0, mem = 0, hs = [];
  function insert(t) { cIn.focus(); var a = cIn.selectionStart, b = cIn.selectionEnd; cIn.setRangeText(t, a, b, "end"); live(); }
  function live() {
    if (!cIn.value.trim()) { cRes.className = "calc-res"; cRes.textContent = "0"; return; }
    try { cRes.className = "calc-res"; cRes.textContent = show(evalExpr(cIn.value, deg, lastAns)); } catch (e) { cRes.className = "calc-res"; cRes.textContent = ""; }
  }
  function equals() {
    var e = cIn.value.trim(); if (!e) return;
    try {
      var r = evalExpr(e, deg, lastAns); lastAns = r; cRes.className = "calc-res"; cRes.textContent = show(r);
      hs.unshift(e + " = " + show(r)); hs = hs.slice(0, 20); drawHist();
    } catch (err) { cRes.className = "calc-res err"; cRes.textContent = "Check the expression (" + err.message + ")"; }
  }
  function drawHist() { hist.innerHTML = ""; hs.forEach(function (h) { var d = document.createElement("div"); d.textContent = h; d.onclick = function () { cIn.value = h.split(" = ")[0]; live(); cIn.focus(); }; hist.appendChild(d); }); }
  KEYS.forEach(function (k) {
    var b = document.createElement("button"); b.type = "button"; b.textContent = k[2]; if (k[1]) b.className = k[1]; keys.appendChild(b);
    b.onclick = function () {
      var v = k[0];
      if (v === "AC") { cIn.value = ""; cRes.className = "calc-res"; cRes.textContent = "0"; cIn.focus(); }
      else if (v === "BACK") { cIn.value = cIn.value.slice(0, -1); live(); cIn.focus(); }
      else if (v === "=") equals();
      else if (v === "ANS") insert("ans");
      else if (v === "MC") { mem = 0; cRes.className = "calc-res"; cRes.textContent = "Memory cleared"; }
      else if (v === "MR") insert(show(mem));
      else if (v === "M+" || v === "M-") { try { var x = evalExpr(cIn.value || String(lastAns), deg, lastAns); mem += v === "M+" ? x : -x; cRes.className = "calc-res"; cRes.textContent = "Memory: " + show(mem); } catch (e) { cRes.className = "calc-res err"; cRes.textContent = "Nothing to store"; } }
      else insert(v);
    };
  });
  cIn.addEventListener("input", live);
  cIn.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); equals(); } if (e.key === "Escape") closeCalc(); });
  $("cMode").onclick = function () { deg = !deg; this.textContent = deg ? "DEG" : "RAD"; live(); };
  $("cClose").onclick = closeCalc;
  back.addEventListener("click", function (e) { if (e.target === back) closeCalc(); });
  $("cCopy").onclick = function () { var t = cRes.textContent; if (t && navigator.clipboard) navigator.clipboard.writeText(t).catch(function () {}); };
  $("cSend").onclick = function () { if (q && cIn.value.trim()) { q.value = (q.value ? q.value + " " : "") + cIn.value.trim(); } closeCalc(); if (q) q.focus(); };
  function openCalc() { back.classList.add("on"); setTimeout(function () { cIn.focus(); }, 30); }
  function closeCalc() { back.classList.remove("on"); }

  var fab = document.createElement("button"); fab.type = "button"; fab.className = "calc-fab"; fab.textContent = "🧮 Calculator"; fab.onclick = openCalc;
  document.body.appendChild(fab);
  if (micBtn) {
    var cb = document.createElement("button"); cb.type = "button"; cb.className = micBtn.className.replace("mic-on", "").trim(); cb.textContent = "🧮 Calculator"; cb.onclick = openCalc;
    micBtn.parentNode.insertBefore(cb, micBtn.nextSibling);
  }
})();
