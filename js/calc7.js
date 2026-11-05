/* MathSolveIQ calculator batch 3 */
(function () {
"use strict";

var E = window.MSIQ = window.MSIQ || {};

function num(v, name) {
  if (String(v == null ? "" : v).trim() === "") throw new Error("Enter " + name + ".");
  var x = Number(v);
  if (!Number.isFinite(x)) throw new Error("Enter a valid number for " + name + ".");
  return x;
}
function fmt(x) {
  if (!Number.isFinite(x)) throw new Error("Result is outside the supported numeric range.");
  if (Object.is(x, -0)) x = 0;
  return String(Number(x.toPrecision(10)));
}
function h(s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
  });
}
function step(t, d) {
  return '<div class="step"><b>' + t + '</b><br>' + d + '</div>';
}
function add(slug, fields, solve) {
  E[slug] = {fields:fields, solve:solve};
}
function nums(s) {
  return String(s).split(/[,\s;]+/).filter(Boolean).map(Number);
}
function validList(a) {
  return a.length > 0 && a.every(Number.isFinite);
}
function date(s) {
  var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s).trim());
  if (!m) throw new Error("Enter a date in YYYY-MM-DD format.");
  var d = new Date(+m[1], +m[2]-1, +m[3], 12);
  if (d.getFullYear() !== +m[1] || d.getMonth() !== +m[2]-1 || d.getDate() !== +m[3]) {
    throw new Error("Enter a valid calendar date.");
  }
  return d;
}
function dateText(d) {
  return d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0") +
    "-" + String(d.getDate()).padStart(2,"0");
}
function parseIPv4(s) {
  var p = String(s).trim().split(".");
  if (p.length !== 4 || p.some(function(x) { return !/^\d{1,3}$/.test(x) || +x > 255; })) {
    throw new Error("Enter a valid IPv4 address.");
  }
  return p.reduce(function(a,x){ return a*256 + Number(x); },0);
}
function ipText(x) {
  return [Math.floor(x/16777216)%256,Math.floor(x/65536)%256,
    Math.floor(x/256)%256,x%256].join(".");
}

/* CHEMISTRY */

add("molar-mass", [
  {id:"C",label:"Carbon atoms",value:1},
  {id:"H",label:"Hydrogen atoms",value:4},
  {id:"O",label:"Oxygen atoms",value:0},
  {id:"N",label:"Nitrogen atoms",value:0},
  {id:"Cl",label:"Chlorine atoms",value:0},
  {id:"Na",label:"Sodium atoms",value:0}
], function(v) {
  var weights = {C:12.011,H:1.008,O:15.999,N:14.007,Cl:35.45,Na:22.989769};
  var total = 0, parts = [];
  Object.keys(weights).forEach(function(k) {
    var count = num(v[k],k);
    if (!Number.isInteger(count) || count < 0) throw new Error("Atom counts must be non-negative whole numbers.");
    if (count) {
      var mass = count*weights[k];
      total += mass;
      parts.push(count+" × "+weights[k]+" = "+fmt(mass));
    }
  });
  if (!parts.length) throw new Error("Enter at least one atom.");
  return step("Element contributions",parts.join("<br>"))+
    step("Molar mass","<b>"+fmt(total)+" g/mol</b>");
});

add("molarity", [
  {id:"moles",label:"Amount of solute (moles)",value:0.5},
  {id:"volume",label:"Solution volume (liters)",value:2}
], function(v) {
  var m=num(v.moles,"moles"),vol=num(v.volume,"volume");
  if(m<0||vol<=0)throw new Error("Moles cannot be negative and volume must be positive.");
  return step("Formula","M = moles / solution volume")+
    step("Molarity","<b>"+fmt(m/vol)+" mol/L (M)</b>");
});

add("molality", [
  {id:"moles",label:"Moles of solute",value:0.5},
  {id:"mass",label:"Mass of solvent (kg)",value:1}
], function(v) {
  var m=num(v.moles,"moles"),kg=num(v.mass,"solvent mass");
  if(m<0||kg<=0)throw new Error("Moles cannot be negative and solvent mass must be positive.");
  return step("Formula","Molality = moles of solute / kg of solvent")+
    step("Molality","<b>"+fmt(m/kg)+" mol/kg</b>");
});

add("dilution", [
  {id:"c1",label:"Initial concentration C1",value:2},
  {id:"v1",label:"Initial volume V1 (mL)",value:100},
  {id:"c2",label:"Final concentration C2",value:0.5}
], function(v) {
  var c1=num(v.c1,"initial concentration"),v1=num(v.v1,"initial volume"),c2=num(v.c2,"final concentration");
  if(c1<=0||v1<=0||c2<=0||c2>c1)throw new Error("Concentrations and volume must be positive; final concentration cannot exceed initial concentration.");
  var v2=c1*v1/c2;
  return step("Dilution formula","C1 × V1 = C2 × V2")+
    step("Final volume","<b>"+fmt(v2)+" mL</b>")+
    step("Solvent to add","<b>"+fmt(v2-v1)+" mL</b>");
});

