import { useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'https://chitravaani-api.vercel.app/api'
const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '1234567890'

function Order() {
  const [orderType, setOrderType] = useState('custom')
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    deliveryAddress: '',
    idea: '',
    medium: '',
    size: '',
    deadline: '',
    budget: '',
    orgName: '',
    itemType: '',
    quantity: '',
    details: ''
  })

  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const newErrors = {}

    if (!formData.customerName || formData.customerName.trim().length < 2) {
      newErrors.customerName = 'Name must be at least 2 characters'
    }

    if (!formData.customerEmail || !formData.customerEmail.includes('@')) {
      newErrors.customerEmail = 'Please enter a valid email address'
    }

    const cleanPhone = formData.customerPhone.replace(/\D/g, '')
    if (!formData.customerPhone || cleanPhone.length !== 10) {
      newErrors.customerPhone = 'Phone number must be exactly 10 digits'
    }

    if (orderType === 'custom') {
      if (!formData.idea || formData.idea.trim().length < 20) {
        newErrors.idea = 'Please describe your idea in at least 20 characters'
      }
    }

    if (orderType === 'bulk') {
      if (!formData.orgName || formData.orgName.trim().length < 3) {
        newErrors.orgName = 'Organization name must be at least 3 characters'
      }
      if (!formData.itemType) {
        newErrors.itemType = 'Please select an item type'
      }
      if (!formData.quantity || parseInt(formData.quantity) < 2) {
        newErrors.quantity = 'Quantity must be at least 2'
      }
      if (!formData.details || formData.details.trim().length < 20) {
        newErrors.details = 'Please provide project details (at least 20 characters)'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    let message = ''
    
    if (orderType === 'custom') {
      message = `Hi! I'd like a Custom Artwork\n\nMy Idea:\n${formData.idea}\n\nDetails:\nMedium: ${formData.medium || 'Any'}\nSize: ${formData.size || 'Flexible'}\nDeadline: ${formData.deadline || 'Flexible'}\nBudget: ${formData.budget || 'Flexible'}\n\nMy Details:\nName: ${formData.customerName}\nPhone: ${formData.customerPhone}\nEmail: ${formData.customerEmail}\nAddress: ${formData.deliveryAddress || 'Will provide later'}`
    } else {
      message = `Hi! I'd like a Bulk Order\n\nOrganization: ${formData.orgName}\nItem Type: ${formData.itemType}\nQuantity: ${formData.quantity}\n\nDetails:\n${formData.details}\n\nTimeline & Budget:\nDeadline: ${formData.deadline || 'Flexible'}\nBudget: ${formData.budget || 'Please quote'}\n\nContact Person:\nName: ${formData.customerName}\nPhone: ${formData.customerPhone}\nEmail: ${formData.customerEmail}`
    }
    
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank')
  }

  const switchOrderType = (type) => {
    setOrderType(type)
    setErrors({})
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Special Orders</h1>
        <p style={{ fontSize: '1.2rem', color: '#666' }}>Custom artwork or bulk orders for organizations</p>
      </div>

      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        marginBottom: '3rem', 
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={() => switchOrderType('custom')}
          style={{
            padding: '1rem 2rem',
            fontSize: '1.1rem',
            borderRadius: '8px',
            border: orderType === 'custom' ? '3px solid #8b7355' : '2px solid #ddd',
            background: orderType === 'custom' ? '#f9f7f5' : 'white',
            cursor: 'pointer',
            fontWeight: orderType === 'custom' ? 600 : 400,
            transition: 'all 0.3s ease'
          }}
        >
          Custom Artwork
        </button>
        <button
          onClick={() => switchOrderType('bulk')}
          style={{
            padding: '1rem 2rem',
            fontSize: '1.1rem',
            borderRadius: '8px',
            border: orderType === 'bulk' ? '3px solid #8b7355' : '2px solid #ddd',
            background: orderType === 'bulk' ? '#f9f7f5' : 'white',
            cursor: 'pointer',
            fontWeight: orderType === 'bulk' ? 600 : 400,
            transition: 'all 0.3s ease'
          }}
        >
          Bulk Orders
        </button>
      </div>

      <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '2rem', 
          marginBottom: '3rem' 
        }}>
          {orderType === 'custom' ? (
            <>
              <div style={{ background: '#f9f7f5', padding: '2rem', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>💡</div>
                <h3>Share Your Idea</h3>
                <p>Tell us your vision</p>
              </div>
              <div style={{ background: '#f9f7f5', padding: '2rem', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🎨</div>
                <h3>We Create</h3>
                <p>Personalized artwork</p>
              </div>
              <div style={{ background: '#f9f7f5', padding: '2rem', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📦</div>
                <h3>Safe Delivery</h3>
                <p>Secure packaging</p>
              </div>
            </>
          ) : (
            <>
              <div style={{ background: '#f9f7f5', padding: '2rem', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>💰</div>
                <h3>Special Pricing</h3>
                <p>Competitive rates</p>
              </div>
              <div style={{ background: '#f9f7f5', padding: '2rem', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>✨</div>
                <h3>Consistent Quality</h3>
                <p>Uniform excellence</p>
              </div>
              <div style={{ background: '#f9f7f5', padding: '2rem', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⏰</div>
                <h3>Timely Delivery</h3>
                <p>Meet your deadlines</p>
              </div>
            </>
          )}
        </div>

        <div onSubmit={handleSubmit}>
          <h3 style={{ marginBottom: '1.5rem' }}>
            {orderType === 'custom' ? 'Request Your Custom Artwork' : 'Request a Bulk Order Quote'}
          </h3>

          {orderType === 'custom' && (
            <>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                  Your Idea / Vision *
                </label>
                <textarea
                  name="idea"
                  rows="5"
                  value={formData.idea}
                  onChange={handleChange}
                  placeholder="Describe your vision: theme, colors, mood, inspiration..."
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    border: `2px solid ${errors.idea ? '#ef4444' : '#ddd'}`,
                    fontSize: '1rem'
                  }}
                />
                {errors.idea && <span style={{ color: '#ef4444', fontSize: '0.9rem' }}>{errors.idea}</span>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                    Preferred Medium
                  </label>
                  <select
                    name="medium"
                    value={formData.medium}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '2px solid #ddd', fontSize: '1rem' }}
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

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                    Preferred Size
                  </label>
                  <input
                    type="text"
                    name="size"
                    value={formData.size}
                    onChange={handleChange}
                    placeholder="e.g., 18x24 inches or Flexible"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '2px solid #ddd', fontSize: '1rem' }}
                  />
                </div>
              </div>
            </>
          )}

          {orderType === 'bulk' && (
            <>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                  Organization / Institution Name *
                </label>
                <input
                  type="text"
                  name="orgName"
                  value={formData.orgName}
                  onChange={handleChange}
                  placeholder="e.g., ABC College, XYZ Company"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    border: `2px solid ${errors.orgName ? '#ef4444' : '#ddd'}`,
                    fontSize: '1rem'
                  }}
                />
                {errors.orgName && <span style={{ color: '#ef4444', fontSize: '0.9rem' }}>{errors.orgName}</span>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                    Item Type *
                  </label>
                  <select
                    name="itemType"
                    value={formData.itemType}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '6px',
                      border: `2px solid ${errors.itemType ? '#ef4444' : '#ddd'}`,
                      fontSize: '1rem'
                    }}
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
                    <option value="Other">Other</option>
                  </select>
                  {errors.itemType && <span style={{ color: '#ef4444', fontSize: '0.9rem' }}>{errors.itemType}</span>}
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                    Quantity *
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    min="2"
                    value={formData.quantity}
                    onChange={handleChange}
                    placeholder="Minimum 2 pieces"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '6px',
                      border: `2px solid ${errors.quantity ? '#ef4444' : '#ddd'}`,
                      fontSize: '1rem'
                    }}
                  />
                  {errors.quantity && <span style={{ color: '#ef4444', fontSize: '0.9rem' }}>{errors.quantity}</span>}
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                  Project Details *
                </label>
                <textarea
                  name="details"
                  rows="5"
                  value={formData.details}
                  onChange={handleChange}
                  placeholder="Please describe: design requirements, colors, sizes, themes..."
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    border: `2px solid ${errors.details ? '#ef4444' : '#ddd'}`,
                    fontSize: '1rem'
                  }}
                />
                {errors.details && <span style={{ color: '#ef4444', fontSize: '0.9rem' }}>{errors.details}</span>}
              </div>
            </>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                Deadline / Event Date
              </label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '2px solid #ddd', fontSize: '1rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                Budget Range (Optional)
              </label>
              <input
                type="text"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                placeholder="e.g., Rs 50,000 - 75,000"
                style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '2px solid #ddd', fontSize: '1rem' }}
              />
            </div>
          </div>

          <h4 style={{ margin: '2rem 0 1rem' }}>Your Details</h4>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Name *</label>
            <input
              type="text"
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
              placeholder="Your full name"
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '6px',
                border: `2px solid ${errors.customerName ? '#ef4444' : '#ddd'}`,
                fontSize: '1rem'
              }}
            />
            {errors.customerName && <span style={{ color: '#ef4444', fontSize: '0.9rem' }}>{errors.customerName}</span>}
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Email *</label>
            <input
              type="email"
              name="customerEmail"
              value={formData.customerEmail}
              onChange={handleChange}
              placeholder="your.email@example.com"
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '6px',
                border: `2px solid ${errors.customerEmail ? '#ef4444' : '#ddd'}`,
                fontSize: '1rem'
              }}
            />
            {errors.customerEmail && <span style={{ color: '#ef4444', fontSize: '0.9rem' }}>{errors.customerEmail}</span>}
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Phone *</label>
            <input
              type="tel"
              name="customerPhone"
              value={formData.customerPhone}
              onChange={handleChange}
              placeholder="10-digit phone number"
              maxLength="10"
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '6px',
                border: `2px solid ${errors.customerPhone ? '#ef4444' : '#ddd'}`,
                fontSize: '1rem'
              }}
            />
            {errors.customerPhone && <span style={{ color: '#ef4444', fontSize: '0.9rem' }}>{errors.customerPhone}</span>}
          </div>

          {orderType === 'custom' && (
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                Delivery Address (Optional)
              </label>
              <textarea
                name="deliveryAddress"
                rows="3"
                value={formData.deliveryAddress}
                onChange={handleChange}
                placeholder="Your delivery address (can provide later)"
                style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '2px solid #ddd', fontSize: '1rem' }}
              />
            </div>
          )}

          <button
            onClick={handleSubmit}
            style={{
              width: '100%',
              background: '#25D366',
              color: 'white',
              fontSize: '1.2rem',
              padding: '1.2rem',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Send via WhatsApp
          </button>

          <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666', textAlign: 'center' }}>
            Click to open WhatsApp with your order details pre-filled
          </p>
         </div>
        

        {/* Information Box */}
        <div style={{
          background: orderType === 'custom' ? '#fff3cd' : '#e3f2fd',
          padding: '2rem',
          borderRadius: '12px',
          marginTop: '3rem',
          border: `2px solid ${orderType === 'custom' ? '#ffc107' : '#2196f3'}`
        }}>
          <h3 style={{ textAlign: 'center', marginBottom: '1rem' }}>
            {orderType === 'custom' ? 'Custom Order Tips' : 'Bulk Order Information'}
          </h3>
          <ul style={{ lineHeight: '1.8', marginLeft: '1.5rem' }}>
            {orderType === 'custom' ? (
              <>
                <li>Be as detailed as possible about your vision</li>
                <li>Share reference images via WhatsApp for better clarity</li>
                <li>Custom pieces typically take 1-3 weeks depending on complexity</li>
                <li>Pricing varies based on size, medium, and detail level</li>
                <li>We'll discuss all details before starting your piece</li>
                <li>50% advance payment may be required for custom orders</li>
              </>
            ) : (
              <>
                <li><strong>Minimum Order:</strong> 2 pieces (varies by item type)</li>
                <li><strong>Pricing:</strong> Special discounts based on quantity and complexity</li>
                <li><strong>Timeline:</strong> Typically 2-4 weeks depending on order size</li>
                <li><strong>Payment:</strong> 50% advance, 50% after completion</li>
                <li><strong>Customization:</strong> Full customization available</li>
                <li><strong>Delivery:</strong> We can arrange delivery for large orders</li>
                <li><strong>Previous Clients:</strong> Colleges, corporate offices, wedding planners, event organizers</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Order