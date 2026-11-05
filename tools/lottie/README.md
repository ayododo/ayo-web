# Lottie generators

`booking-ayo-app.mjs` builds `assets/lottie/booking-ayo-app.json`, the AYO app
booking mock in the homepage Booking section (Figma 26682:27439). The flow:
tap a date → the price grid fills in → tap a price → the summary rises →
tap Book now → Booked ✓. 30fps, 240 frames, looping.

```sh
cd tools/lottie
npm install        # opentype.js
npm run fonts      # downloads static Figtree weights into fonts/
npm run booking    # writes ../../assets/lottie/booking-ayo-app.json
```

- **Copy and layout** — `dates`, `ROWS` (time, price, cell states: `off`
  booked, `pick` selected), the summary strings and the `SUM`/`BTN` boxes.
- **Timing** — the `T` object (frames at 30fps). Shift a step by changing
  its frame; later steps should stay after earlier ones.
- **Colours** — `C`.

Text is outlined with the real Figtree glyphs because the site plays Lottie
with `lottie_light`, which has no text renderer. The markup phone in
`index.html` is the static fallback; keep its copy in step with this file.