add("percent-yield", [
  {id:"actual",label:"Actual yield (g)",value:8},
  {id:"theoretical",label:"Theoretical yield (g)",value:10}
], function(v) {
  var a=num(v.actual,"actual yield"),t=num(v.theoretical,"theoretical yield");
  if(a<0||t<=0)throw new Error("Actual yield cannot be negative and theoretical yield must be positive.");
  return step("Formula","Percent yield = actual / theoretical × 100")+
    step("Percent yield","<b>"+fmt(a/t*100)+"%</b>");
});

add("solution-concentration", [
  {id:"mass",label:"Solute mass (grams)",value:5},
  {id:"volume",label:"Solution volume (mL)",value:100}
], function(v) {
  var m=num(v.mass,"solute mass"),vol=num(v.volume,"volume");
  if(m<0||vol<=0)throw new Error("Mass cannot be negative and volume must be positive.");
  return step("Mass per volume concentration","<b>"+fmt(m/vol*100)+" g per 100 mL</b>")+
    step("Grams per liter","<b>"+fmt(m/vol*1000)+" g/L</b>");
});

add("ideal-gas-law", [
  {id:"mode",label:"Find variable",type:"select",options:["Pressure (P)","Volume (V)","Amount (n)","Temperature (T)"]},
  {id:"p",label:"Pressure (atm)",value:1},
  {id:"v",label:"Volume (L)",value:22.4},
  {id:"n",label:"Amount (mol)",value:1},
  {id:"t",label:"Temperature (K)",value:273.15}
], function(v) {
  var p=num(v.p,"pressure"),vol=num(v.v,"volume"),mol=num(v.n,"amount"),t=num(v.t,"temperature");
  var R=0.082057;
  if(p<=0||vol<=0||mol<=0||t<=0)throw new Error("All gas-law quantities must be positive.");
  var result,label;
  if(v.mode.indexOf("Pressure")===0){result=mol*R*t/vol;label="Pressure (atm)";}
  else if(v.mode.indexOf("Volume")===0){result=mol*R*t/p;label="Volume (L)";}
  else if(v.mode.indexOf("Amount")===0){result=p*vol/(R*t);label="Amount (mol)";}
  else {result=p*vol/(mol*R);label="Temperature (K)";}
  return step("Ideal gas law","P × V = n × R × T; R = 0.082057 L·atm/(mol·K)")+
    step("Calculated "+label,"<b>"+fmt(result)+"</b>");
});

add("ph-calculator", [
  {id:"kind",label:"Solution type",type:"select",options:["Strong acid","Strong base"]},
  {id:"c",label:"Concentration (mol/L)",value:0.001}
], function(v) {
  var c=num(v.c,"concentration");
  if(c<=0)throw new Error("Concentration must be positive.");
  var pH=v.kind==="Strong acid"?-Math.log10(c):14+Math.log10(c);
  return step("Assumption","Idealized fully dissociated monoprotic strong acid/base at 25 °C.")+
    step("Estimated pH","<b>"+fmt(pH)+"</b>");
});

/* COMPUTER SCIENCE */

