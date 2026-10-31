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
files directly, because the venue page fetches animation data.

The same files can be served by any static server. On Vercel, use the **Other**
framework preset, no build command, and serve the repository root.

## Pages

| File | Purpose |
| --- | --- |
| `index.html` | Homepage |
| `venue.html` | AYO Venue Management |
| `partner.html` | Business partners and sponsors |
| `open-play-host.html` | Open Play for hosts; some content remains placeholder |
| `open-match.html` | Open Match; some content remains placeholder |
| `foundations.html` | Visual reference for colors and typography |

## Source organization

| Directory | Contents |
| --- | --- |
| `styles/` | Design tokens, Bootstrap compatibility defaults, shared chrome, and page styles |
| `scripts/` | Shared navigation/account demo, activity tabs, and page scripts |
| `components/` | Reusable visual components, snippets, and isolated previews |
| `assets/` | Images, animation data, brand assets, and icons in use. `hero/` holds the homepage hero stills, `sports/` the sport icons |
| `vendor/` | Pinned Bootstrap, jQuery, Lottie, and dependency license notices |
| `.claude/skills/sport-ui/` | Shared design guidance for continuing work with Claude |

`styles/tokens.css` defines Figtree, the numeric fonts, colors, spacing, radii,
and the type scale. `styles/chrome.css` and `scripts/chrome.js` provide shared
navigation, buttons, footer styles, and account demo behavior.

Page-specific code lives in `styles/home.css` / `scripts/home.js` /
`scripts/booking-motion.js`,
`styles/partner.css` / `scripts/partner.js`, and `styles/venue.css` /
`scripts/venue-tabs.js` / `scripts/venue-loading.js`. The two activity detail
pages share `styles/activity-page.css` and `scripts/activity-tabs.js`.

Keep stylesheet and script order consistent with the HTML entry points:

1. `vendor/bootstrap-4.3.1/bootstrap.min.css`
2. `styles/tokens.css`
3. `styles/bootstrap-compat.css`
4. Shared chrome, component styles, and page styles
5. `vendor/jquery-3.5.1/jquery.min.js`
6. `vendor/bootstrap-4.3.1/bootstrap.bundle.min.js`
7. Shared, component, and page scripts in their existing order

All full pages and component previews load Bootstrap. The two HTML component
snippets rely on their host page to load these dependencies. Production content
wrappers use Bootstrap's `container-fluid` with AYO's existing maximum width
and padding. Detailed layouts and custom interactions remain in their component
files so the reference design stays consistent.

`venue.html` and `index.html` load Lottie with `defer`; their animation
initialization waits for `DOMContentLoaded`.

The homepage hero is a still image for every persona (court background blurred
in CSS, the cut-out player, and the Google Play badge); only the copy rotates.
The marquee component is no longer on the homepage but is still used by
`venue.html` and `partner.html`.

The Activities item in the navigation opens a mega menu on every page (Open
Play with Join/Host activity, Open Match, GameTime, and a PadelLevels promo
card). It opens on hover or focus on desktop and collapses into the burger
menu below 1000px; markup lives in each page's nav, styles in `styles/chrome.css`.

Images still waiting for Figma exports are grey rounded `.asset-ph`
placeholders. Each carries `data-asset` with the file it expects (hero stills,
and sport icons). Replace the placeholder with an `<img>` of the same class once
the file is added. The Activity section has no photos; each tab opens on its
role toggle, matchup or feature list, and its headline figure leads the stats
row.

The homepage Booking section shows two animated phone mocks:
`assets/booking-ayo-app.json` (player books a court in the AYO app) and
`assets/booking-avm-dashboard.json` (the booking arrives in AVM). Both are
420×420, 30 fps, 9-second loops with text converted to outlines, so they need no
fonts. Each starts from the beginning when it scrolls into view. The matching
`-poster.webp` files show the finished state before Lottie loads, without
JavaScript, and with reduced motion.

### Component references

- [Persona hero](components/persona-hero/preview.html)
- [Activity board](components/activity-board/preview.html)
- [Marquee](components/marquee/preview.html)
- [Store rating](components/store-rating/preview.html)
- [Button](components/button/preview.html)
- [PadelLevels markup](components/padellevels-rating/padellevels-rating.html)
- [Ad slot markup](components/ad-slot/ad-slot.html)

The last two files are snippets for integration, not standalone preview pages.
The button preview is a component reference; production pages currently use the
shared button rules in `styles/chrome.css`. Reconcile these when integrating.

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
- Activity content and statistics include sample data. The Open Play participant
  destination `open-play.html` is referenced by the activity board but does not
  exist in this repository; replace it with the application's actual route.
- Venue feature artwork includes temporary loading animations.
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
