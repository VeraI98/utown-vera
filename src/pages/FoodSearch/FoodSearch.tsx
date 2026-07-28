import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import backButtonIcon from '../../assets/search/Back button.svg'
import bellIcon from '../../assets/search/bell.svg'
import cuisineAreaImage from '../../assets/search/Cuisine in the area.svg'
import filterIcon from '../../assets/search/filter.svg'
import foodLogo from '../../assets/search/food.svg'
import longRestaurantImage from '../../assets/search/Long name of the restaurant....svg'
import mapIcon from '../../assets/search/map.svg'
import redWhiteImage from '../../assets/search/red white.svg'
import searchIcon from '../../assets/search/search.svg'
import utLogo from '../../assets/search/ut.svg'

import './FoodSearch.css'

const searchResults = [
  {
    id: 1,
    title: 'Cuisine in the area',
    description: 'Pizza, pasta and fries',
    delivery: 'Delivery: 7,000 won · 45–55 mins',
    image: cuisineAreaImage,
  },
  {
    id: 2,
    title: 'Long name of the restaurant...',
    description: 'Burgers, like home',
    delivery: 'Delivery: 7,000 won · 2 km · 45–55 mins',
    image: longRestaurantImage,
  },
  {
    id: 3,
    title: 'Red White',
    description: 'Doner, burger, chicken, salads',
    delivery: 'Delivery: 7,000 won · 2 km · 45–55 mins',
    image: redWhiteImage,
  },
]

type FilterValue = 'all' | 'restaurants' | 'cafes'
type SortValue = 'recommended' | 'distance' | 'rating'

function FoodSearch() {
  const navigate = useNavigate()

  const [searchValue, setSearchValue] = useState('')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [filter, setFilter] = useState<FilterValue>('all')
  const [sort, setSort] = useState<SortValue>('recommended')

  const normalizedSearch = searchValue.trim().toLowerCase()

  const visibleResults = useMemo(() => {
    if (normalizedSearch !== 'burger') {
      return []
    }

    return searchResults
  }, [normalizedSearch])

  const showPrompt = normalizedSearch.length === 0
  const showResults = normalizedSearch === 'burger'
  const showEmptyResult =
    normalizedSearch.length > 0 &&
    normalizedSearch !== 'burger'

  return (
    <main className="mobile-page food-search-page">
      <section className="food-search-screen">
        <header className="food-search-header">
          <button
            className="food-search-header-button"
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <img
              src={backButtonIcon}
              alt=""
              aria-hidden="true"
            />
          </button>

          <div
            className="food-search-logo"
            aria-label="UT Food"
          >
            <img src={utLogo} alt="UT" />
            <img src={foodLogo} alt="Food" />
          </div>

          <button
            className="food-search-header-button"
            type="button"
            onClick={() => navigate('/notifications')}
            aria-label="Notifications"
          >
            <img
              src={bellIcon}
              alt=""
              aria-hidden="true"
            />
          </button>
        </header>

        <div className="food-search-address">
          <img
            src={mapIcon}
            alt=""
            aria-hidden="true"
          />

          <span>
            Home, street Seobuk-gu Byeonhyeong-ro 569
          </span>
        </div>

        <div className="food-search-bar-wrapper">
          <label className="food-search-input-wrapper">
            <img
              src={searchIcon}
              alt=""
              aria-hidden="true"
            />

            <input
              autoFocus
              type="search"
              value={searchValue}
              onChange={(event) =>
                setSearchValue(event.target.value)
              }
              placeholder="Search for cafes, restaurants and dishes"
              aria-label="Search for cafes, restaurants and dishes"
            />
          </label>

          <button
            className={`food-filter-button ${
              isFilterOpen ? 'active' : ''
            }`}
            type="button"
            onClick={() => setIsFilterOpen(true)}
            aria-label="Open filters"
          >
            <img
              src={filterIcon}
              alt=""
              aria-hidden="true"
            />
          </button>
        </div>

        {!isFilterOpen && (
          <div className="food-search-main-content">
            {showPrompt && (
              <p className="food-search-prompt">
                What shall we
                <br />
                search for?
              </p>
            )}

            {showResults && (
              <div className="food-search-results">
                {visibleResults.map((result) => (
                  <button
                    className="food-search-result-card"
                    type="button"
                    key={result.id}
                  >
                    <img
                      className="food-search-result-image"
                      src={result.image}
                      alt={result.title}
                    />

                    <div className="food-search-result-info">
                      <h2>{result.title}</h2>

                      <p>{result.description}</p>

                      <span>{result.delivery}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {showEmptyResult && (
              <p className="food-search-empty">
                Nothing was found
              </p>
            )}
          </div>
        )}

        {isFilterOpen && (
          <section className="food-filter-panel">
            <div className="food-filter-content">
              <h1>Filter</h1>

              <div className="food-filter-options">
                <button
                  className={filter === 'all' ? 'active' : ''}
                  type="button"
                  onClick={() => setFilter('all')}
                >
                  All results
                </button>

                <button
                  className={
                    filter === 'restaurants' ? 'active' : ''
                  }
                  type="button"
                  onClick={() => setFilter('restaurants')}
                >
                  Restaurants
                </button>

                <button
                  className={
                    filter === 'cafes' ? 'active' : ''
                  }
                  type="button"
                  onClick={() => setFilter('cafes')}
                >
                  Cafés
                </button>
              </div>

              <h2>Sort by</h2>

              <div className="food-filter-options">
                <button
                  className={
                    sort === 'recommended' ? 'active' : ''
                  }
                  type="button"
                  onClick={() => setSort('recommended')}
                >
                  Recommended
                </button>

                <button
                  className={
                    sort === 'distance' ? 'active' : ''
                  }
                  type="button"
                  onClick={() => setSort('distance')}
                >
                  Distance
                </button>

                <button
                  className={
                    sort === 'rating' ? 'active' : ''
                  }
                  type="button"
                  onClick={() => setSort('rating')}
                >
                  Rating
                </button>
              </div>
            </div>

            <div className="food-filter-footer">
              <button
                type="button"
                onClick={() => setIsFilterOpen(false)}
              >
                Close
              </button>
            </div>
          </section>
        )}
      </section>
    </main>
  )
}

export default FoodSearch