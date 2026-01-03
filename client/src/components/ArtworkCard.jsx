import { useNavigate } from 'react-router-dom'

function ArtworkCard({ artwork }) {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(`/artwork/${artwork.id}`)
  }

  const photos = typeof artwork.photos === 'string' 
    ? JSON.parse(artwork.photos) 
    : artwork.photos

  return (
    <div className="artwork-card" onClick={handleClick}>
      <img 
        src={photos[0]?.url} 
        alt={artwork.title}
        className="artwork-image"
        onError={(e) => {
          e.target.src = 'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27400%27 height=%27400%27%3E%3Crect fill=%27%23e8ddd0%27 width=%27400%27 height=%27400%27/%3E%3Ctext x=%2750%25%27 y=%2750%25%27 dominant-baseline=%27middle%27 text-anchor=%27middle%27 font-size=%2760%27 fill=%27%238b7355%27%3E🎨%3C/text%3E%3C/svg%3E'
        }}
      />
      <div className="artwork-info">
        <div className="artwork-category">{artwork.category}</div>
        <h3 className="artwork-title">{artwork.title}</h3>
        <p className="artwork-price">₹{artwork.price}</p>
        <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
           {photos.length} photo{photos.length > 1 ? 's' : ''}
        </p>
        <button className="btn" style={{ width: '100%' }}>
          View Details & Order
        </button>
      </div>
    </div>
  )
}

export default ArtworkCard