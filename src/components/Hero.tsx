import './Hero.css'

interface HeroProps {
  header: string
  name: string
  subtitle: string
  initial: string
  photoUrl?: string | null
}

export const Hero = ({ header = 'Your Encore profile', name, subtitle, initial, photoUrl }: HeroProps) => {
  return (
    <div className="hero">
      <div className="hero-blob hero-blob-a" />
      <div className="hero-blob hero-blob-b" />

      <div className="hero-inner">
        <div className="avatar">
          {photoUrl ? (
            <img className="avatar-photo" src={photoUrl} aria-label={`Avatar for ${name}`} />
          ) : (
            initial
          )}
        </div>

        <div>
          <p className="eyebrow">🎧 {header}</p>
          <h1 className="name">{name}</h1>
          <p className="subtitle">{subtitle}</p>
        </div>
      </div>
    </div>
  )
}
