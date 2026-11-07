const $=id=>document.getElementById(id), n=v=>+(+v).toFixed(6);
const esc=s=>String(s).replace(/[&<>]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]));

/* ---------- Router: #name shows #page-name ---------- */
function route(){
  const h=(location.hash||"#home").slice(1);
  const pages=[...document.querySelectorAll(".page")];
  const target=pages.find(p=>p.id==="page-"+h)||$("page-home");
  pages.forEach(p=>p.classList.toggle("on",p===target));
  document.querySelectorAll("#nav a").forEach(a=>a.classList.toggle("on",a.getAttribute("href")==="#"+target.id.slice(5)));
  document.title=(target.querySelector("h2")?.textContent||"MathSolveIQ")+" – MathSolveIQ";
  if(target.id==="page-graph")draw();
  window.scrollTo(0,0);
}
addEventListener("hashchange",route);

$("theme").onclick=()=>{const r=document.documentElement,d=r.dataset.theme==="dark"||(!r.dataset.theme&&matchMedia("(prefers-color-scheme:dark)").matches);r.dataset.theme=d?"light":"dark";draw()};

/* ---------- Solve (AI) : apna backend yahan jorna ----------
   API_URL mein apne server ka link daalo. Server POST {question} le aur {answer} wapas kare. */
const API_URL="/api/solve";
$("solveBtn").onclick=async()=>{
  const q=$("q").value.trim(),o=$("solveOut");if(!q)return;
  if(!API_URL){o.innerHTML='<span class="err">AI solver abhi connect nahi hai. script mein API_URL set karo.</span>';return}
  o.textContent="Thinking…";
  try{const r=await fetch(API_URL,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({question:q})});
    const d=await r.json();o.textContent=d.answer||"No answer returned."}
  catch(e){o.innerHTML='<span class="err">Could not reach the solver. Try again.</span>'}
};

