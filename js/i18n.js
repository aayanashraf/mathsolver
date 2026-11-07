
/**
 * MathSolveIQ Localization Engine v3
 * English + Turkish
 * Original text preservation, no Google Translate.
 */
(function () {
  "use strict";

  var LANGUAGES = {
    en: { name: "English", native: "English" },
    tr: { name: "Turkish", native: "Türkçe" }
  };

  var DICTIONARY = {
    "Home": "Ana Sayfa",
    "Calculators": "Hesap Makineleri",
    "Graph": "Grafik",
    "Quadratic": "İkinci Dereceden Denklem",
    "Tools": "Araçlar",
    "Learning": "Öğrenme",
    "Practice Quizzes": "Alıştırma Testleri",
    "Flashcards": "Bilgi Kartları",
    "Formula Library": "Formül Kütüphanesi",
    "Homework Mode": "Ödev Modu",
    "Resources": "Kaynaklar",
    "Exam Modes (SAT/FSc/JEE)": "Sınav Modları (SAT/FSc/JEE)",
    "Video Lessons": "Video Dersleri",
    "Back to the solver": "Çözücüye Geri Dön",
    "All calculators": "Tüm Hesap Makineleri",
    "Browse all calculators →": "Tüm Hesap Makinelerine Göz At →",
    "About": "Hakkında",
    "Contact": "İletişim",
    "Privacy Policy": "Gizlilik Politikası",
    "Terms of Service": "Kullanım Şartları",
    "Free AI Math Helper": "Ücretsiz Yapay Zeka Matematik Yardımcısı",
    "Solve": "Çöz",
    "Solve step by step": "Adım Adım Çöz",
    "Get Hint": "İpucu Al",
    "💡 Get Hint": "💡 İpucu Al",
    "Upload Photo / PDF": "Fotoğraf / PDF Yükle",
    "🎤 Speak": "🎤 Konuş",
    "＋ New problem": "＋ Yeni Soru",
    "Plot": "Grafiği Çiz",
    "Generate Quiz": "Test Oluştur",
    "Start Exam": "Sınavı Başlat",
    "Check": "Kontrol Et",
    "Next": "Sonraki",
    "Previous": "Önceki",
    "New quiz": "Yeni Test",
    "Copy": "Kopyala",
    "Print sheet": "Sayfayı Yazdır",
    "Thinking…": "Düşünüyor…",
    "Could not reach the solver. Try again.": "Çözücüye ulaşılamadı. Tekrar deneyin.",
    "Type your math problem, or tap Σ to add symbols…":
      "Matematik probleminizi yazın veya sembol eklemek için Σ simgesine dokunun…"
  };

  var STORAGE_KEY = "msiq_lang";
  var textOriginals = new WeakMap();
  var attributeOriginals = new WeakMap();
  var currentLang = "en";

  try {
    var saved = localStorage.getItem(STORAGE_KEY);
    if (LANGUAGES[saved]) currentLang = saved;
  } catch (e) {}

  function translateTextNode(node) {
    if (!textOriginals.has(node)) {
      textOriginals.set(node, node.nodeValue);
    }

    var original = textOriginals.get(node);
    var trimmed = original.trim();

    if (!trimmed) return;

    var leading = original.match(/^\s*/)[0];
    var trailing = original.match(/\s*$/)[0];

    var translated = currentLang === "tr"
      ? (DICTIONARY[trimmed] || trimmed)
      : trimmed;

    node.nodeValue = leading + translated + trailing;
  }

  function translateElement(el) {
    if (!el || el.nodeType !== 1) return;

    if (el.closest && el.closest("#msiq-lang-wrap")) return;

    ["placeholder", "title", "aria-label"].forEach(function (attr) {
      if (!el.hasAttribute(attr)) return;

      var values = attributeOriginals.get(el);
      if (!values) {
        values = {};
        attributeOriginals.set(el, values);
      }

      if (!(attr in values)) {
        values[attr] = el.getAttribute(attr);
      }

      var original = values[attr];

      el.setAttribute(
        attr,
        currentLang === "tr"
          ? (DICTIONARY[original] || original)
          : original
      );
    });
  }

  function translateSubtree(root) {
    if (!root) return;

    if (root.nodeType === 3) {
      if (!root.parentElement?.closest("#msiq-lang-wrap")) {
        translateTextNode(root);
      }
      return;
    }

    if (root.nodeType !== 1 && root.nodeType !== 9) return;

    if (root.nodeType === 1) translateElement(root);

    var walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    var node;
    while ((node = walker.nextNode())) {
      if (node.parentElement?.closest("#msiq-lang-wrap")) continue;
      translateTextNode(node);
    }

    if (root.querySelectorAll) {
      root.querySelectorAll(
        "input[placeholder], textarea[placeholder], button[title], [aria-label]"
      ).forEach(translateElement);
    }
  }

  function applyLanguage(lang) {
    if (!LANGUAGES[lang]) lang = "en";

    currentLang = lang;

    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {}

    document.documentElement.lang = lang;
    document.documentElement.dir = "ltr";

    translateSubtree(document.body);

    var select = document.getElementById("msiq-lang-select");
    if (select) select.value = lang;

    window.dispatchEvent(new CustomEvent("msiq:languageChanged", {
      detail: { language: lang }
    }));
  }

  function injectStyles() {
    if (document.getElementById("msiq-lang-styles")) return;

    var style = document.createElement("style");
    style.id = "msiq-lang-styles";
    style.textContent = `
      #msiq-lang-wrap {
        display:inline-flex;
        align-items:center;
        gap:5px;
        background:var(--card,#fff);
        border:1px solid var(--line,#e3e7ec);
        border-radius:999px;
        padding:4px 10px;
        color:var(--ink,#1a2233);
        box-shadow:0 1px 4px rgba(0,0,0,.08);
        flex-shrink:0;
        z-index:9999;
      }
      #msiq-lang-wrap svg {
        width:14px;height:14px;
        stroke:var(--acc,#0f766e);
        fill:none;stroke-width:2;
      }
      #msiq-lang-select {
        background:transparent;
        border:none;
        color:var(--ink,#1a2233);
        font:500 12px system-ui,sans-serif;
        cursor:pointer;
        outline:none;
      }
      #msiq-lang-select option {
        background:var(--card,#fff);
        color:var(--ink,#1a2233);
      }
      #msiq-lang-wrap.msiq-floating {
        position:fixed;
        top:14px;
        right:20px;
        z-index:9999;
      }
      @media(max-width:899px) {
        #msiq-lang-wrap.msiq-floating {
          top:10px;
          right:52px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function injectDropdown() {
    if (document.getElementById("msiq-lang-wrap")) return;

    var wrap = document.createElement("div");
    wrap.id = "msiq-lang-wrap";

    var svg = document.createElementNS(
      "http://www.w3.org/2000/svg", "svg"
    );
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");

    var circle = document.createElementNS(
      "http://www.w3.org/2000/svg", "circle"
    );
    circle.setAttribute("cx", "12");
    circle.setAttribute("cy", "12");
    circle.setAttribute("r", "10");

    var path = document.createElementNS(
      "http://www.w3.org/2000/svg", "path"
    );
    path.setAttribute(
      "d",
      "M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
    );

    svg.appendChild(circle);
    svg.appendChild(path);

    var select = document.createElement("select");
    select.id = "msiq-lang-select";
    select.setAttribute("aria-label", "Select language");

    Object.keys(LANGUAGES).forEach(function (code) {
      var option = document.createElement("option");
      option.value = code;
      option.textContent =
        LANGUAGES[code].native + " (" + LANGUAGES[code].name + ")";
      select.appendChild(option);
    });

    select.value = currentLang;
    select.addEventListener("change", function () {
      applyLanguage(this.value);
    });

    wrap.appendChild(svg);
    wrap.appendChild(select);

    if (document.getElementById("page-home")) {
      wrap.classList.add("msiq-floating");
      document.body.appendChild(wrap);
    } else {
      var topBar = document.querySelector(".top");

      if (topBar) {
        topBar.appendChild(wrap);
      } else {
        wrap.classList.add("msiq-floating");
        document.body.appendChild(wrap);
      }
    }
  }

  function init() {
    injectStyles();
    injectDropdown();

    translateSubtree(document.body);

    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        mutation.addedNodes.forEach(function (node) {
          translateSubtree(node);
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    if (currentLang !== "en") {
      applyLanguage(currentLang);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.msiqLang = {
    apply: applyLanguage,
    current: function () {
      return currentLang;
    }
  };
})();
