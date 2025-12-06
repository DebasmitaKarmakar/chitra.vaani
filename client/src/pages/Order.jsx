import { useState } from 'react'
import '../assets/styles.css';

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

// ADD THIS FIXED FUNCTION
const switchOrderType = (type) => {
  setOrderType(type);
  setErrors({});
};

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

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validateForm()) return;

  // Build the WhatsApp message FIRST
  const message = orderType === 'custom'
    ? `Hi! I'd like a Custom Artwork

My Idea:
${formData.idea}

Details:
Medium: ${formData.medium || 'Any'}
Size: ${formData.size || 'Flexible'}
Deadline: ${formData.deadline || 'Flexible'}
Budget: ${formData.budget || 'Flexible'}

My Details:
Name: ${formData.customerName}
Phone: ${formData.customerPhone}
Email: ${formData.customerEmail}
Address: ${formData.deliveryAddress || 'Will provide later'}`
    : `Hi! I'd like a Bulk Order

Organization: ${formData.orgName}
Item Type: ${formData.itemType}
Quantity: ${formData.quantity}

Details:
${formData.details}

Timeline & Budget:
Deadline: ${formData.deadline || 'Flexible'}
Budget: ${formData.budget || 'Please quote'}

Contact Person:
Name: ${formData.customerName}
Phone: ${formData.customerPhone}
Email: ${formData.customerEmail}`;

  // Prepare order payload for backend
  const payload = {
    order_type: orderType,
    customer_name: formData.customerName,
    customer_email: formData.customerEmail,
    customer_phone: formData.customerPhone,
    delivery_address: formData.deliveryAddress,
    order_details:
      orderType === "custom"
        ? { idea: formData.idea, medium: formData.medium, size: formData.size }
        : { orgName: formData.orgName, itemType: formData.itemType, quantity: formData.quantity, details: formData.details }
  };

  //  Try saving order in database BUT NEVER BLOCK WhatsApp redirect
  try {
    await fetch(`${API_URL}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    console.error("Order saving failed:", err);
    // Even if backend fails, WhatsApp must still open
  }

  //  ALWAYS open WhatsApp no matter what
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank");

  alert("Order placed! Redirecting to WhatsApp…");
};


  return (
    <div style={{ backgroundColor: '#f7f7f8' }}>

      {/*  Purple Gradient Hero Section */}
      <div className="container fade-in admin-page">
        <div className="hero" style={{ padding: '3rem 2rem 4rem' }}>
          <h1>Special Orders</h1>
          <p>Custom artwork or bulk orders for organizations</p>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="container info-section">


        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            marginBottom: '2rem'
          }}
        >
          <button
            onClick={() => switchOrderType('custom')}
            style={{
              padding: '1rem 2rem',
              fontSize: '1.1rem',
              borderRadius: '8px',
              border: orderType === 'custom' ? '3px solid #6a5acd' : '2px solid #ccc',
              background: orderType === 'custom' ? '#f3f0ff' : 'white',
              cursor: 'pointer',
              fontWeight: 600,
              transition: '0.3s'
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
              border: orderType === 'bulk' ? '3px solid #6a5acd' : '2px solid #ccc',
              background: orderType === 'bulk' ? '#f3f0ff' : 'white',
              cursor: 'pointer',
              fontWeight: 600,
              transition: '0.3s'
            }}
          >
            Bulk Orders
          </button>
        </div>

        {/* Form Section */}
        <div>

          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.6rem', fontWeight: 700 }}>
            {orderType === 'custom'
              ? 'Request Your Custom Artwork'
              : 'Request a Bulk Order Quote'}
          </h3>

          {orderType === 'custom' && (
            <>
              <div className="form-group">
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

{orderType === "bulk" && (
  <>
    <div className="form-group">
      <label>Organization / Institution Name *</label>
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
      {errors.orgName && <span style={{ color: '#ef4444' }}>{errors.orgName}</span>}
    </div>

    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '1.5rem',
      marginBottom: '1.5rem'
    }}>
      <div>
        <label>Item Type *</label>
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
          <option value="Posters">Art Posters</option>                    <option value="Greeting Cards">Greeting Cards</option>
          <option value="Certificates">Certificates</option>
          <option value="Wall Murals">Wall Murals</option>
          <option value="Event Decorations">Event Decorations</option>
          <option value="Trophies/Awards">Trophies/Awards</option>
          <option value="Custom Merchandise">Custom Merchandise</option>
          <option value="Other">Other</option>
          </select>
        {errors.itemType && <span style={{ color: '#ef4444' }}>{errors.itemType}</span>}
      </div>

      <div>
        <label>Quantity *</label>
        <input
          type="number"
          name="quantity"
          value={formData.quantity}
          onChange={handleChange}
          placeholder="Minimum 2"
          style={{
            width: '100%',
            padding: '0.75rem',
            borderRadius: '6px',
            border: `2px solid ${errors.quantity ? '#ef4444' : '#ddd'}`,
            fontSize: '1rem'
          }}
        />
        {errors.quantity && <span style={{ color: '#ef4444' }}>{errors.quantity}</span>}
      </div>
    </div>

    <div className="form-group">
      <label>Project Details *</label>
      <textarea
        name="details"
        rows="4"
        value={formData.details}
        onChange={handleChange}
        placeholder="Describe what you need in at least 20 characters"
        style={{
          width: '100%',
          padding: '0.75rem',
          borderRadius: '6px',
          border: `2px solid ${errors.details ? '#ef4444' : '#ddd'}`,
          fontSize: '1rem'
        }}
      />
      {errors.details && <span style={{ color: '#ef4444' }}>{errors.details}</span>}
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

          <div className="form-group">

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

          <div className="form-group">

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

          <div className="form-group">

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
            <div className="form-group">

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
            className="btn btn-whatsapp"
            style={{
              width: '100%',
              padding: '1.3rem',
              fontSize: '1.2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.8rem',
              marginTop: '1rem',
              background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
              boxShadow: '0 6px 30px rgba(37, 211, 102, 0.4)'
            }}
          >
            Send via WhatsApp
          </button>

          <p style={{ 
            marginTop: '1rem', 
            fontSize: '0.95rem', 
            color: '#666', 
            textAlign: 'center',
            borderTop: '1px solid #E5E7EB',
            paddingTop: '1rem'
          }}>
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