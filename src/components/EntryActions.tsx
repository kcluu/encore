import './EntryActions.css'

import { useRef, useState } from 'react'

interface EntryActionsProps {
  onFiles: (files: FileList) => void
  onDemo: () => void
  onConnect: () => void
}

export const EntryActions = ({ onFiles, onDemo, onConnect }: EntryActionsProps) => {
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
          Accepts Spotify's Extended Streaming History <code>.json</code> files, or a <code>.csv</code> with
          artist / track / played-at columns.
        </p>

        <p className="dropzone-help">
          Don't have your Extended Streaming History yet? Go to{' '}
          <a
            href="https://www.spotify.com/account/privacy/"
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            spotify.com/account/privacy
          </a>{' '}
          → "Download your data" → check <strong>Extended streaming history</strong> → Request data. Spotify
          emails you a download link, usually within a few days.
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

      <p className="note">
        <strong>About "Connect Spotify":</strong> signs you in with Spotify's Authorization Code + PKCE flow
        (no client secret needed) and pulls your last 50 played tracks. Requires a Spotify app client ID — see{' '}
        <code>.env.example</code>.
      </p>
    </div>
  )
}
