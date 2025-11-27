import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'https://chitravaani-api.vercel.app/api'
const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER

function Artwork() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [artwork, setArtwork] = useState(null)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState('')
  
  const [orderData, setOrderData] = useState({
    size: 'standard',
    notes: '',
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    deliveryAddress: ''
  })

  useEffect(() => {
    fetchArtwork()
  }, [id])

  const fetchArtwork = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_URL}/artworks/${id}`)
      setArtwork(response.data)
      setError(null)
    } catch (error) {
      console.error('Error fetching artwork:', error)
      setError('Artwork not found')
    } finally {
      setLoading(false)
    }
  }

  // WhatsApp order (existing functionality)
  const handleWhatsAppOrder = () => {
    if (!orderData.customerName || !orderData.customerPhone || !orderData.deliveryAddress) {
      alert('⚠️ Please fill: Name, Phone, and Address first');
      return;
    }

    const message = `Hi! I'd like to order:\n\n*${artwork.title}*\nCategory: ${artwork.category}\nPrice: ${artwork.price}\n\n*Order Details:*\nSize: ${orderData.size}\nNotes: ${orderData.notes || 'None'}\n\n*My Details:*\nName: ${orderData.customerName}\nPhone: ${orderData.customerPhone}\nAddress: ${orderData.deliveryAddress}`
    
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank')
  }

  // NEW: Database order submission
  const handleDatabaseOrder = async (e) => {
    e.preventDefault()
    setSubmitError('')
    setSubmitSuccess(false)

    // Validation
    if (!orderData.customerName || orderData.customerName.trim().length < 2) {
      setSubmitError('Name must be at least 2 characters')
      return
    }

    if (!orderData.customerEmail || !orderData.customerEmail.includes('@')) {
      setSubmitError('Valid email is required')
      return
    }

    if (!orderData.customerPhone || orderData.customerPhone.replace(/\D/g, '').length !== 10) {
      setSubmitError('Phone must be exactly 10 digits')
      return
    }

    if (!orderData.deliveryAddress || orderData.deliveryAddress.trim().length < 10) {
      setSubmitError('Please provide a complete delivery address')
      return
    }

    setSubmitting(true)

    try {
      console.log(' Submitting order...')

      const orderPayload = {
        order_type: 'regular',
        artwork_id: artwork.id,
        customer_name: orderData.customerName.trim(),
        customer_email: orderData.customerEmail.trim().toLowerCase(),
        customer_phone: orderData.customerPhone.replace(/\D/g, ''),
        delivery_address: orderData.deliveryAddress.trim(),
        order_details: {
          artwork_title: artwork.title,
          price: artwork.price,
          size: orderData.size,
          notes: orderData.notes || ''
        }
      }

      console.log('📦 Order payload:', orderPayload)

      const response = await axios.post(`${API_URL}/orders`, orderPayload, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      })

      console.log('✅ Order submitted:', response.data)

      setSubmitSuccess(true)
      
      // Reset form
      setOrderData({
        size: 'standard',
        notes: '',
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        deliveryAddress: ''
      })

      // Show success for 5 seconds
      setTimeout(() => setSubmitSuccess(false), 5000)

    } catch (error) {
      console.error('❌ Order submission error:', error)
      
      if (error.response?.data?.error) {
        setSubmitError(error.response.data.error)
      } else if (error.response?.data?.details) {
        const errorMessages = error.response.data.details.map(d => d.message).join(', ')
        setSubmitError(errorMessages)
      } else if (error.message === 'Network Error') {
        setSubmitError('Cannot connect to server. Please try WhatsApp order instead.')
      } else {
        setSubmitError('Failed to submit order. Please try WhatsApp order instead.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleShareArtwork = () => {
    const shareUrl = `${window.location.origin}/artwork/${artwork.id}`
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        alert('🔗 Link copied to clipboard!\n\n' + shareUrl)
      }).catch(() => {
        prompt('Copy this link:', shareUrl)
      })
    } else {
      prompt('Copy this link:', shareUrl)
    }
  }

  if (loading) {
    return <div className="loading">Loading artwork...</div>
  }

  if (error || !artwork) {
    return (
      <div className="container">
        <div className="error">{error || 'Artwork not found'}</div>
        <button className="btn" onClick={() => navigate('/gallery')}>
          Back to Gallery
        </button>
      </div>
    )
  }

  const photos = typeof artwork.photos === 'string' ? JSON.parse(artwork.photos) : artwork.photos

  return (
    <div className="container fade-in">
      <button className="btn btn-secondary" onClick={() => navigate('/gallery')} style={{ marginBottom: '2rem' }}>
        ← Back to Gallery
      </button>

      <div className="info-section">
        {/* Image Gallery */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ position: 'relative', width: '100%', height: '500px', background: '#f5f3f0', borderRadius: '12px', overflow: 'hidden', marginBottom: '1.5rem' }}>
            <img 
              src={photos[currentPhotoIndex]?.url} 
              alt={artwork.title}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              onError={(e) => e.target.src = 'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27800%27 height=%27600%27%3E%3Crect fill=%27%23e8ddd0%27 width=%27800%27 height=%27600%27/%3E%3Ctext x=%2750%25%27 y=%2750%25%27 dominant-baseline=%27middle%27 text-anchor=%27middle%27 font-size=%2780%27 fill=%27%238b7355%27%3E🎨%3C/text%3E%3C/svg%3E'}
            />
            
            {photos.length > 1 && (
              <>
                <button 
                  onClick={() => setCurrentPhotoIndex((currentPhotoIndex - 1 + photos.length) % photos.length)}
                  style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.9)', border: 'none', width: '50px', height: '50px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.5rem' }}
                >
                  ‹
                </button>
                <button 
                  onClick={() => setCurrentPhotoIndex((currentPhotoIndex + 1) % photos.length)}
                  style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.9)', border: 'none', width: '50px', height: '50px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.5rem' }}
                >
                  ›
                </button>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {photos.length > 1 && (
            <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', padding: '0.5rem 0' }}>
              {photos.map((photo, index) => (
                <img 
                  key={index}
                  src={photo.url}
                  alt={photo.label}
                  onClick={() => setCurrentPhotoIndex(index)}
                  style={{ 
                    minWidth: '100px', 
                    height: '100px', 
                    borderRadius: '8px', 
                    cursor: 'pointer', 
                    border: index === currentPhotoIndex ? '3px solid #8b7355' : '3px solid transparent',
                    objectFit: 'cover',
                    transition: 'all 0.3s ease'
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Artwork Details */}
        <div className="artwork-category">{artwork.category}</div>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{artwork.title}</h1>
        <p className="artwork-price" style={{ fontSize: '1.8rem', marginBottom: '2rem' }}>{artwork.price}</p>

        {artwork.description && (
          <div style={{ background: '#f9f7f5', padding: '2rem', borderRadius: '12px', marginBottom: '2rem' }}>
            <h3>About This Artwork</h3>
            <p>{artwork.description}</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
              {artwork.medium && (
                <div>
                  <p style={{ fontSize: '0.9rem', color: '#8b7355', fontWeight: 600 }}>MEDIUM</p>
                  <p>{artwork.medium}</p>
                </div>
              )}
              {artwork.dimensions && (
                <div>
                  <p style={{ fontSize: '0.9rem', color: '#8b7355', fontWeight: 600 }}>DIMENSIONS</p>
                  <p>{artwork.dimensions}</p>
                </div>
              )}
              {artwork.year && (
                <div>
                  <p style={{ fontSize: '0.9rem', color: '#8b7355', fontWeight: 600 }}>YEAR</p>
                  <p>{artwork.year}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Share Button */}
        <div style={{ background: '#f0f8ff', padding: '1.5rem', borderRadius: '8px', textAlign: 'center', marginBottom: '2rem' }}>
          <h4 style={{ marginBottom: '1rem' }}>🔗 Share This Artwork</h4>
          <button className="btn" onClick={handleShareArtwork} style={{ background: '#4a90e2' }}>
            📋 Copy Share Link
          </button>
        </div>

        {/* Order Form - DATABASE + WhatsApp */}
        <div style={{ background: 'linear-gradient(135deg, #f0fff4 0%, #c6f6d5 100%)', padding: '2rem', borderRadius: '12px', border: '2px solid #38a169' }}>
          <h3 style={{ marginBottom: '1.5rem', color: '#2f855a' }}>🛒 Place Your Order</h3>
          
          <form onSubmit={handleDatabaseOrder}>
            <h4 style={{ marginBottom: '1rem', color: '#2d3748' }}>Order Details</h4>
            
            <div className="form-group">
              <label>Size</label>
              <select 
                value={orderData.size} 
                onChange={(e) => setOrderData({...orderData, size: e.target.value})}
                disabled={submitting}
              >
                <option value="standard">As Shown</option>
                <option value="small">Small (12x16")</option>
                <option value="medium">Medium (18x24")</option>
                <option value="large">Large (24x36")</option>
                <option value="custom">Custom Size</option>
              </select>
            </div>

            <div className="form-group">
              <label>Additional Notes</label>
              <textarea 
                value={orderData.notes} 
                onChange={(e) => setOrderData({...orderData, notes: e.target.value})}
                placeholder="Any special requests, custom colors, frame preferences..."
                rows="3"
                disabled={submitting}
              />
            </div>

            <h4 style={{ margin: '2rem 0 1rem', color: '#2d3748' }}>Your Details</h4>

            <div className="form-group">
              <label>Name *</label>
              <input 
                type="text" 
                required 
                value={orderData.customerName}
                onChange={(e) => setOrderData({...orderData, customerName: e.target.value})}
                placeholder="Your full name"
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label>Email *</label>
              <input 
                type="email" 
                required 
                value={orderData.customerEmail}
                onChange={(e) => setOrderData({...orderData, customerEmail: e.target.value})}
                placeholder="your.email@example.com"
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label>Phone *</label>
              <input 
                type="tel" 
                required 
                value={orderData.customerPhone}
                onChange={(e) => setOrderData({...orderData, customerPhone: e.target.value})}
                placeholder="10-digit phone number"
                maxLength="10"
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label>Delivery Address *</label>
              <textarea 
                required 
                value={orderData.deliveryAddress}
                onChange={(e) => setOrderData({...orderData, deliveryAddress: e.target.value})}
                placeholder="Your complete delivery address"
                rows="3"
                disabled={submitting}
              />
            </div>

            {submitError && (
              <div style={{ 
                marginBottom: '1rem', 
                padding: '1rem', 
                borderRadius: '8px',
                background: '#fee2e2',
                color: '#991b1b',
                border: '2px solid #ef4444'
              }}>
                <strong>❌ Error:</strong> {submitError}
              </div>
            )}

            {submitSuccess && (
              <div style={{ 
                marginBottom: '1rem', 
                padding: '1rem', 
                borderRadius: '8px',
                background: '#d1fae5',
                color: '#065f46',
                border: '2px solid #10b981'
              }}>
                <strong>✅ Success!</strong> Your order has been placed! We'll contact you soon.
              </div>
            )}

            {/* WhatsApp Order Button */}
            <button 
              type="button"
              className="btn" 
              onClick={handleWhatsAppOrder}
              disabled={submitting}
              style={{ 
                background: '#25D366', 
                fontSize: '1.2rem', 
                padding: '1.2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                width: '100%'
              }}
            >
              💬 Order via WhatsApp (Instant)
            </button>

            <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666', textAlign: 'center' }}>
              l<br/>
              💬 WhatsApp orders get instant response
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Artwork