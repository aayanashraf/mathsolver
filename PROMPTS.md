# Prompts for Claude Code (paste ONE at a time, test, then paste the next)

## Phase 1: Professional base
1. Make the home page professional: hero section, features grid, FAQ and footer.
2. Add About, Contact, Privacy Policy and Terms of Service pages.
3. Add SEO: meta tags for every page, sitemap.xml, robots.txt and Open Graph tags.
4. Design a logo and favicon and use them on the site.

## Phase 2: Calculators (one page each)
5. Add a Derivative calculator page with steps.
6. Add an Integral and Definite Integral calculator page.
7. Add a Limit calculator page.
8. Add a Matrix calculator page: determinant, inverse, transpose, multiplication, eigenvalues.
9. Add a Vector calculator page: dot product and cross product.
10. Add Fraction and Percentage calculator pages.
11. Add a Geometry calculator page: area, perimeter, volume, angles.
12. Add Probability, Permutation and Combination calculator pages.
13. Add Systems of Equations and Inequality calculator pages.
14. Upgrade the scientific calculator: factorial and complex numbers.

## Phase 3: Input features
15. Add a math keyboard to the Solve page: fractions, powers, roots, matrices, integral.
16. Add voice input in Urdu, Hindi and English.
17. Add LaTeX rendering and editing with KaTeX.
18. Add photo upload with OCR (needs backend, do prompt 50 first).
19. Add PDF worksheet upload and extract questions (needs backend).

## Phase 4: Solution features
20. Add a hint system: one hint at a time, not the full answer.
21. Add a Socratic mode: only guiding questions, no answer.
22. Solve quadratics three ways: factoring, completing the square, formula.
23. Show the final answer in a separate highlighted box.
24. Let the user click any solution step and ask "how did this come?" (needs backend).

## Phase 5: Study and export
25. Add a practice quiz generator with a question bank.
26. Add flashcards.
27. Expand the formula library and add search.
28. Add a video lessons page with YouTube links.
29. Add history and search using localStorage.
30. Add Copy text and Copy LaTeX buttons.
31. Add export of a solution as PDF.
32. Add shareable links where the problem is encoded in the URL.

## Phase 6: Platform
33. Build a multi-language system (English, Urdu, Hindi, Roman Urdu, Arabic) with separate translation files and RTL support.
34. Make it a PWA: manifest and service worker, works offline.
35. Add a local instant solver for small equations that answers in milliseconds.
36. Add a voice tutor: read the answer aloud and accept spoken follow-up questions.

## Phase 7: Gamification
37. Add daily streaks, XP and badges.
38. Add a leaderboard (needs backend).

## Phase 8: Interactive visuals
39. Add a 3D graph page with three.js.
40. Add an interactive 3D solids of revolution simulation with sliders.
41. Add an animated unit circle and trigonometry diagram with sliders.
42. Add geometry diagrams that highlight with each solution step.
43. Add a 3D vector cross product visualizer.

## Phase 9: Exam and classroom
44. Add exam modes: SAT, AP Calculus, O/A Level, FSc, JEE with separate syllabi.
45. Add a past paper question bank page.
46. Add teacher dashboard and student portal (needs backend).
47. Add a live multiplayer whiteboard (needs backend).
48. Add a community forum under each question (needs backend).
49. Add a Free and Premium pricing page with payments (needs backend).

## Backend (do this before 18, 19, 24, 38, 46, 47, 48, 49)
50. Create a Node.js backend that calls an AI API, keeps my API key private in a .env file, and exposes a /solve endpoint that takes {question} and returns {answer}. Then connect API_URL in js/app.js to it.
