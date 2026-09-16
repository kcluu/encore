import { useMemo, useState } from 'react'

import type { ArtistDetail } from '../utils/types'

interface ArtistSearchProps {
  artists: ArtistDetail[]
  onSelect: (name: string) => void
}

const ArtistSearch = ({ artists, onSelect }: ArtistSearchProps) => {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)

  const matches = query.trim()
    ? artists.filter((a) => a.artist.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 8)
    : []

  return (
    <div className="search">
      <input
        className="search-input"
        placeholder="Search an artist, e.g. Gracie Abrams"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
      />

      {open && query.trim() && (
        <div className="search-results">
          {matches.length === 0 && (
            <div className="search-empty">No artist matching "{query}" in your history.</div>
          )}

          {matches.map((a) => (
            <div
              key={a.artist}
              className="search-row"
              onClick={() => {
                onSelect(a.artist)
                setQuery('')
                setOpen(false)
              }}
            >
              <span>{a.artist}</span>
              <span className="search-count">
                #{a.rank} · {a.count} plays
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ArtistSearch
