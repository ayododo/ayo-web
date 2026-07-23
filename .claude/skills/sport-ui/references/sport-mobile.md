# Sport Mobile — apps for fans and athletes

Read alongside the chosen mode (matchday or performance-premium). Benchmarks: WHOOP (progressive disclosure over dark data UI), Nike Run Club (bold numbers, emotional milestones), Strava (feed + segments), top live-score apps on Mobbin.

## Progressive disclosure — the WHOOP pattern

Sport data is deep; screens are small. Three tiers, strictly:
1. **Glanceable**: one hero number per screen (today's score, recovery %, km run) at display size — readable mid-run at arm's length
2. **Trend**: a compact chart or week strip one scroll below
3. **Deep dive**: full graphs and tables behind a tap, never on the home screen

If the home screen shows more than one large number competing, demote all but one.

## Layout for the sport context

Fans and athletes use these apps in motion, one-handed, often outdoors:
- Hero stat top (huge, tabular numerals), actions bottom (thumb zone), tab bar with 4 items max
- **Live match screen**: score bug pinned at top, minute + pulsing LIVE badge, event feed (goals, cards) as a reverse-chronological timeline with mono timestamps
- **Fixture list**: match cards with team abbreviations, kickoff in the user's timezone, swipe between matchdays
- **Workout/activity rings or bars**: progress toward a target is the emotional core — animate once on load, 600–800ms ease-out
- Outdoor readability: contrast ≥ 7:1 for hero numbers (sunlight), touch targets ≥ 48px (moving thumbs, gloves)

## Sport-specific mobile moments

- **Streak and milestone celebrations** (Nike Run Club lesson): a personal record deserves a full-screen takeover moment — the one place exuberant motion belongs
- **Pull-to-refresh on live screens** with a sport-flavored spinner (ball, stopwatch)
- **Haptic-feel press states**: scale 0.97 + tint within 100ms on every interactive row
- **Countdown as content**: next match/race on the home screen with a live countdown, not buried in a schedule tab

## Dark by default, functional

Dark UI on sport mobile is functional (WHOOP): colored data pops, evening/dawn usage, OLED battery. Elevate with lighter surfaces, not shadows. Accent color carries meaning — one hue for "good/complete", one for "live/alert" — and is never decorative.
