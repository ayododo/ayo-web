| `avm-id.html` | AVM (AYO Venue Management) landing page — Figma desktop 27882:40312, mobile 27882:41018, FAQ 27882:41680. Hero, stats, why AVM, seven key-feature tabs, join steps, CTA + contact form, FAQ. Deep links `#booking`, `#payments`, `#reports`, `#promotions`, `#add-ons`, `#activities`, `#additional` open a tab. The nav's "Untuk Pemilik Venue" links here. |
| `avm-en.html` | English twin of `avm-id.html` (Figma desktop 27093:65, mobile 27093:936), same structure and tab slugs. The language switch moves between the two and keeps the tab hash. |
# AYO Web

Website design reference and frontend handoff for AYO.

[Live preview](https://ayo-web-beta.vercel.app/index.html)

## Current implementation

Static HTML with **Bootstrap 4.3.1**, **jQuery 3.5.1**, and custom AYO CSS and
JavaScript. There is no build step or npm dependency. The Bootstrap JavaScript
bundle includes Popper. All dependencies are served locally from `vendor/`.

The public `ayo.co.id` homepage was inspected on 28 October 2026. It loaded
Bootstrap 4.3.1 CSS alongside Bootstrap 5.1.3 CSS and JavaScript, plus multiple
jQuery versions. This reference project uses one consistent Bootstrap 4.3.1
CSS/JavaScript pair and one jQuery 3.5.1 instance, matching the requested
Bootstrap 4 integration target. Confirm the production asset pipeline with the
frontend team before merging into their application.

## Run locally

From the repository root, run:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open <http://127.0.0.1:8000/index.html>. Use an HTTP server rather than opening
files directly, because the homepage fetches Lottie animation data.

The same files can be served by any static server. On Vercel, use the **Other**
framework preset, no build command, and serve the repository root.

## Pages

| File | Purpose |
| --- | --- |
| `index.html` | Homepage |
| `scoring-id.html` | Scoring (GameTime) — Figma 28109:21824, mobile 28109:22535. Deep links `#setup`, `#match`, `#klasemen`, `#bagikan` open a key-feature tab. |
| `scoring-en.html` | English twin of `scoring-id.html` (Figma 26877:7465), same markup. The top-nav language switch moves between the two and keeps the tab hash. `/scoring.html` redirects to `scoring-id.html` (vercel.json). |
| `about-en.html` | About Us — Figma 27980:18323 (desktop 27987:7997, mobile 27990:8081, story states 28014:8166 …). Entry point: "About Us" in the footer. |
| `about-id.html` | Indonesian twin ("Tentang Kami", Figma 28095:25789), same markup. The language switch moves between the two. On the homepage the footer link follows the chosen language (`data-href-id`, handled in `chrome.js`). |

The repository focused on the homepage only (decision 2026-11-18); since then
the Scoring, AVM and About Us pages have been rebuilt, each in Indonesian and
English.
The earlier venue, partner, Open Play host, Open Match, court directory, and
foundations pages were removed and will be rebuilt from scratch. Homepage links
to those pages point to `#` until the new pages exist.

## Source organization

| Directory | Contents |
| --- | --- |
| `styles/` | Design tokens, Bootstrap compatibility defaults, shared chrome, and page styles |
| `scripts/` | Shared navigation/account demo and homepage script |
| `components/` | Reusable visual components used by the homepage |
| `assets/` | Images, videos, animation data, brand assets, and icons in use |
| `vendor/` | Pinned Bootstrap, jQuery, Lottie, and dependency license notices |
| `.claude/skills/sport-ui/` | Shared design guidance for continuing work with Claude |

`styles/tokens.css` defines Figtree, the numeric fonts, colors, spacing, radii,
and the type scale. `styles/chrome.css` and `scripts/chrome.js` provide shared
navigation, buttons, footer styles, and account demo behavior.

Page-specific code:

| Page | Files |
| --- | --- |
| Homepage | `styles/home.css`, `scripts/home.js` |
| Scoring | `styles/scoring.css`, `scripts/scoring.js`, `components/mini-ui/`, `assets/scoring/` |
| AVM | `styles/avm.css`, `scripts/avm.js` (tabs, FAQ accordion, contact form, stat count-up, section reveal), `components/avm-hero/` (animated hero illustration), `components/mini-ui/` + `components/mini-ui/avm/` (25 feature cards) |
| About Us | `styles/about.css`, `scripts/about.js` (story timeline; hero pills that scatter and bounce on hover or tap, then coast to a stop; Moments strip auto-scroll; milestone photo crossfade), `assets/about/` |

All page motion is vanilla JS/CSS and switches off with reduced motion.

### Mini UI

`components/mini-ui/` draws the simplified phone screens in the Scoring
feature cards (Figma "Phone · Mini UI · …"). `mini-ui.js` renders each
`<div data-mu="…">` from templates and plays the multi-screen flows from the
Scoring staging board (Figma 28125:11094): Setup 01–03, Match & Skor 02 and
04, and Bagikan 01. The AVM page adds its own cards from `components/mini-ui/avm/`
(Booking & Payments, Reports & Promo, Add-ons & more), registered through
`AyoMiniUI.add()`, with one string table per language. Open Match cards
(in progress, staging board Figma 28427:17089) live in
`components/mini-ui/open-match/` (icons taken from the PRD — Zap, Hand-peace,
the PadelLevels mark and wordmark — are in `assets/open-match/`); until the Open Match page exists they are
reviewed on `mini-ui-preview.html` (`?lang=en` for English, not linked from
the site). Flows run while the
card is in view and loop. With reduced
motion they stay on the first screen. The player photos in
`assets/scoring/avatars/` are AI-generated, fictional people.
`tools/lottie/` regenerates the Booking section animation.

Keep stylesheet and script order consistent with the HTML entry points:

1. `vendor/bootstrap-4.3.1/bootstrap.min.css`
2. `styles/tokens.css`
3. `styles/bootstrap-compat.css`
4. Shared chrome, component styles, and page styles
5. `vendor/jquery-3.5.1/jquery.min.js`
6. `vendor/bootstrap-4.3.1/bootstrap.bundle.min.js`
7. Shared, component, and page scripts in their existing order

Production content wrappers use Bootstrap's `container-fluid` with AYO's
existing maximum width and padding. Detailed layouts and custom interactions
remain in their component files so the reference design stays consistent.

### Shared footer

`components/site-footer/` is the footer for every page (Figma 26585:11670,
mobile 26592:9750). Copy the block in `site-footer.html` into the page and load
`site-footer.css`; its icons live in `assets/icons/footer/`. English only for
now.

### Component references

- [Button](components/button/preview.html) — a component reference; the
  homepage currently uses the shared button rules in `styles/chrome.css`.
  Reconcile these when integrating.

## Bootstrap 4 handoff

1. Reuse the application's Bootstrap 4 and jQuery dependencies when integrating;
   do not include the copies in `vendor/` a second time. Reconcile the mixed
   production versions with the frontend team rather than reproducing them.
2. Start with the homepage in the real application. Compare desktop and mobile
   layout before adapting the remaining pages.
3. AYO buttons, navigation, leads, and footer columns now use `.ayo-btn`,
   `.ayo-nav`, `.ayo-nav-item`, `.ayo-lead`, and `.ayo-foot-col` to avoid overlap
   with Bootstrap. Preview-only rows and badges also use AYO class names. Keep
   markup, CSS, and JavaScript selectors in sync when changing components.
4. Keep the `ayo-web` class on the page body (or an equivalent content wrapper)
   for the compatibility defaults. Scope custom styles when transplanting
   individual components. `styles/chrome.css` includes
   global resets and element selectors; do not load it across an existing
   application without reviewing their effect. Scope design tokens as needed.
5. Preserve the intended layout widths. The design uses a 1440px maximum content
   width and content-specific breakpoints; Bootstrap's default containers are
   not a direct replacement. Review grid gutters and page padding together.
6. Map design values through the team's Sass setup or scoped custom CSS. Keep
   Bootstrap source files unchanged. Follow Bootstrap 4 APIs and utilities.
7. Choose one owner for each interaction. Keep custom hero/marquee behavior where
   needed; avoid initializing a Bootstrap plugin and custom handler on the same
   control. Bootstrap 4 plugins require jQuery, with Popper for some components.
8. Check the integrated pages at mobile, tablet, and desktop widths, including
   keyboard navigation, focus states, reduced motion, menus, tabs, and dialogs.

The existing CSS already targets modern browsers (CSS Grid, custom properties,
and `clamp()`). Compatibility defaults also use `:where()`, `:is()`, and `revert`;
Bootstrap 4 support alone does not imply legacy-browser support for this design.

Validation for this installation compared 27 page/viewport combinations before
and after adding Bootstrap, covering the five main pages, foundations, and five
component previews. Review the real application again with its own styles and
data; public asset inspection does not expose backend templates or build setup.

References: [Bootstrap 4.3 theming](https://getbootstrap.com/docs/4.3/getting-started/theming/)
and [JavaScript dependencies](https://getbootstrap.com/docs/4.3/getting-started/introduction/#js).

## Demo behavior and unfinished connections

- Login/register and Google sign-in simulate a local session. Connect these to
  the application's authentication service before production.
- Media kit forms and several CTA, store, and blog links are placeholders.
- The AVM contact form has no backend: `scripts/avm.js` only shows a sent state.
  About Us stats for Venues and Cities are "xxxx"/"xxx" placeholders, as in Figma.
- Activity content and statistics include sample data. Links to pages that are
  not rebuilt yet (venue, partner, Open Play, Open Match, court directory) are
  `#` placeholders.
- Fonts load from Google Fonts. Review font hosting with the frontend team.
- Keep `assets/icons/carbon/LICENSE` and `NOTICE.md` with the Carbon icons, and
  `vendor/lottie.LICENSE.md` with the Lottie runtime (lottie-web 5.12.2).
  Bootstrap, jQuery, and Popper notices are in `vendor/THIRD_PARTY_NOTICES.md`.

## Keeping the repository tidy

Keep source pages, shared components, design tokens, used assets, vendor license
notices, and this handoff document. Exclude local assistant settings, environment
files, dependency folders, generated screenshots/reports, and deployment metadata.
Check both direct and JavaScript-generated references before deleting an asset.
Keep reusable previews and shared design guidance so developers and Claude can
continue from the same source.