function integerString(s,pattern,label) {
  s=String(s).trim();
  if(!pattern.test(s))throw new Error("Enter a valid "+label+" integer.");
  return s;
}
add("binary-decimal",[{id:"value",label:"Binary integer",type:"text",value:"101101"}],function(v) {
  var s=integerString(v.value,/^[01]+$/,"binary");
  return step("Binary to decimal","<b>"+BigInt("0b"+s).toString(10)+"</b>");
});
add("decimal-binary",[{id:"value",label:"Non-negative decimal integer",value:"45"}],function(v) {
  var s=integerString(v.value,/^\d+$/,"decimal");
  return step("Decimal to binary","<b>"+BigInt(s).toString(2)+"</b>");
});
add("hex-decimal",[{id:"value",label:"Hexadecimal integer",type:"text",value:"2D"}],function(v) {
  var s=integerString(v.value,/^[0-9a-f]+$/i,"hexadecimal");
  return step("Hexadecimal to decimal","<b>"+BigInt("0x"+s).toString(10)+"</b>");
});
add("decimal-hex",[{id:"value",label:"Non-negative decimal integer",value:"45"}],function(v) {
  var s=integerString(v.value,/^\d+$/,"decimal");
  return step("Decimal to hexadecimal","<b>"+BigInt(s).toString(16).toUpperCase()+"</b>");
});
add("binary-addition",[
  {id:"a",label:"First binary integer",type:"text",value:"1011"},
  {id:"b",label:"Second binary integer",type:"text",value:"1101"}
],function(v) {
  var a=integerString(v.a,/^[01]+$/,"binary"),b=integerString(v.b,/^[01]+$/,"binary");
  var result=BigInt("0b"+a)+BigInt("0b"+b);
  return step("Binary addition",a+" + "+b+" = <b>"+result.toString(2)+"</b>")+
    step("Decimal check",BigInt("0b"+a).toString()+" + "+BigInt("0b"+b).toString()+" = "+result.toString());
});
add("ascii-converter",[
  {id:"mode",label:"Conversion",type:"select",options:["Text to ASCII codes","ASCII codes to text"]},
  {id:"value",label:"Text or decimal character codes",type:"text",value:"Math"}
],function(v) {
  var s=String(v.value);
  if(v.mode==="Text to ASCII codes") {
    var codes=Array.from(s).map(function(c){var x=c.charCodeAt(0);if(x>127)throw new Error("Only basic ASCII characters (0–127) are supported.");return x;});
    return step("ASCII decimal codes","<b>"+codes.join(", ")+"</b>");
  }
  var codes=s.split(/[,\s]+/).filter(Boolean).map(Number);
  if(!codes.length||codes.some(function(x){return !Number.isInteger(x)||x<0||x>127;}))throw new Error("Enter decimal ASCII codes from 0 to 127.");
  return step("Decoded text","<b>"+h(String.fromCharCode.apply(null,codes))+"</b>");
});
add("data-transfer-time",[
  {id:"size",label:"File size (MB)",value:100},
  {id:"speed",label:"Transfer speed (Mbps)",value:50}
],function(v) {
  var size=num(v.size,"file size"),speed=num(v.speed,"transfer speed");
  if(size<0||speed<=0)throw new Error("File size cannot be negative and speed must be positive.");
  var sec=size*8/speed;
  return step("Estimated transfer time","<b>"+fmt(sec)+" seconds</b>")+
    step("Minutes","<b>"+fmt(sec/60)+" minutes</b>")+
    step("Assumption","1 MB = 8 megabits; no protocol overhead or interruptions.");
});
add("ipv4-subnet",[
  {id:"ip",label:"IPv4 address",type:"text",value:"192.168.1.10"},
  {id:"prefix",label:"CIDR prefix (0–32)",value:24}
],function(v) {
  var ip=parseIPv4(v.ip),prefix=num(v.prefix,"CIDR prefix");
  if(!Number.isInteger(prefix)||prefix<0||prefix>32)throw new Error("CIDR prefix must be a whole number from 0 to 32.");
  var mask=prefix===0?0:(0xFFFFFFFF << (32-prefix))>>>0;
  var network=(ip & mask)>>>0;
  var broadcast=(network | (~mask>>>0))>>>0;
  var count=Math.pow(2,32-prefix);
  var usable=prefix===32?1:prefix===31?2:Math.max(0,count-2);
  return step("Network address","<b>"+ipText(network)+"</b>")+
    step("Subnet mask","<b>"+ipText(mask)+"</b>")+
    step("Broadcast address","<b>"+ipText(broadcast)+"</b>")+
    step("Address capacity",count+" total addresses; <b>"+usable+" conventional usable host addresses</b>");
});

/* BUSINESS AND ECONOMICS */

