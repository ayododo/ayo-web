---
name: sport-ui
description: Builds sport-themed interfaces with award-tier energy — the level of Awwwards Site of the Year (lando.gg) and premium sport brands (MAAP, Veo, WHOOP). Use this skill whenever the user asks to build, design, prototype, or improve ANY sport-related interface — a club or team site, sports landing page, athlete portfolio, fitness/workout app, live score or match app, sports e-commerce, gym site, running/cycling brand, esports page, or tournament site — even if they never mention design quality. If the subject is sport, athletics, fitness, or competition, this skill applies.
---

# Sport UI

Sport interfaces fail in a specific way: they default to a red-and-black template with a stock photo of a stadium, three feature cards, and the word "PASSION" in the hero. This skill exists to produce sport UIs with the energy of a matchday and the craft of an award-winning site — never that template.

The foundation: sport design is about **numbers, motion, and belonging**. Scores, stats, and countdowns are the content fans actually came for — treat them as the largest graphic elements on screen, not metadata. Everything moves at "race pace" but with one signature moment, not twenty effects (the lesson from lando.gg, Awwwards Site of the Year 2025).

## Step 1 — Pick the mode

Sport has two premium registers. Choosing wrong makes a luxury cycling brand look like a betting app.

| Project | Mode | Read |
|---|---|---|
| Clubs, teams, matches, live scores, events, tournaments, esports, fan experiences | **Matchday** — dark, loud, electric | `references/matchday.md` |
| Premium sport brands, performance apparel/gear, athlete portfolios, fitness studios, running/cycling labels | **Performance Premium** — restrained, technical, editorial | `references/performance-premium.md` |
| Any sport mobile app (fitness tracker, live score, team app) | Mode above **plus** | `references/sport-mobile.md` |

Hybrids exist: a club's merch store is Matchday branding with Performance Premium product pages.

## Step 2 — Commit to a concept

First read `references/art-directions.md` and pick ONE of the four art directions (Bold & Friendly, Night Broadcast, Club Heritage, Performance Premium) based on the project's audience — and deliberately vary between projects so results never converge on one look. Dark + electric accent is one option, not the default.

Then write one sentence: the chosen direction, the club/brand personality, the type system, the color stance, and the signature moment. Example: *"Championship-chasing city club. Anton display + Space Grotesk UI + IBM Plex Mono for data. Stadium-night dark with one volt green, active/calm color pairing. Signature moment: stat counters that count up on scroll."*

Invent a real-feeling identity: club name with history (founded year, stadium name, rivalry), believable stats (54 pts, 41,208 attendance — not 100 or 99999), named players/athletes with per-position stats, real match dates and kickoff times. Specificity is what separates a living club from a template.

## Step 3 — The sport design system

**Typography** — numbers are the headline:
- Font sources: Google Fonts or system fonts ONLY. Never Adobe Fonts/Typekit (requires a paid license and an account-bound kit script — breaks for anyone without the license). Free equivalents cover every direction: condensed caps → Anton/Archivo; chunky friendly → Bricolage Grotesque/Hanken Grotesk; serif → Fraunces/Instrument Serif.
- Mono default: **IBM Plex Mono** — the house data face for this skill. Use it for every score, stat, price, timestamp, ticker, and eyebrow label across all art directions; its warm, humanist proportions read precise without feeling cold. Alternatives (Space Mono for quirk, JetBrains Mono for modern) only when the concept explicitly calls for a different mono voice.
- Display: condensed/heavy caps (Anton, Archivo Expanded, Bebas-class) for names, scores, statements. Italic = speed.
- Data: monospace with tabular figures for every score, stat, time, and price. Mono reads as precision (the MAAP lesson).
- Scores and key stats at 3–6× heading size. A scoreline is a hero element, not a table cell.

