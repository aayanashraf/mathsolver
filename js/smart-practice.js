/* MathSolveIQ Smart Practice: adaptive topic recommendations with local-only progress. */
(function () {
"use strict";
var BANK = {
 "Algebra (Linear Equations)": [
  {q:"Solve 3x + 7 = 22",o:["x = 3","x = 4","x = 5","x = 6"],a:2,e:"Subtract 7 to get 3x = 15, then divide by 3: x = 5."},
  {q:"Solve 2(x − 4) = 10",o:["x = 5","x = 7","x = 9","x = 13"],a:2,e:"Expand: 2x − 8 = 10, so 2x = 18 and x = 9."},
  {q:"Solve 5x − 3 = 2x + 12",o:["x = 3","x = 5","x = 9","x = 15"],a:1,e:"Subtract 2x from both sides: 3x − 3 = 12, so 3x = 15 and x = 5."},
  {q:"Solve x/4 + 2 = 6",o:["x = 8","x = 12","x = 16","x = 24"],a:2,e:"Subtract 2: x/4 = 4. Multiply by 4: x = 16."},
  {q:"Solve −2x + 3 < 11",o:["x < −4","x > −4","x < 4","x > 4"],a:1,e:"Subtract 3: −2x < 8. Dividing by a negative flips the sign: x > −4."},
  {q:"Solve (x + 1)/3 = (x − 1)/2",o:["x = 1","x = 3","x = 5","x = 7"],a:2,e:"Cross-multiply: 2(x + 1) = 3(x − 1), so 2x + 2 = 3x − 3 and x = 5."}],
 "Quadratic Equations": [
  {q:"What are the roots of x² − 5x + 6 = 0?",o:["1 and 6","2 and 3","−2 and −3","−1 and 6"],a:1,e:"It factors as (x − 2)(x − 3) = 0, so x = 2 or x = 3."},
  {q:"What is the discriminant of x² + 4x + 4?",o:["0","8","16","−16"],a:0,e:"D = b² − 4ac = 16 − 16 = 0, so there is one repeated root."},
  {q:"Solve x² − 9 = 0",o:["x = 3 only","x = −3 only","x = 3 or x = −3","No real solution"],a:2,e:"x² = 9, so x = ±3."},
  {q:"What is the x-coordinate of the vertex of y = x² − 6x + 5?",o:["−3","3","5","6"],a:1,e:"x = −b/(2a) = 6/2 = 3."},
  {q:"Solve 2x² − 8 = 0",o:["x = ±2","x = ±4","x = ±8","x = ±√2"],a:0,e:"2x² = 8, so x² = 4 and x = ±2."},
  {q:"How many real roots does x² + x + 5 = 0 have?",o:["0","1","2","Cannot tell"],a:0,e:"D = 1 − 20 = −19, which is negative, so there are no real roots."}],
 "Calculus (Derivatives)": [
  {q:"d/dx of x³ is",o:["x⁴/4","3x²","3x","x²"],a:1,e:"Power rule: bring down the 3 and reduce the power by 1."},
  {q:"d/dx of 5x² + 3x is",o:["10x + 3","5x + 3","10x² + 3","10x"],a:0,e:"Differentiate each term: 10x from 5x² and 3 from 3x."},
  {q:"d/dx of sin x is",o:["−cos x","cos x","−sin x","tan x"],a:1,e:"The derivative of sine is cosine."},
  {q:"d/dx of e^(2x) is",o:["e^(2x)","2e^x","2e^(2x)","2x·e^(2x−1)"],a:2,e:"Chain rule: the derivative of e^u is e^u times u′, and u′ = 2."},
  {q:"d/dx of x·ln x is",o:["ln x","1/x","ln x + 1","x + ln x"],a:2,e:"Product rule: 1·ln x + x·(1/x) = ln x + 1."},
  {q:"d/dx of (x² + 1)³ is",o:["3(x² + 1)²","6x(x² + 1)²","3x(x² + 1)²","6(x² + 1)²"],a:1,e:"Chain rule: 3(x² + 1)² times the inner derivative 2x gives 6x(x² + 1)²."}],
 "Fractions & Arithmetic": [
  {q:"1/2 + 1/3 =",o:["2/5","5/6","2/6","1/6"],a:1,e:"Common denominator 6: 3/6 + 2/6 = 5/6."},
  {q:"3/4 ÷ 3/8 =",o:["1/2","2","9/32","4/3"],a:1,e:"Flip and multiply: 3/4 × 8/3 = 24/12 = 2."},
  {q:"2/3 × 9/10 =",o:["11/13","3/5","2/5","6/5"],a:1,e:"Multiply across: 18/30, then divide by 6 to get 3/5."},
  {q:"Simplify 18/24",o:["2/3","3/4","5/6","9/8"],a:1,e:"Divide top and bottom by their GCF, 6: 3/4."},
  {q:"5 + 3 × 2² =",o:["17","32","64","23"],a:0,e:"Order of operations: 2² = 4, then 3 × 4 = 12, then 5 + 12 = 17."},
  {q:"What is the least common multiple of 4 and 6?",o:["8","12","18","24"],a:1,e:"Multiples of 4: 4, 8, 12. Multiples of 6: 6, 12. The first shared one is 12."}],
 "Percentages": [
  {q:"What is 20% of 150?",o:["20","30","45","75"],a:1,e:"0.20 × 150 = 30."},
  {q:"45 is what percent of 60?",o:["65%","70%","75%","80%"],a:2,e:"45 ÷ 60 = 0.75, which is 75%."},
  {q:"A price of 80 is increased by 25%. The new price is",o:["95","100","105","120"],a:1,e:"25% of 80 is 20, and 80 + 20 = 100."},
  {q:"A price falls from 50 to 40. The percent decrease is",o:["10%","20%","25%","80%"],a:1,e:"The change is 10, and 10 ÷ 50 = 0.20, so 20%."},
  {q:"After a 20% discount a shirt costs 40. What was the original price?",o:["48","50","52","60"],a:1,e:"The price is 80% of the original: 40 ÷ 0.8 = 50."},
  {q:"What is 150% of 40?",o:["40","50","60","150"],a:2,e:"1.5 × 40 = 60."}],
 "Statistics": [
  {q:"What is the mean of 4, 8, 6, 10?",o:["6","7","8","28"],a:1,e:"The sum is 28 and there are 4 numbers: 28 ÷ 4 = 7."},
  {q:"What is the median of 3, 9, 5, 7, 1?",o:["3","5","7","9"],a:1,e:"Sorted: 1, 3, 5, 7, 9. The middle value is 5."},
  {q:"What is the mode of 2, 3, 3, 5, 7, 3, 8?",o:["2","3","5","8"],a:1,e:"3 appears most often (three times)."},
  {q:"What is the range of 12, 5, 20, 9?",o:["8","11","15","20"],a:2,e:"Largest minus smallest: 20 − 5 = 15."},
  {q:"The mean of 5 numbers is 12. What is their sum?",o:["17","48","60","72"],a:2,e:"Sum = mean × count = 12 × 5 = 60."},
  {q:"What is the standard deviation of 10, 10, 10?",o:["0","1","10","30"],a:0,e:"Every value equals the mean, so there is no spread."}],
 "Geometry": [
  {q:"What is the area of a circle with radius 5?",o:["10π","25π","5π","50π"],a:1,e:"A = πr² = π × 25."},
  {q:"A triangle has base 10 and height 6. Its area is",o:["16","30","60","32"],a:1,e:"A = ½ × 10 × 6 = 30."},
  {q:"A right triangle has legs 6 and 8. The hypotenuse is",o:["7","10","12","14"],a:1,e:"6² + 8² = 100, and √100 = 10."},
  {q:"The angles inside a triangle add up to",o:["90°","180°","270°","360°"],a:1,e:"The interior angles of any triangle sum to 180°."},
  {q:"What is the volume of a cube with side 3?",o:["9","18","27","81"],a:2,e:"3 × 3 × 3 = 27."},
  {q:"What is the circumference of a circle with radius 7?",o:["7π","14π","49π","28π"],a:1,e:"C = 2πr = 2 × π × 7 = 14π."}],
 "Trigonometry": [
  {q:"sin 30° =",o:["√3/2","1/2","1","√2/2"],a:1,e:"sin 30° = 1/2 is a standard exact value."},
  {q:"cos 0° =",o:["0","1","1/2","−1"],a:1,e:"At 0° the point on the unit circle is (1, 0), so cosine is 1."},
  {q:"tan 45° =",o:["0","√3","1","Undefined"],a:2,e:"At 45° sine and cosine are equal, so tan = 1."},
  {q:"sin²θ + cos²θ =",o:["0","1","2","tan θ"],a:1,e:"This is the Pythagorean identity."},
  {q:"180° in radians is",o:["π/2","π","2π","3π/2"],a:1,e:"A half turn is π radians."},
  {q:"In a right triangle the opposite side is 3 and the hypotenuse is 5. sin θ =",o:["3/5","4/5","3/4","5/3"],a:0,e:"sin θ = opposite ÷ hypotenuse = 3/5."}]
};;
var $ = function (id) { return document.getElementById(id); };
var STORAGE = "msiq_smart_practice_v1";
var state = { topic: "", questions: [], index: 0, correct: 0, wrong: [], answered: false };
function readStats() {
  try { var v = JSON.parse(localStorage.getItem(STORAGE) || "{}"); return v && typeof v === "object" ? v : {}; }
  catch (e) { return {}; }
}
function saveStats(v) { try { localStorage.setItem(STORAGE, JSON.stringify(v)); } catch (e) {} }
function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
function shuffle(a) { a = a.slice(); for (var i=a.length-1;i>0;i--) { var j=Math.floor(Math.random()*(i+1)), t=a[i]; a[i]=a[j]; a[j]=t; } return a; }
function topicStats(stats, topic) { return stats[topic] || { correct: 0, total: 0, recent: [] }; }
function accuracy(s) { return s.total ? s.correct / s.total : null; }
function weakestTopic() {
  var stats=readStats(), names=Object.keys(BANK), chosen=names[0], lowest=2, hasData=false;
  names.forEach(function (name) {
    var s=topicStats(stats,name), rate=accuracy(s);
    if (rate !== null && (!hasData || rate < lowest)) { lowest=rate; chosen=name; hasData=true; }
  });
  return { topic: chosen, hasData: hasData, rate: lowest, stats: stats };
}
function renderDashboard() {
  var w=weakestTopic(), s=w.stats;
  $("recommendedTopic").textContent = w.topic;
  $("recommendationText").textContent = w.hasData
    ? "This is currently your lowest-scoring topic. A focused practice set can help strengthen it."
    : "Start with a short Algebra set. Your results will help choose future practice topics.";
  var box=$("topicProgress"); box.innerHTML="";
  Object.keys(BANK).forEach(function(name) {
    var st=topicStats(s,name), pct=st.total ? Math.round(st.correct/st.total*100) : 0;
    var row=document.createElement("div"); row.className="progress-row";
    row.innerHTML="<div class='progress-label'><span>"+esc(name)+"</span><b>"+(st.total ? pct+"%" : "Not practiced")+"</b></div><div class='track'><i style='width:"+pct+"%'></i></div><small>"+st.correct+" correct out of "+st.total+"</small>";
    box.appendChild(row);
  });
  var select=$("topic"); select.innerHTML="";
  Object.keys(BANK).forEach(function(name) { var o=document.createElement("option"); o.value=name; o.textContent=name; select.appendChild(o); });
  select.value=w.topic;
}
function start(topic, count) {
  var pool=BANK[topic] || [];
  if (!pool.length) return;
  state={topic:topic,questions:shuffle(pool).slice(0,Math.min(count,pool.length)),index:0,correct:0,wrong:[],answered:false};
  $("dashboard").hidden=true; $("result").hidden=true; $("session").hidden=false;
  showQuestion();
}
function showQuestion() {
  var q=state.questions[state.index]; state.answered=false;
  $("questionCount").textContent="Question "+(state.index+1)+" of "+state.questions.length+" · "+state.topic;
  $("progressFill").style.width=(state.index/state.questions.length*100)+"%";
  $("question").textContent=q.q; $("feedback").hidden=true; $("next").hidden=true;
  var options=$("options"); options.innerHTML="";
  q.o.forEach(function(opt,i) {
    var btn=document.createElement("button"); btn.type="button"; btn.className="option"; btn.textContent=opt;
    btn.addEventListener("click",function(){ choose(i); }); options.appendChild(btn);
  });
}
function choose(i) {
  if (state.answered) return; state.answered=true;
  var q=state.questions[state.index], buttons=$("options").children, ok=i===q.a;
  if (ok) state.correct++; else state.wrong.push(q);
  Array.prototype.forEach.call(buttons,function(btn,k) {
    btn.disabled=true;
    if(k===q.a) btn.classList.add("correct");
    if(k===i && !ok) btn.classList.add("incorrect");
  });
  $("feedback").hidden=false;
  $("feedback").innerHTML="<b>"+(ok?"Correct!":"Not quite.")+"</b> "+esc(q.e);
  $("next").hidden=false; $("next").textContent=state.index===state.questions.length-1?"See results":"Next question";
}
function finish() {
  $("session").hidden=true; $("result").hidden=false;
  var total=state.questions.length, pct=Math.round(state.correct/total*100);
  $("resultScore").textContent=state.correct+" / "+total;
  $("resultMessage").textContent=pct>=80?"Strong work. Keep building on this progress.":pct>=50?"Good effort. Review the explanations and practice this topic again.":"This topic needs more practice. Start with the worked explanations, then try another set.";
  var stats=readStats(), st=topicStats(stats,state.topic);
  st.correct+=state.correct; st.total+=total;
  st.recent=(st.recent||[]).concat([{correct:state.correct,total:total,at:Date.now()}]).slice(-10);
  stats[state.topic]=st; saveStats(stats);
  var rev=$("review"); rev.innerHTML="";
  state.wrong.forEach(function(q){var d=document.createElement("div");d.className="review-item";d.innerHTML="<b>"+esc(q.q)+"</b><p>Correct answer: "+esc(q.o[q.a])+"</p><small>"+esc(q.e)+"</small>";rev.appendChild(d);});
  $("reviewTitle").hidden=!state.wrong.length; $("retryWrong").hidden=!state.wrong.length;
  $("progressFill").style.width="100%";
}
$("startRecommended").addEventListener("click",function(){var w=weakestTopic();start(w.topic,parseInt($("count").value,10)||5);});
$("startSelected").addEventListener("click",function(){start($("topic").value,parseInt($("count").value,10)||5);});
$("next").addEventListener("click",function(){state.index++;if(state.index<state.questions.length)showQuestion();else finish();});
$("backDashboard").addEventListener("click",function(){$("result").hidden=true;$("dashboard").hidden=false;renderDashboard();});
$("retryWrong").addEventListener("click",function(){if(state.wrong.length)startFromWrong();});
function startFromWrong(){
  var missed=state.wrong.slice(); state={topic:state.topic,questions:shuffle(missed),index:0,correct:0,wrong:[],answered:false};
  $("result").hidden=true;$("session").hidden=false;showQuestion();
}
$("resetProgress").addEventListener("click",function(){
  if(!window.confirm("Clear all Smart Practice progress saved on this device?"))return;
  try{localStorage.removeItem(STORAGE);}catch(e){} renderDashboard();
});
renderDashboard();
})();