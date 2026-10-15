# Invitation music

Edit `music` inside the `invitation-data` JSON in `../quince-blue-silver.html`.

- `opening` plays while the envelope is closed. `opening-melody.wav` is an original 24-second music-box theme generated locally by `generate-opening-melody.mjs`.
- `invitation` starts when the envelope is clicked. Its current source is the existing 10-second `melody.m4a` sample. Replace `src` with the local path or direct audio URL of the chosen song. A Spotify, YouTube, or other webpage URL is not an audio file.
- Each track accepts `src`, optional `title` and `artist`, `volume` from `0` to `1`, and `loop` (`true` or `false`). An empty `src` disables that phase. Removing the entire `music` section preserves the previous invitation audio behavior.

Example configuration using your own audio file:

```json
"music": {
  "opening": {
    "src": "./blue-silver-assets/opening-melody.wav",
    "title": "Una noche de magia",
    "artist": "Melodía original",
    "volume": 0.35,
    "loop": true
  },
  "invitation": {
    "src": "./blue-silver-assets/my-invitation-song.mp3",
    "title": "Your song title",
    "artist": "Your artist",
    "volume": 0.7,
    "loop": true
  }
}
```

The opening track attempts autoplay. If the browser requires a gesture, the cover's music button starts it. Opening the envelope stops and resets that track before starting the invitation track. The heart and floating sound button control only the invitation track. Both tracks pause when the page is hidden; only a track that was playing resumes when the page becomes visible. An intentional pause remains paused.

Regenerate the original melody locally with `node previews/blue-silver-assets/generate-opening-melody.mjs` from the repository root.
