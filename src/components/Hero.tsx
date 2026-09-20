import './Hero.css'

interface HeroProps {
  name: string
  subtitle: string
  initial: string
  photoUrl?: string | null
}

export const Hero = ({ name, subtitle, initial, photoUrl }: HeroProps) => {
  return (
    <div className="hero">
      <div className="hero-blob hero-blob-a" />
      <div className="hero-blob hero-blob-b" />

      <div className="hero-inner">
        <div className="avatar">
          {photoUrl ? <img className="avatar-photo" src={photoUrl} alt="" /> : initial}
        </div>

        <div>
          <p className="eyebrow">🎧 Your Encore profile</p>
          <h1 className="name">{name}</h1>
          <p className="subtitle">{subtitle}</p>
        </div>
      </div>
    </div>
  )
}
