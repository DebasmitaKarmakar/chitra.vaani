import { useState } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'https://chitravaani-api.vercel.app/api'
const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER

function BulkOrder() {
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    orgName: '',
    itemType: '',
    quantity: '',
    deadline: '',
    budget: '',
    details: ''
  })

  const [submitting, setSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState('')

  // WhatsApp order (existing)
  const handleWhatsAppOrder = (e) => {
    e.preventDefault()
    
    if (!formData.customerName || !formData.customerPhone || !formData.orgName || !formData.itemType || !formData.quantity) {
      alert(' Please fill: Name, Phone, Organization, Item Type, and Quantity first');
      return;
    }

    const message = `Hi! I'd like a *Bulk Order*\n\n*Organization:* ${formData.orgName}\n*Item Type:* ${formData.itemType}\n*Quantity:* ${formData.quantity}\n\n*Details:*\n${formData.details || 'Will discuss'}\n\n*Timeline & Budget:*\nDeadline: ${formData.deadline || 'Flexible'}\nBudget: ${formData.budget || 'Please quote'}\n\n*Contact Person:*\nName: ${formData.customerName}\nPhone: ${formData.customerPhone}\nEmail: ${formData.customerEmail || 'Not provided'}`
    
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

    if (!formData.orgName || formData.orgName.trim().length < 3) {
      setSubmitError('Organization name must be at least 3 characters')
      return
    }

    if (!formData.itemType) {
      setSubmitError('Please select an item type')
      return
    }

    if (!formData.quantity || parseInt(formData.quantity) < 2) {
      setSubmitError('Quantity must be at least 2')
      return
    }

    if (!formData.details || formData.details.trim().length < 20) {
      setSubmitError('Please provide project details (at least 20 characters)')
      return
    }

    setSubmitting(true)

    try {
      const orderPayload = {
        order_type: 'bulk',
        artwork_id: null,
        customer_name: formData.customerName.trim(),
        customer_email: formData.customerEmail.trim().toLowerCase(),
        customer_phone: formData.customerPhone.replace(/\D/g, ''),
        delivery_address: null,
        order_details: {
          orgName: formData.orgName.trim(),
          itemType: formData.itemType,
          quantity: parseInt(formData.quantity),
          details: formData.details.trim(),
          deadline: formData.deadline || 'Flexible',
          budget: formData.budget || 'To be discussed'
        }
      }

      console.log('📤 Submitting bulk order:', orderPayload)

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
        orgName: '',
        itemType: '',
        quantity: '',
        deadline: '',
        budget: '',
        details: ''
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
        <h1>Bulk Orders</h1>
        <p>Perfect for colleges, institutions, events, and organizations</p>
      </div>

      <div className="info-section">
        <h2>Why Choose Us for Bulk Orders?</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
          
          <div style={{ background: '#f9f7f5', padding: '2rem', borderRadius: '12px', border: '2px solid #e8ddd0', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💰</div>
            <h3>Special Pricing</h3>
            <p>Competitive rates for large quantity orders</p>
          </div>

          <div style={{ background: '#f9f7f5', padding: '2rem', borderRadius: '12px', border: '2px solid #e8ddd0', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✨</div>
            <h3>Consistent Quality</h3>
            <p>Uniform quality across all pieces in your order</p>
          </div>

          <div style={{ background: '#f9f7f5', padding: '2rem', borderRadius: '12px', border: '2px solid #e8ddd0', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏰</div>
            <h3>Timely Delivery</h3>
            <p>We work with your deadlines and event schedules</p>
          </div>
        </div>

        <form onSubmit={handleDatabaseOrder}>
          <h3 style={{ marginBottom: '1.5rem' }}> Request a Bulk Order Quote</h3>

          <div className="form-group">
            <label>Organization / Institution Name *</label>
            <input 
              type="text" 
              required 
              value={formData.orgName}
              onChange={(e) => setFormData({...formData, orgName: e.target.value})}
              placeholder="e.g., ABC College, XYZ Company"
              disabled={submitting}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            <div className="form-group">
              <label>Item Type *</label>
              <select 
                required
                value={formData.itemType}
                onChange={(e) => setFormData({...formData, itemType: e.target.value})}
                disabled={submitting}
              >
                <option value="">Select item type</option>
                <option value="Canvas Paintings">Canvas Paintings</option>
                <option value="Posters">Art Posters</option>
                <option value="Greeting Cards">Greeting Cards</option>
                <option value="Certificates">Certificates</option>
                <option value="Wall Murals">Wall Murals</option>
                <option value="Event Decorations">Event Decorations</option>
                <option value="Trophies/Awards">Trophies/Awards</option>
                <option value="Custom Merchandise">Custom Merchandise</option>
                <option value="Other">Other (Please specify in details)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Quantity *</label>
              <input 
                type="number" 
                required 
                min="2"
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                placeholder="Minimum 2 pieces"
                disabled={submitting}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Project Details *</label>
            <textarea 
              required
              rows="5"
              value={formData.details}
              onChange={(e) => setFormData({...formData, details: e.target.value})}
              placeholder="Please describe: design requirements, colors, sizes, themes, or any specific needs..."
              disabled={submitting}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            <div className="form-group">
              <label>Deadline / Event Date</label>
              <input 
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label>Budget Range (Optional)</label>
              <input 
                type="text"
                value={formData.budget}
                onChange={(e) => setFormData({...formData, budget: e.target.value})}
                placeholder="e.g., Rs 50,000 - 75,000"
                disabled={submitting}
              />
            </div>
          </div>

          <h4 style={{ margin: '2rem 0 1rem' }}>Contact Person Details</h4>

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

          {submitError && (
            <div style={{ marginBottom: '1rem', padding: '1rem', borderRadius: '8px', background: '#fee2e2', color: '#991b1b', border: '2px solid #ef4444' }}>
              <strong>❌ Error:</strong> {submitError}
            </div>
          )}

          {submitSuccess && (
            <div style={{ marginBottom: '1rem', padding: '1rem', borderRadius: '8px', background: '#d1fae5', color: '#065f46', border: '2px solid #10b981' }}>
              <strong>✅ Success!</strong> Your bulk order has been placed! We'll contact you soon with a quote.
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
            💬 Send Request via WhatsApp
          </button>

          <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666', textAlign: 'center' }}>
             💬 WhatsApp for fastest response
          </p>
        </form>

        <div style={{ background: '#e3f2fd', padding: '2rem', borderRadius: '12px', marginTop: '3rem', border: '2px solid #2196f3' }}>
          <h3 style={{ textAlign: 'center' }}>📋 Bulk Order Information</h3>
          <ul style={{ lineHeight: '1.8', marginLeft: '1.5rem' }}>
            <li><strong>Minimum Order:</strong> 2 pieces (varies by item type)</li>
            <li><strong>Pricing:</strong> Special discounts based on quantity and complexity</li>
            <li><strong>Timeline:</strong> Typically 2-4 weeks depending on order size</li>
            <li><strong>Payment:</strong> 50% advance, 50% after completion</li>
            <li><strong>Customization:</strong> Full customization available</li>
            <li><strong>Delivery:</strong> We can arrange delivery for large orders</li>
            <li><strong>Previous Clients:</strong> Colleges, corporate offices, wedding planners, event organizers</li>
          </ul>
        </div>

        <div style={{ background: '#fff3e0', padding: '2rem', borderRadius: '12px', marginTop: '2rem', border: '2px solid #ff9800' }}>
          <h3 style={{ textAlign: 'center' }}>🎯 Popular Bulk Order Items</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
            <div>
              <h4>🏫 Educational Institutions</h4>
              <p>Certificates, wall art, competition trophies, event decorations</p>
            </div>
            <div>
              <h4>💼 Corporate</h4>
              <p>Office wall art, awards, greeting cards, branded merchandise</p>
            </div>
            <div>
              <h4>💒 Events & Weddings</h4>
              <p>Invitations, decorations, signage, party favors</p>
            </div>
            <div>
              <h4>🎪 Festivals & Fairs</h4>
              <p>Posters, banners, stall decorations, promotional items</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BulkOrder