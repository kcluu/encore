// A single play event, however it came in (CSV row, JSON entry, etc)
export interface StreamRecord {
  artist: string
  track: string
  ms: number
  ts: string | null
}

// Everything we've accumulated about one artist across the user's history
export interface ArtistDetail {
  artist: string
  count: number
  ms: number
  tracks: Map<string, { count: number; ms: number }>
  days: Set<string>
  minTs: Date | null
  maxTs: Date | null
  rank: number
}

export interface Library {
  artistDetails: Map<string, ArtistDetail>
  artists: ArtistDetail[]
  totalStreams: number
  totalMs: number
}

export interface ScoreBreakdownItem {
  label: string
  value: number
  max: number
}

export interface ArtistScore {
  score: number
  tier: string
  tierDesc: string
  hours: number
  uniqueTracks: number
  share: number
  avgReplays: number
  activeDays: number
  breakdown: ScoreBreakdownItem[]
}

export interface StatusMessage {
  type: 'error' | 'loading' | 'info'
  message: string
}
