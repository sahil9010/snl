# Simple Nursing NCLEX Prep

Original NCLEX-style practice questions covering the topics of the Simple Nursing study guide.

## Run it

Open `index.html` in any modern browser. No install or build step is needed.
For the best experience on a phone, host the folder on any static host (GitHub Pages, Netlify, or similar).

## Contents

- `index.html` — page shell
- `app.css` — styles (light and dark mode, phone layout)
- `app.js` — practice engine, scoring, and progress saving
- `data/` — question bank, one file per module

## Question bank

- 194 questions across 26 sections (Labs, ABG, Fluids, EKG, Pharmacology, Cardiovascular, Endocrine, GI, Hematology, Immunity, Infection Control, Integumentary, Musculoskeletal, Neurological, Renal, Respiratory, Oncology, Maternal/Newborn, Pediatrics, Mental Health, Critical Care, Leadership, Safety, and more)
- Question types: single answer, select all that apply, matrix, highlight, bow-tie
- Scoring: 1 point per item; select-all and highlight use partial credit (correct picks minus wrong picks, divided by the number of correct answers); matrix is per row; bow-tie is per slot.

## Adding questions

Create a new file in `data/` that pushes objects into `window.SNL_QS`, then add a `<script>` tag for it in `index.html`. Each question needs `id` (unique), `sec` (section name), `type`, `q`, the type's answer fields, and `why` (the rationale).

## Coverage and accuracy

- Sections were sampled from the source book, not every page was turned into questions. Coverage is broad but not complete.
- Questions are original wording based on the book's clinical content. Check important facts against your course materials and current guidelines before relying on them.
- This is a study tool. The "Practice score" is not an NCLEX score.

## Progress

Answers are saved in the browser's local storage on the same device. Clearing site data resets progress.
