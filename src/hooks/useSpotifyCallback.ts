import { useEffect } from 'react'

import { clearCallbackParams, completeSpotifyAuthorize, readAuthorizeCallback } from '../utils/spotifyAuth'
import { fetchRecentlyPlayed, fetchSpotifyProfile } from '../utils/spotifyApi'
import type { StatusMessage, StreamRecord } from '../utils/types'

export const useSpotifyCallback = (
  loadRecords: (recs: StreamRecord[], label: string, photoUrl: string | null) => void,
  setStatus: (status: StatusMessage | null) => void,
  onToken: (accessToken: string) => void
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
      .then(async (tokens) => {
        onToken(tokens.accessToken)

        const [recs, profile] = await Promise.all([
          fetchRecentlyPlayed(tokens.accessToken),
          fetchSpotifyProfile(tokens.accessToken),
        ])

        return { recs, profile }
      })
      .then(({ recs, profile }) => {
        loadRecords(recs, profile.displayName ?? 'Your Spotify Account', profile.imageUrl)
        setStatus({
          type: 'info',
          message:
            "Connected — but Spotify's API only exposes your last 50 played tracks, so this score is based on those, not your full history. For lifetime data, use the upload path instead.",
        })
      })
      .catch((err) => setStatus({ type: 'error', message: (err as Error).message }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
