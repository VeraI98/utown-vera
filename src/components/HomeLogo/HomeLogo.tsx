import { Link } from 'react-router-dom'

import './HomeLogo.css'

interface HomeLogoProps {
  className: string
  src: string
  alt: string
  to?: string
  onClick?: () => void
}

export default function HomeLogo({
  className,
  src,
  alt,
  to = '/',
  onClick,
}: HomeLogoProps) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`home-logo-link ${className}`}
      aria-label="Go to home"
    >
      <img src={src} alt={alt} />
    </Link>
  )
}