add("revenue-calculator",[
  {id:"units",label:"Units sold",value:100},
  {id:"price",label:"Price per unit",value:25}
],function(v) {
  var q=num(v.units,"units sold"),p=num(v.price,"unit price");
  if(q<0||p<0)throw new Error("Units and price cannot be negative.");
  return step("Revenue formula","Revenue = units sold × price per unit")+
    step("Total revenue","<b>"+fmt(q*p)+"</b>");
});
add("net-profit",[
  {id:"revenue",label:"Total revenue",value:10000},
  {id:"expenses",label:"Total expenses",value:7500}
],function(v) {
  var r=num(v.revenue,"revenue"),e=num(v.expenses,"expenses");
  if(r<0||e<0)throw new Error("Revenue and expenses cannot be negative.");
  var profit=r-e;
  return step("Net profit","<b>"+fmt(profit)+"</b>")+
    step("Net profit margin",r===0?"Not defined because revenue is zero.":"<b>"+fmt(profit/r*100)+"%</b>");
});
add("gross-margin",[
  {id:"revenue",label:"Revenue",value:10000},
  {id:"cogs",label:"Cost of goods sold",value:6000}
],function(v) {
  var r=num(v.revenue,"revenue"),c=num(v.cogs,"cost of goods sold");
  if(r<=0||c<0)throw new Error("Revenue must be positive and cost cannot be negative.");
  return step("Gross profit","<b>"+fmt(r-c)+"</b>")+
    step("Gross margin","<b>"+fmt((r-c)/r*100)+"%</b>");
});
add("sales-commission",[
  {id:"sales",label:"Sales amount",value:5000},
  {id:"rate",label:"Commission rate (%)",value:5}
],function(v) {
  var s=num(v.sales,"sales amount"),r=num(v.rate,"commission rate");
  if(s<0||r<0)throw new Error("Sales and commission rate cannot be negative.");
  return step("Commission earned","<b>"+fmt(s*r/100)+"</b>")+
    step("Sales plus commission","<b>"+fmt(s+s*r/100)+"</b>");
});
add("cogs-calculator",[
  {id:"begin",label:"Beginning inventory",value:2000},
  {id:"purchases",label:"Purchases",value:5000},
  {id:"end",label:"Ending inventory",value:1500}
],function(v) {
  var b=num(v.begin,"beginning inventory"),p=num(v.purchases,"purchases"),e=num(v.end,"ending inventory");
  if(b<0||p<0||e<0)throw new Error("Inventory values cannot be negative.");
  return step("COGS formula","Beginning inventory + purchases − ending inventory")+
    step("Cost of goods sold","<b>"+fmt(b+p-e)+"</b>");
});
add("vat-calculator",[
  {id:"mode",label:"Price type",type:"select",options:["Add VAT to net price","Extract VAT from gross price"]},
  {id:"price",label:"Price",value:100},
  {id:"rate",label:"VAT rate (%)",value:15}
],function(v) {
  var p=num(v.price,"price"),r=num(v.rate,"VAT rate");
  if(p<0||r<0)throw new Error("Price and VAT rate cannot be negative.");
  if(v.mode==="Add VAT to net price") {
    var tax=p*r/100;
    return step("VAT amount","<b>"+fmt(tax)+"</b>")+step("Gross price including VAT","<b>"+fmt(p+tax)+"</b>");
  }
  var net=p/(1+r/100);
  return step("Net price before VAT","<b>"+fmt(net)+"</b>")+step("VAT included in gross price","<b>"+fmt(p-net)+"</b>");
});
add("cagr-calculator",[
  {id:"start",label:"Starting value",value:1000},
  {id:"end",label:"Ending value",value:1500},
  {id:"years",label:"Number of years",value:5}
],function(v) {
  var a=num(v.start,"starting value"),b=num(v.end,"ending value"),t=num(v.years,"years");
  if(a<=0||b<0||t<=0)throw new Error("Starting value and time must be positive; ending value cannot be negative.");
  return step("CAGR formula","(Ending value / Starting value)^(1 / years) − 1")+
    step("Compound annual growth rate","<b>"+fmt((Math.pow(b/a,1/t)-1)*100)+"%</b>");
});
add("cash-flow",[
  {id:"opening",label:"Opening cash balance",value:5000},
  {id:"inflow",label:"Cash inflows",value:2000},
  {id:"outflow",label:"Cash outflows",value:1200}
],function(v) {
  var o=num(v.opening,"opening balance"),i=num(v.inflow,"cash inflows"),x=num(v.outflow,"cash outflows");
  return step("Net cash flow","<b>"+fmt(i-x)+"</b>")+
    step("Closing cash balance","<b>"+fmt(o+i-x)+"</b>");
});

/* CONSTRUCTION AND HOME */

