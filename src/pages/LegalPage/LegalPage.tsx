import {
  Link,
  useNavigate,
  useParams,
} from 'react-router-dom'

import backButton from '../../assets/icon info/Back Button.svg'
import logoWhite from '../../assets/icon info/logo white.svg'
import bell from '../../assets/icon info/bell.svg'

import favoritesIcon from '../../assets/icons main pages/Favorites.svg'
import homeIcon from '../../assets/icons main pages/Home.svg'
import profileIcon from '../../assets/icons main pages/Profile.svg'

import './LegalPage.css'

type LegalPageType =
  | 'privacy-policy'
  | 'terms-of-use'
  | 'disclaimer'

interface LegalContent {
  title: string
  text: string[]
}

const legalContent: Record<
  LegalPageType,
  LegalContent
> = {
  'privacy-policy': {
    title: 'Privacy Policy',
    text: [
      'The Privacy Policy content has not been provided yet.',
      'This page is prepared for the official UTOWN privacy policy.',
    ],
  },

  'terms-of-use': {
    title: 'Terms of Use',
    text: [
      'The Terms of Use content has not been provided yet.',
      'This page is prepared for the official UTOWN terms and conditions.',
    ],
  },

  disclaimer: {
    title: 'Disclaimer',
    text: [
      'The Disclaimer content has not been provided yet.',
      'This page is prepared for the official UTOWN disclaimer.',
    ],
  },
}

function isLegalPageType(
  value: string | undefined,
): value is LegalPageType {
  return (
    value === 'privacy-policy' ||
    value === 'terms-of-use' ||
    value === 'disclaimer'
  )
}

function LegalPage() {
  const navigate = useNavigate()

  const { type } = useParams<{
    type: string
  }>()

  if (!isLegalPageType(type)) {
    return (
      <main className="mobile-page legal-page">
        <section className="legal-screen">
          <div className="legal-not-found">
            <h1>Page not found</h1>

            <button
              type="button"
              onClick={() =>
                navigate('/information')
              }
            >
              Back to Information
            </button>
          </div>
        </section>
      </main>
    )
  }

  const content =
    legalContent[type]

  return (
    <main className="mobile-page legal-page">
      <section className="legal-screen">
        <header className="legal-header">
          <button
            className="legal-header-button"
            type="button"
            onClick={() =>
              navigate('/information')
            }
            aria-label="Go back to information"
          >
            <img
              src={backButton}
              alt=""
              aria-hidden="true"
            />
          </button>

          <img
            className="legal-logo"
            src={logoWhite}
            alt="UTOWN"
          />

          <button
            className="legal-header-button"
            type="button"
            onClick={() =>
              navigate('/notifications')
            }
            aria-label="Notifications"
          >
            <img
              src={bell}
              alt=""
              aria-hidden="true"
            />
          </button>
        </header>

        <div className="legal-content">
          <h1 className="legal-title">
            {content.title}
          </h1>

          <div className="legal-text">
            {content.text.map(
              (paragraph) => (
                <p key={paragraph}>
                  {paragraph}
                </p>
              ),
            )}
          </div>
        </div>

        <nav
          className="bottom-nav legal-bottom-nav"
          aria-label="Main navigation"
        >
          <Link
            className="bottom-nav-link"
            to="/"
          >
            <img
              src={homeIcon}
              alt=""
              aria-hidden="true"
            />

            <span>Home</span>
          </Link>

          <Link
            className="bottom-nav-link"
            to="/favorites"
          >
            <img
              src={favoritesIcon}
              alt=""
              aria-hidden="true"
            />

            <span>Favorites</span>
          </Link>

          <Link
            className="bottom-nav-link active"
            to="/profile"
          >
            <img
              src={profileIcon}
              alt=""
              aria-hidden="true"
            />

            <span>Profile</span>
          </Link>
        </nav>
      </section>
    </main>
  )
}

export default LegalPage