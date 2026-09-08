// A single play event, however it came in (CSV row, JSON entry, whatever).
export interface StreamRecord {
  artist: string
  track: string
  ms: number
  ts: string | null
}
