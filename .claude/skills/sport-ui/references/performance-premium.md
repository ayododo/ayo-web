# Performance Premium — restrained, technical, editorial

For premium sport brands, performance apparel/gear, athlete portfolios, studios, running/cycling labels. Benchmarks: MAAP (monospace precision), Satisfy Running (scroll-driven product storytelling), Aether Apparel (cinematic content), Pas Normal Studios (feature-selector interaction), Mammut (variable-font micro-interactions), Bandit Running (scroll progress, city identity), ROA Hiking (restrained palette), WHOOP (functional dark data UI).

This register sells belief: a 200-euro running shirt is justified by depth and precision, never by shouting. The product or athlete is always the center of composition; the UI recedes.

## The precision system

- **Monospace for everything technical** (the MAAP move): specs, prices, labels, dates, sizes. Mono = engineered. Pair with a quiet grotesk for body and — for editorial contrast only — a serif.
- **Restrained palette to the last pixel** (the ROA move): 2–3 tones total (earth + black, paper + ink + one muted accent), consistent through the footer. Color = identity, not decoration.
- Light/paper backgrounds are allowed here — this is the sport mode where premium can be bright.

## Signature techniques (rarely seen in templates)

- **Exclusion/difference blend** (`mix-blend-mode: difference`) on fixed titles and logos so they stay legible over any imagery — the MAAP/ROA legibility trick
- **Variable-font micro-interaction** (the Mammut move): text shifts weight or slants italic on hover via `font-variation-settings` — refined, nearly free
- **Scroll-driven product reveal** (the Satisfy move): a product/render rotates or advances through an image sequence as the user scrolls, specs fading in stage by stage — build the story *inside* the gallery
- **Feature-selector interaction** (the Pas Normal move): feature list on the left; clicking swaps the focused image on the right
- **Scroll progress indicator** in nav or footer (the Bandit move): a small bar showing how far you've scrolled — craft signal, one line of JS
- **Spec-sheet grids** (the J.Lindeberg move): dense thumbnail views without names, like a photoshoot contact sheet; irregular editorial grids with free aspect ratios

## Justifying the price (content strategy)

Premium is proven, not claimed:
- **Data visualization for product specs** — weight, breathability, drop as drawn diagrams, not bullet lists
- **Designer's notes** — a named designer speaking about construction and material choices (the Soar lesson: this is what separates €200 from €50)
- **Provenance** — named factories, fabric origins, altitude-tested claims with numbers
- **Community as content** — group rides/runs, memberships with concrete perks, editorial shot in a real named city

## The anti-lesson

Soar Running has premium video and content but a confusing purchase hierarchy — proof that content without intentional hierarchy still fails. Every screen: one clear primary action, specs one tap away in a drawer, price and CTA never lost while scrolling (keep them overlaid or sticky).
