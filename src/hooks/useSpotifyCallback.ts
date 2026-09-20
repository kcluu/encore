import { useEffect } from 'react'

import { clearCallbackParams, completeSpotifyAuthorize, readAuthorizeCallback } from '../utils/spotifyAuth'
import { fetchRecentlyPlayed } from '../utils/spotifyApi'
import type { StatusMessage, StreamRecord } from '../utils/types'

export const useSpotifyCallback = (
  loadRecords: (recs: StreamRecord[], label: string) => void,
  setStatus: (status: StatusMessage | null) => void
) => {
  useEffect(() => {
    let callback: { code: string; state: string } | null

    try {
      callback = readAuthorizeCallback()
    } catch (err) {
      setStatus({ type: 'error', message: (err as Error).message })
      return
    }

    if (!callback) return

    clearCallbackParams()
    setStatus({ type: 'loading', message: 'Finishing Spotify sign-in…' })

    completeSpotifyAuthorize(callback.code, callback.state)
      .then((tokens) => fetchRecentlyPlayed(tokens.accessToken))
      .then((recs) => loadRecords(recs, 'Your Spotify Account'))
      .catch((err) => setStatus({ type: 'error', message: (err as Error).message }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
