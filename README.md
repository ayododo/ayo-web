# AYO Web

Website design reference and frontend handoff for AYO.

[Live preview](https://ayo-web-beta.vercel.app/index.html)

## Current implementation

Static HTML, CSS, and vanilla JavaScript. There is no build step or npm dependency.
The frontend team's integration target is **Bootstrap 4**; the current pages do
not load Bootstrap yet. Match the team's exact Bootstrap version and stylesheet
before adapting these pages to their application.

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
| `styles/` | Shared design tokens, shared page chrome, and page styles |
| `scripts/` | Shared navigation/account demo, activity tabs, and page scripts |
| `components/` | Reusable visual components, snippets, and isolated previews |
| `assets/` | Images, videos, animation data, brand assets, and icons in use |
| `vendor/` | Local Lottie runtime used by `venue.html` |
| `.claude/skills/sport-ui/` | Shared design guidance for continuing work with Claude |

`styles/tokens.css` defines Figtree, the numeric fonts, colors, spacing, radii,
and the type scale. `styles/chrome.css` and `scripts/chrome.js` provide shared
navigation, buttons, footer styles, and account demo behavior.

Page-specific code lives in `styles/home.css` / `scripts/home.js`,
`styles/partner.css` / `scripts/partner.js`, and `styles/venue.css` /
`scripts/venue-tabs.js` / `scripts/venue-loading.js`. The two activity detail
pages share `styles/activity-page.css` and `scripts/activity-tabs.js`.

Keep stylesheet and script order consistent with the HTML entry points.
`venue.html` loads Lottie with `defer`; its animation initialization waits for
`DOMContentLoaded`.

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

1. Confirm the existing application's exact Bootstrap 4 version, templates,
   asset pipeline, and supported browsers. Reuse its dependencies.
2. Start with the homepage in the real application. Compare desktop and mobile
   layout before adapting the remaining pages.
3. Resolve custom `.btn`, `.nav`, `.lead`, and other class names that overlap
   Bootstrap. Use `ayo-` names for custom components and update markup, CSS, and
   JavaScript selectors together.
4. Scope custom styles to the new page/components. `styles/chrome.css` includes
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

References: [Bootstrap 4 theming](https://getbootstrap.com/docs/4.6/getting-started/theming/)
and [JavaScript dependencies](https://getbootstrap.com/docs/4.6/getting-started/introduction/#js).

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

## Keeping the repository tidy

Keep source pages, shared components, design tokens, used assets, vendor license
notices, and this handoff document. Exclude local assistant settings, environment
files, dependency folders, generated screenshots/reports, and deployment metadata.
Check both direct and JavaScript-generated references before deleting an asset.
Keep reusable previews and shared design guidance so developers and Claude can
continue from the same source.
