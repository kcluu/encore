# Fan Score

A small React + TypeScript app that computes a per-artist "fan score" from
your Spotify listening history — upload the export, or click through demo
data.

## Run it

```bash
npm install
npm run dev
```

Then open the local URL Vite prints (usually `http://localhost:5173`).

## How it's organized

```
src/
  utils/
    types.ts     — shared interfaces (StreamRecord, ArtistDetail, Library, ...)
    parse.ts     — turns Spotify's exported .json/.csv into plain records
    score.ts     — groups records by artist and computes the fan score
  components/
    Hero.tsx           + Hero.css           — profile header
    EntryActions.tsx   + EntryActions.css   — connect / upload / demo buttons + dropzone
    ArtistSearch.tsx   + ArtistSearch.css   — search box for any artist in your history
    ArtistChips.tsx    + ArtistChips.css    — horizontal strip of top artists
    ScorePanel.tsx      + ScorePanel.css     — score gauge + tier + breakdown bars
    StatsGrid.tsx       + StatsGrid.css      — stat cards for the selected artist
    TrackList.tsx       + TrackList.css      — that artist's top tracks
  App.tsx + App.css   — holds all state, wires the pieces together
  index.css           — design tokens (:root) and anything shared across components
```

Every component owns its own stylesheet and imports it directly
(`import './Hero.css'`), so styling one piece of the UI never means
scrolling through one giant CSS file. A few things — buttons, status
messages, the responsive breakpoints — are genuinely shared across
components, so those stay in `index.css` rather than being duplicated
everywhere.

## Getting real Spotify data in

- **Upload path (works today):** go to `spotify.com/account/privacy` →
  "Download your data" → request **Extended streaming history**. It arrives
  by email as a zip of `StreamingHistory_music_*.json` files — drop those
  straight into the app.
- **"Connect Spotify" button:** signs in via Spotify's Authorization Code +
  PKCE flow (no client secret needed — it runs entirely in the browser) and
  pulls your last 50 played tracks from `/me/player/recently-played`. To use
  it:
  1. Create an app at [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard).
  2. In the app's settings, add a Redirect URI — e.g. `http://127.0.0.1:5173/`
     for local dev.
  3. Copy `.env.example` to `.env` and fill in `VITE_SPOTIFY_CLIENT_ID` (and
     `VITE_SPOTIFY_REDIRECT_URI` if it differs from the default).
  4. Restart `npm run dev`.

  The relevant code: `src/utils/spotifyAuth.ts` (the PKCE dance) and
  `src/utils/spotifyApi.ts` (fetching + mapping recently played tracks),
  wired up in `App.tsx`.

## Things to extend next

1. **Persist history beyond the last 50 plays.** Spotify's live API only
   returns your last 50 plays — good for a real preview, not a full history.
   A small backend with a scheduled job that polls periodically (using the
   refresh token `completeSpotifyAuthorize` already returns) and appends new
   plays to a database is what actually builds up "lifetime" history over
   time for connected accounts.
2. **Genre data.** The export has no genre field. You'd fetch each artist's
   genres from Spotify's `/artists` endpoint and layer a genre breakdown
   into `StatsGrid` or a new component.
3. **Shareable score card.** Render `ScorePanel` to an image (e.g. with the
   `html-to-image` package) so people can post their score, à la Wrapped.
4. **Score history over time.** Persist past uploads so returning users can
   see how a given artist's score has moved.
5. **Tune the scoring weights.** All four components live in
   `computeArtistScore` in `src/utils/score.ts` — the volume benchmark (150
   hours), the share multiplier, and the replay cap (5×) are all just
   constants you can adjust to taste.
