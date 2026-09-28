import './Pagination.css'

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  disabled?: boolean
  siblingCount?: number
}

const DOTS = 'dots'

function getPageItems(
  page: number,
  totalPages: number,
  siblingCount: number,
): Array<number | typeof DOTS> {
  const totalNumbers = siblingCount * 2 + 5
  // 5 = first + last + current + 2 dots (worst case)

  if (totalPages <= totalNumbers) {
    return Array.from({ length: totalPages }, (_, index) => index)
  }

  const leftSiblingIndex = Math.max(page - siblingCount, 0)
  const rightSiblingIndex = Math.min(page + siblingCount, totalPages - 1)

  const showLeftDots = leftSiblingIndex > 1
  const showRightDots = rightSiblingIndex < totalPages - 2

  if (!showLeftDots && showRightDots) {
    const leftRange = Array.from(
      { length: siblingCount * 2 + 3 },
      (_, index) => index,
    )

    return [...leftRange, DOTS, totalPages - 1]
  }

  if (showLeftDots && !showRightDots) {
    const rightRangeLength = siblingCount * 2 + 3
    const rightRange = Array.from(
      { length: rightRangeLength },
      (_, index) => totalPages - rightRangeLength + index,
    )

    return [0, DOTS, ...rightRange]
  }

  const middleRange = Array.from(
    { length: rightSiblingIndex - leftSiblingIndex + 1 },
    (_, index) => leftSiblingIndex + index,
  )

  return [0, DOTS, ...middleRange, DOTS, totalPages - 1]
}

function Pagination({
  page,
  totalPages,
  onPageChange,
  disabled = false,
  siblingCount = 1,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null
  }

  const canGoPrev = page > 0
  const canGoNext = page + 1 < totalPages

  const items = getPageItems(page, totalPages, siblingCount)

  return (
    <div className="pagination">
      <button
        type="button"
        disabled={disabled || !canGoPrev}
        onClick={() => onPageChange(page - 1)}
      >
        Prev
      </button>

      {items.map((item, index) =>
        item === DOTS ? (
          <span key={`dots-${index}`} className="pagination__dots">
            …
          </span>
        ) : (
          <button
            type="button"
            key={item}
            className={item === page ? 'pagination-active' : undefined}
            disabled={disabled}
            onClick={() => onPageChange(item)}
          >
            {item + 1}
          </button>
        ),
      )}

      <button
        type="button"
        disabled={disabled || !canGoNext}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </button>
    </div>
  )
}

export default Pagination
