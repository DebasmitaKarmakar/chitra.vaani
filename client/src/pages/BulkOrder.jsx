import { useState } from 'react'

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER

function BulkOrder() {
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    orgName: '',
    itemType: '',
    quantity: '',
    deadline: '',
    budget: '',
    details: ''
  })

  const handleWhatsAppOrder = (e) => {
    e.preventDefault()
    
    if (!formData.customerName || !formData.customerPhone || !formData.orgName || !formData.itemType || !formData.quantity) {
      alert(' Please fill: Name, Phone, Organization, Item Type, and Quantity first');
      return;
    }

    const message = `Hi! I'd like a *Bulk Order*\n\n*Organization:* ${formData.orgName}\n*Item Type:* ${formData.itemType}\n*Quantity:* ${formData.quantity}\n\n*Details:*\n${formData.details || 'Will discuss'}\n\n*Timeline & Budget:*\nDeadline: ${formData.deadline || 'Flexible'}\nBudget: ${formData.budget || 'Please quote'}\n\n*Contact Person:*\nName: ${formData.customerName}\nPhone: ${formData.customerPhone}`
    
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank')
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
          
          {/* Box 1 */}
          <div style={{ 
            background: '#f9f7f5', 
            padding: '2rem', 
            borderRadius: '12px',
            border: '2px solid #e8ddd0',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}></div>
            <h3>Special Pricing</h3>
            <p>Competitive rates for large quantity orders</p>
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
            <h3>Consistent Quality</h3>
            <p>Uniform quality across all pieces in your order</p>
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
            <h3>Timely Delivery</h3>
            <p>We work with your deadlines and event schedules</p>
          </div>

        </div>

        <form onSubmit={handleWhatsAppOrder}>
          <h3 style={{ marginBottom: '1.5rem' }}> Request a Bulk Order Quote</h3>

          <div className="form-group">
            <label>Organization / Institution Name *</label>
            <input 
              type="text" 
              required 
              value={formData.orgName}
              onChange={(e) => setFormData({...formData, orgName: e.target.value})}
              placeholder="e.g., ABC College, XYZ Company"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            <div className="form-group">
              <label>Item Type *</label>
              <select 
                required
                value={formData.itemType}
                onChange={(e) => setFormData({...formData, itemType: e.target.value})}
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
                placeholder="Minimum 10 pieces"
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
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            <div className="form-group">
              <label>Deadline / Event Date</label>
              <input 
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({...formData, deadline: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Budget Range (Optional)</label>
              <input 
                type="text"
                value={formData.budget}
                onChange={(e) => setFormData({...formData, budget: e.target.value})}
                placeholder="e.g., Rs 50,000 - 75,000"
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
             Click to send your bulk order request directly via WhatsApp for fastest response
          </p>
        </form>

        <div style={{ background: '#e3f2fd', padding: '2rem', borderRadius: '12px', marginTop: '3rem', border: '2px solid #2196f3' }}>
          <centre><h3> Bulk Order Information</h3></centre>
          <ul style={{ lineHeight: '1.8', marginLeft: '1.5rem' }}>
            <li><strong>Minimum Order:</strong> 2 pieces (varies by item type)</li>
            <li><strong>Pricing:</strong> Special discounts based on quantity and complexity</li>
            <li><strong>Timeline:</strong> Typically 2-4 weeks depending on order size</li>
            <li><strong>Payment:</strong> 50% advance, 50% after completion of artwork </li>
            <li><strong>Customization:</strong> Full customization available for all bulk orders</li>
            <li><strong>Delivery:</strong> We can arrange delivery for large orders</li>
            <li><strong>Previous Clients:</strong> Colleges, corporate offices, wedding planners, event organizers</li>
          </ul>
        </div>

        <div style={{ background: '#fff3e0', padding: '2rem', borderRadius: '12px', marginTop: '2rem', border: '2px solid #ff9800' }}>
          <centre><h3> Popular Bulk Order Items</h3></centre>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
            <div>
              <h4> Educational Institutions</h4>
              <p>Certificates, wall art, competition trophies, event decorations</p>
            </div>
            <div>
              <h4> Corporate</h4>
              <p>Office wall art, awards, greeting cards, branded merchandise</p>
            </div>
            <div>
              <h4> Events & Weddings</h4>
              <p>Invitations, decorations, signage, party favors</p>
            </div>
            <div>
              <h4> Festivals & Fairs</h4>
              <p>Posters, banners, stall decorations, promotional items</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BulkOrder