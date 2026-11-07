/* MathSolveIQ: connects the home page Solve button to /api/solve. Load AFTER js/app.js. */
(function () {
  var $ = function (i) { return document.getElementById(i); };
  var btn = $("solveBtn"), box = $("q"), out = $("solveOut");
  if (!btn || !box || !out) return;
  var history = [], image = null, busy = false;

  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; }); }
  function fmt(s) { return esc(s).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/`([^`]+)`/g, "<code>$1</code>"); }
  function mode() {
    var c = document.querySelector("#modes .chip.on"), t = c ? c.textContent.toLowerCase() : "";
    return t.indexOf("hint") > -1 ? "hint" : t.indexOf("socratic") > -1 ? "socratic" : "full";
  }
  function cleanQ() {
    var q = box.value, c = document.querySelector("#modes .chip.on"), pre = c ? (c.dataset.m || "") : "";
    if (pre && q.indexOf(pre) === 0) q = q.slice(pre.length);
    return q.trim();
  }


  /* Language is shared with the main website selector. */

  /* photo button */
  var note = document.createElement("div"); note.className = "hint"; out.parentNode.insertBefore(note, out);
  var photoBtn = null;
  Array.prototype.forEach.call(document.querySelectorAll("#page-home button"), function (b) { if (/photo/i.test(b.textContent)) photoBtn = b; });
  if (photoBtn) {
    var f = document.createElement("input"); f.type = "file"; f.accept = "image/*"; f.hidden = true; document.body.appendChild(f);
    photoBtn.disabled = false; photoBtn.removeAttribute("title"); photoBtn.textContent = "📷 Photo";
    photoBtn.onclick = function () { f.click(); };
    f.onchange = function () {
      var file = f.files && f.files[0]; if (!file) return;
      var img = new Image(), url = URL.createObjectURL(file);
      img.onload = function () {
        var s = Math.min(1, 1400 / Math.max(img.width, img.height)), c = document.createElement("canvas");
        c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        image = { media_type: "image/jpeg", data: c.toDataURL("image/jpeg", 0.8).split(",")[1] };
        note.textContent = "Photo added: " + file.name + ". Press Solve. (Images only for now, no PDF.)";
        URL.revokeObjectURL(url);
      };
      img.onerror = function () { note.textContent = "Could not read that image."; };
      img.src = url;
    };
  }

  function addExport(wrap) {
    var lang = window.msiqLang && window.msiqLang.current() === "tr" ? "tr" : "en";
    var labels = lang === "tr"
      ? ["Yanıtı Kopyala", "TXT İndir", "PDF Yazdır / Kaydet"]
      : ["Copy Answer", "Download TXT", "Print / Save PDF"];

    var bar = document.createElement("div");
    bar.className = "export-actions";
    bar.style.cssText = "display:flex;flex-wrap:wrap;gap:8px;margin-top:14px;";

    function makeButton(label, action) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "chip";
      b.textContent = label;
      b.onclick = action;
      bar.appendChild(b);
    }

    makeButton(labels[0], async function () {
      var answer = wrap.innerText || wrap.textContent || "";
      try {
        await navigator.clipboard.writeText(answer);
        this.textContent = lang === "tr" ? "Kopyalandı!" : "Copied!";
      } catch (e) {
        var area = document.createElement("textarea");
        area.value = answer;
        document.body.appendChild(area);
        area.select();
        var ok = document.execCommand("copy");
        area.remove();
        this.textContent = ok
          ? (lang === "tr" ? "Kopyalandı!" : "Copied!")
          : (lang === "tr" ? "Kopyalanamadı" : "Copy failed");
      }
    });

    makeButton(labels[1], function () {
      var answer = wrap.innerText || wrap.textContent || "";
      var blob = new Blob([answer], { type: "text/plain;charset=utf-8" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = "MathSolveIQ-solution.txt";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    });

    makeButton(labels[2], function () {
      var answer = wrap.innerText || wrap.textContent || "";
      var win = window.open("", "_blank", "width=900,height=700");
      if (!win) {
        alert(lang === "tr"
          ? "Yazdırma penceresine izin verin."
          : "Please allow the print window.");
        return;
      }
      win.document.write(
        '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>MathSolveIQ Solution</title>' +
        '<style>body{font-family:Arial,sans-serif;max-width:850px;margin:40px auto;padding:20px;line-height:1.7;color:#222}' +
        'h1{border-bottom:2px solid #ddd;padding-bottom:12px}pre{white-space:pre-wrap;overflow-wrap:anywhere;font:inherit}</style>' +
        '</head><body><h1>MathSolveIQ Solution</h1><pre>' +
        esc(answer) +
        '</pre></body></html>'
      );
      win.document.close();
      win.focus();
      win.print();
    });

    wrap.appendChild(bar);
  }
  async function ask(question, isFollow, modeOverride) {
    if (busy) return;
    busy = true; btn.disabled = true;
    var wrap = document.createElement("div"); wrap.className = "step"; wrap.textContent = "Thinking…";
    if (!isFollow) { out.innerHTML = ""; }
    out.appendChild(wrap);
    try {
      var r = await fetch("/api/solve", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: question, mode: modeOverride || mode(), lang: (window.msiqLang && window.msiqLang.current() === "tr") ? "Turkish" : "English", history: isFollow ? history : [], image: isFollow ? null : image }) });
      var d = await r.json().catch(function () { return {}; });
      if (!r.ok) throw new Error(d.error || "Something went wrong. Please try again.");
      if (!isFollow) history = [];
      history.push({ role: "user", content: question || "Solve the problem in the photo." }, { role: "assistant", content: d.answer });
      wrap.innerHTML = fmt(d.answer).replace(/\n/g, "<br>");
      addExport(wrap);
      addFollow();
      try { var a = JSON.parse(localStorage.getItem("msiq_recent") || "[]"); if (question) { a = [question].concat(a.filter(function (x) { return x !== question; })).slice(0, 6); localStorage.setItem("msiq_recent", JSON.stringify(a)); } } catch (e) {}
    } catch (e) {
      wrap.innerHTML = '<span class="err">' + esc(e.message) + "</span>";
    }
    busy = false; btn.disabled = false;
  }
  function addFollow() {
    var old = $("followBox"); if (old) old.remove();
    var lang = window.msiqLang && window.msiqLang.current() === "tr" ? "tr" : "en";
    var d = document.createElement("div"); d.id = "followBox";
    var quick = document.createElement("div"); quick.className = "chips"; quick.setAttribute("aria-label", "More explanation options");
    var actions = lang === "tr" ? [
      ["Daha basit anlat", "Explain the solution again in simpler Turkish, one small step at a time. Keep the same answer."],
      ["Cevabi kontrol et", "Verify the previous answer independently. Recheck each calculation and explain whether the answer is correct."],
      ["Adimlari acikla", "Explain why each rule and operation used in the previous solution is valid, with more detail."]
    ] : [
      ["Explain simpler", "Explain the solution again in simpler English, one small step at a time. Keep the same answer."],
      ["Verify answer", "Verify the previous answer independently. Recheck each calculation and explain whether the answer is correct."],
      ["Explain each step", "Explain why each rule and operation used in the previous solution is valid, with more detail."]
    ];
    actions.forEach(function (item) {
      var b = document.createElement("button"); b.type = "button"; b.className = "chip"; b.textContent = item[0];
      b.onclick = function () { submitFollow(item[1], "full"); };
      quick.appendChild(b);
    });
    d.appendChild(quick);
    var row = document.createElement("div"); row.className = "row";
    var input = document.createElement("input"); input.id = "followQ";
    input.placeholder = lang === "tr" ? "Bir adımı anlamadın mı? Sor..." : "Need help with a step? Ask a follow-up...";
    var askBtn = document.createElement("button"); askBtn.className = "btn fit"; askBtn.id = "followGo"; askBtn.type = "button"; askBtn.textContent = lang === "tr" ? "Sor" : "Ask";
    row.appendChild(input); row.appendChild(askBtn); d.appendChild(row); out.appendChild(d);
    function submitFollow(v, forcedMode) {
      v = String(v || "").trim(); if (!v) return;
      d.remove(); var u = document.createElement("div"); u.className = "hint"; u.textContent = (lang === "tr" ? "Sen: " : "You: ") + v; out.appendChild(u); ask(v, true, forcedMode);
    }
    askBtn.onclick = function () { submitFollow(input.value); };
    input.onkeydown = function (e) { if (e.key === "Enter") submitFollow(input.value); };
  }
  btn.onclick = function () {
    var q = cleanQ();
    if (!q && !image) { out.innerHTML = '<span class="err">Type a problem or add a photo first.</span>'; return; }
    ask(q, false);
  };
})();
