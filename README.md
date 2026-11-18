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

The repository currently focuses on the homepage only (decision 2026-11-18).
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

Homepage-specific code lives in `styles/home.css` / `scripts/home.js`.
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