/* ---------- Safe expression compiler (graph + calculator) ---------- */
function compile(src){
  let s=src.toLowerCase().replace(/\s+/g,"").replace(/π/g,"pi").replace(/\^/g,"**")
   .replace(/(\d|\))(x|\(|[a-z])/g,(m,a,b)=>a+"*"+b).replace(/x(\d|\()/g,"x*$1");
  const ok=["sin","cos","tan","sqrt","abs","ln","log","exp","pi","e","x","asin","acos","atan"];
  if((s.match(/[a-z]+/g)||[]).some(i=>!ok.includes(i))||/[^0-9a-z+\-*/().,]/.test(s))return null;
  s=s.replace(/\bln\b/g,"Math.log").replace(/\blog\b/g,"Math.log10")
   .replace(/\b(sin|cos|tan|sqrt|abs|exp|asin|acos|atan)\b/g,"Math.$1").replace(/\bpi\b/g,"Math.PI").replace(/\be\b/g,"Math.E");
  try{return new Function("x","return "+s)}catch(e){return null}
}

/* ---------- Graph ---------- */
const cols=["#0f766e","#d9480f","#6741d9","#c2255c"];
let view={cx:0,cy:0,s:50},fnsv=["x^2-2","sin(x)"],graphOverlay=null;
function renderInputs(){
  $("fns").innerHTML="";
  fnsv.forEach((f,i)=>{
    const r=document.createElement("div");r.className="row";r.style.marginTop="6px";
    r.innerHTML='<span class="fit" style="color:'+cols[i%4]+'">● y =</span>';
    const inp=document.createElement("input");inp.value=f;inp.oninput=()=>{fnsv[i]=inp.value};inp.onkeydown=e=>{if(e.key==="Enter")draw()};r.appendChild(inp);
    if(fnsv.length>1){const x=document.createElement("button");x.className="btn ghost fit";x.textContent="✕";x.onclick=()=>{fnsv.splice(i,1);renderInputs();draw()};r.appendChild(x)}
    $("fns").appendChild(r);
  });
}
function draw(){
  const c=$("cv"),g=c.getContext("2d"),W=c.width,H=c.height,st=getComputedStyle(document.documentElement);
  const ink=st.getPropertyValue("--ink").trim(),line=st.getPropertyValue("--line").trim(),mute=st.getPropertyValue("--mute").trim();
  g.clearRect(0,0,W,H);
  const X=x=>W/2+(x-view.cx)*view.s,Y=y=>H/2-(y-view.cy)*view.s;
  const step=[.1,.2,.5,1,2,5,10,20,50].find(t=>t*view.s>=50)||100;
  g.font="13px system-ui";g.lineWidth=1;
  for(let x=Math.ceil((view.cx-W/2/view.s)/step)*step;x<=view.cx+W/2/view.s;x+=step){g.strokeStyle=line;g.beginPath();g.moveTo(X(x),0);g.lineTo(X(x),H);g.stroke();g.fillStyle=mute;g.fillText(+x.toFixed(2),X(x)+3,Math.min(H-4,Math.max(14,Y(0)+14)))}
  for(let y=Math.ceil((view.cy-H/2/view.s)/step)*step;y<=view.cy+H/2/view.s;y+=step){g.strokeStyle=line;g.beginPath();g.moveTo(0,Y(y));g.lineTo(W,Y(y));g.stroke();if(Math.abs(y)>1e-9){g.fillStyle=mute;g.fillText(+y.toFixed(2),Math.min(W-34,Math.max(4,X(0)+4)),Y(y)-3)}}
  g.strokeStyle=ink;g.lineWidth=2;g.beginPath();g.moveTo(X(0),0);g.lineTo(X(0),H);g.moveTo(0,Y(0));g.lineTo(W,Y(0));g.stroke();
  fnsv.forEach((src,i)=>{
    if(!src.trim())return;const f=compile(src);if(!f)return;
    g.strokeStyle=cols[i%4];g.lineWidth=2.5;g.beginPath();let pen=false,py=0;
    for(let px=0;px<=W;px++){
      const x=view.cx+(px-W/2)/view.s;let y;try{y=f(x)}catch(e){y=NaN}
      if(!isFinite(y)||Math.abs(y)>1e6){pen=false;continue}
      const sy=Y(y);if(pen&&Math.abs(sy-py)>H)pen=false;
      if(pen)g.lineTo(px,sy);else{g.moveTo(px,sy);pen=true}py=sy;
    }
    g.stroke();
  });
  drawGraphOverlay(g,W,H,X,Y);
}
function drawGraphOverlay(g,W,H,X,Y){
  if(!graphOverlay)return;
  const ink=getComputedStyle(document.documentElement).getPropertyValue("--ink").trim();
  if(graphOverlay.type==="tangent"){
    const {x,y,slope}=graphOverlay;
    g.save();g.strokeStyle="#e11d48";g.lineWidth=2.5;g.setLineDash([8,5]);g.beginPath();
    g.moveTo(0,Y(y+slope*((0-W/2)/view.s+view.cx-x)));
    g.lineTo(W,Y(y+slope*((W-W/2)/view.s+view.cx-x)));g.stroke();g.setLineDash([]);
    g.fillStyle="#e11d48";g.beginPath();g.arc(X(x),Y(y),6,0,Math.PI*2);g.fill();g.restore();
  }else if(graphOverlay.type==="roots"){
    g.save();g.fillStyle="#e11d48";graphOverlay.points.forEach(p=>{g.beginPath();g.arc(X(p),Y(0),6,0,Math.PI*2);g.fill()});g.restore();
  }else if(graphOverlay.type==="integral"){
    const {a,b,fn}=graphOverlay,lo=Math.min(a,b),hi=Math.max(a,b);
    g.save();g.fillStyle="rgba(20,184,166,.20)";g.beginPath();g.moveTo(X(lo),Y(0));
    const count=240;for(let i=0;i<=count;i++){const x=lo+(hi-lo)*i/count;let y;try{y=fn(x)}catch(e){y=NaN}if(Number.isFinite(y))g.lineTo(X(x),Y(y));}
    g.lineTo(X(hi),Y(0));g.closePath();g.fill();g.restore();
  }else if(graphOverlay.type==="critical"){
    g.save();g.fillStyle="#d97706";graphOverlay.points.forEach(p=>{g.beginPath();g.arc(X(p.x),Y(p.y),6,0,Math.PI*2);g.fill()});g.restore();
  }
}
$("addf").onclick=()=>{if(fnsv.length<4){fnsv.push("");renderInputs()}};
$("plot").onclick=draw;$("rst").onclick=()=>{view={cx:0,cy:0,s:50};draw()};
let drag=null;const cv=$("cv");
cv.onpointerdown=e=>{drag=[e.clientX,e.clientY,view.cx,view.cy];cv.setPointerCapture(e.pointerId)};
cv.onpointermove=e=>{if(!drag)return;const k=cv.width/cv.getBoundingClientRect().width;view.cx=drag[2]-(e.clientX-drag[0])*k/view.s;view.cy=drag[3]+(e.clientY-drag[1])*k/view.s;draw()};
cv.onpointerup=()=>{drag=null};
cv.onwheel=e=>{e.preventDefault();view.s*=e.deltaY<0?1.12:1/1.12;draw()};
renderInputs();

/* ---------- Advanced graph analysis ---------- */
function graphFunction(){const src=fnsv[0]||"";return compile(src)}
function graphValue(f,x){try{const y=f(x);return Number.isFinite(y)&&Math.abs(y)<1e10?y:NaN}catch(e){return NaN}}
function graphDerivative(f,x){const h=1e-5*Math.max(1,Math.abs(x));return (graphValue(f,x+h)-graphValue(f,x-h))/(2*h)}
function graphRoots(f,a,b){const roots=[],steps=1200,dx=(b-a)/steps;let x0=a,y0=graphValue(f,x0);
 for(let i=1;i<=steps;i++){const x1=a+i*dx,y1=graphValue(f,x1);if(Number.isFinite(y0)&&Number.isFinite(y1)){
  if(y0===0)roots.push(x0);else if(y0*y1<0){let l=x0,r=x1,fl=y0;for(let k=0;k<55;k++){const m=(l+r)/2,fm=graphValue(f,m);if(!Number.isFinite(fm))break;if(fl*fm<=0)r=m;else{l=m;fl=fm}}roots.push((l+r)/2)}
 }x0=x1;y0=y1;}
 return roots.filter((x,i)=>i===0||Math.abs(x-roots[i-1])>1e-4);
}
function graphIntegrate(f,a,b){const n=2000,h=(b-a)/n;let sum=graphValue(f,a)+graphValue(f,b);for(let i=1;i<n;i++){const y=graphValue(f,a+i*h);if(!Number.isFinite(y))return NaN;sum+=(i%2?4:2)*y;}return sum*h/3}
$("graphAnalyze").onclick=()=>{
 const f=graphFunction(),out=$("graphResult"),action=$("graphAction").value;
 const a=Number($("graphMin").value),b=Number($("graphMax").value),x=Number($("graphPoint").value);
 if(!f){out.innerHTML='<span class="err">Enter a valid first function before analyzing.</span>';return}
 if(action!=="tangent"&&(!Number.isFinite(a)||!Number.isFinite(b)||a===b)){out.innerHTML='<span class="err">Enter two different, valid interval bounds.</span>';return}
 graphOverlay=null;
 if(action==="roots"){
  const roots=graphRoots(f,Math.min(a,b),Math.max(a,b));graphOverlay={type:"roots",points:roots};
  out.innerHTML=roots.length?'<b>Roots found:</b> '+roots.map(v=>'x ≈ '+n(v)).join(' · '):'No x-intercepts detected in this interval.';
 }else if(action==="tangent"){
  if(!Number.isFinite(x)){out.innerHTML='<span class="err">Enter a valid x-coordinate.</span>';return}
  const y=graphValue(f,x),slope=graphDerivative(f,x);if(!Number.isFinite(y)||!Number.isFinite(slope)){out.innerHTML='<span class="err">The function is not defined at this x-coordinate.</span>';return}
  graphOverlay={type:"tangent",x,y,slope};out.innerHTML='<b>At x = '+n(x)+'</b><br>f(x) ≈ '+n(y)+'<br>Derivative / tangent slope ≈ '+n(slope)+'<br>Tangent: y = '+n(slope)+'(x − '+n(x)+') + '+n(y);
 }else if(action==="integral"){
  const val=graphIntegrate(f,a,b);if(!Number.isFinite(val)){out.innerHTML='<span class="err">Could not calculate the integral across this interval. Check for discontinuities.</span>';return}
  graphOverlay={type:"integral",a,b,fn:f};out.innerHTML='<b>Definite integral</b><br>∫ from '+n(a)+' to '+n(b)+' f(x) dx ≈ <b>'+n(val)+'</b><br><span class="hint">This is signed area; regions below the x-axis count as negative.</span>';
 }else{
  const lo=Math.min(a,b),hi=Math.max(a,b),critical=[],steps=900,dx=(hi-lo)/steps;let x0=lo,d0=graphDerivative(f,x0);
  for(let i=1;i<=steps;i++){const x1=lo+i*dx,d1=graphDerivative(f,x1);if(Number.isFinite(d0)&&Number.isFinite(d1)&&d0*d1<0){let l=x0,r=x1,dl=d0;for(let k=0;k<40;k++){const m=(l+r)/2,dm=graphDerivative(f,m);if(!Number.isFinite(dm))break;if(dl*dm<=0)r=m;else{l=m;dl=dm}}const xx=(l+r)/2,yy=graphValue(f,xx);if(Number.isFinite(yy)&&(!critical.length||Math.abs(xx-critical[critical.length-1].x)>1e-3))critical.push({x:xx,y:yy})}x0=x1;d0=d1;}
  graphOverlay={type:"critical",points:critical};out.innerHTML=critical.length?'<b>Possible turning points:</b><br>'+critical.map(p=>'x ≈ '+n(p.x)+', y ≈ '+n(p.y)).join('<br>'):'No turning points detected in this interval.';
 }
 draw();
};
$("graphAction").onchange=()=>{const tangent=$("graphAction").value==="tangent";$("graphPoint").disabled=!tangent};
$("graphAction").dispatchEvent(new Event("change"));

/* ---------- Quadratic ---------- */
$("qgo").onclick=()=>{
  const a=parseFloat($("qa").value),b=parseFloat($("qb").value),c=parseFloat($("qc").value),o=$("qout");
  if([a,b,c].some(isNaN)){o.innerHTML='<span class="err">Enter numbers for a, b and c.</span>';return}
  const S=[],add=(t,d)=>S.push('<div class="step"><b>'+t+"</b><br>"+d+"</div>");
  if(a===0){o.innerHTML=b===0?(c===0?"Every x works.":"No solution."):"Linear: x = <b>"+n(-c/b)+"</b>";return}
  const D=b*b-4*a*c;
  add("1. Formula","x = (−b ± √(b² − 4ac)) / 2a");
  add("2. Discriminant","D = ("+b+")² − 4·("+a+")·("+c+") = <b>"+n(D)+"</b><br>"+(D>0?"Two real roots":D===0?"One repeated root":"Two complex roots"));
  if(D>=0){const r1=(-b+Math.sqrt(D))/(2*a),r2=(-b-Math.sqrt(D))/(2*a);
    add("3. Roots","x₁ = <b>"+n(r1)+"</b>, x₂ = <b>"+n(r2)+"</b>");
    add("4. Check","a·x₁² + b·x₁ + c = "+n(a*r1*r1+b*r1+c)+" ≈ 0 ✓");
  }else add("3. Complex roots","x = "+n(-b/(2*a))+" ± "+n(Math.sqrt(-D)/(2*Math.abs(a)))+"i");
  add("Vertex","("+n(-b/(2*a))+", "+n(c-b*b/(4*a))+")");
  o.innerHTML=S.join("");
};

/* ---------- Tools ---------- */
$("scg").onclick=()=>{const f=compile($("sc").value);let r;try{r=f?f(0):NaN}catch(e){r=NaN}
  $("sr").innerHTML=isFinite(r)?"<b>= "+n(r)+"</b>":'<span class="err">Could not evaluate.</span>'};
const U={Length:{m:1,km:1000,cm:.01,mm:.001,mile:1609.344,ft:.3048,inch:.0254},Mass:{kg:1,g:.001,lb:.453592,oz:.0283495},Angle:{deg:1,rad:180/Math.PI,grad:.9},Speed:{"m/s":1,"km/h":1/3.6,mph:.44704},Temperature:{C:1,F:1,K:1}};
const fill=(s,o)=>{s.innerHTML=o.map(x=>"<option>"+x+"</option>").join("")};
fill($("uc"),Object.keys(U));
function ucat(){const k=Object.keys(U[$("uc").value]);fill($("uf"),k);fill($("ut"),k);$("ut").selectedIndex=Math.min(1,k.length-1);uconv()}
function uconv(){
  const c=$("uc").value,v=parseFloat($("uv").value),f=$("uf").value,t=$("ut").value;if(isNaN(v))return;let r;
  if(c==="Temperature"){const C=f==="C"?v:f==="F"?(v-32)*5/9:v-273.15;r=t==="C"?C:t==="F"?C*9/5+32:C+273.15}
  else r=v*U[c][f]/U[c][t];
  $("ur").innerHTML="<b>"+n(v)+" "+f+" = "+n(r)+" "+t+"</b>";
}
$("uc").onchange=ucat;["uv","uf","ut"].forEach(i=>$(i).oninput=uconv);ucat();
$("stg").onclick=()=>{
  const a=$("st").value.split(/[,\s]+/).filter(Boolean).map(Number).filter(x=>!isNaN(x));
  if(!a.length){$("so").textContent="Enter numbers.";return}
  const s=[...a].sort((x,y)=>x-y),N=a.length,m=a.reduce((p,c)=>p+c,0)/N,med=N%2?s[(N-1)/2]:(s[N/2-1]+s[N/2])/2;
  const cn={};a.forEach(x=>cn[x]=(cn[x]||0)+1);const mx=Math.max(...Object.values(cn)),mo=Object.keys(cn).filter(k=>cn[k]===mx);
  const ss=a.reduce((p,c)=>p+(c-m)**2,0);
  $("so").innerHTML="Count "+N+" · Sum "+n(m*N)+"<br>Mean <b>"+n(m)+"</b> · Median <b>"+n(med)+"</b> · Mode <b>"+(mx>1?mo.join(", "):"none")+"</b><br>Std dev (population) <b>"+n(Math.sqrt(ss/N))+"</b>"+(N>1?" · (sample) <b>"+n(Math.sqrt(ss/(N-1)))+"</b>":"")+"<br>Min "+s[0]+" · Max "+s[N-1];
};

/* ---------- Formulas ---------- */
const F={Algebra:["Quadratic: x = (−b ± √(b²−4ac)) / 2a","(a+b)² = a² + 2ab + b²","a² − b² = (a−b)(a+b)","log(ab) = log a + log b","Arithmetic sum: Sₙ = n/2·(2a + (n−1)d)"],
 Geometry:["Circle: A = πr², C = 2πr","Triangle: A = ½·b·h","Pythagoras: a² + b² = c²","Sphere: V = 4/3·πr³","Cylinder: V = πr²h"],
 Trigonometry:["sin²θ + cos²θ = 1","sin 2θ = 2 sinθ cosθ","Law of cosines: c² = a² + b² − 2ab·cosC"],
 Calculus:["d/dx xⁿ = n·xⁿ⁻¹","Product: (uv)′ = u′v + uv′","Chain: f(g(x))′ = f′(g(x))·g′(x)","∫ xⁿ dx = xⁿ⁺¹/(n+1) + C"],
 Statistics:["Mean = Σx / n","z = (x − μ) / σ","nCr = n! / (r!(n−r)!)"]};
Object.entries(F).forEach(([k,v])=>{const d=document.createElement("div");d.className="card";d.innerHTML="<b>"+k+"</b>"+v.map(x=>'<div class="step">'+esc(x)+"</div>").join("");$("fl").appendChild(d)});

route();