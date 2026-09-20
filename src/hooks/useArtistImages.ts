import { useEffect, useState } from 'react'

import { searchArtistImage } from '../utils/spotifyApi'
import type { Library } from '../utils/types'

// Streaming history only has artist names, so once we have a Spotify token
// we look up a photo for each artist currently on screen
// Misses are cached as '' so we don't keep re-querying names Spotify has 
// no artist for
export const useArtistImages = (
  library: Library | null,
  accessToken: string | null,
  selectedArtist: string | null,
  visibleCount: number
) => {
  const [images, setImages] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!library || !accessToken) return

    const names = new Set(library.artists.slice(0, visibleCount).map((a) => a.artist))

    if (selectedArtist) names.add(selectedArtist)

    const missing = [...names].filter((name) => !(name in images))

    if (!missing.length) return

    let cancelled = false

    Promise.all(missing.map((name) => searchArtistImage(accessToken, name).then((url) => [name, url] as const))).then(
      (results) => {
        if (cancelled) return

        setImages((prev) => {
          const next = { ...prev }
          
          for (const [name, url] of results) {
            next[name] = url ?? ''
          }

          return next
        })
      }
    )

    return () => {
      cancelled = true
    }
  }, [library, accessToken, selectedArtist, visibleCount, images])

  const reset = () => setImages({})

  return { images, reset }
}
