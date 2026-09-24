# Splash promo video

A 30-second vertical (1080×1920, 30 fps) promo for the Splash app, made with [Remotion](https://www.remotion.dev/): every frame is React code, so changing the video means changing the code.

- Finished video: [`out/splash-promo.mp4`](out/splash-promo.mp4)
- Poster/thumbnail: [`out/poster.png`](out/poster.png)

## Storyboard

| Time | Scene | File |
|---|---|---|
| 0–3.5s | Colour burst, loop logo draws, "Splash" rises | `src/scenes/Intro.tsx` |
| 3.5–7s | "Your whole day. One glance." | `src/scenes/Hook.tsx` |
| 7–23s | Phone showing the app's home screen, four features spotlighted in turn | `src/scenes/Showcase.tsx`, `src/components/Phone.tsx` |
| 23–26s | Rainbow wave, "Opens with a splash." | `src/scenes/Launch.tsx` |
| 26–30s | Logo, tagline, "Download now" | `src/scenes/CallToAction.tsx` |

Scene timings live in `src/Promo.tsx`; colours and fonts in `src/theme.ts`. The phone screen recreates `app/src/main/res/layout/activity_main.xml` and uses the app's own vector icons.

## Preview and render

Requires Node 18+.

```bash
cd promo-video
npm install
npm run studio   # live preview in the browser, scrub the timeline
npm run render   # writes out/splash-promo.mp4
npm run still    # writes out/poster.png
```

Remotion downloads its own headless Chrome on first render. To use an existing one instead, set `REMOTION_BROWSER=/path/to/chrome`.

## Common edits

- **Wording:** feature captions are in the `features` array in `Showcase.tsx`; the name on the phone ("TOM") is in `Phone.tsx`.
- **Colours:** `colors` in `theme.ts`.
- **Music or voiceover:** drop an audio file in `public/` and add `<Audio src={staticFile('music.mp3')} />` inside `Promo.tsx` (import both from `remotion`). Use royalty-free music you have rights to.
- **Other formats:** change `WIDTH`/`HEIGHT` in `theme.ts` (e.g. 1080×1080 for square).
