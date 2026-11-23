# Pruthvi P R – Portfolio

Personal portfolio of Pruthvi P R, full-stack developer (PHP, CodeIgniter, MySQL, JavaScript).

Plain HTML, CSS and JavaScript. No build step, no libraries, no external requests.

## What's on the page

- **Intro**: a glowing dot, then the name decodes into "PRUTHVI" and "FULL STACK". Plays once per visit.
- **Hero**: a giant name behind the portrait. The photo assembles from particles; move the mouse over it to scatter them.
- **Headings**: the letters scramble into place as each section scrolls into view.
- **Dot-matrix board**: "FRONT TO BACK END" drawn as LEDs that push away from the cursor.
- **Work**: project cards that stack on top of each other as you scroll (desktop).
- **Contact**: an ember section with a duotone photo and a résumé download.

All motion turns off for visitors who choose reduced motion in their system settings.

## Important: run it from a server

The particle effect reads the photo's pixels. Browsers block that when the page is opened straight from disk (`file://`), so the photo is shown without particles. On GitHub Pages, or a local server, it works:

```bash
python -m http.server 8000
# open http://localhost:8000
```

## Structure

```
index.html      content
style.css       design and responsive rules
index.js        intro, particles, dot matrix, scramble, stacking cards, cursor
assets/
  Pruthvi_PR_Resume.pdf
  img/          photos (transparent WebP)
  fonts/        Anton, Instrument Serif, Schibsted Grotesk (SIL Open Font License)
  og.jpg        link-preview image
```

## Editing

- Résumé: replace `assets/Pruthvi_PR_Resume.pdf` with a file of the same name.
- Hero photo: replace `assets/img/about.webp` (transparent background, 2:3).
- Colours: change `--ember` and the other variables at the top of `style.css`.

## Deploy

Push to GitHub, then Settings → Pages → Deploy from branch → `main` / root.
After it's live, change `og:image` in `index.html` to the full URL, e.g.
`https://pruthvi-dev1.github.io/pruthvi-portfolio/assets/og.jpg`.
