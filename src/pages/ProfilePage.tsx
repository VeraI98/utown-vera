import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

function ProfilePage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <main className="profile-page">
      <section className="profile-card">
        <h1>Профиль</h1>

        <p>
          <strong>Имя:</strong> {user?.name}
        </p>

        <p>
          <strong>Email:</strong> {user?.email}
        </p>

        <p>
          <strong>Роль:</strong> {user?.role}
        </p>

        <button type="button" onClick={handleLogout}>
          Выйти
        </button>
      </section>
    </main>
  )
}

export default ProfilePage