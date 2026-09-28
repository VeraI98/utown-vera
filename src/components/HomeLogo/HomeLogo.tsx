import { Link } from 'react-router-dom'

import './HomeLogo.css'

interface HomeLogoProps {
  className: string
  src: string
  alt: string
}

export default function HomeLogo({ className, src, alt }: HomeLogoProps) {
  return (
    <Link
      to="/"
      className={`home-logo-link ${className}`}
      aria-label="Go to home"
    >
      <img src={src} alt={alt} />
    </Link>
  )
}
