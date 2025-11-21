import { useState } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'https://chitravaani-api.vercel.app/api'

function Contact() {
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '919436357001'
  const email = import.meta.env.VITE_ARTIST_EMAIL || 'debasmitak10@gmail.com'
  const instagram = import.meta.env.VITE_INSTAGRAM || '@chitra.vaani'

  const [feedbackData, setFeedbackData] = useState({
    name: '',
    email: '',
    category: '',
    rating: 0,
    message: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)

  const handleWhatsApp = () => {
    const message = 'Hi! I would like to get in touch regarding your artwork.'
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank')
  }

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault()
    
    if (!feedbackData.name || !feedbackData.email || !feedbackData.category || !feedbackData.message) {
      setSubmitStatus({ type: 'error', message: 'Please fill all required fields' })
      return
    }

    if (!feedbackData.email.endsWith('@gmail.com')) {
      setSubmitStatus({ type: 'error', message: 'Please use a Gmail address' })
      return
    }

    setSubmitting(true)
    setSubmitStatus(null)

    try {
      // Send feedback through orders API (you'll need to create a feedback endpoint)
      await axios.post(`${API_URL}/feedback`, {
        customer_name: feedbackData.name,
        customer_email: feedbackData.email,
        feedback_type: feedbackData.category,
        rating: feedbackData.rating,
        message: feedbackData.message
      })

      setSubmitStatus({ 
        type: 'success', 
        message: 'Thank you for your feedback! We appreciate your input.' 
      })
      
      // Reset form
      setFeedbackData({
        name: '',
        email: '',
        category: '',
        rating: 0,
        message: ''
      })
    } catch (error) {
      console.error('Feedback submission error:', error)
      setSubmitStatus({ 
        type: 'error', 
        message: 'Failed to submit feedback. Please try again or contact us directly.' 
      })
    } finally {
      setSubmitting(false)
    }
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

  return (
    <div className="container fade-in">
      <div className="hero">
        <h1>Get in Touch</h1>
        <p>Let's discuss your art needs or share your feedback</p>
      </div>

      <div className="info-section">
        <h2>Contact Information</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', margin: '2.5rem 0' }}>
          <div style={{ textAlign: 'center', padding: '2.5rem', background: '#f9f7f5', borderRadius: '12px' }}>
            <h3 style={{ marginBottom: '1rem' }}> WhatsApp</h3>
            <p style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#2c2c2c', margin: '1rem 0' }}>
              +91-9436357001
            </p>
            <button className="btn btn-whatsapp" onClick={handleWhatsApp}>
              Message Me
            </button>
          </div>
          
          <div style={{ textAlign: 'center', padding: '2.5rem', background: '#f9f7f5', borderRadius: '12px' }}>
            <h3 style={{ marginBottom: '1rem' }}> Email</h3>
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

        {/* NEW: Feedback Form */}
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

          <form onSubmit={handleFeedbackSubmit} style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div className="form-group">
              <label>Your Name *</label>
              <input 
                type="text" 
                required 
                value={feedbackData.name}
                onChange={(e) => setFeedbackData({...feedbackData, name: e.target.value})}
                placeholder="Your full name"
              />
            </div>

            <div className="form-group">
              <label>Your Email (Gmail only) *</label>
              <input 
                type="email" 
                required 
                value={feedbackData.email}
                onChange={(e) => setFeedbackData({...feedbackData, email: e.target.value})}
                placeholder="yourname@gmail.com"
              />
            </div>

            <div className="form-group">
              <label>Feedback Category *</label>
              <select 
                required
                value={feedbackData.category}
                onChange={(e) => setFeedbackData({...feedbackData, category: e.target.value})}
              >
                <option value="">Select a category</option>
                <option value="artwork_quality">Artwork Quality</option>
                <option value="customer_service">Customer Service</option>
                <option value="website_experience">Website Experience</option>
                <option value="delivery">Delivery & Packaging</option>
                <option value="pricing">Pricing</option>
                <option value="suggestion">Suggestion/Request</option>
                <option value="complaint">Complaint</option>
                <option value="appreciation">Appreciation</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Overall Rating *</label>
              <StarRating 
                rating={feedbackData.rating} 
                setRating={(rating) => setFeedbackData({...feedbackData, rating})}
              />
              {feedbackData.rating > 0 && (
                <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>
                  {feedbackData.rating === 1 && "(>_<) We'll do better"}
                  {feedbackData.rating === 2 && ":-/ Needs improvement"}
                  {feedbackData.rating === 3 && ":| It's okay"}
                  {feedbackData.rating === 4 && "(: Good experience"}
                  {feedbackData.rating === 5 && "^_^ Excellent!"}
                </p>
              )}
            </div>
            

            <div className="form-group">
              <label>Your Feedback *</label>
              <textarea 
                required
                rows="5"
                value={feedbackData.message}
                onChange={(e) => setFeedbackData({...feedbackData, message: e.target.value})}
                placeholder="Tell us about your experience, suggestions, or any concerns..."
              />
              <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
                {feedbackData.message.length} / 500 characters
              </p>
            </div>

            <button 
              type="submit" 
              className="btn" 
              disabled={submitting || feedbackData.rating === 0}
              style={{ 
                width: '100%', 
                background: feedbackData.rating === 0 ? '#ccc' : '#0ea5e9',
                cursor: feedbackData.rating === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              {submitting ? ' Submitting...' : ' Submit Feedback'}
            </button>

            {submitStatus && (
              <div style={{ 
                marginTop: '1.5rem', 
                padding: '1rem', 
                borderRadius: '8px',
                background: submitStatus.type === 'success' ? '#d1fae5' : '#fee2e2',
                color: submitStatus.type === 'success' ? '#065f46' : '#991b1b',
                border: `2px solid ${submitStatus.type === 'success' ? '#10b981' : '#ef4444'}`
              }}>
                <strong>{submitStatus.type === 'success' ? ' Success!' : ' Error:'}</strong>
                <p style={{ marginTop: '0.5rem' }}>{submitStatus.message}</p>
              </div>
            )}
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
                e.target.parentElement.innerHTML = '<p style="color: #8b7355; padding: 2rem; textAlign: center;">QR Code Not Found<br/><small>Place image at:<br/>client/public/payment-qr.jpg</small></p>'
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