add("concrete-volume",[
  {id:"length",label:"Length (m)",value:5},
  {id:"width",label:"Width (m)",value:3},
  {id:"depth",label:"Depth (m)",value:0.15},
  {id:"waste",label:"Waste allowance (%)",value:5}
],function(v) {
  var l=num(v.length,"length"),w=num(v.width,"width"),d=num(v.depth,"depth"),r=num(v.waste,"waste allowance");
  if(l<=0||w<=0||d<=0||r<0)throw new Error("Dimensions must be positive and waste allowance cannot be negative.");
  var base=l*w*d;
  return step("Base volume",fmt(base)+" m³")+
    step("Volume including allowance","<b>"+fmt(base*(1+r/100))+" m³</b>");
});
add("paint-estimator",[
  {id:"area",label:"Paintable area (m²)",value:80},
  {id:"coverage",label:"Coverage per liter (m²)",value:10},
  {id:"coats",label:"Number of coats",value:2}
],function(v) {
  var a=num(v.area,"area"),c=num(v.coverage,"coverage"),n=num(v.coats,"coats");
  if(a<0||c<=0||!Number.isInteger(n)||n<1)throw new Error("Area cannot be negative; coverage must be positive; coats must be a positive whole number.");
  return step("Total coverage required",fmt(a*n)+" m²")+
    step("Estimated paint quantity","<b>"+fmt(a*n/c)+" liters</b>");
});
add("flooring-estimator",[
  {id:"length",label:"Room length (m)",value:5},
  {id:"width",label:"Room width (m)",value:4},
  {id:"waste",label:"Waste allowance (%)",value:10}
],function(v) {
  var l=num(v.length,"length"),w=num(v.width,"width"),r=num(v.waste,"waste allowance");
  if(l<=0||w<=0||r<0)throw new Error("Dimensions must be positive and waste cannot be negative.");
  var a=l*w;
  return step("Floor area","<b>"+fmt(a)+" m²</b>")+
    step("Area including waste","<b>"+fmt(a*(1+r/100))+" m²</b>");
});
add("tile-estimator",[
  {id:"area",label:"Area to tile (m²)",value:20},
  {id:"length",label:"Tile length (cm)",value:60},
  {id:"width",label:"Tile width (cm)",value:60},
  {id:"waste",label:"Extra tiles (%)",value:10}
],function(v) {
  var a=num(v.area,"area"),l=num(v.length,"tile length"),w=num(v.width,"tile width"),r=num(v.waste,"waste allowance");
  if(a<=0||l<=0||w<=0||r<0)throw new Error("Area and tile dimensions must be positive; waste cannot be negative.");
  var tile=l*w/10000,base=a/tile;
  return step("Area per tile",fmt(tile)+" m²")+
    step("Tiles before allowance",fmt(base))+
    step("Estimated tiles to buy","<b>"+Math.ceil(base*(1+r/100))+" tiles</b>");
});
add("roof-pitch",[
  {id:"rise",label:"Vertical rise (m)",value:2},
  {id:"run",label:"Horizontal run (m)",value:4}
],function(v) {
  var r=num(v.rise,"rise"),x=num(v.run,"run");
  if(r<0||x<=0)throw new Error("Rise cannot be negative and run must be positive.");
  var ratio=r/x;
  return step("Roof pitch","<b>"+fmt(ratio*100)+"%</b>")+
    step("Roof angle","<b>"+fmt(Math.atan(ratio)*180/Math.PI)+"°</b>")+
    step("Rise to run ratio",fmt(ratio)+" : 1");
});
add("stair-calculator",[
  {id:"height",label:"Total vertical rise (cm)",value:280},
  {id:"max",label:"Maximum desired riser height (cm)",value:18},
  {id:"tread",label:"Tread depth (cm)",value:28}
],function(v) {
  var hgt=num(v.height,"total rise"),max=num(v.max,"maximum riser"),t=num(v.tread,"tread depth");
  if(hgt<=0||max<=0||t<=0)throw new Error("All stair dimensions must be positive.");
  var count=Math.ceil(hgt/max),riser=hgt/count,steps=count-1,run=steps*t;
  return step("Number of risers","<b>"+count+"</b>")+
    step("Actual riser height","<b>"+fmt(riser)+" cm</b>")+
    step("Estimated horizontal run","<b>"+fmt(run)+" cm</b>")+
    step("Note","Preliminary geometric estimate only; verify applicable building codes and professional design requirements.");
});
add("fence-estimator",[
  {id:"length",label:"Rectangle length (m)",value:20},
  {id:"width",label:"Rectangle width (m)",value:10},
  {id:"spacing",label:"Maximum post spacing (m)",value:2}
],function(v) {
  var l=num(v.length,"length"),w=num(v.width,"width"),s=num(v.spacing,"spacing");
  if(l<=0||w<=0||s<=0)throw new Error("All dimensions must be positive.");
  var posts=2*Math.ceil(l/s)+2*Math.ceil(w/s);
  return step("Perimeter",fmt(2*(l+w))+" meters")+
    step("Estimated fence posts","<b>"+posts+"</b>")+
    step("Assumption","Rectangular fence with posts at all corners and spacing not exceeding the selected distance.");
});

/* DATE AND TIME */

