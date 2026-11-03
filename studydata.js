/* MathSolveIQ study data: flashcard decks, formula library and homework problems. */
(function () {
  var DECKS = {
    "Algebra": [
      ["Quadratic formula", "x = (−b ± √(b² − 4ac)) / 2a"],
      ["Difference of squares", "a² − b² = (a − b)(a + b)"],
      ["(a + b)²", "a² + 2ab + b²"],
      ["(a − b)²", "a² − 2ab + b²"],
      ["Sum of the first n terms of an AP", "Sₙ = n/2 · (2a + (n − 1)d)"],
      ["Sum of the first n terms of a GP (r ≠ 1)", "Sₙ = a(1 − rⁿ) / (1 − r)"],
      ["Slope between two points", "m = (y₂ − y₁) / (x₂ − x₁)"],
      ["Distance between two points", "d = √((x₂ − x₁)² + (y₂ − y₁)²)"]
    ],
    "Exponents and Logs": [
      ["aᵐ × aⁿ", "aᵐ⁺ⁿ"],
      ["aᵐ ÷ aⁿ", "aᵐ⁻ⁿ"],
      ["(aᵐ)ⁿ", "aᵐⁿ"],
      ["a⁰ (a ≠ 0)", "1"],
      ["a⁻ⁿ", "1 / aⁿ"],
      ["log(ab)", "log a + log b"],
      ["log(a/b)", "log a − log b"],
      ["log(aⁿ)", "n · log a"],
      ["Change of base", "log_b(x) = ln x / ln b"]
    ],
    "Trigonometry": [
      ["sin 30°", "1/2"],
      ["cos 30°", "√3/2"],
      ["sin 60°", "√3/2"],
      ["tan 45°", "1"],
      ["sin²θ + cos²θ", "1"],
      ["tan θ in terms of sin and cos", "sin θ / cos θ"],
      ["180° in radians", "π"],
      ["Law of cosines", "c² = a² + b² − 2ab·cos C"]
    ],
    "Calculus": [
      ["d/dx of xⁿ", "n·xⁿ⁻¹"],
      ["d/dx of sin x", "cos x"],
      ["d/dx of cos x", "−sin x"],
      ["d/dx of eˣ", "eˣ"],
      ["d/dx of ln x", "1/x"],
      ["Product rule", "(uv)′ = u′v + uv′"],
      ["Chain rule", "d/dx f(g(x)) = f′(g(x)) · g′(x)"],
      ["∫ xⁿ dx (n ≠ −1)", "xⁿ⁺¹ / (n + 1) + C"]
    ],
    "Geometry": [
      ["Area and circumference of a circle", "A = πr², C = 2πr"],
      ["Area of a triangle", "½ × base × height"],
      ["Pythagorean theorem", "a² + b² = c²"],
      ["Volume of a sphere", "4/3 · πr³"],
      ["Surface area of a sphere", "4πr²"],
      ["Volume of a cylinder", "πr²h"],
      ["Volume of a cone", "1/3 · πr²h"],
      ["Sum of the interior angles of an n-sided polygon", "(n − 2) × 180°"]
    ],
    "Statistics": [
      ["Mean", "Σx / n"],
      ["Range", "largest value − smallest value"],
      ["Sample standard deviation", "s = √( Σ(x − x̄)² / (n − 1) )"],
      ["z-score", "z = (x − μ) / σ"],
      ["Permutations", "nPr = n! / (n − r)!"],
      ["Combinations", "nCr = n! / (r! (n − r)!)"],
      ["Probability of A or B", "P(A) + P(B) − P(A and B)"],
      ["Median of an even number of values", "The average of the two middle values"]
    ]
  };

  /* [topic, question, answer, hint1, hint2, [solution steps]] */
  var PROBLEMS = [
    ["Algebra", "Solve 3x + 7 = 22. What is x?", 5, "Subtract 7 from both sides first.", "Now divide both sides by 3.", ["3x + 7 = 22", "3x = 22 − 7 = 15", "x = 15 ÷ 3 = 5"]],
    ["Algebra", "Solve 2(x − 4) = 10. What is x?", 9, "Expand the bracket, or divide both sides by 2 first.", "If you divide by 2 you get x − 4 = 5.", ["2(x − 4) = 10", "x − 4 = 5", "x = 9"]],
    ["Algebra", "Solve x/3 + 2 = 6. What is x?", 12, "Get the fraction on its own by subtracting 2.", "Then multiply both sides by 3.", ["x/3 + 2 = 6", "x/3 = 4", "x = 12"]],
    ["Algebra", "Solve 5x − 3 = 2x + 12. What is x?", 5, "Collect the x terms on one side: subtract 2x from both sides.", "You should have 3x − 3 = 12.", ["5x − 3 = 2x + 12", "3x = 15", "x = 5"]],
    ["Algebra", "Solve 4x − 9 = 3. What is x?", 3, "Add 9 to both sides.", "Then divide by 4.", ["4x − 9 = 3", "4x = 12", "x = 3"]],
    ["Quadratics", "x² − 7x + 12 = 0 has two roots. What is the larger one?", 4, "Look for two numbers that multiply to 12 and add to −7.", "They are −3 and −4, so the factors are (x − 3)(x − 4).", ["x² − 7x + 12 = (x − 3)(x − 4)", "Roots: x = 3 and x = 4", "The larger root is 4"]],
    ["Quadratics", "What is the discriminant of 2x² − 3x − 5?", 49, "The discriminant is b² − 4ac.", "Here a = 2, b = −3 and c = −5.", ["D = b² − 4ac", "D = (−3)² − 4(2)(−5)", "D = 9 + 40 = 49"]],
    ["Quadratics", "What is the x-coordinate of the vertex of y = x² − 8x + 3?", 4, "Use x = −b / (2a).", "Here b = −8 and a = 1.", ["x = −b / (2a) = 8 / 2", "x = 4"]],
    ["Quadratics", "What is the product of the roots of x² − 9x + 14 = 0?", 14, "For ax² + bx + c = 0 the product of the roots is c / a.", "Here c = 14 and a = 1.", ["Product = c / a = 14 / 1", "Product = 14"]],
    ["Quadratics", "What is the sum of the roots of 2x² − 10x + 3 = 0?", 5, "The sum of the roots is −b / a.", "Here b = −10 and a = 2.", ["Sum = −b / a = 10 / 2", "Sum = 5"]],
    ["Fractions and Percent", "Compute 3/4 + 1/6 (a fraction like 11/12 or a decimal is fine).", 11 / 12, "Find a common denominator of 4 and 6.", "12 works: 3/4 = 9/12 and 1/6 = 2/12.", ["3/4 = 9/12 and 1/6 = 2/12", "9/12 + 2/12 = 11/12"]],
    ["Fractions and Percent", "What is 20% of 350?", 70, "20% means 20/100, which is 0.2.", "Multiply 0.2 by 350.", ["20% = 0.2", "0.2 × 350 = 70"]],
    ["Fractions and Percent", "A price of 80 goes up by 15%. What is the new price?", 92, "Find 15% of 80 first.", "15% of 80 is 12. Now add it to 80.", ["15% of 80 = 12", "80 + 12 = 92"]],
    ["Fractions and Percent", "What is 2/3 of 45?", 30, "Divide 45 by 3 first.", "Then multiply by 2.", ["45 ÷ 3 = 15", "15 × 2 = 30"]],
    ["Fractions and Percent", "Write 36/48 as a decimal.", 0.75, "Simplify first: divide top and bottom by 12.", "36/48 = 3/4. Now divide 3 by 4.", ["36/48 = 3/4", "3 ÷ 4 = 0.75"]],
    ["Geometry", "A circle has radius 6. Its area is kπ. What is k?", 36, "Area = πr².", "r² = 36.", ["A = πr² = π × 6²", "A = 36π, so k = 36"]],
    ["Geometry", "A right triangle has legs 5 and 12. How long is the hypotenuse?", 13, "Use a² + b² = c².", "25 + 144 = 169.", ["c² = 5² + 12² = 25 + 144 = 169", "c = √169 = 13"]],
    ["Geometry", "A triangle has base 14 and height 9. What is its area?", 63, "Area = ½ × base × height.", "½ × 14 = 7.", ["A = ½ × 14 × 9", "A = 7 × 9 = 63"]],
    ["Geometry", "What is the volume of a cube with side 4?", 64, "Volume = side × side × side.", "4 × 4 = 16.", ["V = 4³", "V = 64"]],
    ["Geometry", "What is the sum of the interior angles of a hexagon (in degrees)?", 720, "Use (n − 2) × 180°.", "A hexagon has n = 6 sides.", ["(6 − 2) × 180°", "4 × 180° = 720°"]],
    ["Calculus", "If f(x) = x³, what is f′(2)?", 12, "Use the power rule to find f′(x).", "f′(x) = 3x². Now put x = 2.", ["f′(x) = 3x²", "f′(2) = 3 × 4 = 12"]],
    ["Calculus", "If f(x) = 3x² + 2x, what is f′(1)?", 8, "Differentiate each term.", "f′(x) = 6x + 2.", ["f′(x) = 6x + 2", "f′(1) = 6 + 2 = 8"]],
    ["Calculus", "Evaluate the integral of 2x dx from 0 to 3.", 9, "An antiderivative of 2x is x².", "Compute 3² − 0².", ["∫ 2x dx = x²", "From 0 to 3: 9 − 0 = 9"]],
    ["Calculus", "Evaluate the integral of 3x² dx from 0 to 2.", 8, "An antiderivative of 3x² is x³.", "Compute 2³ − 0³.", ["∫ 3x² dx = x³", "From 0 to 2: 8 − 0 = 8"]],
    ["Calculus", "If f(x) = 5x⁴, what is f′(1)?", 20, "Bring the power down: 5 × 4 = 20.", "f′(x) = 20x³.", ["f′(x) = 20x³", "f′(1) = 20"]],
    ["Statistics", "What is the mean of 6, 8, 10, 12?", 9, "Add the numbers.", "The sum is 36. Divide by 4.", ["6 + 8 + 10 + 12 = 36", "36 ÷ 4 = 9"]],
    ["Statistics", "What is the median of 3, 9, 5, 7, 1?", 5, "Sort the numbers first.", "Sorted: 1, 3, 5, 7, 9. Take the middle one.", ["Sorted: 1, 3, 5, 7, 9", "The middle value is 5"]],
    ["Statistics", "What is the range of 12, 5, 20, 9?", 15, "Range = largest − smallest.", "The largest is 20 and the smallest is 5.", ["20 − 5 = 15"]],
    ["Statistics", "How many ways can you choose 2 people from 6 (6C2)?", 15, "nCr = n! / (r!(n − r)!).", "6C2 = (6 × 5) / (2 × 1).", ["6C2 = (6 × 5) / 2", "= 30 / 2 = 15"]],
    ["Statistics", "How many ways can you arrange 2 of 5 people in order (5P2)?", 20, "nPr = n! / (n − r)!.", "5P2 = 5 × 4.", ["5P2 = 5 × 4", "= 20"]]
  ];

  /* Compare a typed answer with the expected number. Accepts 3/4, 0.75, 1,5 style is NOT accepted. */
  function toNum(s) {
    s = String(s).replace(/\s+/g, "").replace(/−/g, "-");
    var m = s.match(/^(-?\d+\.?\d*)\/(-?\d+\.?\d*)$/);
    if (m) return parseFloat(m[1]) / parseFloat(m[2]);
    if (/^-?\d*\.?\d+$/.test(s) || /^-?\d+\.$/.test(s)) return parseFloat(s);
    return NaN;
  }
  function check(input, answer) {
    var v = toNum(input);
    if (!isFinite(v)) return null;           /* not a number */
    return Math.abs(v - answer) <= Math.max(0.005, Math.abs(answer) * 0.005);
  }

  var api = { DECKS: DECKS, PROBLEMS: PROBLEMS, check: check, toNum: toNum };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else window.MSIQ_STUDY = api;
})();
