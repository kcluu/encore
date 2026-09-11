import { useState } from 'react'

import Hero from './components/Hero'
import EntryActions from './components/EntryActions'
import { parseCSVRecords, parseJSONRecords, readFileAsText } from './utils/parse'
import { buildLibrary, generateDemoRecords } from './utils/score'
import type { Library, StatusMessage } from './utils/types'

const App = () => {
  const [library, setLibrary] = useState<Library | null>(null)
  const [status, setStatus] = useState<StatusMessage | null>(null)

  function loadRecords(recs: ReturnType<typeof generateDemoRecords>) {
    setLibrary(buildLibrary(recs))
    setStatus(null)
  }

  async function handleFiles(fileList: FileList) {
    const files = Array.from(fileList)
    if (!files.length) return

    setStatus({ type: 'loading', message: `Reading ${files.length} file${files.length > 1 ? 's' : ''}…` })

    try {
      let all = [] as ReturnType<typeof generateDemoRecords>

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
    setStatus({ type: 'loading', message: 'Real Spotify sign-in needs a backend — showing demo data insted.' })

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

      {library && (
        <main className="main">
          <p className="block-sub">
            Parsed {library.artists.length} artists from {library.totalStreams} streams. Score panel coming next.
          </p>
        </main>
      )}
    </div>
  )
}

export default App
