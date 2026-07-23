# Matchday — dark, loud, electric

For clubs, teams, live scores, events, tournaments, esports. Benchmarks: lando.gg (Awwwards SOTY 2025 — volt type on dark, cinematic scroll, one 3D signature), NBA.com (video-first dark), Veo (broadcast energy), CyberKongz (giant numbers, horizontal timeline, marquees), NFL.com (game-day layout transformation).

## The stadium-night base

Dark is functional here, not aesthetic: team colors and footage pop against it, and fans check scores at night. Base near-black with a green/warm tint (#0B0F0C-class), elevated surfaces one step lighter, hairline borders at ~12% white. One electric accent (volt, tangerine, cyan) used for: live signals, primary CTA, key numbers, and nothing else. Pair it with a *calm* deep tone (forest, navy) for featured blocks — the active/calm duo.

## Broadcast grammar

Steal from TV graphics, which fans already read fluently:
- **Score bug**: compact `SAT 3–1 PSD` in mono with tabular figures — abbreviate team names to 3 letters
- **LIVE badge**: pulsing accent dot + minute (`LIVE 78'`) — instant recognition
- **FT / HT / NEXT tags**: inverted chips (accent bg, dark text) before every score in tickers
- **Lower-third asymmetry**: hero text bottom-left like a broadcast caption, not centered

## Section rhythm that works (vary, don't repeat)

A proven skeleton sequence — each section structurally different from its neighbor:
1. Ticker (edge-to-edge marquee, accent background)
2. Asymmetric hero: 7/5 split — giant statement left, next-match panel with countdown right
3. Chant/partner marquee: outlined display type, one solid accent word per repeat
4. Stat band: 4 columns, hairline-separated, count-up numerals with small accent units
5. Horizontal scroll (squad or timeline) with scroll-snap
6. Full-bleed statement: accent background, one giant sentence, mixed solid/outlined words
7. Ledger-row pricing/membership (one featured row in the calm color)
8. Oversized outlined wordmark footer

## Signature techniques

- **Outlined type** (`-webkit-text-stroke`, transparent fill) for oversized background numbers and marquees; fill on hover = a designed moment
- **Count-up stats**: IntersectionObserver + rAF, cubic ease-out, ~1.4s, run once. This is the cheapest "wow" in sport UI
- **Countdown to kickoff**: live-updating cells (days/hours/min/sec), tabular numerals — sport is temporal, always show time pressure
- **Jersey numbers as art**: 120px+ outlined numerals bleeding off card corners
- **Pitch/court line SVG** at 10–15% opacity as hero texture — replaces photography in prototypes
- **Season timeline**: horizontal scroll, date in mono accent, dot markers on a hairline — narrative structure fans love (works for club history, season recaps, event schedules)

## The immersion checklist

A matchday page without immersion is a brochure. Verify before delivering:
- Something on screen is always moving (ticker, live pulse, countdown) — sport is never static
- Scroll does more than reveal: at least one element is *driven* by scroll position (horizontal gallery, text fill, parallax layers at different speeds)
- The page reacts to the user: velocity-linked skew/marquee, tilt, or magnetic hovers
- Texture exists: grain overlay or pitch-line SVG — flat solid backgrounds read as unfinished
- The intro sets tone: a brief brand wipe (~1s) makes everything after feel cinematic

## Copy voice

Short, declarative, specific. "54 points. Six games left." beats "We are passionate about excellence." Reference real texture: founding year, stand names, attendance figures, rivalries, records broken. Numbers are the brand.
