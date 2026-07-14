import { useAuth } from '../hooks/useAuth'

function ProfilePage() {
  const { user, logout } = useAuth()

  if (!user) {
    return null
  }

  return (
    <main className="profile-page">
      <section className="profile-card">
        <h1>Профиль</h1>

        <p>
          <strong>Username:</strong> {user.username}
        </p>

        <p>
          <strong>Имя:</strong> {user.fullName}
        </p>

        <p>
          <strong>Роль:</strong> {user.roles.join(', ')}
        </p>

        <p>
          <strong>Статус:</strong>{' '}
          {user.isActive ? 'Активен' : 'Неактивен'}
        </p>

        <button type="button" onClick={logout}>
          Выйти
        </button>
      </section>
    </main>
  )
}

export default ProfilePage