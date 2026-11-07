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

  /* language: English or Turkish, two buttons (no dropdown) */
  var saved = "English"; try { saved = localStorage.getItem("msiq_lang") === "Turkish" ? "Turkish" : "English"; } catch (e) {}
  window.MSIQ_LANG = saved;
  var langBox = document.createElement("div"); langBox.className = "chips"; langBox.setAttribute("role", "group"); langBox.setAttribute("aria-label", "Answer language");
  [["English", "English"], ["Turkish", "T\u00fcrk\u00e7e"]].forEach(function (l) {
    var b = document.createElement("button"); b.type = "button"; b.className = "chip" + (l[0] === saved ? " on" : ""); b.textContent = l[1]; b.setAttribute("data-lang", l[0]);
    b.onclick = function () {
      window.MSIQ_LANG = l[0]; try { localStorage.setItem("msiq_lang", l[0]); } catch (e) {}
      Array.prototype.forEach.call(langBox.children, function (x) { x.classList.toggle("on", x === b); });
    };
    langBox.appendChild(b);
  });
  var chips = $("modes"); if (chips && chips.parentNode) chips.parentNode.insertBefore(langBox, chips.nextSibling);
  var langSel = { get value() { return window.MSIQ_LANG; } };

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

  async function ask(question, isFollow) {
    if (busy) return;
    busy = true; btn.disabled = true;
    var wrap = document.createElement("div"); wrap.className = "step"; wrap.textContent = "Thinking…";
    if (!isFollow) { out.innerHTML = ""; }
    out.appendChild(wrap);
    try {
      var r = await fetch("/api/solve", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: question, mode: mode(), lang: langSel.value, history: isFollow ? history : [], image: isFollow ? null : image }) });
      var d = await r.json().catch(function () { return {}; });
      if (!r.ok) throw new Error(d.error || "Something went wrong. Please try again.");
      if (!isFollow) history = [];
      history.push({ role: "user", content: question || "Solve the problem in the photo." }, { role: "assistant", content: d.answer });
      wrap.innerHTML = fmt(d.answer).replace(/\n/g, "<br>");
      addFollow();
      try { var a = JSON.parse(localStorage.getItem("msiq_recent") || "[]"); if (question) { a = [question].concat(a.filter(function (x) { return x !== question; })).slice(0, 6); localStorage.setItem("msiq_recent", JSON.stringify(a)); } } catch (e) {}
    } catch (e) {
      wrap.innerHTML = '<span class="err">' + esc(e.message) + "</span>";
    }
    busy = false; btn.disabled = false;
  }
  function addFollow() {
    var old = $("followBox"); if (old) old.remove();
    var d = document.createElement("div"); d.id = "followBox"; d.className = "row";
    d.innerHTML = '<input id="followQ" placeholder="Did not get a step? Ask a follow-up…"><button class="btn fit" id="followGo" type="button">Ask</button>';
    out.appendChild(d);
    var go = function () { var v = $("followQ").value.trim(); if (!v) return; d.remove(); var u = document.createElement("div"); u.className = "hint"; u.textContent = "You: " + v; out.appendChild(u); ask(v, true); };
    $("followGo").onclick = go; $("followQ").onkeydown = function (e) { if (e.key === "Enter") go(); };
  }
  btn.onclick = function () {
    var q = cleanQ();
    if (!q && !image) { out.innerHTML = '<span class="err">Type a problem or add a photo first.</span>'; return; }
    ask(q, false);
  };
})();