add("days-between",[
  {id:"start",label:"Start date (YYYY-MM-DD)",type:"text",value:"2026-01-01"},
  {id:"end",label:"End date (YYYY-MM-DD)",type:"text",value:"2026-01-31"}
],function(v) {
  var a=date(v.start),b=date(v.end);
  var days=Math.round((b-a)/86400000);
  return step("Calendar day difference","<b>"+Math.abs(days)+" days</b>")+
    step("Direction",days<0?"End date is before the start date.":days>0?"End date is after the start date.":"Both dates are the same.");
});
add("add-days",[
  {id:"start",label:"Starting date (YYYY-MM-DD)",type:"text",value:"2026-01-01"},
  {id:"days",label:"Days to add or subtract",value:30}
],function(v) {
  var d=date(v.start),n=num(v.days,"number of days");
  if(!Number.isInteger(n))throw new Error("Days must be a whole number.");
  d.setDate(d.getDate()+n);
  return step("Calculated date","<b>"+dateText(d)+"</b>");
});
add("working-days",[
  {id:"start",label:"Start date (YYYY-MM-DD)",type:"text",value:"2026-01-01"},
  {id:"end",label:"End date (YYYY-MM-DD)",type:"text",value:"2026-01-31"}
],function(v) {
  var a=date(v.start),b=date(v.end);
  if(b<a)throw new Error("End date must be on or after start date.");
  var count=0,weekends=0,d=new Date(a);
  while(d<=b) {
    var day=d.getDay();
    if(day===0||day===6)weekends++;else count++;
    d.setDate(d.getDate()+1);
  }
  return step("Weekdays (Monday–Friday)","<b>"+count+"</b>")+
    step("Weekend days",weekends)+
    step("Range","Inclusive of both selected dates; public holidays are not excluded.");
});
add("time-duration",[
  {id:"start",label:"Start time (HH:MM)",type:"text",value:"09:30"},
  {id:"end",label:"End time (HH:MM)",type:"text",value:"17:15"}
],function(v) {
  function minutes(s) {
    var m=/^([01]\d|2[0-3]):([0-5]\d)$/.exec(String(s).trim());
    if(!m)throw new Error("Enter times in 24-hour HH:MM format.");
    return +m[1]*60 + +m[2];
  }
  var a=minutes(v.start),b=minutes(v.end);
  if(b<a)b+=1440;
  var diff=b-a;
  return step("Elapsed time","<b>"+Math.floor(diff/60)+" hours "+(diff%60)+" minutes</b>")+
    step("Decimal hours","<b>"+fmt(diff/60)+"</b>");
});
add("hours-to-decimal",[
  {id:"hours",label:"Whole hours",value:2},
  {id:"minutes",label:"Additional minutes",value:30}
],function(v) {
  var h=num(v.hours,"hours"),m=num(v.minutes,"minutes");
  if(!Number.isInteger(h)||!Number.isInteger(m)||h<0||m<0||m>59)throw new Error("Use non-negative whole hours and 0–59 minutes.");
  return step("Decimal hours","<b>"+fmt(h+m/60)+" hours</b>")+
    step("Total minutes",h*60+m+" minutes");
});
add("age-calculator",[
  {id:"birth",label:"Date of birth (YYYY-MM-DD)",type:"text",value:"2000-01-01"},
  {id:"asof",label:"Age on date (YYYY-MM-DD)",type:"text",value:"2026-11-05"}
],function(v) {
  var b=date(v.birth),a=date(v.asof);
  if(a<b)throw new Error("The reference date must be on or after the birth date.");
  var y=a.getFullYear()-b.getFullYear(),m=a.getMonth()-b.getMonth(),d=a.getDate()-b.getDate();
  if(d<0){m--;d+=new Date(a.getFullYear(),a.getMonth(),0).getDate();}
  if(m<0){y--;m+=12;}
  return step("Completed age","<b>"+y+" years, "+m+" months, "+d+" days</b>")+
    step("Reference date",dateText(a));
});

/* ADDITIONAL STATISTICS */

