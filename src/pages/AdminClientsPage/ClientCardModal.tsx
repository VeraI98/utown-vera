import './ClientCardModal.css'

interface ClientCardModalProps {
  client: {
    name: string
    number: string
    city: string
    address: string
    orders: number
  }
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
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        <div className="client-card-modal__top">
          <div className="client-card-modal__photo" />

          <div className="client-card-modal__panel">
            <button
              className="client-card-modal__edit-button"
              type="button"
              onClick={onEdit}
            >
              Edit account
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>

        <h2 className="client-card-modal__name">{client.name}</h2>

        <dl className="client-card-modal__details">
          <div>
            <dt>Phone:</dt>
            <dd>{client.number}</dd>
          </div>
          <div>
            <dt>City:</dt>
            <dd>{client.city}</dd>
          </div>
          <div>
            <dt>Address:</dt>
            <dd>{client.address}</dd>
          </div>
          <div>
            <dt>Orders:</dt>
            <dd>{client.orders} orders</dd>
          </div>
        </dl>
      </div>
    </div>
  )
}

export default ClientCardModal