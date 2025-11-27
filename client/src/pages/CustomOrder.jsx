import { useState } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'https://chitravaani-api.vercel.app/api'
const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER

function CustomOrder() {
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    deliveryAddress: '',
    idea: '',
    medium: '',
    size: '',
    deadline: '',
    budget: ''
  })

  const [submitting, setSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState('')

  // WhatsApp order (existing)
  const handleWhatsAppOrder = (e) => {
    e.preventDefault()
    
    if (!formData.customerName || !formData.customerPhone || !formData.idea) {
      alert('⚠️ Please fill: Name, Phone, and Your Idea first');
      return;
    }

    const message = `Hi! I'd like a *Custom Artwork*\n\n*My Idea:*\n${formData.idea}\n\n*Details:*\nMedium: ${formData.medium || 'Any'}\nSize: ${formData.size || 'Flexible'}\nDeadline: ${formData.deadline || 'Flexible'}\nBudget: ${formData.budget || 'Flexible'}\n\n*My Details:*\nName: ${formData.customerName}\nPhone: ${formData.customerPhone}\nEmail: ${formData.customerEmail || 'Not provided'}\nAddress: ${formData.deliveryAddress || 'Will provide later'}`
    
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank')
  }

  // NEW: Database order
  const handleDatabaseOrder = async (e) => {
    e.preventDefault()
    setSubmitError('')
    setSubmitSuccess(false)

    // Validation
    if (!formData.customerName || formData.customerName.trim().length < 2) {
      setSubmitError('Name must be at least 2 characters')
      return
    }

    if (!formData.customerEmail || !formData.customerEmail.includes('@')) {
      setSubmitError('Valid email is required')
      return
    }

    if (!formData.customerPhone || formData.customerPhone.replace(/\D/g, '').length !== 10) {
      setSubmitError('Phone must be exactly 10 digits')
      return
    }

    if (!formData.idea || formData.idea.trim().length < 20) {
      setSubmitError('Please describe your idea in at least 20 characters')
      return
    }

    setSubmitting(true)

    try {
      const orderPayload = {
        order_type: 'custom',
        artwork_id: null,
        customer_name: formData.customerName.trim(),
        customer_email: formData.customerEmail.trim().toLowerCase(),
        customer_phone: formData.customerPhone.replace(/\D/g, ''),
        delivery_address: formData.deliveryAddress.trim() || null,
        order_details: {
          idea: formData.idea.trim(),
          medium: formData.medium || 'Any',
          size: formData.size || 'Flexible',
          deadline: formData.deadline || 'Flexible',
          budget: formData.budget || 'Flexible'
        }
      }

      console.log('📤 Submitting custom order:', orderPayload)

      const response = await axios.post(`${API_URL}/orders`, orderPayload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      })

      console.log('✅ Order submitted:', response.data)

      setSubmitSuccess(true)
      
      // Reset form
      setFormData({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        deliveryAddress: '',
        idea: '',
        medium: '',
        size: '',
        deadline: '',
        budget: ''
      })

      setTimeout(() => setSubmitSuccess(false), 5000)

    } catch (error) {
      console.error('❌ Order error:', error)
      
      if (error.response?.data?.error) {
        setSubmitError(error.response.data.error)
      } else if (error.response?.data?.details) {
        const errorMessages = error.response.data.details.map(d => d.message).join(', ')
        setSubmitError(errorMessages)
      } else {
        setSubmitError('Failed to submit order. Please try WhatsApp instead.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container fade-in">
      <div className="hero">
        <h1>Custom Art Orders</h1>
        <p>Have a unique vision? Let's create something special together!</p>
      </div>

      <div className="info-section">
        <h2>How It Works</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmin(250px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
          
          <div style={{ background: '#f9f7f5', padding: '2rem', borderRadius: '12px', border: '2px solid #e8ddd0', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💡</div>
            <h3>Share Your Idea</h3>
            <p>Tell us what you envision - theme, colors, style, or any inspiration</p>
          </div>

          <div style={{ background: '#f9f7f5', padding: '2rem', borderRadius: '12px', border: '2px solid #e8ddd0', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎨</div>
            <h3>We Create</h3>
            <p>Our artist will bring your vision to life with personalized artwork</p>
          </div>

          <div style={{ background: '#f9f7f5', padding: '2rem', borderRadius: '12px', border: '2px solid #e8ddd0', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}></div>
            <h3>Safe Delivery</h3>
            <p>Receive your unique masterpiece with secure packaging</p>
          </div>
        </div>

        <form onSubmit={handleDatabaseOrder}>
          <h3 style={{ marginBottom: '1.5rem' }}> Request Your Custom Artwork</h3>

          <div className="form-group">
            <label>Your Idea / Vision * <span style={{ fontSize: '0.9rem', color: '#666' }}>(What do you want created?)</span></label>
            <textarea 
              required 
              rows="5"
              value={formData.idea}
              onChange={(e) => setFormData({...formData, idea: e.target.value})}
              placeholder="Describe your vision: theme, colors, mood, inspiration, or reference images you have in mind..."
              disabled={submitting}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            <div className="form-group">
              <label>Preferred Medium</label>
              <select 
                value={formData.medium} 
                onChange={(e) => setFormData({...formData, medium: e.target.value})}
                disabled={submitting}
              >
                <option value="">Any (Artist's Choice)</option>
                <option value="Acrylic">Acrylic</option>
                <option value="Watercolor">Watercolor</option>
                <option value="Oil">Oil Painting</option>
                <option value="Pencil">Pencil Sketch</option>
                <option value="Charcoal">Charcoal</option>
                <option value="Mixed Media">Mixed Media</option>
                <option value="Digital">Digital Art</option>
              </select>
            </div>

            <div className="form-group">
              <label>Preferred Size</label>
              <input 
                type="text"
                value={formData.size}
                onChange={(e) => setFormData({...formData, size: e.target.value})}
                placeholder="e.g., 18x24 inches or Flexible"
                disabled={submitting}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            <div className="form-group">
              <label>Deadline (If Any)</label>
              <input 
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label>Budget Range</label>
              <input 
                type="text"
                value={formData.budget}
                onChange={(e) => setFormData({...formData, budget: e.target.value})}
                placeholder="e.g., Rs 3,000 - 5,000 or Flexible"
                disabled={submitting}
              />
            </div>
          </div>

          <h4 style={{ margin: '2rem 0 1rem' }}>Your Details</h4>

          <div className="form-group">
            <label>Name *</label>
            <input 
              type="text" 
              required 
              value={formData.customerName}
              onChange={(e) => setFormData({...formData, customerName: e.target.value})}
              placeholder="Your full name"
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input 
              type="email" 
              required 
              value={formData.customerEmail}
              onChange={(e) => setFormData({...formData, customerEmail: e.target.value})}
              placeholder="your.email@example.com"
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label>Phone *</label>
            <input 
              type="tel" 
              required 
              value={formData.customerPhone}
              onChange={(e) => setFormData({...formData, customerPhone: e.target.value})}
              placeholder="10-digit phone number"
              maxLength="10"
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label>Delivery Address (Optional)</label>
            <textarea 
              rows="3"
              value={formData.deliveryAddress}
              onChange={(e) => setFormData({...formData, deliveryAddress: e.target.value})}
              placeholder="Your delivery address (can provide later)"
              disabled={submitting}
            />
          </div>

          {submitError && (
            <div style={{ marginBottom: '1rem', padding: '1rem', borderRadius: '8px', background: '#fee2e2', color: '#991b1b', border: '2px solid #ef4444' }}>
              <strong>❌ Error:</strong> {submitError}
            </div>
          )}

          {submitSuccess && (
            <div style={{ marginBottom: '1rem', padding: '1rem', borderRadius: '8px', background: '#d1fae5', color: '#065f46', border: '2px solid #10b981' }}>
              <strong>✅ Success!</strong> Your custom order has been placed! We'll contact you soon.
            </div>
          )}

          {/* WhatsApp Button */}
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
             Order via WhatsApp 
          </button>

          <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666', textAlign: 'center' }}>
             WhatsApp for instant response + image sharing
          </p>
        </form>

        <div style={{ background: '#fff3cd', padding: '2rem', borderRadius: '12px', marginTop: '3rem', border: '2px solid #ffc107' }}>
          <div style={{ textAlign: 'center' }}><h3>💡 Custom Order Tips</h3></div>
          <ul style={{ lineHeight: '1.8', marginLeft: '1.5rem' }}>
            <li>Be as detailed as possible about your vision</li>
            <li>Share reference images via WhatsApp for better clarity</li>
            <li>Custom pieces typically take 1-3 weeks depending on complexity</li>
            <li>Pricing varies based on size, medium, and detail level</li>
            <li>We'll discuss all details before starting your piece</li>
            <li>50% advance payment may be required for custom orders</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default CustomOrder