add("weighted-average",[
  {id:"values",label:"Values (comma separated)",type:"text",value:"80, 90, 70"},
  {id:"weights",label:"Matching weights (comma separated)",type:"text",value:"2, 3, 1"}
],function(v) {
  var a=nums(v.values),w=nums(v.weights);
  if(!validList(a)||!validList(w)||a.length!==w.length)throw new Error("Enter matching lists of valid numbers.");
  var total=w.reduce(function(s,x){return s+x;},0);
  if(total===0)throw new Error("The sum of weights cannot be zero.");
  var result=a.reduce(function(s,x,i){return s+x*w[i];},0)/total;
  return step("Weighted sum","<b>"+fmt(a.reduce(function(s,x,i){return s+x*w[i];},0))+"</b>")+
    step("Sum of weights",fmt(total))+
    step("Weighted average","<b>"+fmt(result)+"</b>");
});
add("quartiles",[
  {id:"values",label:"Dataset (comma separated)",type:"text",value:"2, 4, 5, 7, 8, 10, 12, 15"}
],function(v) {
  var a=nums(v.values);
  if(!validList(a)||a.length<2)throw new Error("Enter at least two valid numbers.");
  a.sort(function(x,y){return x-y;});
  function median(x){var n=x.length;return n%2?x[(n-1)/2]:(x[n/2-1]+x[n/2])/2;}
  var mid=Math.floor(a.length/2),lower=a.slice(0,mid),upper=a.slice(Math.ceil(a.length/2));
  var q1=median(lower),q2=median(a),q3=median(upper);
  return step("Sorted values",a.join(", "))+
    step("First quartile (Q1)","<b>"+fmt(q1)+"</b>")+
    step("Median (Q2)","<b>"+fmt(q2)+"</b>")+
    step("Third quartile (Q3)","<b>"+fmt(q3)+"</b>")+
    step("Interquartile range","<b>"+fmt(q3-q1)+"</b>")+
    step("Method","Median of lower and upper halves; median is excluded from halves for odd sample sizes.");
});
add("coefficient-variation",[
  {id:"values",label:"Dataset (comma separated)",type:"text",value:"10, 12, 14, 16, 18"}
],function(v) {
  var a=nums(v.values);
  if(!validList(a)||a.length<2)throw new Error("Enter at least two valid numbers.");
  var mean=a.reduce(function(s,x){return s+x;},0)/a.length;
  if(mean===0)throw new Error("Coefficient of variation is undefined when the mean is zero.");
  var ss=a.reduce(function(s,x){return s+(x-mean)*(x-mean);},0);
  var sd=Math.sqrt(ss/(a.length-1));
  return step("Mean",fmt(mean))+
    step("Sample standard deviation",fmt(sd))+
    step("Coefficient of variation","<b>"+fmt(sd/Math.abs(mean)*100)+"%</b>");
});
add("standard-error",[
  {id:"values",label:"Sample data (comma separated)",type:"text",value:"10, 12, 14, 16, 18"}
],function(v) {
  var a=nums(v.values);
  if(!validList(a)||a.length<2)throw new Error("Enter at least two valid numbers.");
  var mean=a.reduce(function(s,x){return s+x;},0)/a.length;
  var sd=Math.sqrt(a.reduce(function(s,x){return s+(x-mean)*(x-mean);},0)/(a.length-1));
  return step("Sample size",a.length)+
    step("Sample standard deviation",fmt(sd))+
    step("Standard error of the mean","<b>"+fmt(sd/Math.sqrt(a.length))+"</b>");
});
add("binomial-probability",[
  {id:"n",label:"Number of trials (n)",value:10},
  {id:"k",label:"Number of successes (k)",value:3},
  {id:"p",label:"Probability of success (0 to 1)",value:0.5}
],function(v) {
  var n=num(v.n,"trials"),k=num(v.k,"successes"),p=num(v.p,"success probability");
  if(!Number.isInteger(n)||!Number.isInteger(k)||n<0||n>10000||k<0||k>n||p<0||p>1)throw new Error("Use integer trials from 0–10000, successes from 0–n, and probability from 0 to 1.");
  var logC=0;
  for(var i=1;i<=k;i++)logC+=Math.log(n-k+i)-Math.log(i);
  var prob;
  if((p===0&&k>0)||(p===1&&k<n))prob=0;
  else if(p===0||p===1)prob=1;
  else prob=Math.exp(logC+k*Math.log(p)+(n-k)*Math.log1p(-p));
  return step("Binomial probability","P(X = k) = C(n,k) × pᵏ × (1−p)ⁿ⁻ᵏ")+
    step("Probability","<b>"+fmt(prob)+"</b>")+
    step("Percentage","<b>"+fmt(prob*100)+"%</b>");
});
add("normal-distribution",[
  {id:"x",label:"Value (x)",value:85},
  {id:"mean",label:"Mean",value:70},
  {id:"sd",label:"Standard deviation",value:10}
],function(v) {
  var x=num(v.x,"value"),m=num(v.mean,"mean"),s=num(v.sd,"standard deviation");
  if(s<=0)throw new Error("Standard deviation must be positive.");
  var z=(x-m)/s;
  var sign=z<0?-1:1,a=Math.abs(z),t=1/(1+0.3275911*a);
  var erf=sign*(1-(((((1.061405429*t-1.453152027)*t)+1.421413741)*t-0.284496736)*t+0.254829592)*t*Math.exp(-a*a));
  var cdf=(1+erf/Math.sqrt(2))/2;
  return step("Z-score","<b>"+fmt(z)+"</b>")+
    step("Cumulative probability","<b>"+fmt(cdf*100)+"%</b>")+
    step("Interpretation","Approximate percentage of the normal distribution at or below x.");
});

/* ELECTRICAL ENGINEERING */

add("voltage-divider",[
  {id:"vin",label:"Input voltage (V)",value:12},
  {id:"r1",label:"Resistor R1 (ohms)",value:1000},
  {id:"r2",label:"Resistor R2 (ohms)",value:1000}
],function(v) {
  var vin=num(v.vin,"input voltage"),r1=num(v.r1,"R1"),r2=num(v.r2,"R2");
  if(r1<=0||r2<=0)throw new Error("Resistances must be positive.");
  return step("Voltage divider formula","Vout = Vin × R2 / (R1 + R2)")+
    step("Output voltage","<b>"+fmt(vin*r2/(r1+r2))+" V</b>")+
    step("Assumption","Ideal divider with no load connected to the output.");
});
add("electric-power",[
  {id:"mode",label:"Calculate",type:"select",options:["Power from voltage and current","Voltage from power and current","Current from power and voltage"]},
  {id:"a",label:"First value",value:12},
  {id:"b",label:"Second value",value:2}
],function(v) {
  var a=num(v.a,"first value"),b=num(v.b,"second value");
  if(a<0||b<0)throw new Error("Values cannot be negative.");
  if(v.mode.indexOf("Power")===0)return step("Power formula","P = V × I")+step("Power","<b>"+fmt(a*b)+" W</b>");
  if(v.mode.indexOf("Voltage")===0){if(b===0)throw new Error("Current cannot be zero.");return step("Voltage formula","V = P / I")+step("Voltage","<b>"+fmt(a/b)+" V</b>");}
  if(b===0)throw new Error("Voltage cannot be zero.");
  return step("Current formula","I = P / V")+step("Current","<b>"+fmt(a/b)+" A</b>");
});
add("resistor-series",[
  {id:"values",label:"Resistances in ohms (comma separated)",type:"text",value:"100, 220, 330"}
],function(v) {
  var a=nums(v.values);
  if(!validList(a)||a.length<1||a.some(function(x){return x<=0;}))throw new Error("Enter positive resistor values.");
  return step("Series resistance formula","Req = R1 + R2 + ... + Rn")+
    step("Equivalent resistance","<b>"+fmt(a.reduce(function(s,x){return s+x;},0))+" Ω</b>");
});
add("resistor-parallel",[
  {id:"values",label:"Resistances in ohms (comma separated)",type:"text",value:"100, 220, 330"}
],function(v) {
  var a=nums(v.values);
  if(!validList(a)||a.length<1||a.some(function(x){return x<=0;}))throw new Error("Enter positive resistor values.");
  var inv=a.reduce(function(s,x){return s+1/x;},0);
  return step("Parallel resistance formula","1 / Req = 1/R1 + 1/R2 + ... + 1/Rn")+
    step("Equivalent resistance","<b>"+fmt(1/inv)+" Ω</b>");
});
add("wavelength-frequency",[
  {id:"speed",label:"Wave speed (m/s)",value:299792458},
  {id:"frequency",label:"Frequency (Hz)",value:100000000}
],function(v) {
  var s=num(v.speed,"wave speed"),f=num(v.frequency,"frequency");
  if(s<=0||f<=0)throw new Error("Wave speed and frequency must be positive.");
  return step("Wavelength formula","λ = wave speed / frequency")+
    step("Wavelength","<b>"+fmt(s/f)+" meters</b>");
});