**Color** — the active/calm system (from Veo's brand guidelines):
- Pair one *active* (electric: volt green #C6FF2E-class, orange, red) with one *calm* (deep: forest, navy, oxblood). Never two actives.
- Text is always near-white or near-black — accents are for backgrounds, badges, and moments only.
- Dark base is the sport default (fans watch at night; team colors pop) but Performance Premium mode may go light/paper.

**Container width**: modern premium sites (Wise, Adobe) run wide — max-width 1400–1500px with slim edge padding (clamp 16–40px, ~2.5vw). A 1100–1200px container with big side gaps reads as a dated template. Define it once as a CSS variable and reuse it for nav, sections, and full-bleed color blocks so all edges align.

**Imagery without photos**: prototypes rarely have real photography. Never use gray placeholder boxes — draw the sport itself: pitch/court line SVGs, outlined giant numbers, duotone color blocks, jersey-number typography, or a full illustrated scene (stadium bowl, crowd texture patterns, floodlights) in the palette's duotone. These read as art direction, not absence.

**Full-bleed photo hero** (the Nike/coaching-site pattern — emotion first): when the hero carries imagery (real photo or the illustrated scene above), run it edge-to-edge behind the hero. Requirements: a directional scrim gradient (deep tone ~90% opacity on the text side fading to ~25%) plus a subtle top/bottom gradient so white type always passes 4.5:1; content left-aligned on the clear side — eyebrow with a short rule line (`— Experienced coach` style), white display headline, pill CTA, and a proof row (stars + review count, or attendance figure); nav transparent over the image with light-colored links, switching to dark text when it detaches into the floating pill. Swap note: build the container so replacing the SVG scene with one `<img>` (object-fit: cover) is a one-line change.

## Step 4 — Sport components (the functional layer)

These patterns exist because fans behave differently — they scan, they check mid-game, they decide in seconds:

- **Score ticker**: persistent marquee strip at top, mono type, FT/LIVE/NEXT badges
- **Match card**: teams, kickoff time + timezone, venue, competition; countdown for the next fixture
- **Live badge**: pulsing dot + minute marker — the single most recognizable sport UI signal
- **Stat band**: oversized numerals that count up on scroll entry (once, ease-out, ~1.4s)
- **Season timeline**: horizontal scrolling milestones — turns a season into a story
- **Squad/roster cards**: giant jersey number as the graphic, position label, 3 stats per player
- **Bracket/standings**: horizontal desktop, vertically stacked expandable cards on mobile
- **Membership/pricing as ledger rows** (not three equal cards), one featured row in the calm color
- **Vertical tabs / feature selector** (the Awwwards alternative to a horizontal tab bar): for sections presenting 3–5 programs, features, or products. Left column: a vertical list where each item IS typography — numbered mono label (01/02/03) + large bold title (20–30px), separated by hairlines; inactive items muted, the active one gains ink color, an indent shift, a highlight underline or accent marker, and a revealed arrow. Right column: one panel per item (deep-color card with tag, heading, body, stat row, link) crossfading + sliding ~14px on switch. Implement as real `role="tab"`/`aria-selected` buttons with ArrowUp/Down keyboard support; on mobile, stack list above panel. Use when a plain card grid feels too static — the selector invites interaction and reads instantly as crafted.
- **Hairline editorial grid**: for stats, values, or credential sections — columns separated by 1px vertical hairlines (~12% of the ink color), closed with a horizontal hairline rule; each section opened by a numbered eyebrow label (`01 — TRUST`) in small tracked-out mono/uppercase. Numerals in a contrasting display style (italic serif is beautiful here) with a quiet label beneath. No card backgrounds, no borders-as-boxes — the lines themselves are the structure. Reads as editorial print — so it belongs ONLY in directions that speak that language: Club Heritage and Performance Premium. Do not mix it into Bold & Friendly or Night Broadcast pages (an italic-serif editorial block inside a chunky rounded page reads as two different brands); those directions show stats with their own voice instead (color-block cards, count-up display numerals).
- **Adaptive floating nav** (the Adobe pattern): nav starts transparent, merged with the hero — no bar, no border. After ~60px of scroll it detaches into a floating pill: fixed with side margins, fully rounded, backdrop blur, soft shadow, slightly compressed padding. Toggle one class via a rAF-throttled scroll listener; transition top/background/radius ~350ms. Works in every art direction and instantly reads as premium.

## Step 5 — Motion, strictly curated

The Wise lesson first: a site can feel bold and alive with almost no motion — boldness lives in type scale and color commitment. Motion is seasoning, not the dish. Hard budget: **one signature moment + at most two subtle supports.** More than that reads as noise, not craft. Bold & Friendly and Club Heritage directions usually need only hovers and one reveal; the full wow layer below belongs mainly to Night Broadcast, and even there stays within budget:

**The signature moment** (pick ONE, execute at full scale):
- **Scroll-driven horizontal gallery**: a tall section (300vh+) with a sticky viewport; vertical scroll translates a horizontal track (squad, products, timeline). The most reliable "this isn't a template" move.
- **Scroll-linked text fill**: a giant statement whose color fills word-by-word as it scrolls through the viewport (`background-clip: text` + scroll-mapped background-position)
- **Cinematic scroll sequence**: a product/element that rotates or transforms through scroll progress (the Satisfy/lando.gg move)

**The supporting layer** (choose at most TWO, keep each subtle):
- Intro wipe: 1s brand reveal that clips away — sets cinematic tone (skip on reduced-motion)
- Scroll-velocity reactions: marquee speeds up, display type skews ±3° with scroll speed — the page feels alive
- Multi-speed parallax in the hero: background number, texture, and headline move at different rates
- Custom cursor (dot + trailing ring that grows over interactive elements) + magnetic buttons — desktop only, `@media (hover: hover)`
- 3D tilt panels: perspective + rotateX/Y following the mouse, children lifted with `translateZ` — makes match cards feel physical
- Grain overlay (2–5% SVG noise, `position: fixed`) — kills the sterile digital look
- Entrance stagger, count-ups, scroll-progress bar

Engineering rules: ONE shared `requestAnimationFrame` loop for all scroll effects (never per-effect scroll listeners), `will-change` on animated elements only, everything else under 700ms ease-out. `prefers-reduced-motion` disables transforms/marquees/cursor and converts the sticky horizontal section to a plain scrollable row — content always accessible. Non-negotiable.

## Step 6 — The anti-mainstream pass (mandatory)

Before delivering, check and fix:

1. Red/black gradient + stadium stock photo energy → apply the committed active/calm palette
2. The word "PASSION"/"SEMANGAT" as a headline → write copy with specifics (points, streaks, years, rivalries)
3. Stats in small text or tables only → promote key numbers to display size
4. Three equal feature cards → stat band, ledger rows, or varied mosaic
5. Two adjacent sections with the same skeleton → restructure one (hero → marquee → split → band → statement → rows is a proven rhythm)
6. No live/temporal element → add countdown, ticker, or LIVE badge; sport is time-based
7. Generic placeholder content → named athletes, real-feeling scores, specific dates
8. Emoji as icons, missing focus states, contrast below 4.5:1, touch targets under 44px → fix; fans include everyone

The identity test: someone should describe the result as "the one where the stats count up under the giant volt scoreline" — never "a sports template".
