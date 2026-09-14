import type { ArtistDetail, ArtistScore } from '../utils/types'
import { colorFor, initialOf } from '../utils/score'

interface ScorePanelProps {
  result: ArtistScore & { artist: ArtistDetail }
  totalArtists: number
}

const ScorePanel = ({ result, totalArtists }: ScorePanelProps) => {
  const { artist, score, tier, tierDesc, breakdown } = result

  return (
    <div className="panel">
      <div className="panel-id">
        <div className="panel-avatar" style={{ background: colorFor(artist.artist) }}>
          {initialOf(artist.artist)}
        </div>

        <p className="panel-rank">
          #{artist.rank} of {totalArtists}
        </p>
      </div>

      {/* The ring is a conic-gradient sized by the --pct custom property —
          no SVG or animation library needed. */}
      <div className="gauge" style={{ '--pct': score }}>
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
      </div>
    </div>
  )
}

export default ScorePanel
