/* MathSolveIQ calculators - batch 2 */
(function () {
  "use strict";

  var E = window.MSIQ = window.MSIQ || {};

  function number(v, label) {
    if (String(v == null ? "" : v).trim() === "") {
      throw new Error("Enter " + label + ".");
    }
    var x = Number(v);
    if (!Number.isFinite(x)) throw new Error("Enter a valid number for " + label + ".");
    return x;
  }

  function fmt(x) {
    if (!Number.isFinite(x)) throw new Error("The result is outside the supported numeric range.");
    if (Object.is(x, -0)) x = 0;
    return String(Number(x.toPrecision(10)));
  }

  function step(title, body) {
    return '<div class="step"><b>' + title + '</b><br>' + body + '</div>';
  }

  function add(slug, fields, solve) {
    E[slug] = { fields: fields, solve: solve };
  }

  function converter(slug, units) {
    var names = units.map(function (u) { return u[0]; });

    add(slug, [
      { id: "amount", label: "Amount", value: 1 },
      { id: "from", label: "Convert from", type: "select", options: names },
      { id: "to", label: "Convert to", type: "select", options: names }
    ], function (v) {
      var amount = number(v.amount, "an amount");
      var from = units.filter(function (u) { return u[0] === v.from; })[0];
      var to = units.filter(function (u) { return u[0] === v.to; })[0];

      if (!from || !to) throw new Error("Select valid units.");

      var result = amount * from[1] / to[1];

      return step("Conversion",
        fmt(amount) + " " + from[0] + " = <b>" + fmt(result) + " " + to[0] + "</b>"
      );
    });
  }

  converter("length-converter", [
    ["Meters", 1], ["Kilometers", 1000], ["Centimeters", .01],
    ["Millimeters", .001], ["Inches", .0254], ["Feet", .3048],
    ["Yards", .9144], ["Miles", 1609.344]
  ]);

  converter("mass-converter", [
    ["Kilograms", 1], ["Grams", .001], ["Milligrams", .000001],
    ["Pounds", .45359237], ["Ounces", .028349523125], ["Metric tonnes", 1000]
  ]);

  converter("area-converter", [
    ["Square meters", 1], ["Square kilometers", 1000000],
    ["Square centimeters", .0001], ["Square millimeters", .000001],
    ["Square feet", .09290304], ["Square yards", .83612736],
    ["Acres", 4046.8564224], ["Hectares", 10000]
  ]);

  converter("volume-converter", [
    ["Liters", 1], ["Milliliters", .001], ["Cubic meters", 1000],
    ["Cubic centimeters", .001], ["US gallons", 3.785411784],
    ["US cups", .2365882365], ["Cubic feet", 28.316846592]
  ]);

  converter("speed-converter", [
    ["Meters per second", 1], ["Kilometers per hour", 1 / 3.6],
    ["Miles per hour", .44704], ["Knots", .514444444]
  ]);

  converter("time-converter", [
    ["Seconds", 1], ["Milliseconds", .001], ["Minutes", 60],
    ["Hours", 3600], ["Days", 86400], ["Weeks", 604800]
  ]);

  converter("pressure-converter", [
    ["Pascals", 1], ["Kilopascals", 1000], ["Megapascals", 1000000],
    ["Bars", 100000], ["Atmospheres", 101325], ["PSI", 6894.757293]
  ]);

  converter("energy-converter", [
    ["Joules", 1], ["Kilojoules", 1000], ["Calories", 4.184],
    ["Kilocalories", 4184], ["Watt-hours", 3600],
    ["Kilowatt-hours", 3600000], ["Electronvolts", 1.602176634e-19]
  ]);

  converter("power-converter", [
    ["Watts", 1], ["Kilowatts", 1000],
    ["Megawatts", 1000000], ["Mechanical horsepower", 745.699872]
  ]);

  converter("data-storage-converter", [
    ["Bits", 1], ["Bytes", 8],
    ["Kilobytes (KB)", 8000], ["Megabytes (MB)", 8000000],
    ["Gigabytes (GB)", 8000000000],
    ["Terabytes (TB)", 8000000000000],
    ["Kibibytes (KiB)", 8192],
    ["Mebibytes (MiB)", 8388608],
    ["Gibibytes (GiB)", 8589934592],
    ["Tebibytes (TiB)", 8796093022208]
  ]);

  add("temperature-converter", [
    { id: "amount", label: "Temperature", value: 100 },
    { id: "from", label: "Convert from", type: "select", options: ["Celsius", "Fahrenheit", "Kelvin"] },
    { id: "to", label: "Convert to", type: "select", options: ["Celsius", "Fahrenheit", "Kelvin"] }
  ], function (v) {
    var x = number(v.amount, "a temperature");

    var c = v.from === "Fahrenheit" ? (x - 32) * 5 / 9 :
            v.from === "Kelvin" ? x - 273.15 : x;

    if (c < -273.15) throw new Error("Temperature cannot be below absolute zero.");

    var result = v.to === "Fahrenheit" ? c * 9 / 5 + 32 :
                 v.to === "Kelvin" ? c + 273.15 : c;

    return step("Temperature conversion",
      fmt(x) + " °" + (v.from === "Celsius" ? "C" : v.from === "Fahrenheit" ? "F" : "K") +
      " = <b>" + fmt(result) + " " + v.to + "</b>"
    );
  });

  // FINANCE AND BANKING

  add("simple-interest", [
    { id: "p", label: "Principal amount", value: 1000 },
    { id: "r", label: "Annual interest rate (%)", value: 5 },
    { id: "t", label: "Time (years)", value: 3 }
  ], function (v) {
    var p = number(v.p, "principal"), r = number(v.r, "interest rate"), t = number(v.t, "time");
    if (p < 0 || r < 0 || t < 0) throw new Error("Values cannot be negative.");

    var interest = p * r * t / 100;
    return step("Simple interest formula", "I = P × R × T / 100") +
      step("Interest earned", "<b>" + fmt(interest) + "</b>") +
      step("Total amount", "<b>" + fmt(p + interest) + "</b>");
  });

  add("compound-interest", [
    { id: "p", label: "Principal amount", value: 1000 },
    { id: "r", label: "Annual rate (%)", value: 5 },
    { id: "t", label: "Time (years)", value: 3 },
    { id: "n", label: "Compounding periods per year", type: "select", options: ["1", "2", "4", "12", "365"] }
  ], function (v) {
    var p = number(v.p, "principal"), r = number(v.r, "rate"),
        t = number(v.t, "time"), n = number(v.n, "compounding frequency");

    if (p < 0 || r < 0 || t < 0 || n <= 0) throw new Error("Use non-negative values and a valid frequency.");

    var amount = p * Math.pow(1 + r / (100 * n), n * t);
    return step("Compound interest formula", "A = P(1 + r/n)^(nt)") +
      step("Accumulated amount", "<b>" + fmt(amount) + "</b>") +
      step("Interest earned", "<b>" + fmt(amount - p) + "</b>");
  });

  add("loan-payment", [
    { id: "p", label: "Loan principal", value: 200000 },
    { id: "r", label: "Annual interest rate (%)", value: 6 },
    { id: "years", label: "Loan term (years)", value: 20 }
  ], function (v) {
    var p = number(v.p, "loan principal"), apr = number(v.r, "annual rate"),
        years = number(v.years, "loan term");

    if (p <= 0 || apr < 0 || years <= 0) throw new Error("Principal and term must be positive; rate cannot be negative.");

    var months = years * 12;
    var monthlyRate = apr / 1200;
    var payment = monthlyRate === 0 ? p / months :
      p * monthlyRate / (1 - Math.pow(1 + monthlyRate, -months));

    var total = payment * months;
    return step("Monthly payment formula", "M = P × r / (1 − (1 + r)^−n)") +
      step("Monthly payment", "<b>" + fmt(payment) + "</b>") +
      step("Total paid", "<b>" + fmt(total) + "</b>") +
      step("Total interest", "<b>" + fmt(total - p) + "</b>") +
      step("Payment count", months + " monthly payments");
  });

  add("sales-tax", [
    { id: "price", label: "Price before tax", value: 100 },
    { id: "rate", label: "Sales tax rate (%)", value: 8.25 }
  ], function (v) {
    var p = number(v.price, "price"), r = number(v.rate, "tax rate");
    if (p < 0 || r < 0) throw new Error("Price and tax rate cannot be negative.");
    var tax = p * r / 100;
    return step("Tax amount", "<b>" + fmt(tax) + "</b>") +
      step("Final price including tax", "<b>" + fmt(p + tax) + "</b>");
  });

  add("discount-calculator", [
    { id: "price", label: "Original price", value: 120 },
    { id: "rate", label: "Discount (%)", value: 20 }
  ], function (v) {
    var p = number(v.price, "original price"), r = number(v.rate, "discount");
    if (p < 0 || r < 0 || r > 100) throw new Error("Price must be non-negative and discount must be from 0 to 100.");
    var saved = p * r / 100;
    return step("Money saved", "<b>" + fmt(saved) + "</b>") +
      step("Final price", "<b>" + fmt(p - saved) + "</b>");
  });

  add("profit-margin", [
    { id: "cost", label: "Cost", value: 70 },
    { id: "sale", label: "Selling price", value: 100 }
  ], function (v) {
    var c = number(v.cost, "cost"), s = number(v.sale, "selling price");
    if (c < 0 || s <= 0 || c === 0) throw new Error("Cost must be positive and selling price must be above zero.");
    var profit = s - c;
    return step("Profit", "<b>" + fmt(profit) + "</b>") +
      step("Profit margin", "<b>" + fmt(profit / s * 100) + "%</b>") +
      step("Markup on cost", "<b>" + fmt(profit / c * 100) + "%</b>");
  });

  add("markup-calculator", [
    { id: "cost", label: "Cost", value: 70 },
    { id: "rate", label: "Markup (%)", value: 30 }
  ], function (v) {
    var c = number(v.cost, "cost"), r = number(v.rate, "markup");
    if (c < 0 || r < 0) throw new Error("Cost and markup cannot be negative.");
    var profit = c * r / 100;
    return step("Markup amount", "<b>" + fmt(profit) + "</b>") +
      step("Selling price", "<b>" + fmt(c + profit) + "</b>") +
      step("Profit margin", "<b>" + fmt((profit / (c + profit)) * 100) + "%</b>");
  });

  add("break-even", [
    { id: "fixed", label: "Fixed costs", value: 10000 },
    { id: "price", label: "Selling price per unit", value: 50 },
    { id: "variable", label: "Variable cost per unit", value: 30 }
  ], function (v) {
    var f = number(v.fixed, "fixed costs"), p = number(v.price, "selling price"),
        c = number(v.variable, "variable cost");

    if (f < 0 || c < 0 || p <= c) throw new Error("Selling price must be greater than variable cost.");

    var units = f / (p - c);
    return step("Contribution per unit", "<b>" + fmt(p - c) + "</b>") +
      step("Break-even quantity", "<b>" + fmt(units) + " units</b>") +
      step("Whole units needed", "<b>" + Math.ceil(units) + " units</b>") +
      step("Revenue at exact break-even", "<b>" + fmt(units * p) + "</b>");
  });

  add("roi-calculator", [
    { id: "initial", label: "Initial investment", value: 10000 },
    { id: "final", label: "Final value", value: 12500 }
  ], function (v) {
    var a = number(v.initial, "initial investment"), b = number(v.final, "final value");
    if (a <= 0 || b < 0) throw new Error("Initial investment must be positive and final value cannot be negative.");
    var gain = b - a;
    return step("Gain or loss", "<b>" + fmt(gain) + "</b>") +
      step("Return on investment", "<b>" + fmt(gain / a * 100) + "%</b>");
  });

  add("savings-growth", [
    { id: "initial", label: "Starting balance", value: 1000 },
    { id: "deposit", label: "Monthly deposit", value: 100 },
    { id: "rate", label: "Annual interest rate (%)", value: 5 },
    { id: "years", label: "Years", value: 10 }
  ], function (v) {
    var p = number(v.initial, "starting balance"), d = number(v.deposit, "monthly deposit"),
        r = number(v.rate, "annual rate"), years = number(v.years, "years");

    if (p < 0 || d < 0 || r < 0 || years < 0) throw new Error("Values cannot be negative.");

    var months = Math.round(years * 12);
    var i = r / 1200;
    var growth = i === 0 ? p + d * months :
      p * Math.pow(1 + i, months) + d * (Math.pow(1 + i, months) - 1) / i;

    var contributions = p + d * months;
    return step("Future savings balance", "<b>" + fmt(growth) + "</b>") +
      step("Total contributions", "<b>" + fmt(contributions) + "</b>") +
      step("Estimated interest earned", "<b>" + fmt(growth - contributions) + "</b>") +
      step("Assumption", "Monthly deposits are made at the end of each month.");
  });

  // PHYSICS AND MECHANICS

  add("average-speed", [
    { id: "distance", label: "Distance (meters)", value: 1000 },
    { id: "time", label: "Time (seconds)", value: 100 }
  ], function (v) {
    var d = number(v.distance, "distance"), t = number(v.time, "time");
    if (d < 0 || t <= 0) throw new Error("Distance cannot be negative and time must be positive.");
    return step("Average speed", "Speed = distance / time") +
      step("Result", "<b>" + fmt(d / t) + " m/s</b>") +
      step("Kilometers per hour", "<b>" + fmt(d / t * 3.6) + " km/h</b>");
  });

  add("distance-travelled", [
    { id: "speed", label: "Constant speed (m/s)", value: 15 },
    { id: "time", label: "Time (seconds)", value: 20 }
  ], function (v) {
    var s = number(v.speed, "speed"), t = number(v.time, "time");
    if (s < 0 || t < 0) throw new Error("Speed and time cannot be negative.");
    return step("Distance formula", "Distance = speed × time") +
      step("Distance travelled", "<b>" + fmt(s * t) + " meters</b>");
  });

  add("travel-time", [
    { id: "distance", label: "Distance (meters)", value: 1000 },
    { id: "speed", label: "Constant speed (m/s)", value: 10 }
  ], function (v) {
    var d = number(v.distance, "distance"), s = number(v.speed, "speed");
    if (d < 0 || s <= 0) throw new Error("Distance cannot be negative and speed must be positive.");
    var seconds = d / s;
    return step("Travel time", "Time = distance / speed") +
      step("Seconds", "<b>" + fmt(seconds) + "</b>") +
      step("Minutes", "<b>" + fmt(seconds / 60) + "</b>");
  });

  add("acceleration", [
    { id: "initial", label: "Initial velocity (m/s)", value: 0 },
    { id: "final", label: "Final velocity (m/s)", value: 20 },
    { id: "time", label: "Time (seconds)", value: 5 }
  ], function (v) {
    var u = number(v.initial, "initial velocity"), f = number(v.final, "final velocity"),
        t = number(v.time, "time");
    if (t <= 0) throw new Error("Time must be positive.");
    return step("Acceleration formula", "a = (v − u) / t") +
      step("Average acceleration", "<b>" + fmt((f - u) / t) + " m/s²</b>");
  });

  add("force-calculator", [
    { id: "mass", label: "Mass (kg)", value: 10 },
    { id: "acceleration", label: "Acceleration (m/s²)", value: 2 }
  ], function (v) {
    var m = number(v.mass, "mass"), a = number(v.acceleration, "acceleration");
    if (m < 0) throw new Error("Mass cannot be negative.");
    return step("Newton's second law", "F = m × a") +
      step("Force", "<b>" + fmt(m * a) + " newtons (N)</b>");
  });

  add("weight-force", [
    { id: "mass", label: "Mass (kg)", value: 10 },
    { id: "gravity", label: "Gravitational acceleration (m/s²)", value: 9.80665 }
  ], function (v) {
    var m = number(v.mass, "mass"), g = number(v.gravity, "gravity");
    if (m < 0 || g < 0) throw new Error("Mass and gravity cannot be negative.");
    return step("Weight formula", "W = m × g") +
      step("Weight force", "<b>" + fmt(m * g) + " newtons (N)</b>");
  });

  add("kinetic-energy", [
    { id: "mass", label: "Mass (kg)", value: 10 },
    { id: "velocity", label: "Velocity (m/s)", value: 5 }
  ], function (v) {
    var m = number(v.mass, "mass"), velocity = number(v.velocity, "velocity");
    if (m < 0) throw new Error("Mass cannot be negative.");
    return step("Kinetic energy formula", "KE = ½ × m × v²") +
      step("Kinetic energy", "<b>" + fmt(.5 * m * velocity * velocity) + " joules (J)</b>");
  });

  add("potential-energy", [
    { id: "mass", label: "Mass (kg)", value: 10 },
    { id: "gravity", label: "Gravity (m/s²)", value: 9.80665 },
    { id: "height", label: "Height (meters)", value: 5 }
  ], function (v) {
    var m = number(v.mass, "mass"), g = number(v.gravity, "gravity"),
        h = number(v.height, "height");
    if (m < 0 || g < 0 || h < 0) throw new Error("Values cannot be negative.");
    return step("Potential energy formula", "PE = m × g × h") +
      step("Gravitational potential energy", "<b>" + fmt(m * g * h) + " joules (J)</b>");
  });

  add("work-calculator", [
    { id: "force", label: "Force (newtons)", value: 50 },
    { id: "distance", label: "Displacement (meters)", value: 10 },
    { id: "angle", label: "Angle between force and displacement (degrees)", value: 0 }
  ], function (v) {
    var f = number(v.force, "force"), d = number(v.distance, "displacement"),
        a = number(v.angle, "angle");
    if (d < 0) throw new Error("Displacement cannot be negative.");
    var w = f * d * Math.cos(a * Math.PI / 180);
    return step("Work formula", "W = F × d × cos(θ)") +
      step("Mechanical work", "<b>" + fmt(w) + " joules (J)</b>");
  });

  add("mechanical-power", [
    { id: "work", label: "Work done (joules)", value: 1000 },
    { id: "time", label: "Time (seconds)", value: 10 }
  ], function (v) {
    var w = number(v.work, "work"), t = number(v.time, "time");
    if (t <= 0) throw new Error("Time must be positive.");
    return step("Power formula", "P = W / t") +
      step("Mechanical power", "<b>" + fmt(w / t) + " watts (W)</b>");
  });

  add("density-calculator", [
    { id: "mass", label: "Mass (kg)", value: 10 },
    { id: "volume", label: "Volume (m³)", value: 2 }
  ], function (v) {
    var m = number(v.mass, "mass"), volume = number(v.volume, "volume");
    if (m < 0 || volume <= 0) throw new Error("Mass cannot be negative and volume must be positive.");
    return step("Density formula", "Density = mass / volume") +
      step("Density", "<b>" + fmt(m / volume) + " kg/m³</b>");
  });

  // ELECTRICAL ENGINEERING

  add("ohms-law", [
    { id: "mode", label: "Calculate", type: "select",
      options: ["Voltage (V = I × R)", "Current (I = V / R)", "Resistance (R = V / I)"] },
    { id: "x", label: "First value", value: 2 },
    { id: "y", label: "Second value", value: 10 }
  ], function (v) {
    var x = number(v.x, "first value"), y = number(v.y, "second value");

    if (x < 0 || y < 0) throw new Error("Values cannot be negative.");

    if (v.mode.indexOf("Voltage") === 0) {
      return step("Ohm's law", "V = I × R") +
        step("Voltage", "<b>" + fmt(x * y) + " volts (V)</b>");
    }

    if (v.mode.indexOf("Current") === 0) {
      if (y === 0) throw new Error("Resistance cannot be zero.");
      return step("Ohm's law", "I = V / R") +
        step("Current", "<b>" + fmt(x / y) + " amperes (A)</b>");
    }

    if (y === 0) throw new Error("Current cannot be zero.");
    return step("Ohm's law", "R = V / I") +
      step("Resistance", "<b>" + fmt(x / y) + " ohms (Ω)</b>");
  });

})();