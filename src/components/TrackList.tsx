import './TrackList.css'

import type { ArtistDetail } from '../utils/types'

interface TrackListProps {
  artist: ArtistDetail
}

const TrackList = ({ artist }: TrackListProps) => {
  const tracks = Array.from(artist.tracks.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)

  const max = tracks[0]?.[1] || 1

  return (
    <div className="track-list">
      {tracks.map(([track, count], i) => (
        <div className="track-row" key={track}>
          <span className="track-rank">{i + 1}</span>
          <span className="track-name">{track}</span>

          <span className="track-bar">
            <span className="track-bar-fill" style={{ width: `${(count / max) * 100}%` }} />
          </span>

          <span className="track-count">{count} plays</span>
        </div>
      ))}
    </div>
  )
}

export default TrackList
