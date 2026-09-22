import type { ArtistDetail, ArtistScore, Library, StreamRecord } from './types'

// A play under 30s is treated as a skip - not a real listen
const MIN_MS = 30000

// Groups flat play records by artist and computes the raw numbers each
// artist's fan score is built from
export const buildLibrary = (records: StreamRecord[]): Library => {
  const played = records.filter((r) => r.ms >= MIN_MS)
  const usable = played.length ? played : records // fallback if ms data is missing entirely

  const artistDetails = new Map<string, ArtistDetail>()

  for (const r of usable) {
    let a = artistDetails.get(r.artist)

    if (!a) {
      a = {
        artist: r.artist,
        count: 0,
        ms: 0,
        tracks: new Map(),
        days: new Set(),
        minTs: null,
        maxTs: null,
        rank: 0,
      }

      artistDetails.set(r.artist, a)
    }

    a.count += 1
    a.ms += r.ms || 0

    const t = a.tracks.get(r.track) ?? { count: 0, ms: 0 }
    t.count += 1
    t.ms += r.ms || 0
    a.tracks.set(r.track, t)

    if (r.ts) {
      const d = new Date(r.ts)

      if (!Number.isNaN(d.getTime())) {
        a.days.add(d.toISOString().slice(0, 10))

        if (!a.minTs || d < a.minTs) a.minTs = d
        if (!a.maxTs || d > a.maxTs) a.maxTs = d
      }
    }
  }

  const artists = Array.from(artistDetails.values()).sort((a, b) => b.count - a.count)

  artists.forEach((a, i) => {
    a.rank = i + 1
  })

  return {
    artistDetails,
    artists,
    totalStreams: usable.length,
    totalMs: records.reduce((s, r) => s + (r.ms || 0), 0),
  }
}

// The Fan Score itself (four components out of 25 each)
//   Volume: how many hours you've put into this artist
//   Share: how much of your total listening they take up
//   Consistency: active days vs. the span you've been listening to them
//   Replay depth: how often you repeat the same tracks (a fan behavior)
export const computeArtistScore = (a: ArtistDetail, lib: Library): ArtistScore => {
  const hours = a.ms / 3600000
  const uniqueTracks = a.tracks.size
  const share = lib.totalStreams ? a.count / lib.totalStreams : 0
  const avgReplays = uniqueTracks ? a.count / uniqueTracks : 0

  const spanDays =
    a.minTs && a.maxTs
      ? Math.max(1, Math.round((a.maxTs.getTime() - a.minTs.getTime()) / 86400000) + 1)
      : a.days.size || 1

  const consistencyRatio = Math.min(1, a.days.size / spanDays)

  const volumeScore = Math.min(25, (Math.log10(hours + 1) / Math.log10(151)) * 25)
  const shareScore = Math.min(25, share * 25 * 3)
  const consistencyScore = consistencyRatio * 25
  const replayScore = Math.min(25, (avgReplays / 5) * 25)

  const score = Math.round(volumeScore + shareScore + consistencyScore + replayScore)

  const tiers: [number, string, string][] = [
    [
      81,
      'Superfan',
      'This artist dominates your listening — heavy rotation, deep replays, and a consistent habit over time.',
    ],
    [61, 'True Fan', 'A clear favorite. You come back to this artist often and know the tracks well.'],
    [
      41,
      'Regular Listener',
      'You listen to this artist fairly often, but they share space with a lot of other music.',
    ],
    [
      0,
      'Casual Listener',
      'Light or occasional listening — a track here and there rather than deep rotation.',
    ],
  ]

  const [, tier, tierDesc] = tiers.find(([min]) => score >= min)!

  return {
    score,
    tier,
    tierDesc,
    hours,
    uniqueTracks,
    share,
    avgReplays,
    activeDays: a.days.size,
    breakdown: [
      { label: 'Volume', value: Math.round(volumeScore), max: 25 },
      { label: 'Share of listening', value: Math.round(shareScore), max: 25 },
      { label: 'Consistency', value: Math.round(consistencyScore), max: 25 },
      { label: 'Replay depth', value: Math.round(replayScore), max: 25 },
    ],
  }
}

// Generates a plausible fake library so the UI can be explored without a
// real export
// Gracie on. top.
export const generateDemoRecords = (): StreamRecord[] => {
  const artists = [
    'Gracie Abrams',
    'Frank Ocean',
    'SZA',
    'Tyler, The Creator',
    'Mac Miller',
    'Beach House',
    'Radiohead',
    'Kendrick Lamar',
    'Boards of Canada',
    'Bon Iver',
    'Björk',
    'Steve Lacy',
    'Alvvays',
  ]

  const weight = [34, 26, 20, 17, 14, 10, 9, 8, 7, 6, 5, 4, 3]
  const tracksPerArtist: Record<string, string[]> = {}

  artists.forEach((a) => {
    tracksPerArtist[a] = Array.from({ length: 6 }, (_, i) => `${a} Track ${i + 1}`)
  })

  const records: StreamRecord[] = []
  const now = Date.now()
  const daySpan = 420
  const totalWeight = weight.reduce((a, b) => a + b, 0)

  for (let i = 0; i < 2800; i++) {
    const r = Math.random() * totalWeight
    let acc = 0
    let idx = 0

    for (let w = 0; w < weight.length; w++) {
      acc += weight[w]
      if (r <= acc) {
        idx = w
        break
      }
    }

    const artist = artists[idx]
    const track = tracksPerArtist[artist][Math.floor(Math.random() * tracksPerArtist[artist].length)]
    const daysAgo = Math.floor(Math.random() * Math.random() * daySpan)
    const ts = new Date(now - daysAgo * 86400000 - Math.floor(Math.random() * 86400000)).toISOString()
    const ms = 90000 + Math.floor(Math.random() * 130000)

    records.push({ artist, track, ms, ts })
  }

  return records
}

const CHIP_COLORS = ['#29e07a', '#ff5fa2', '#ffd23f', '#6fd6ff', '#b98cff']

export const colorFor = (str: string): string => {
  let h = 0

  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0
  }

  return CHIP_COLORS[h % CHIP_COLORS.length]
}

export const initialOf = (str: string): string => (str.trim()[0] || '\u266A').toUpperCase()
