import { useState } from 'react'

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER

function CustomOrder() {
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    deliveryAddress: '',
    idea: '',
    medium: '',
    size: '',
    deadline: '',
    budget: ''
  })

  const handleWhatsAppOrder = (e) => {
    e.preventDefault()
    
    if (!formData.customerName || !formData.customerPhone || !formData.idea) {
      alert(' Please fill: Name, Phone, and Your Idea first');
      return;
    }

    const message = `Hi! I'd like a *Custom Artwork*\n\n*My Idea:*\n${formData.idea}\n\n*Details:*\nMedium: ${formData.medium || 'Any'}\nSize: ${formData.size || 'Flexible'}\nDeadline: ${formData.deadline || 'Flexible'}\nBudget: ${formData.budget || 'Flexible'}\n\n*My Details:*\nName: ${formData.customerName}\nPhone: ${formData.customerPhone}\nAddress: ${formData.deliveryAddress || 'Will provide later'}`
    
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank')
  }

  return (
    <div className="container fade-in">
      <div className="hero">
        <h1>Custom Art Orders</h1>
        <p>Have a unique vision? Let's create something special together!</p>
      </div>

      <div className="info-section">
        <h2>How It Works</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
          
          {/* Box 1 */}
          <div style={{ 
            background: '#f9f7f5', 
            padding: '2rem', 
            borderRadius: '12px',
            border: '2px solid #e8ddd0',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}></div>
            <h3>Share Your Idea</h3>
            <p>Tell us what you envision - theme, colors, style, or any inspiration</p>
          </div>

          {/* Box 2 */}
          <div style={{ 
            background: '#f9f7f5', 
            padding: '2rem', 
            borderRadius: '12px',
            border: '2px solid #e8ddd0',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}></div>
            <h3>We Create</h3>
            <p>Our artist will bring your vision to life with personalized artwork</p>
          </div>

          {/* Box 3 */}
          <div style={{ 
            background: '#f9f7f5', 
            padding: '2rem', 
            borderRadius: '12px',
            border: '2px solid #e8ddd0',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}></div>
            <h3>Safe Delivery</h3>
            <p>Receive your unique masterpiece with secure packaging</p>
          </div>

        </div>

        <form onSubmit={handleWhatsAppOrder}>
          <h3 style={{ marginBottom: '1.5rem' }}> Request Your Custom Artwork</h3>

          <div className="form-group">
            <label>Your Idea / Vision * <span style={{ fontSize: '0.9rem', color: '#666' }}>(What do you want created?)</span></label>
            <textarea 
              required 
              rows="5"
              value={formData.idea}
              onChange={(e) => setFormData({...formData, idea: e.target.value})}
              placeholder="Describe your vision: theme, colors, mood, inspiration, or reference images you have in mind..."
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            <div className="form-group">
              <label>Preferred Medium</label>
              <select value={formData.medium} onChange={(e) => setFormData({...formData, medium: e.target.value})}>
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
              />
            </div>

            <div className="form-group">
              <label>Budget Range</label>
              <input 
                type="text"
                value={formData.budget}
                onChange={(e) => setFormData({...formData, budget: e.target.value})}
                placeholder="e.g., Rs 3,000 - 5,000 or Flexible"
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
            />
          </div>

          <div className="form-group">
            <label>Phone *</label>
            <input 
              type="tel" 
              required 
              value={formData.customerPhone}
              onChange={(e) => setFormData({...formData, customerPhone: e.target.value})}
              placeholder="Your phone number"
            />
          </div>

          <div className="form-group">
            <label>Delivery Address</label>
            <textarea 
              rows="3"
              value={formData.deliveryAddress}
              onChange={(e) => setFormData({...formData, deliveryAddress: e.target.value})}
              placeholder="Your delivery address (can provide later)"
            />
          </div>

          {/*  WhatsApp ONLY Button */}
          <button 
            type="submit"
            className="btn" 
            style={{ 
              background: '#25D366', 
              fontSize: '1.2rem', 
              padding: '1.2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              width: '100%',
              marginTop: '2rem'
            }}
          >
             Send Request via WhatsApp
          </button>

          <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666', textAlign: 'center' }}>
             Click to send your custom order request directly via WhatsApp. You can share reference images there too!
          </p>
        </form>

        <div style={{ background: '#fff3cd', padding: '2rem', borderRadius: '12px', marginTop: '3rem', border: '2px solid #ffc107' }}>
          <centre><h3> Custom Order Tips</h3></centre>
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