/* MathSolveIQ — Check My Work. Uses the existing /api/solve endpoint. */
(function () {
  "use strict";
  var solveButton = document.getElementById("solveBtn");
  var question = document.getElementById("q");
  var output = document.getElementById("solveOut");
  if (!solveButton || !question || !output) return;

  var row = solveButton.parentNode;
  var toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "btn ghost";
  toggle.textContent = "Check my work";
  toggle.id = "checkWorkToggle";
  row.appendChild(toggle);

  var panel = document.createElement("section");
  panel.id = "checkWorkPanel";
  panel.className = "card";
  panel.hidden = true;
  panel.style.marginTop = "12px";
  panel.innerHTML =
    '<label for="checkWorkInput"><b>Your working / answer</b></label>' +
    '<textarea id="checkWorkInput" rows="5" placeholder="Paste or type your solution, including the steps you tried..."></textarea>' +
    '<div class="row"><button type="button" class="btn" id="checkWorkSubmit">Check my solution</button></div>' +
    '<div id="checkWorkResult" class="out" aria-live="polite"></div>';
  output.parentNode.insertBefore(panel, output);

  var input = panel.querySelector("#checkWorkInput");
  var submit = panel.querySelector("#checkWorkSubmit");
  var result = panel.querySelector("#checkWorkResult");
  var busy = false;

  function escapeHtml(value) {
    return String(value).replace(/[&<>]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c];
    });
  }

  toggle.addEventListener("click", function () {
    panel.hidden = !panel.hidden;
    if (!panel.hidden) input.focus();
  });

  submit.addEventListener("click", async function () {
    var problem = question.value.trim();
    var work = input.value.trim();
    if (busy) return;
    if (!problem) {
      result.textContent = "Enter the original math problem above first.";
      question.focus();
      return;
    }
    if (!work) {
      result.textContent = "Add your working or final answer so it can be checked.";
      input.focus();
      return;
    }

    var lang = window.msiqLang && window.msiqLang.current && window.msiqLang.current() === "tr" ? "Turkish" : "English";
    var prompt = "You are a careful mathematics teacher. Check the student's work for the exact problem below. " +
      "Do not assume the student's answer is correct. Verify each mathematical step independently. " +
      "Identify the first incorrect step (if any), explain why it is wrong, show the correction, and give a clear verdict: Correct, Partly correct, or Incorrect. " +
      "If the work is correct, confirm it and briefly explain why. Do not invent mistakes. " +
      "Use clear step-by-step formatting and respond in " + lang + ".\n\nPROBLEM:\n" + problem +
      "\n\nSTUDENT'S WORK:\n" + work;

    busy = true;
    submit.disabled = true;
    submit.textContent = lang === "Turkish" ? "Kontrol ediliyor..." : "Checking...";
    result.textContent = lang === "Turkish" ? "Çözümünüz kontrol ediliyor..." : "Checking your solution...";
    try {
      var response = await fetch("/api/solve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: prompt, mode: "full", lang: lang })
      });
      var data = await response.json().catch(function () { return {}; });
      if (!response.ok) throw new Error(data.error || "Could not check the solution. Please try again.");
      var answer = data.answer || data.result;
      if (!answer) throw new Error("The solver returned an empty response. Please try again.");
      result.innerHTML = escapeHtml(answer).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/\n/g, "<br>");
    } catch (error) {
      result.textContent = error.message || "Something went wrong. Please try again.";
    } finally {
      busy = false;
      submit.disabled = false;
      submit.textContent = lang === "Turkish" ? "Çözümümü kontrol et" : "Check my solution";
    }
  });
})();
