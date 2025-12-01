import { useState } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'https://chitravaani-api.vercel.app/api'
const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '919436357001'

function Contact() {
  const email = import.meta.env.VITE_ARTIST_EMAIL || 'debasmitak10@gmail.com'
  const instagram = import.meta.env.VITE_INSTAGRAM || '@chitra.vaani'

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    subject: '',
    message: '',
    rating: 0
  })
  
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleWhatsApp = () => {
    const message = 'Hi! I would like to get in touch regarding your artwork.'
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank')
  }

  const StarRating = ({ rating, setRating }) => {
    return (
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '2rem',
              color: star <= rating ? '#fbbf24' : '#d1d5db',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.2)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          >
            ★
          </button>
        ))}
      </div>
    )
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    // Client-side validation
    if (!formData.customer_name || formData.customer_name.trim().length < 2) {
      setError('Name must be at least 2 characters')
      return
    }

    if (!formData.customer_email || !formData.customer_email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }

    if (!formData.subject || formData.subject.trim().length < 3) {
      setError('Subject must be at least 3 characters')
      return
    }

    if (!formData.message || formData.message.trim().length < 10) {
      setError('Message must be at least 10 characters')
      return
    }

    if (!formData.rating || formData.rating === 0) {
      setError('Please select a rating (1-5 stars)')
      return
    }

    // Validate phone if provided
    if (formData.customer_phone && formData.customer_phone.trim().length > 0) {
      const phoneDigits = formData.customer_phone.replace(/\D/g, '')
      if (phoneDigits.length !== 10) {
        setError('Phone number must be exactly 10 digits')
        return
      }
    }

    setSubmitting(true)

    try {
      console.log(' Submitting feedback to:', `${API_URL}/feedback`)
      
      const payload = {
        customer_name: formData.customer_name.trim(),
        customer_email: formData.customer_email.trim().toLowerCase(),
        customer_phone: formData.customer_phone.trim() || null,
        subject: formData.subject.trim(),
        message: formData.message.trim(),
        rating: parseInt(formData.rating)
      }

      console.log(' Payload:', payload)

      const response = await axios.post(`${API_URL}/feedback`, payload, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      })

      console.log(' Success response:', response.data)
      
      setSuccess(true)
      
      // Reset form
      setFormData({
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        subject: '',
        message: '',
        rating: 0
      })

      // Hide success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000)
      
    } catch (error) {
      console.error(' Submission error:', error)
      
      if (error.response) {
        console.error('Server response:', error.response.data)
        console.error('Status code:', error.response.status)
        
        if (error.response.status === 500) {
          setError('Server error. The database might not be configured correctly. Please contact via WhatsApp instead.')
        } else if (error.response.data?.error) {
          setError(error.response.data.error)
        } else if (error.response.data?.details) {
          const errorMessages = error.response.data.details.map(d => d.message).join(', ')
          setError(errorMessages)
        } else {
          setError('Failed to submit feedback. Please try WhatsApp instead.')
        }
      } else if (error.request) {
        console.error('No response received:', error.request)
        setError('Cannot connect to server. Please check your internet connection or contact via WhatsApp.')
      } else {
        console.error('Error:', error.message)
        setError('An unexpected error occurred. Please contact via WhatsApp.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container fade-in">
      <div className="hero" style={{ padding: '5rem 2rem 4rem' }}>        <h1>Get in Touch</h1>
        <p>Let's discuss your art needs or share your feedback</p>
      </div>

      <div className="info-section">
        <h2>Contact Information</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', margin: '2.5rem 0' }}>
          <div style={{ textAlign: 'center', padding: '2.5rem', background: '#f9f7f5', borderRadius: '12px' }}>
            <h3 style={{ marginBottom: '1rem' }}>WhatsApp</h3>
            <p style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#2c2c2c', margin: '1rem 0' }}>
              +91-9436357001
            </p>
            <button className="btn btn-whatsapp" onClick={handleWhatsApp}>
              Message Me
            </button>
          </div>
          
          <div style={{ textAlign: 'center', padding: '2.5rem', background: '#f9f7f5', borderRadius: '12px' }}>
            <h3 style={{ marginBottom: '1rem' }}>Email</h3>
            <p style={{ fontSize: '1.1rem', color: '#555', margin: '1rem 0', wordBreak: 'break-word' }}>
              {email}
            </p>
            <a href={`mailto:${email}`} className="btn" style={{ textDecoration: 'none' }}>
              Send Email
            </a>
          </div>
          
          <div style={{ textAlign: 'center', padding: '2.5rem', background: '#f9f7f5', borderRadius: '12px' }}>
            <h3 style={{ marginBottom: '1rem' }}> Instagram</h3>
            <p style={{ fontSize: '1.1rem', color: '#555', margin: '1rem 0' }}>
              {instagram}
            </p>
            <a 
              href={`https://instagram.com/${instagram.replace('@', '')}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn"
              style={{ textDecoration: 'none' }}
            >
              Follow Me
            </a>
          </div>
        </div>

        {/* Feedback Form */}
        <div style={{ 
          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', 
          padding: '2.5rem', 
          borderRadius: '12px', 
          marginTop: '3rem',
          border: '2px solid #0ea5e9'
        }}>
          <h2 style={{ textAlign: 'center', marginBottom: '1rem', color: '#0369a1' }}>
             Share Your Feedback
          </h2>
          <p style={{ textAlign: 'center', color: '#666', marginBottom: '2rem' }}>
            Your feedback helps us improve our services and artwork
          </p>

          <form onSubmit={handleSubmit} style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div className="form-group">
              <label>Your Name *</label>
              <input 
                type="text" 
                required 
                value={formData.customer_name}
                onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                placeholder="Your full name"
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label>Your Email *</label>
              <input 
                type="email" 
                required 
                value={formData.customer_email}
                onChange={(e) => setFormData({...formData, customer_email: e.target.value})}
                placeholder="yourname@example.com"
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label>Phone Number (Optional)</label>
              <input 
                type="tel" 
                value={formData.customer_phone}
                onChange={(e) => setFormData({...formData, customer_phone: e.target.value})}
                placeholder="10-digit phone number"
                maxLength="10"
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label>Subject *</label>
              <input 
                type="text"
                required
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                placeholder="What's your feedback about?"
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label>Overall Rating *</label>
              <StarRating 
                rating={formData.rating} 
                setRating={(rating) => setFormData({...formData, rating})}
              />
              {formData.rating > 0 && (
                <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>
                  {formData.rating === 1 && "(>_<) We'll do better"}
                  {formData.rating === 2 && ":-/ Needs improvement"}
                  {formData.rating === 3 && ":| It's okay"}
                  {formData.rating === 4 && ":) Good experience"}
                  {formData.rating === 5 && "^_^ Excellent!"}
                </p>
              )}
            </div>

            <div className="form-group">
              <label>Your Feedback *</label>
              <textarea 
                required
                rows="5"
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                placeholder="Tell us about your experience, suggestions, or any concerns..."
                maxLength="2000"
                disabled={submitting}
              />
              <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
                {formData.message.length} / 2000 characters
              </p>
            </div>

            {error && (
              <div style={{ 
                marginBottom: '1rem', 
                padding: '1rem', 
                borderRadius: '8px',
                background: '#fee2e2',
                color: '#991b1b',
                border: '2px solid #ef4444'
              }}>
                <strong> Error:</strong> {error}
              </div>
            )}

            {success && (
              <div style={{ 
                marginBottom: '1rem', 
                padding: '1rem', 
                borderRadius: '8px',
                background: '#d1fae5',
                color: '#065f46',
                border: '2px solid #10b981'
              }}>
                <strong> Success!</strong> Thank you for your feedback! We appreciate your input.
              </div>
            )}

            <button 
              type="submit" 
              className="btn" 
              disabled={submitting || formData.rating === 0}
              style={{ 
                width: '100%', 
                background: formData.rating === 0 || submitting ? '#ccc' : '#0ea5e9',
                cursor: formData.rating === 0 || submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.7 : 1
              }}
            >
              {submitting ? ' Submitting...' : ' Submit Feedback'}
            </button>

            <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666', textAlign: 'center' }}>
              Having trouble? <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" style={{ color: '#0ea5e9', fontWeight: 600 }}>Contact us on WhatsApp</a>
            </p>
          </form>
        </div>

        <div style={{ 
          textAlign: 'center', 
          margin: '2.5rem auto', 
          padding: '2rem', 
          background: '#fff9f5', 
          borderRadius: '12px', 
          border: '2px dashed #8b7355',
          maxWidth: '500px'
        }}>
          <h3 style={{ marginBottom: '1rem' }}>Payment QR Code</h3>
          <p style={{ marginBottom: '1.5rem', color: '#666' }}>Scan to pay via UPI after order confirmation</p>
          <div style={{ 
            width: '100%',
            maxWidth: '280px',
            margin: '0 auto',
            aspectRatio: '1/1',
            background: 'white', 
            border: '3px solid #8b7355', 
            borderRadius: '12px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)', 
            overflow: 'hidden',
            padding: '1rem'
          }}>
            <img 
              src="/payment-qr.jpg" 
              alt="Payment QR Code" 
              style={{ 
                width: '100%',
                height: '100%',
                objectFit: 'contain'
              }}
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.parentElement.innerHTML = '<p style="color: #8b7355; padding: 2rem; textAlign: center;">QR Code Not Found<br/><small>Place image at:<br/>public/payment-qr.jpg</small></p>'
              }}
            />
          </div>
        </div>

        <div style={{ background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)', padding: '2rem', borderRadius: '12px', marginTop: '3rem' }}>
          <h3 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Quick Tips</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ padding: '0.8rem', background: 'white', borderRadius: '8px', marginBottom: '1rem' }}>
              <strong>For fastest response:</strong> Message us on WhatsApp
            </li>
            <li style={{ padding: '0.8rem', background: 'white', borderRadius: '8px', marginBottom: '1rem' }}>
              <strong>Response time:</strong> Usually within 24 hours
            </li>
            <li style={{ padding: '0.8rem', background: 'white', borderRadius: '8px', marginBottom: '1rem' }}>
              <strong>Payment:</strong> We accept UPI, Bank Transfer, and Cash on Delivery
            </li>
            <li style={{ padding: '0.8rem', background: 'white', borderRadius: '8px' }}>
              <strong>Shipping:</strong> Available across India with secure packaging
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Contact