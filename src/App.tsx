import { useMemo, useState } from 'react'

import Hero from './components/Hero'
import EntryActions from './components/EntryActions'
import ScorePanel from './components/ScorePanel'
import StatsGrid from './components/StatsGrid'
import { parseCSVRecords, parseJSONRecords, readFileAsText } from './utils/parse'
import { buildLibrary, computeArtistScore, generateDemoRecords } from './utils/score'
import type { Library, StatusMessage, StreamRecord } from './utils/types'

const App = () => {
  const [records, setRecords] = useState<StreamRecord[] | null>(null)
  const [status, setStatus] = useState<StatusMessage | null>(null)

  const library = useMemo<Library | null>(() => (records ? buildLibrary(records) : null), [records])

  const topArtist = library?.artists[0] ?? null

  const scoreResult = useMemo(() => {
    if (!library || !topArtist) return null

    return { artist: topArtist, ...computeArtistScore(topArtist, library) }
  }, [library, topArtist])

  function loadRecords(recs: StreamRecord[]) {
    setRecords(recs)
    setStatus(null)
  }

  async function handleFiles(fileList: FileList) {
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

      loadRecords(all)
    } catch (err) {
      setStatus({ type: 'error', message: (err as Error).message })
    }
  }

  function handleDemo() {
    loadRecords(generateDemoRecords())
  }

  function handleConnect() {
    setStatus({ type: 'loading', message: 'Real Spotify sign-in needs a backend — showing demo data instead.' })

    setTimeout(() => loadRecords(generateDemoRecords()), 700)
  }

  return (
    <div className="page">
      <Hero
        name="Your Listening Profile"
        subtitle={
          library
            ? `${library.artists.length} artists · ${library.totalStreams} streams found`
            : 'Connect your account or upload your streaming history to begin'
        }
        initial="?"
      />

      {!library && (
        <EntryActions onFiles={handleFiles} onDemo={handleDemo} onConnect={handleConnect} status={status} />
      )}

      {library && scoreResult && (
        <main className="main">
          <section className="block">
            <h2 className="block-title">Fan Score — {scoreResult.artist.artist}</h2>
            <ScorePanel result={scoreResult} totalArtists={library.artists.length} />
          </section>

          <section className="block">
            <h2 className="block-title">Stats for {scoreResult.artist.artist}</h2>
            <StatsGrid result={scoreResult} />
          </section>
        </main>
      )}
    </div>
  )
}

export default App
