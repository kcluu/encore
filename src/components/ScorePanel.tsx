import './ScorePanel.css'

import { useState, type CSSProperties } from 'react'

import type { ArtistDetail, ArtistScore } from '../utils/types'
import { colorFor, initialOf } from '../utils/score'
import { generateShareCard } from '../utils/shareCard'

interface ScorePanelProps {
  result: ArtistScore & { artist: ArtistDetail }
  totalArtists: number
  imageUrl?: string
}

export const ScorePanel = ({ result, totalArtists, imageUrl }: ScorePanelProps) => {
  const { artist, score, tier, tierDesc, breakdown } = result
  const [sharing, setSharing] = useState(false)

  const handleShare = async () => {
    setSharing(true)

    try {
      const blob = await generateShareCard(artist, result, totalArtists, imageUrl)
      const fileName = `${artist.artist.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-fan-score.png`
      const file = new File([blob], fileName, { type: 'image/png' })

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: `My ${artist.artist} fan score` })
      } else {
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')

        link.href = url
        link.download = fileName
        link.click()

        URL.revokeObjectURL(url)
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error('Could not generate share card', err)
      }
    } finally {
      setSharing(false)
    }
  }

  return (
    <div className="panel">
      <div className="panel-id">
        <div className="panel-avatar" style={{ background: colorFor(artist.artist) }}>
          {imageUrl ? (
            <img className="panel-avatar-photo" src={imageUrl} alt={`Avatar for ${artist.artist}`} />
          ) : (
            initialOf(artist.artist)
          )}
        </div>

        <p className="panel-rank">
          #{artist.rank} of {totalArtists}
        </p>
      </div>

      <div className="gauge" style={{ '--pct': score } as CSSProperties}>
        <div className="gauge-inner">
          <span className="gauge-num">{score}</span>
          <span className="gauge-den">/ 100</span>
        </div>
      </div>

      <div className="panel-info">
        <span className="tier-badge">fan score</span>
        <h3 className="tier-name">{tier}</h3>
        <p className="tier-desc">{tierDesc}</p>

        <div className="breakdown">
          {breakdown.map((b) => (
            <div className="bd-row" key={b.label}>
              <span className="bd-label">{b.label}</span>

              <span className="bd-track">
                <span className="bd-fill" style={{ width: `${(b.value / b.max) * 100}%` }} />
              </span>

              <span className="bd-val">
                {b.value}/{b.max}
              </span>
            </div>
          ))}
        </div>

        <button className="btn btn-outline share-btn" onClick={handleShare} disabled={sharing}>
          {sharing ? 'Generating…' : '📲 Share your score'}
        </button>
      </div>
    </div>
  )
}
