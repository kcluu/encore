# Fan Score

A small React + TypeScript app that computes a per-artist "fan score" from
your Spotify listening history — upload the export, or click through demo
data.

## Run it

```bash
npm install
npm start
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

Components are written as typed arrow functions
(`const Hero = (props: HeroProps) => {...}`), and state is plain
`useState` / `useMemo` — no Redux, no CSS-in-JS.

## Getting real Spotify data in

- **Upload path (works today):** go to `spotify.com/account/privacy` →
  "Download your data" → request **Extended streaming history**. It arrives
  by email as a zip of `StreamingHistory_music_*.json` files — drop those
  straight into the app.
- **"Connect Spotify" button:** currently just previews demo data. Real OAuth
  can actually be done from the browser alone via Spotify's Authorization
  Code + PKCE flow (no client secret needed) — see "Adding real OAuth" below.

## Things to extend next

1. **Real OAuth via PKCE.** Spotify's PKCE flow is designed for frontend-only
   apps. You'd still likely want a small backend, though — not for the OAuth
   exchange itself, but because Spotify's live API only returns your last 50
   plays (`/me/player/recently-played`). A backend with a scheduled job that
   polls periodically and appends new plays to a database is what actually
   builds up "lifetime" history over time for connected accounts.
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
