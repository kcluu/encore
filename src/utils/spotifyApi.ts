import type { StreamRecord } from './types'

interface RecentlyPlayedItem {
  track: {
    name: string
    duration_ms: number
    artists: { name: string }[]
  }
  played_at: string
}

// Spotify's live API only returns your last 50 plays = enough for a real
// preview, not a full history
export const fetchRecentlyPlayed = async (accessToken: string): Promise<StreamRecord[]> => {
  const res = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=50', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!res.ok) {
    throw new Error('Could not fetch your recently played tracks from Spotify.')
  }

  const json = await res.json()
  const items = (json.items ?? []) as RecentlyPlayedItem[]

  if (!items.length) {
    throw new Error("Spotify didn't return any recently played tracks — try listening to something first.")
  }

  return items.map((item) => ({
    artist: item.track.artists[0]?.name ?? 'Unknown Artist',
    track: item.track.name,
    ms: item.track.duration_ms,
    ts: item.played_at,
  }))
}
