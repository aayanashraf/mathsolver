/* MathSolveIQ: connects the home page Solve button to /api/solve. Load AFTER js/app.js. */
(function () {
  var $ = function (i) { return document.getElementById(i); };
  var btn = $("solveBtn"), box = $("q"), out = $("solveOut");
  if (!btn || !box || !out) return;
  var history = [], image = null, busy = false;

  // Persistent Saved Solutions: stored locally in this browser.
  var savedSolutionsKey = "msiq_saved_solutions";
  var savedSolutionsPanel = null;

  function getSavedSolutions() {
    try {
      var data = JSON.parse(localStorage.getItem(savedSolutionsKey) || "[]");
      return Array.isArray(data) ? data : [];
    } catch (e) {
      return [];
    }
  }

  function renderSavedSolutions() {
    if (!savedSolutionsPanel) return;

    var list = savedSolutionsPanel.querySelector(".msiq-saved-list");
    var empty = savedSolutionsPanel.querySelector(".msiq-saved-empty");
    var clearBtn = savedSolutionsPanel.querySelector(".msiq-saved-clear");
    var entries = getSavedSolutions();

    list.innerHTML = "";
    empty.style.display = entries.length ? "none" : "block";
    clearBtn.style.display = entries.length ? "inline-block" : "none";

    entries.forEach(function (entry) {
      var card = document.createElement("div");
      card.style.cssText = "border:1px solid var(--border,#ddd);border-radius:10px;padding:12px;margin-top:10px;";

      var question = document.createElement("div");
      question.style.cssText = "font-weight:600;overflow-wrap:anywhere;";
      question.textContent = entry.question || "Saved solution";

      var date = document.createElement("div");
      date.className = "hint";
      date.style.marginTop = "5px";
      date.textContent = entry.date || "";

      var actions = document.createElement("div");
      actions.style.cssText = "display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;";

      var openBtn = document.createElement("button");
      openBtn.type = "button";
      openBtn.className = "chip";
      openBtn.textContent = "Open";
      openBtn.addEventListener("click", function () {
        box.value = entry.question || "";
        out.innerHTML = "";
        var answer = document.createElement("div");
        answer.className = "step";
        renderMathAnswer(answer, entry.answer || "");
        out.appendChild(answer);
        addExport(answer);
        out.scrollIntoView({ behavior: "smooth", block: "start" });
      });

      var deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.className = "chip";
      deleteBtn.textContent = "Delete";
      deleteBtn.addEventListener("click", function () {
        var updated = getSavedSolutions().filter(function (item) {
          return item.id !== entry.id;
        });
        try {
          localStorage.setItem(savedSolutionsKey, JSON.stringify(updated));
          renderSavedSolutions();
        } catch (e) {}
      });

      actions.appendChild(openBtn);
      actions.appendChild(deleteBtn);
      card.appendChild(question);
      card.appendChild(date);
      card.appendChild(actions);
      list.appendChild(card);
    });
  }

  function saveSolution(question, answer) {
    if (!answer) return;

    try {
      var entries = getSavedSolutions();
      entries.unshift({
        id: Date.now().toString() + "-" + Math.random().toString(36).slice(2, 8),
        question: String(question || "Photo/PDF question").slice(0, 2000),
        answer: String(answer).slice(0, 30000),
        date: new Date().toLocaleString()
      });

      localStorage.setItem(savedSolutionsKey, JSON.stringify(entries.slice(0, 30)));
      renderSavedSolutions();
    } catch (e) {
      console.warn("Could not save this solution locally.", e);
    }
  }

  function initSavedSolutions() {
    var panel = document.createElement("section");
    panel.id = "savedSolutionsPanel";
    panel.style.cssText = "margin-top:22px;padding:16px;border:1px solid var(--border,#ddd);border-radius:14px;";

    var heading = document.createElement("div");
    heading.style.cssText = "display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;";

    var title = document.createElement("h3");
    title.textContent = "Recent Solutions";
    title.style.margin = "0";

    var clear = document.createElement("button");
    clear.type = "button";
    clear.className = "chip msiq-saved-clear";
    clear.textContent = "Clear All";
    clear.addEventListener("click", function () {
      if (!window.confirm("Delete all saved solutions from this browser?")) return;
      try {
        localStorage.removeItem(savedSolutionsKey);
        renderSavedSolutions();
      } catch (e) {}
    });

    var empty = document.createElement("p");
    empty.className = "hint msiq-saved-empty";
    empty.textContent = "Your saved solutions will appear here.";

    var list = document.createElement("div");
    list.className = "msiq-saved-list";

    heading.appendChild(title);
    heading.appendChild(clear);
    panel.appendChild(heading);
    panel.appendChild(empty);
    panel.appendChild(list);

    out.parentNode.insertBefore(panel, out.nextSibling);
    savedSolutionsPanel = panel;
    renderSavedSolutions();
  }

  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; }); }
  function fmt(s) { return esc(s).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/`([^`]+)`/g, "<code>$1</code>"); }

  // Render mathematical notation when MathJax becomes available.
  function renderMathAnswer(target, rawText) {
    target.innerHTML = fmt(rawText || "");
    target.style.whiteSpace = "pre-wrap";

    function typeset() {
      if (!target.isConnected || !window.MathJax || !window.MathJax.typesetPromise) return;
      try {
        window.MathJax.typesetClear([target]);
        window.MathJax.typesetPromise([target]).catch(function () {});
      } catch (e) {}
    }

    if (window.MathJax && window.MathJax.typesetPromise) {
      typeset();
    } else {
      window.addEventListener("msiq-mathjax-ready", typeset, { once: true });
    }
  }
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

  /* Photo and PDF upload */
  var note = document.createElement("div");
  note.className = "hint";
  out.parentNode.insertBefore(note, out);
  initSavedSolutions();

  var photoBtn = null;
  Array.prototype.forEach.call(document.querySelectorAll("#page-home button"), function (b) {
    if (/photo/i.test(b.textContent)) photoBtn = b;
  });

  if (photoBtn) {
    var f = document.createElement("input");
    f.type = "file";
    f.accept = "image/jpeg,image/png,image/webp,application/pdf,.jpg,.jpeg,.png,.webp,.pdf";
    f.hidden = true;
    document.body.appendChild(f);

    photoBtn.disabled = false;
    photoBtn.removeAttribute("title");
    photoBtn.textContent = "Photo";
    photoBtn.onclick = function () { f.click(); };

    f.onchange = function () {
      var file = f.files && f.files[0];
      if (!file) return;

      var isPDF = file.type === "application/pdf" || /\.pdf$/i.test(file.name);
      var isImage = ["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
        /\.(jpe?g|png|webp)$/i.test(file.name);

      var lang = window.msiqLang && window.msiqLang.current() === "tr" ? "tr" : "en";

      if (!isPDF && !isImage) {
        note.textContent = lang === "tr"
          ? "Lutfen JPG, PNG, WEBP veya PDF dosyasi secin."
          : "Please select a JPG, PNG, WEBP or PDF file.";
        f.value = "";
        return;
      }

      if (file.size > 2.8 * 1024 * 1024) {
        note.textContent = lang === "tr"
          ? "Dosya boyutu 2.8 MB'dan kucuk olmali."
          : "File must be smaller than 2.8 MB.";
        f.value = "";
        return;
      }

      note.textContent = lang === "tr" ? "Dosya okunuyor..." : "Reading file...";

      if (isPDF) {
        var reader = new FileReader();

        reader.onload = function () {
          var result = String(reader.result || "");
          var comma = result.indexOf(",");

          if (comma < 0) {
            note.textContent = lang === "tr" ? "PDF okunamadi." : "Could not read the PDF.";
            return;
          }

          image = {
            media_type: "application/pdf",
            data: result.slice(comma + 1)
          };

          note.textContent = (lang === "tr" ? "PDF eklendi: " : "PDF added: ") +
            file.name + (lang === "tr" ? ". Cozmek icin Solve'a basin." : ". Press Solve.");
        };

        reader.onerror = function () {
          note.textContent = lang === "tr" ? "PDF okunamadi." : "Could not read the PDF.";
        };

        reader.readAsDataURL(file);
        return;
      }

      var img = new Image();
      var url = URL.createObjectURL(file);

      img.onload = function () {
        var s = Math.min(1, 1400 / Math.max(img.width, img.height));
        var c = document.createElement("canvas");
        c.width = Math.round(img.width * s);
        c.height = Math.round(img.height * s);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);

        image = {
          media_type: "image/jpeg",
          data: c.toDataURL("image/jpeg", 0.8).split(",")[1]
        };

        note.textContent = (lang === "tr" ? "Fotograf eklendi: " : "Photo added: ") +
          file.name + (lang === "tr" ? ". Cozmek icin Solve'a basin." : ". Press Solve.");

        URL.revokeObjectURL(url);
      };

      img.onerror = function () {
        note.textContent = lang === "tr" ? "Gorsel okunamadi." : "Could not read the image.";
        URL.revokeObjectURL(url);
      };

      img.src = url;
    };
  }
  // Clipboard paste and drag-and-drop image/PDF support.
  function attachDroppedFile(file) {
    if (!file || !f) return;

    var valid = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!valid.includes(file.type)) {
      note.textContent = "Please use JPG, PNG, WEBP or PDF.";
      return;
    }

    if (file.size > 2.8 * 1024 * 1024) {
      note.textContent = "File must be smaller than 2.8 MB.";
      return;
    }

    try {
      var transfer = new DataTransfer();
      transfer.items.add(file);
      f.files = transfer.files;
      f.dispatchEvent(new Event("change", { bubbles: true }));
    } catch (e) {
      note.textContent = "Could not attach this file. Please use Photo upload.";
    }
  }

  if (f && box) {
    box.addEventListener("paste", function (event) {
      var items = event.clipboardData && event.clipboardData.items;
      if (!items) return;

      for (var i = 0; i < items.length; i++) {
        if (items[i].type && items[i].type.indexOf("image/") === 0) {
          var pastedFile = items[i].getAsFile();
          if (pastedFile) {
            event.preventDefault();
            attachDroppedFile(pastedFile);
            return;
          }
        }
      }
    });

    box.addEventListener("dragover", function (event) {
      event.preventDefault();
      box.style.outline = "2px dashed var(--accent,#3984e8)";
    });

    box.addEventListener("dragleave", function () {
      box.style.outline = "";
    });

    box.addEventListener("drop", function (event) {
      event.preventDefault();
      box.style.outline = "";

      var files = event.dataTransfer && event.dataTransfer.files;
      if (files && files.length) attachDroppedFile(files[0]);
    });
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
      renderMathAnswer(wrap, d.answer);
      addExport(wrap);
      addFollow();
      if (!isFollow) saveSolution(question || "Photo/PDF question", d.answer);
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
      ["Benzer Soru", "Ayni konu ve zorlukta, farkli sayilarla yeni bir alistirma sorusu olustur. Adim adim coz.", "similar"],
      ["Baska Bir Yontem", "Orijinal soruyu farkli ve gecerli bir matematik yontemiyle yeniden coz. Sonuc ayni olmali." , "alternate"],
    ] : [
      ["Explain simpler", "Explain the solution again in simpler English, one small step at a time. Keep the same answer."],
      ["Verify answer", "Verify the previous answer independently. Recheck each calculation and explain whether the answer is correct."],
      ["Explain each step", "Explain why each rule and operation used in the previous solution is valid, with more detail."]
      ["Similar Problem", "Create a new practice problem on the same topic and at a similar difficulty, using different values. Solve it step by step.", "similar"],
      ["Another Method", "Solve the original problem again using a different valid mathematical method. Keep the same final answer.", "alternate"],
    ];
    actions.forEach(function (item) {
      var b = document.createElement("button"); b.type = "button"; b.className = "chip"; b.textContent = item[0];
      b.onclick = function () { submitFollow(item[1], item[2] || "full"); };
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
  var newChatBtn = $("newchat");
  if (newChatBtn) {
    newChatBtn.addEventListener("click", function () {
      history.length = 0;
      image = null;
    });
  }

  btn.onclick = function () {
    var q = cleanQ();
    if (!q && !image) { out.innerHTML = '<span class="err">Type a problem or add a photo first.</span>'; return; }
    ask(q, false);
  };
})();
