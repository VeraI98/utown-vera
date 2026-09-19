import './OwnerStatisticsPage.css'

// Placeholder page: the menu item exists (and matches the Figma nav), but
// the actual statistics/analytics view isn't built yet. This keeps the
// item clickable instead of disabled, without pretending there's real
// data behind it.
function OwnerStatisticsPage() {
  return (
    <main className="owner-statistics-page">
      <div className="owner-statistics-page__content">
        <h1>Statistics</h1>

        <div className="owner-statistics-page__placeholder">
          <svg
            className="owner-statistics-page__placeholder-icon"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M4 20V10M12 20V4M20 20v-7"
              stroke="#888888"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <p className="owner-statistics-page__placeholder-title">
            Coming soon
          </p>

          <p className="owner-statistics-page__placeholder-text">
            Statistics for your restaurant will appear here.
          </p>
        </div>
      </div>
    </main>
  )
}

export default OwnerStatisticsPage
