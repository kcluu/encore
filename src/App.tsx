import './App.css'

import { useMemo, useState } from 'react'

import { Hero } from './components/Hero'
import { EntryActions } from './components/EntryActions'
import { ArtistSearch } from './components/ArtistSearch'
import { ArtistChips } from './components/ArtistChips'
import { ScorePanel } from './components/ScorePanel'
import { StatsGrid } from './components/StatsGrid'
import { TrackList } from './components/TrackList'
import { useSpotifyCallback } from './hooks/useSpotifyCallback'
import { parseCSVRecords, parseJSONRecords, readFileAsText } from './utils/parse'
import { buildLibrary, computeArtistScore, generateDemoRecords, initialOf } from './utils/score'
import { redirectToSpotifyAuthorize } from './utils/spotifyAuth'
import type { Library, StatusMessage, StreamRecord } from './utils/types'

export const App = () => {
  const [records, setRecords] = useState<StreamRecord[] | null>(null)
  const [profileLabel, setProfileLabel] = useState('Your Listening Profile')
  const [selectedArtist, setSelectedArtist] = useState<string | null>(null)
  const [status, setStatus] = useState<StatusMessage | null>(null)

  // Recomputed only when the raw records change, not on every render
  const library = useMemo<Library | null>(() => (records ? buildLibrary(records) : null), [records])

  const scoreResult = useMemo(() => {
    if (!library || !selectedArtist) return null

    const selectedArtistDetail = library.artistDetails.get(selectedArtist)

    return selectedArtistDetail
      ? { artist: selectedArtistDetail, ...computeArtistScore(selectedArtistDetail, library) }
      : null
  }, [library, selectedArtist])

  const loadRecords = (recs: StreamRecord[], label: string) => {
    const lib = buildLibrary(recs)

    setRecords(recs)
    setProfileLabel(label)
    setSelectedArtist(lib.artists[0]?.artist ?? null)
    setStatus(null)
  }

  const handleFiles = async (fileList: FileList) => {
    const files = Array.from(fileList)

    if (!files.length) return

    setStatus({ type: 'loading', message: `Reading ${files.length} file${files.length > 1 ? 's' : ''}…` })

    try {
      let all: StreamRecord[] = []

      for (const file of files) {
        const raw = await readFileAsText(file)
        const lower = file.name.toLowerCase()

        const recs = lower.endsWith('.json')
          ? parseJSONRecords(raw)
          : lower.endsWith('.csv')
            ? parseCSVRecords(raw)
            : (() => {
                throw new Error(`Unsupported file type: ${file.name}. Please upload .json or .csv.`)
              })()

        all = all.concat(recs)
      }

      if (!all.length) throw new Error('No streaming records were found in that file.')

      loadRecords(all, 'Your Streaming History')
    } catch (err) {
      setStatus({ type: 'error', message: (err as Error).message })
    }
  }

  const handleDemo = () => {
    loadRecords(generateDemoRecords(), 'Demo Listener')
  }

  useSpotifyCallback(loadRecords, setStatus)

  const handleConnect = async () => {
    try {
      setStatus({ type: 'loading', message: 'Redirecting to Spotify…' })
      await redirectToSpotifyAuthorize()
    } catch (err) {
      setStatus({ type: 'error', message: (err as Error).message })
    }
  }

  const handleReset = () => {
    setRecords(null)
    setSelectedArtist(null)
    setStatus(null)
    setProfileLabel('Your Listening Profile')
  }

  const selectArtistByName = (name: string) => {
    if (library?.artistDetails.has(name)) {
      setSelectedArtist(name)
      setStatus(null)

      return
    }

    setStatus({ type: 'error', message: `No plays found for "${name}" in your listening history.` })
  }

  return (
    <div className="page">
      <Hero
        name={library ? profileLabel : 'Your Listening Profile'}
        subtitle={
          library
            ? `${library.artists.length} artists · ${library.totalStreams.toLocaleString()} streams analyzed`
            : 'Connect your account or upload your streaming history to begin'
        }
        initial={library ? initialOf(profileLabel) : '?'}
      />

      {!library && (
        <EntryActions onFiles={handleFiles} onDemo={handleDemo} onConnect={handleConnect} status={status} />
      )}

      {library && (
        <main className="main">
          <section className="block">
            <h2 className="block-title">Search an artist</h2>
            <p className="block-sub">Look up any artist from your history to see their fan score</p>

            <ArtistSearch artists={library.artists} onSelect={selectArtistByName} />
            {status && <div className={`status status-${status.type}`}>{status.message}</div>}
          </section>

          <section className="block">
            <h2 className="block-title">Your top artists</h2>

            <ArtistChips
              artists={library.artists.slice(0, 12)}
              active={selectedArtist}
              onSelect={selectArtistByName}
            />
          </section>

          {scoreResult && (
            <>
              <section className="block">
                <h2 className="block-title">Fan Score — {scoreResult.artist.artist}</h2>
                <ScorePanel result={scoreResult} totalArtists={library.artists.length} />
              </section>

              <section className="block">
                <h2 className="block-title">Stats for {scoreResult.artist.artist}</h2>
                <StatsGrid result={scoreResult} />
              </section>

              <section className="block">
                <h2 className="block-title">Top tracks by {scoreResult.artist.artist}</h2>
                <TrackList artist={scoreResult.artist} />
              </section>
            </>
          )}

          <div className="reset-row">
            <button className="btn btn-outline" onClick={handleReset}>
              Analyze a different file
            </button>
          </div>
        </main>
      )}

      <footer>Fan Score is an independent project and isn't affiliated with or endorsed by Spotify.</footer>
    </div>
  )
}
