import './TableSkeleton.css'

interface TableSkeletonProps {
  columns: number
  rows?: number
}

function TableSkeleton({ columns, rows = 5 }: TableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }, (_, rowIndex) => (
        <tr className="table-skeleton-row" key={rowIndex}>
          {Array.from({ length: columns }, (_, colIndex) => (
            <td key={colIndex}>
              <div className="table-skeleton-bar" />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

export default TableSkeleton
