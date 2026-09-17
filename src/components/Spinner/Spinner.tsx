import './Spinner.css'

interface SpinnerProps {
  label?: string
}

function Spinner({ label }: SpinnerProps) {
  return (
    <div className="spinner">
      <span className="spinner__circle" role="status" aria-label="Loading" />
      {label && <p className="spinner__label">{label}</p>}
    </div>
  )
}

export default Spinner
