import './ArtistChips.css'

import type { ArtistDetail } from '../utils/types'
import { colorFor, initialOf } from '../utils/score'

interface ArtistChipsProps {
  artists: ArtistDetail[]
  active: string | null
  onSelect: (name: string) => void
  images?: Record<string, string>
}

export const ArtistChips = ({ artists, active, onSelect, images }: ArtistChipsProps) => {
  return (
    <div className="chip-row">
      {artists.map((a) => {
        const imageUrl = images?.[a.artist]

        return (
          <button
            key={a.artist}
            className={`chip ${a.artist === active ? 'chip-active' : ''}`}
            onClick={() => onSelect(a.artist)}
          >
            <span className="chip-avatar" style={{ background: colorFor(a.artist) }}>
              {imageUrl ? (
                <img className="chip-avatar-photo" src={imageUrl} aria-label={`Avatar for ${a.artist}`} />
              ) : (
                initialOf(a.artist)
              )}
            </span>
            <span className="chip-rank">#{a.rank}</span> {a.artist}
          </button>
        )
      })}
    </div>
  )
}
