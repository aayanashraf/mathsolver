(function () {
  var out = document.getElementById("solveOut");
  var solveBtn = document.getElementById("solveBtn");
  if (!out || !solveBtn) return;

  var origFetch = window.fetch.bind(window);
  var state = { q: "", answer: "", ok: false, sig: "", follow: [] };
  var busy = false;

  var SUP = { "0": "\u2070", "1": "\u00B9", "2": "\u00B2", "3": "\u00B3", "4": "\u2074", "5": "\u2075", "6": "\u2076", "7": "\u2077", "8": "\u2078", "9": "\u2079", "-": "\u207B" };

  function pretty(s) {
    return String(s)
      .replace(/sqrt\(/g, "\u221A(")
      .replace(/\^(-?\d+)/g, function (m, d) {
        return d.split("").map(function (c) { return SUP[c] || c; }).join("");
      })
      .replace(/<=/g, "\u2264")
      .replace(/>=/g, "\u2265")
      .replace(/!=/g, "\u2260")
      .replace(/\+-/g, "\u00B1")
      .replace(/->/g, "\u2192")
      .replace(/(\d|\)|[a-z]) \* (?=[\dA-Za-z(])/g, "$1 \u00D7 ")
      .replace(/\bpi\b/g, "\u03C0")
      .replace(/\btheta\b/g, "\u03B8")
      .replace(/\binfinity\b/gi, "\u221E");
  }

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function clip(s, n) {
    s = String(s || "");
    return s.length > n ? s.slice(0, n) : s;
  }

  function stripMode(s) {
    var chips = document.querySelectorAll("#modes .chip");
    for (var i = 0; i < chips.length; i++) {
      var m = chips[i].getAttribute("data-m");
      if (m && s.indexOf(m) === 0) return s.slice(m.length);
    }
    return s;
  }

  var css = document.createElement("style");
  css.textContent =
    "@keyframes msiqspin{to{transform:rotate(360deg)}}" +
    ".msiqspin{display:inline-block;width:14px;height:14px;border:2px solid currentColor;" +
    "border-right-color:transparent;border-radius:50%;animation:msiqspin .8s linear infinite;" +
    "vertical-align:-2px;margin-right:8px}";
  document.head.appendChild(css);

  /* ---------- loading indicator ---------- */
  var status = document.createElement("div");
  status.style.cssText = "display:none;margin:10px 0;opacity:.85";
  status.innerHTML = '<span class="msiqspin"></span>Solving...';
  out.parentNode.insertBefore(status, out);
  function setStatus(on) { status.style.display = on ? "" : "none"; }

  /* ---------- toolbar: copy / share / print ---------- */
  var bar = document.createElement("div");
  bar.className = "row";
  bar.style.display = "none";
  bar.style.marginTop = "10px";
  bar.innerHTML =
    '<button type="button" class="btn ghost fit" data-a="copy">Copy</button>' +
    '<button type="button" class="btn ghost fit" data-a="share">Share</button>' +
    '<button type="button" class="btn ghost fit" data-a="print">Print / PDF</button>';
  out.parentNode.insertBefore(bar, out.nextSibling);

  /* ---------- follow-up panel ---------- */
  var fp = document.createElement("div");
  fp.style.display = "none";
  fp.style.marginTop = "14px";
  fp.innerHTML =
    '<div class="row"><input id="fuQ" type="text" placeholder="Ask a follow-up question..." maxlength="400">' +
    '<button type="button" class="btn fit" id="fuGo">Ask</button></div>' +
    '<div class="chips"><button type="button" class="chip" data-f="similar">Similar problem</button>' +
    '<button type="button" class="chip" data-f="simple">Explain simply</button></div>' +
    '<div id="fuOut"></div>';
  bar.parentNode.insertBefore(fp, bar.nextSibling);
  var fuOut = fp.querySelector("#fuOut");
  var fuQ = fp.querySelector("#fuQ");

  function updateUI() {
    var t = out.textContent || "";
    var show = state.ok && state.sig && t.indexOf(state.sig) !== -1;
    bar.style.display = show ? "" : "none";
    fp.style.display = show ? "" : "none";
  }

  /* ---------- prettify whatever app.js writes into the answer box ---------- */
  function prettifyNode(root) {
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    var n;
    while ((n = w.nextNode())) {
      var v = pretty(n.nodeValue);
      if (v !== n.nodeValue) n.nodeValue = v;
    }
  }

  var obs = new MutationObserver(function () {
    if (busy) return;
    busy = true;
    prettifyNode(out);
    obs.takeRecords();
    busy = false;
    updateUI();
  });
  obs.observe(out, { childList: true, characterData: true, subtree: true });

  /* ---------- watch the main solver request ---------- */
  window.fetch = function (input, init) {
    var url = typeof input === "string" ? input : (input && input.url) || "";
    if (url.indexOf("api/solve") === -1) return origFetch(input, init);

    try {
      var b = init && init.body ? JSON.parse(init.body) : null;
      if (b && b.question) state.q = stripMode(String(b.question));
    } catch (e) {}

    state.ok = false;
    state.follow = [];
    fuOut.innerHTML = "";
    setStatus(true);
    updateUI();

    return origFetch(input, init).then(
      function (res) {
        setStatus(false);
        res.clone().json().then(function (j) {
          if (res.ok && j && j.answer) {
            state.ok = true;
            state.answer = String(j.answer);
            state.sig = pretty(state.answer.split("\n")[0]).trim().slice(0, 25);
          }
          updateUI();
        }).catch(function () {});
        return res;
      },
      function (err) {
        setStatus(false);
        throw err;
      }
    );
  };

  /* ---------- copy / share / print ---------- */
  function copyText(t) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(t);
    }
    return new Promise(function (resolve) {
      var ta = document.createElement("textarea");
      ta.value = t;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); } catch (e) {}
      document.body.removeChild(ta);
      resolve();
    });
  }

  function flash(btn, msg) {
    var old = btn.textContent;
    btn.textContent = msg;
    setTimeout(function () { btn.textContent = old; }, 1500);
  }

  bar.addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    var a = b.getAttribute("data-a");
    var sol = (out.innerText || out.textContent || "").trim();
    var q = pretty(state.q).trim();
    var full = "Problem: " + q + "\n\nSolution:\n" + sol;

    if (a === "copy") {
      copyText(full).then(function () { flash(b, "Copied"); });
    } else if (a === "share") {
      if (navigator.share) {
        navigator.share({ title: "MathSolveIQ", text: full, url: location.origin }).catch(function () {});
      } else {
        copyText(full + "\n\n" + location.origin).then(function () { flash(b, "Copied"); });
      }
    } else if (a === "print") {
      var w = window.open("", "_blank");
      if (!w) { flash(b, "Allow pop-ups"); return; }
      w.document.write(
        '<!doctype html><meta charset="utf-8"><title>MathSolveIQ</title>' +
        '<body style="font-family:sans-serif;max-width:700px;margin:30px auto;line-height:1.6">' +
        "<h2>MathSolveIQ</h2><p><b>Problem:</b> " + esc(q) + "</p>" +
        '<pre style="white-space:pre-wrap;font-family:inherit">' + esc(sol) + "</pre>" +
        '<p style="color:#666;font-size:12px">' + esc(location.origin) + "</p>"
      );
      w.document.close();
      w.focus();
      w.print();
    }
  });

  /* ---------- follow-up chat ---------- */
  async function ask(text, label) {
    var item = document.createElement("div");
    item.style.cssText = "margin-top:12px;white-space:pre-wrap";
    var qd = document.createElement("div");
    qd.style.fontWeight = "600";
    qd.textContent = label || text;
    var ad = document.createElement("div");
    ad.style.marginTop = "4px";
    ad.innerHTML = '<span class="msiqspin"></span>Thinking...';
    item.appendChild(qd);
    item.appendChild(ad);
    fuOut.appendChild(item);

    var last = state.follow.length ? state.follow[state.follow.length - 1] : null;
    var ctx = "Problem: " + clip(state.q, 500) + "\nSolution: " + clip(state.answer, 1800);
    if (last) {
      ctx += "\nPrevious follow-up: " + clip(last.q, 200) + "\nPrevious reply: " + clip(last.a, 500);
    }
    var full = ctx + "\nNew follow-up request: " + clip(text, 400) +
      "\nReply only to the new request, briefly, using the work above.";

    try {
      var r = await origFetch("/api/solve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: full })
      });
      var j = await r.json().catch(function () { return {}; });
      var a = (j && j.answer) || "No reply. Try again.";
      ad.textContent = pretty(a);
      if (r.ok) state.follow.push({ q: text, a: a });
    } catch (e) {
      ad.textContent = "Could not reach the solver.";
    }
  }

  function sendFollow() {
    var t = (fuQ.value || "").trim();
    if (!t) return;
    fuQ.value = "";
    ask(t);
  }

  fp.querySelector("#fuGo").addEventListener("click", sendFollow);
  fuQ.addEventListener("keydown", function (e) {
    if (e.key === "Enter") { e.preventDefault(); sendFollow(); }
  });
  fp.addEventListener("click", function (e) {
    var c = e.target.closest("[data-f]");
    if (!c) return;
    if (c.getAttribute("data-f") === "similar") {
      ask("Give me one similar practice problem (only the problem, no solution).", "Similar problem");
    } else {
      ask("Explain the solution again in very simple words, as for a beginner.", "Explain simply");
    }
  });

  var nc = document.getElementById("newchat");
  if (nc) nc.addEventListener("click", function () {
    setTimeout(function () { fuOut.innerHTML = ""; state.follow = []; updateUI(); }, 0);
  });
})();