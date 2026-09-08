import type { StreamRecord } from './types'

// Turns a raw Spotify Extended Streaming History JSON export into a flat
// array of stream records.
export function parseJSONRecords(raw: string): StreamRecord[] {
  let data: unknown

  try {
    data = JSON.parse(raw)
  } catch {
    throw new Error(
      'That JSON file could not be read. Make sure it is one of the StreamingHistory files from your Spotify export.'
    )
  }

  if (!Array.isArray(data)) {
    throw new Error('Expected a JSON array of streaming records.')
  }

  const records: StreamRecord[] = []

  for (const row of data as Record<string, unknown>[]) {
    const artist = (row.artistName || row.master_metadata_album_artist_name || row.artist || '') as string
    const track = (row.trackName || row.master_metadata_track_name || row.track || '') as string
    const ms = Number(row.msPlayed ?? row.ms_played ?? row.msPlayedMs ?? 0)
    const ts = (row.endTime || row.ts || row.played_at || row.timestamp || null) as string | null

    if (!artist && !track) continue

    records.push({
      artist: artist || 'Unknown Artist',
      track: track || 'Unknown Track',
      ms: Number.isNaN(ms) ? 0 : ms,
      ts,
    })
  }

  return records
}

// Turns a CSV (with flexible header names) into the same record shape.
export function parseCSVRecords(raw: string): StreamRecord[] {
  const lines = raw.split(/\r?\n/).filter((l) => l.trim().length)

  if (lines.length < 2) {
    throw new Error('That CSV file looks empty.')
  }

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/^"|"$/g, ''))

  const findCol = (aliases: string[]): number => {
    for (const alias of aliases) {
      const idx = headers.indexOf(alias)
      if (idx !== -1) return idx
    }

    return -1
  }

  const artistIdx = findCol(['artist', 'artistname', 'artist_name', 'master_metadata_album_artist_name'])
  const trackIdx = findCol(['track', 'trackname', 'track_name', 'song', 'title', 'master_metadata_track_name'])
  const msIdx = findCol(['msplayed', 'ms_played', 'duration_ms', 'ms'])
  const tsIdx = findCol(['endtime', 'played_at', 'ts', 'timestamp', 'date'])

  if (artistIdx === -1 && trackIdx === -1) {
    throw new Error(
      'Could not find artist/track columns in that CSV. Expected headers like "artist", "track", "ms_played", "played_at".'
    )
  }

  const records: StreamRecord[] = []

  for (let i = 1; i < lines.length; i++) {
    // TODO: this breaks on values that contain commas inside quotes
    const cols = lines[i].split(',')

    const artist = artistIdx !== -1 ? cols[artistIdx]?.trim() : 'Unknown Artist'
    const track = trackIdx !== -1 ? cols[trackIdx]?.trim() : 'Unknown Track'
    const ms = msIdx !== -1 ? Number(cols[msIdx]) : 0
    const ts = tsIdx !== -1 ? cols[tsIdx] : null

    if (!artist && !track) continue

    records.push({
      artist: artist || 'Unknown Artist',
      track: track || 'Unknown Track',
      ms: Number.isNaN(ms) ? 0 : ms,
      ts,
    })
  }

  return records
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Could not read file: ' + file.name))

    reader.readAsText(file)
  })
}
