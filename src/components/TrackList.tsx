import './TrackList.css'

import type { ArtistDetail } from '../utils/types'

interface TrackListProps {
  artist: ArtistDetail
}

export const TrackList = ({ artist }: TrackListProps) => {
  const tracks = Array.from(artist.tracks.entries())
    .sort((a, b) => b[1].count - a[1].count || b[1].ms - a[1].ms)
    .slice(0, 10)

  return (
    <div className="track-list">
      {tracks.map(([track, t], i) => (
        <div className="track-row" key={track}>
          <span className="track-rank">{i + 1}</span>
          <span className="track-name">{track}</span>

          <span className="track-count">
            {t.count} play{t.count === 1 ? '' : 's'}
          </span>
        </div>
      ))}
    </div>
  )
}
