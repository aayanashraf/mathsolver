(function () {
  var q = document.getElementById("q");
  var out = document.getElementById("solveOut");
  var btn = document.getElementById("photoBtn");
  if (!btn) {
    var all = document.querySelectorAll("button");
    for (var i = 0; i < all.length; i++) {
      if (/photo/i.test(all[i].textContent)) { btn = all[i]; break; }
    }
  }
  if (!btn || !q) return;

  /* make sure the button is switched on, even if the HTML still says disabled */
  btn.disabled = false;
  btn.removeAttribute("disabled");
  btn.id = "photoBtn";
  btn.title = "Upload a photo or PDF of your problem";
  var label = btn.textContent;

  var cam = document.createElement("button");
  cam.type = "button";
  cam.id = "cameraBtn";
  cam.className = btn.className;
  cam.title = "Take a photo of your problem";
  cam.textContent = "\uD83D\uDCF8 Camera";
  btn.parentNode.insertBefore(cam, btn.nextSibling);

  var fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/*,application/pdf";
  fileInput.style.display = "none";
  document.body.appendChild(fileInput);

  var camInput = document.createElement("input");
  camInput.type = "file";
  camInput.accept = "image/*";
  camInput.setAttribute("capture", "environment");
  camInput.style.display = "none";
  document.body.appendChild(camInput);

  function say(t) { if (out) out.textContent = t; }
  function busy(on) {
    btn.disabled = on;
    cam.disabled = on;
    btn.textContent = on ? "Reading..." : label;
  }

  function readAsDataURL(file) {
    return new Promise(function (resolve, reject) {
      var fr = new FileReader();
      fr.onload = function () { resolve(fr.result); };
      fr.onerror = function () { reject(new Error("Could not read the file.")); };
      fr.readAsDataURL(file);
    });
  }

  function toJpeg(source, w, h) {
    var max = 1600;
    var s = Math.min(1, max / Math.max(w, h));
    var c = document.createElement("canvas");
    c.width = Math.max(1, Math.round(w * s));
    c.height = Math.max(1, Math.round(h * s));
    var ctx = c.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.drawImage(source, 0, 0, c.width, c.height);
    return c.toDataURL("image/jpeg", 0.85);
  }

  function resizeImage(file) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        var d = toJpeg(img, img.width, img.height);
        URL.revokeObjectURL(url);
        resolve(d);
      };
      img.onerror = function () {
        URL.revokeObjectURL(url);
        reject(new Error("This image type is not supported. Try a JPG or PNG."));
      };
      img.src = url;
    });
  }

  async function send(mime, data) {
    busy(true);
    say("Reading your file...");
    try {
      var r = await fetch("/api/photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mime: mime, data: data })
      });
      var j = await r.json().catch(function () { return {}; });
      if (!r.ok || !j.text) throw new Error(j.error || "Could not read the problem. Try a clearer photo.");
      q.value = j.text;
      q.focus();
      say("Check the problem in the box above, fix it if needed, then press Solve.");
    } catch (e) {
      say(e.message || "Something went wrong.");
    }
    busy(false);
  }

  async function handleFile(f) {
    if (!f) return;
    try {
      var mime = f.type || "";
      var data;
      if (mime === "application/pdf") {
        if (f.size > 3 * 1024 * 1024) throw new Error("PDF is too big (max 3 MB).");
        data = (await readAsDataURL(f)).split(",")[1];
      } else if (mime.indexOf("image/") === 0) {
        mime = "image/jpeg";
        data = (await resizeImage(f)).split(",")[1];
      } else {
        throw new Error("Please choose a photo or a PDF.");
      }
      await send(mime, data);
    } catch (e) {
      say(e.message || "Something went wrong.");
    }
  }

  btn.addEventListener("click", function () { fileInput.value = ""; fileInput.click(); });
  fileInput.addEventListener("change", function () { handleFile(fileInput.files && fileInput.files[0]); });
  camInput.addEventListener("change", function () { handleFile(camInput.files && camInput.files[0]); });

  /* ---------- live camera ---------- */
  function openCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      camInput.value = "";
      camInput.click();
      return;
    }
    navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false })
      .then(function (stream) {
        var ov = document.createElement("div");
        ov.style.cssText = "position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.88);" +
          "z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:16px";
        var v = document.createElement("video");
        v.setAttribute("playsinline", "");
        v.muted = true;
        v.autoplay = true;
        v.style.cssText = "max-width:100%;max-height:70vh;border-radius:12px;background:#000";
        v.srcObject = stream;
        var tip = document.createElement("div");
        tip.style.cssText = "color:#fff;font-size:14px;text-align:center";
        tip.textContent = "Keep the problem inside the frame, then press Capture.";
        var row = document.createElement("div");
        row.style.cssText = "display:flex;gap:12px";
        var snap = document.createElement("button");
        snap.type = "button";
        snap.className = "btn fit";
        snap.textContent = "Capture";
        var cancel = document.createElement("button");
        cancel.type = "button";
        cancel.className = "btn ghost fit";
        cancel.textContent = "Cancel";
        row.appendChild(snap);
        row.appendChild(cancel);
        ov.appendChild(v);
        ov.appendChild(tip);
        ov.appendChild(row);
        document.body.appendChild(ov);

        function close() {
          document.removeEventListener("keydown", onKey);
          stream.getTracks().forEach(function (t) { t.stop(); });
          if (ov.parentNode) ov.parentNode.removeChild(ov);
        }
        function onKey(e) { if (e.key === "Escape") close(); }
        document.addEventListener("keydown", onKey);
        cancel.addEventListener("click", close);
        snap.addEventListener("click", function () {
          if (!v.videoWidth) { tip.textContent = "Camera is still starting, try again."; return; }
          var data = toJpeg(v, v.videoWidth, v.videoHeight).split(",")[1];
          close();
          send("image/jpeg", data);
        });
      })
      .catch(function () {
        say("Camera could not be opened. Allow camera access in the browser, or use the Photo button.");
        camInput.value = "";
        camInput.click();
      });
  }
  cam.addEventListener("click", openCamera);
})();