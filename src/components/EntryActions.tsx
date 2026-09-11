import { useRef, useState } from 'react'

import type { StatusMessage } from '../utils/types'

interface EntryActionsProps {
  onFiles: (files: FileList) => void
  onDemo: () => void
  onConnect: () => void
  status: StatusMessage | null
}

const EntryActions = ({ onFiles, onDemo, onConnect, status }: EntryActionsProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  return (
    <div className="entry">
      <div className="entry-buttons">
        <button className="btn btn-primary" onClick={onConnect}>
          Connect Spotify
        </button>

        <button className="btn btn-outline" onClick={() => inputRef.current?.click()}>
          Upload history
        </button>

        <button className="btn btn-ghost" onClick={onDemo}>
          Try demo data →
        </button>
      </div>

      <div
        className={`dropzone ${dragging ? 'dropzone-active' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          onFiles(e.dataTransfer.files)
        }}
      >
        <p>
          <strong>Drop your file here</strong>, or click a button above.
          <br />
          Accepts Spotify's Extended Streaming History <code>.json</code> files, or a{' '}
          <code>.csv</code> with artist / track / played-at columns.
        </p>

        <input
          ref={inputRef}
          type="file"
          accept=".json,.csv"
          multiple
          hidden
          onChange={(e) => e.target.files && onFiles(e.target.files)}
        />
      </div>

      {status && <div className={`status status-${status.type}`}>{status.message}</div>}

      <p className="note">
        <strong>About "Connect Spotify":</strong> real sign-in needs a backend to hold your
        app's client secret and exchange the OAuth code for a token — that can't happen safely
        in the browser alone, so this button just previews demo data. The upload path is fully
        real and never leaves your browser.
      </p>
    </div>
  )
}

export default EntryActions
