import './ClientCardModal.css'

interface ClientCardModalClient {
  id: number
  name: string
  number?: string
  city?: string
  address?: string
  orders?: number
}

interface ClientCardModalProps {
  client: ClientCardModalClient
  onClose: () => void
  onEdit: () => void
}

function ClientCardModal({ client, onClose, onEdit }: ClientCardModalProps) {
  return (
    <div className="client-card-modal__overlay" onClick={onClose}>
      <div
        className="client-card-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          className="client-card-modal__close"
          type="button"
          aria-label="Close"
          onClick={onClose}
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M6 6L18 18M18 6L6 18"
              stroke="#101828"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <div className="client-card-modal__header">
          <div className="client-card-modal__photo" />

          <div className="client-card-modal__photo-panel">
            <button
              className="client-card-modal__edit-button"
              type="button"
              onClick={onEdit}
            >
              Edit account
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M5 12H19M19 12L13 6M19 12L13 18"
                  stroke="#101828"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="client-card-modal__body">
          <h2 className="client-card-modal__name">{client.name}</h2>

          <dl className="client-card-modal__details">
            <div className="client-card-modal__detail-row">
              <dt>Phone:</dt>
              <dd>{client.number || '-'}</dd>
            </div>
            <div className="client-card-modal__detail-row">
              <dt>City:</dt>
              <dd>{client.city || '-'}</dd>
            </div>
            <div className="client-card-modal__detail-row">
              <dt>Address:</dt>
              <dd>{client.address || '-'}</dd>
            </div>
            <div className="client-card-modal__detail-row">
              <dt>Orders:</dt>
              <dd>
                {client.orders !== undefined ? `${client.orders} orders` : '-'}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  )
}

export default ClientCardModal
