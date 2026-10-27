# MathSolveIQ

Simple static website. No install needed.

## Run in VS Code
1. Open this folder in VS Code (File > Open Folder).
2. Install the "Live Server" extension.
3. Right-click index.html > "Open with Live Server".

## Structure
- index.html   - all pages (each page is a <section class="page" id="page-NAME">)
- css/style.css - styles
- js/app.js    - tools (graph, quadratic, calculator, units, stats) and the page router
- images/      - put logos and images here

## Add a new page
1. In index.html add a section: <section class="page" id="page-NAME"><h2>Title</h2>...</section>
2. In the <nav> add: <a href="#NAME">Title</a>

## AI solver
In js/app.js set API_URL to your own server. It should accept POST {question} and return {answer}.
