interface HeroProps {
  name: string
  subtitle: string
  initial: string
}

const Hero = ({ name, subtitle, initial }: HeroProps) => {
  return (
    <div className="hero">
      <div className="hero-inner">
        <div className="avatar">{initial}</div>

        <div>
          <p className="eyebrow">your profile</p>
          <h1 className="name">{name}</h1>
          <p className="subtitle">{subtitle}</p>
        </div>
      </div>
    </div>
  )
}

export default Hero
