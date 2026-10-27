(function () {
  var btn = document.getElementById("photoBtn");
  var q = document.getElementById("q");
  var out = document.getElementById("solveOut");
  if (!btn || !q) return;

  var input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*,application/pdf";
  input.style.display = "none";
  document.body.appendChild(input);

  var label = btn.textContent;
  function busy(on) { btn.disabled = on; btn.textContent = on ? "Reading..." : label; }
  function say(t) { if (out) out.textContent = t; }

  btn.addEventListener("click", function () { input.value = ""; input.click(); });

  function readAsDataURL(file) {
    return new Promise(function (resolve, reject) {
      var fr = new FileReader();
      fr.onload = function () { resolve(fr.result); };
      fr.onerror = function () { reject(new Error("Could not read the file.")); };
      fr.readAsDataURL(file);
    });
  }

  function resizeImage(file) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        var max = 1600;
        var s = Math.min(1, max / Math.max(img.width, img.height));
        var c = document.createElement("canvas");
        c.width = Math.round(img.width * s);
        c.height = Math.round(img.height * s);
        var ctx = c.getContext("2d");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, c.width, c.height);
        ctx.drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        resolve(c.toDataURL("image/jpeg", 0.85));
      };
      img.onerror = function () {
        URL.revokeObjectURL(url);
        reject(new Error("This image type is not supported. Try a JPG or PNG."));
      };
      img.src = url;
    });
  }

  input.addEventListener("change", async function () {
    var f = input.files && input.files[0];
    if (!f) return;
    busy(true);
    say("Reading your file...");
    try {
      var mime = f.type;
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

      var r = await fetch("/api/photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mime: mime, data: data }),
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
  });
})();