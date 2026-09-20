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

export interface SpotifyProfile {
  displayName: string | null
  imageUrl: string | null
}

export const fetchSpotifyProfile = async (accessToken: string): Promise<SpotifyProfile> => {
  const res = await fetch('https://api.spotify.com/v1/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!res.ok) return { displayName: null, imageUrl: null }

  const json = await res.json()

  return {
    displayName: json.display_name ?? null,
    imageUrl: json.images?.[0]?.url ?? null,
  }
}

const normalize = (name: string): string => name.trim().toLowerCase()

// Streaming history only has artist names, not Spotify IDs, so we look each
// one up by name to grab a photo
// Fall back is avatar initial
export const searchArtistImage = async (accessToken: string, artistName: string): Promise<string | null> => {
  const params = new URLSearchParams({ q: artistName, type: 'artist', limit: '1' })

  const res = await fetch(`https://api.spotify.com/v1/search?${params.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!res.ok) return null

  const json = await res.json()
  const top = json.artists?.items?.[0]

  if (!top) return null

  // Spotify's search is fuzzy, not exact
  if (normalize(top.name) !== normalize(artistName)) return null

  return top.images?.[0]?.url ?? null
}
