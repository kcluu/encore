import './EntryActions.css'

import { useRef } from 'react'

import { Tooltip } from './Tooltip'
import type { StatusMessage } from '../utils/types'

const IN_PROGRESS_MESSAGE = 'This feature is currently in progress'

interface EntryActionsProps {
  onFiles: (files: FileList) => void
  onDemo: () => void
  onConnect: () => void
  status: StatusMessage | null
}

export const EntryActions = ({ onFiles, onDemo, onConnect, status }: EntryActionsProps) => {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="entry">
      <div className="entry-buttons">
        <button className="btn btn-primary" onClick={onConnect}>
          Connect Spotify
        </button>

        <Tooltip message={IN_PROGRESS_MESSAGE} className="tooltip-wrap">
          <button className="btn btn-outline" disabled>
            Upload history
          </button>
        </Tooltip>

        <button className="btn btn-ghost" onClick={onDemo}>
          Try demo data →
        </button>
      </div>

      <Tooltip message={IN_PROGRESS_MESSAGE}>
        <div
          className="dropzone dropzone-disabled"
          onDragOver={(e) => {
            e.preventDefault()
          }}
          onDrop={(e) => {
            e.preventDefault()
          }}
        >
          <p>
            <strong>Drop your file here</strong>, or click a button above.
            <br />
            Accepts Spotify's Extended Streaming History <code>.json</code> files, or a <code>.csv</code> with
            artist / track / played-at columns.
          </p>

          <input
            ref={inputRef}
            type="file"
            accept=".json,.csv"
            multiple
            hidden
            disabled
            onChange={(e) => e.target.files && onFiles(e.target.files)}
          />
        </div>
      </Tooltip>

      {status && <div className={`status status-${status.type}`}>{status.message}</div>}

      <p className="note">
        <strong>About "Connect Spotify":</strong> signs you in with Spotify's Authorization Code + PKCE flow
        (no client secret needed) and pulls your last 50 played tracks. Requires a Spotify app client ID — see{' '}
        <code>.env.example</code>. The upload path is fully real too, and never leaves your browser.
      </p>
    </div>
  )
}
