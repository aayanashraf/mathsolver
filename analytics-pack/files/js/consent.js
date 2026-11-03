/* MathSolveIQ: cookie notice and analytics loader.
   - provider "ga4": Google Analytics loads ONLY after the visitor presses Accept.
   - provider "plausible": cookie-free statistics, no notice needed.
   - id empty: does nothing at all.
   Set the id with:  node .\analytics-pack\apply-analytics.js G-XXXXXXXXXX   */
(function () {
  var CONFIG = /*CONFIG*/{"provider":"ga4","id":""}/*END*/;
  var KEY = "msiq-consent";
  if (!CONFIG.id) return;

  function read() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function write(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }
  var gpc = (navigator.globalPrivacyControl === true) || navigator.doNotTrack === "1" || window.doNotTrack === "1";

  function loadScript(src, attrs) {
    var s = document.createElement("script"); s.async = true; s.src = src;
    for (var k in attrs) s.setAttribute(k, attrs[k]);
    document.head.appendChild(s);
  }
  function loadGA() {
    if (window.__msiqGA) return; window.__msiqGA = true;
    window["ga-disable-" + CONFIG.id] = false;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", CONFIG.id, { anonymize_ip: true });
    loadScript("https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(CONFIG.id));
  }
  function dropGA() {
    window["ga-disable-" + CONFIG.id] = true;
    var parts = location.hostname.split("."), doms = [location.hostname, "." + location.hostname];
    if (parts.length > 2) doms.push("." + parts.slice(-2).join("."));
    document.cookie.split(";").forEach(function (c) {
      var name = c.split("=")[0].trim();
      if (name.indexOf("_ga") === 0) doms.forEach(function (d) { document.cookie = name + "=; Max-Age=0; path=/; domain=" + d; document.cookie = name + "=; Max-Age=0; path=/"; });
    });
  }

  if (CONFIG.provider === "plausible") {
    if (gpc) return;
    loadScript("https://plausible.io/js/script.js", { defer: "defer", "data-domain": CONFIG.id });
    return;
  }

  /* ---- Google Analytics with consent ---- */
  function css() {
    if (document.getElementById("msiq-consent-css")) return;
    var st = document.createElement("style"); st.id = "msiq-consent-css";
    st.textContent = "#msiq-consent{position:fixed;left:12px;right:12px;bottom:12px;z-index:2147483000;max-width:640px;margin:0 auto;padding:14px 16px;border-radius:14px;box-shadow:0 8px 30px rgba(0,0,0,.25);background:#fff;color:#0f172a;border:1px solid #cbd5e1;font:14px/1.5 system-ui,-apple-system,Segoe UI,Roboto,sans-serif}" +
      "@media (prefers-color-scheme:dark){#msiq-consent{background:#1e293b;color:#f1f5f9;border-color:#475569}}" +
      "#msiq-consent p{margin:0 0 10px}#msiq-consent a{color:inherit;text-decoration:underline}" +
      "#msiq-consent .b{display:flex;gap:10px;flex-wrap:wrap}" +
      "#msiq-consent button{flex:1 1 120px;padding:10px 14px;border-radius:999px;border:1.5px solid currentColor;background:transparent;color:inherit;font:600 14px system-ui,sans-serif;cursor:pointer}" +
      "#msiq-consent button:focus-visible{outline:3px solid #60a5fa;outline-offset:2px}";
    document.head.appendChild(st);
  }
  function close() { var b = document.getElementById("msiq-consent"); if (b && b.parentNode) b.parentNode.removeChild(b); }
  function choose(v) { write(v); close(); if (v === "accepted") loadGA(); else dropGA(); }
  function open() {
    if (document.getElementById("msiq-consent")) return;
    css();
    var d = document.createElement("div"); d.id = "msiq-consent"; d.setAttribute("role", "dialog"); d.setAttribute("aria-label", "Cookie notice");
    d.innerHTML = '<p>We would like to use cookies from Google Analytics to count visits and see which calculators are used. They are not used for ads. You can change your choice at any time. <a href="/privacy.html">Privacy</a></p>' +
      '<div class="b"><button type="button" data-v="declined">Decline</button><button type="button" data-v="accepted">Accept</button></div>';
    d.addEventListener("click", function (e) { var v = e.target && e.target.getAttribute && e.target.getAttribute("data-v"); if (v) choose(v); });
    document.body.appendChild(d);
  }
  function addLink() {
    var a = document.querySelector('a[href="/privacy.html"]');
    if (!a || document.getElementById("msiq-cookie-link")) return;
    var l = document.createElement("a"); l.id = "msiq-cookie-link"; l.href = "#"; l.textContent = "Cookie settings";
    l.addEventListener("click", function (e) { e.preventDefault(); open(); });
    a.parentNode.insertBefore(document.createTextNode(" · "), a.nextSibling);
    a.parentNode.insertBefore(l, a.nextSibling.nextSibling);
  }
  window.msiqConsent = { open: open };

  function start() {
    addLink();
    var v = read();
    if (gpc) { if (v !== "declined") write("declined"); return; }
    if (v === "accepted") loadGA();
    else if (v !== "declined") open();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