/* EVERYDAY TOOLS */

add("tip-calculator",[
  {id:"bill",label:"Bill amount",value:50},
  {id:"rate",label:"Tip percentage (%)",value:15}
],function(v) {
  var b=num(v.bill,"bill amount"),r=num(v.rate,"tip rate");
  if(b<0||r<0)throw new Error("Bill and tip rate cannot be negative.");
  return step("Tip amount","<b>"+fmt(b*r/100)+"</b>")+
    step("Total including tip","<b>"+fmt(b*(1+r/100))+"</b>");
});
add("bill-split",[
  {id:"bill",label:"Bill before tax and tip",value:100},
  {id:"tax",label:"Tax percentage (%)",value:8},
  {id:"tip",label:"Tip percentage (%)",value:15},
  {id:"people",label:"Number of people",value:4}
],function(v) {
  var b=num(v.bill,"bill"),tax=num(v.tax,"tax"),tip=num(v.tip,"tip"),p=num(v.people,"people");
  if(b<0||tax<0||tip<0||!Number.isInteger(p)||p<1)throw new Error("Amounts and rates cannot be negative; people must be a positive whole number.");
  var total=b*(1+tax/100+tip/100);
  return step("Total bill including tax and tip","<b>"+fmt(total)+"</b>")+
    step("Amount per person","<b>"+fmt(total/p)+"</b>");
});
add("fuel-cost",[
  {id:"distance",label:"Trip distance (km)",value:300},
  {id:"consumption",label:"Fuel consumption (L/100 km)",value:8},
  {id:"price",label:"Fuel price per liter",value:1.5}
],function(v) {
  var d=num(v.distance,"distance"),c=num(v.consumption,"consumption"),p=num(v.price,"fuel price");
  if(d<0||c<0||p<0)throw new Error("Values cannot be negative.");
  var liters=d*c/100;
  return step("Estimated fuel needed","<b>"+fmt(liters)+" liters</b>")+
    step("Estimated fuel cost","<b>"+fmt(liters*p)+"</b>");
});
add("fuel-economy",[
  {id:"distance",label:"Distance travelled (km)",value:500},
  {id:"fuel",label:"Fuel used (liters)",value:40}
],function(v) {
  var d=num(v.distance,"distance"),f=num(v.fuel,"fuel used");
  if(d<0||f<=0)throw new Error("Distance cannot be negative and fuel used must be positive.");
  return step("Fuel economy","<b>"+fmt(d/f)+" km/L</b>")+
    step("Fuel consumption","<b>"+fmt(f/d*100)+" L/100 km</b>");
});
add("grade-calculator",[
  {id:"earned",label:"Points earned",value:85},
  {id:"total",label:"Total possible points",value:100}
],function(v) {
  var e=num(v.earned,"points earned"),t=num(v.total,"total possible points");
  if(t<=0||e<0||e>t)throw new Error("Total must be positive and earned points must be between zero and total.");
  var p=e/t*100;
  var grade=p>=90?"A":p>=80?"B":p>=70?"C":p>=60?"D":"F";
  return step("Percentage grade","<b>"+fmt(p)+"%</b>")+
    step("Approximate letter grade","<b>"+grade+"</b>")+
    step("Grading note","Uses a generic A≥90, B≥80, C≥70, D≥60 scale. Your institution may use a different scale.");
});

})();