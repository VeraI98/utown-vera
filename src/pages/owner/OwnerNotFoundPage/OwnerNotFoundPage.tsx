import { useNavigate } from 'react-router-dom'

import './OwnerNotFoundPage.css'

export default function OwnerNotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="owner-not-found-page">
      <h1>Page not found</h1>

      <p>This owner page does not exist.</p>

      <button type="button" onClick={() => navigate('/owner')}>
        Back to main screen
      </button>
    </div>
  )
}
