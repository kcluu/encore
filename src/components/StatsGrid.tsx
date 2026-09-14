import type { ArtistDetail, ArtistScore } from '../utils/types'

interface StatsGridProps {
  result: ArtistScore & { artist: ArtistDetail }
}

function formatDate(d: Date | null): string {
  if (!d) return '—'

  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

const StatsGrid = ({ result }: StatsGridProps) => {
  const { artist, hours, share, uniqueTracks, activeDays, avgReplays } = result

  const stats: [string, string][] = [
    [artist.count.toLocaleString(), 'Total plays'],
    [hours.toFixed(1), 'Hours listened'],
    [`${(share * 100).toFixed(1)}%`, 'Share of your listening'],
    [uniqueTracks.toLocaleString(), 'Unique tracks played'],
    [formatDate(artist.minTs), 'First listened'],
    [formatDate(artist.maxTs), 'Most recent'],
    [activeDays.toLocaleString(), 'Days you played them'],
    [`${avgReplays.toFixed(1)}×`, 'Avg replays per track'],
  ]

  return (
    <div className="stat-grid">
      {stats.map(([num, label]) => (
        <div className="stat-card" key={label}>
          <div className="stat-num">{num}</div>
          <div className="stat-label">{label}</div>
        </div>
      ))}
    </div>
  )
}

export default StatsGrid
