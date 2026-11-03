/* MathSolveIQ: registers the service worker so pages you have opened work offline. */
(function () {
  if (!("serviceWorker" in navigator)) return;
  var ok = location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1";
  if (!ok) return;
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(function () { /* offline mode is optional */ });
  });
})();
