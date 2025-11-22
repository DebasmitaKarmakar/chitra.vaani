import { useState, useEffect } from 'react'
import { GoogleLogin } from '@react-oauth/google'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'https://chitravaani-api.vercel.app/api'

function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loginData, setLoginData] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [token, setToken] = useState(null)
  const [activeTab, setActiveTab] = useState('dashboard')
  
  const [artworks, setArtworks] = useState([])
  const [categories, setCategories] = useState([])
  const [orders, setOrders] = useState([])
  const [orderStats, setOrderStats] = useState({})
  const [dashboardStats, setDashboardStats] = useState(null)
  
  // FEEDBACK STATE
  const [feedback, setFeedback] = useState([])
  const [feedbackStats, setFeedbackStats] = useState({})
  const [feedbackFilter, setFeedbackFilter] = useState('all')
  
  const [newArtwork, setNewArtwork] = useState({
    title: '',
    description: '',
    category: '',
    medium: '',
    dimensions: '',
    year: '',
    price: ''
  })
  const [selectedFiles, setSelectedFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [newCategory, setNewCategory] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    const savedToken = localStorage.getItem('adminToken')
    if (savedToken) {
      axios.get(`${API_URL}/admin/verify`, {
        headers: { Authorization: `Bearer ${savedToken}` }
      })
      .then(() => {
        setToken(savedToken)
        setIsLoggedIn(true)
      })
      .catch(() => {
        localStorage.removeItem('adminToken')
        setIsLoggedIn(false)
      })
    }
  }, [])

  useEffect(() => {
    if (isLoggedIn && token) {
      loadDashboardData()
    }
  }, [activeTab, isLoggedIn, token])

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await axios.post(`${API_URL}/admin/login`, {
        username: loginData.username,
        password: loginData.password
      })

      const newToken = response.data.token
      localStorage.setItem('adminToken', newToken)
      setToken(newToken)
      setIsLoggedIn(true)
      alert('Login successful!')
    } catch (error) {
      console.error('Login error:', error)
      if (error.response) {
        setError(error.response.data.error || 'Login failed')
      } else if (error.request) {
        setError('Cannot connect to server. Check if backend is running.')
      } else {
        setError('An error occurred. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async (credentialResponse) => {
    setError('')
    setLoading(true)

    try {
      const response = await axios.post(`${API_URL}/admin/google-login`, {
        credential: credentialResponse.credential
      })

      const newToken = response.data.token
      localStorage.setItem('adminToken', newToken)
      setToken(newToken)
      setIsLoggedIn(true)
      alert('Google login successful!')
    } catch (error) {
      console.error('Google login error:', error)
      if (error.response?.status === 403) {
        setError('Access denied. Your Google account is not authorized as an admin.')
      } else if (error.response) {
        setError(error.response.data.error || 'Google login failed')
      } else if (error.request) {
        setError('Cannot connect to server. Check if backend is running.')
      } else {
        setError('An error occurred. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    setToken(null)
    setIsLoggedIn(false)
    setLoginData({ username: '', password: '' })
  }

  const loadDashboardData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` }

      if (activeTab === 'artworks') {
        const [artworksRes, categoriesRes] = await Promise.all([
          axios.get(`${API_URL}/artworks`),
          axios.get(`${API_URL}/categories`)
        ])
        setArtworks(artworksRes.data)
        setCategories(categoriesRes.data)
      }

      if (activeTab === 'categories') {
        const response = await axios.get(`${API_URL}/categories`)
        setCategories(response.data)
      }

      if (activeTab === 'orders') {
        const [ordersRes, statsRes] = await Promise.all([
          axios.get(`${API_URL}/orders`, { headers }),
          axios.get(`${API_URL}/orders/stats/summary`, { headers })
        ])
        setOrders(ordersRes.data)
        setOrderStats(statsRes.data)
      }

      // LOAD FEEDBACK DATA
      if (activeTab === 'feedback') {
        try {
          const [feedbackRes, statsRes] = await Promise.all([
            axios.get(`${API_URL}/feedback`, { headers }),
            axios.get(`${API_URL}/feedback/stats/summary`, { headers })
          ])
          setFeedback(feedbackRes.data)
          setFeedbackStats(statsRes.data)
        } catch (err) {
          console.error('Error loading feedback:', err)
          setFeedback([])
          setFeedbackStats({})
        }
      }

      if (activeTab === 'dashboard') {
        const response = await axios.get(`${API_URL}/admin/dashboard/stats`, { headers })
        setDashboardStats(response.data)
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    }
  }

  const handleFileSelect = (e) => {
    setSelectedFiles(Array.from(e.target.files))
  }

  const handleAddArtwork = async (e) => {
    e.preventDefault()

    if (selectedFiles.length === 0) {
      alert('Please upload at least one photo!')
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('title', newArtwork.title)
      formData.append('description', newArtwork.description)
      formData.append('category', newArtwork.category)
      formData.append('medium', newArtwork.medium)
      formData.append('dimensions', newArtwork.dimensions)
      formData.append('year', newArtwork.year)
      formData.append('price', newArtwork.price)

      selectedFiles.forEach((file, index) => {
        formData.append('photos', file)
        formData.append(`label_${index}`, `Photo ${index + 1}`)
      })

      await axios.post(`${API_URL}/artworks`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      })

      alert('Artwork added successfully!')
      setNewArtwork({
        title: '',
        description: '',
        category: '',
        medium: '',
        dimensions: '',
        year: '',
        price: ''
      })
      setSelectedFiles([])
      document.getElementById('artworkImages').value = ''
      loadDashboardData()
    } catch (error) {
      console.error('Error adding artwork:', error)
      alert('Failed to add artwork: ' + (error.response?.data?.error || error.message))
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteArtwork = async (id) => {
    if (!window.confirm('Delete this artwork? This cannot be undone!')) return

    try {
      await axios.delete(`${API_URL}/artworks/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      alert('Artwork deleted successfully!')
      loadDashboardData()
    } catch (error) {
      console.error('Error deleting artwork:', error)
      alert('Failed to delete artwork')
    }
  }

  const handleAddCategory = async (e) => {
    e.preventDefault()

    try {
      await axios.post(`${API_URL}/categories`, 
        { name: newCategory },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      alert('Category added successfully!')
      setNewCategory('')
      loadDashboardData()
    } catch (error) {
      console.error('Error adding category:', error)
      alert(error.response?.data?.error || 'Failed to add category')
    }
  }

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return

    try {
      await axios.delete(`${API_URL}/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      alert("Order deleted successfully!")
      loadDashboardData()
    } catch (error) {
      console.error("Error deleting order:", error)
      alert("Failed to delete order.")
    }
  }

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Delete this category?')) return

    try {
      await axios.delete(`${API_URL}/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      alert('Category deleted successfully!')
      loadDashboardData()
    } catch (error) {
      console.error('Error deleting category:', error)
      alert(error.response?.data?.error || 'Failed to delete category')
    }
  }

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.patch(`${API_URL}/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      alert('Order status updated!')
      loadDashboardData()
    } catch (error) {
      console.error('Error updating order status:', error)
      alert('Failed to update status')
    }
  }

  // FEEDBACK HANDLERS
  const handleUpdateFeedbackStatus = async (feedbackId, newStatus) => {
    try {
      await axios.patch(`${API_URL}/feedback/${feedbackId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      alert('Feedback status updated!')
      loadDashboardData()
    } catch (error) {
      console.error('Error updating feedback status:', error)
      alert('Failed to update status')
    }
  }

  const handleDeleteFeedback = async (feedbackId) => {
    if (!window.confirm("Are you sure you want to delete this feedback?")) return

    try {
      await axios.delete(`${API_URL}/feedback/${feedbackId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      alert("Feedback deleted successfully!")
      loadDashboardData()
    } catch (error) {
      console.error("Error deleting feedback:", error)
      alert("Failed to delete feedback.")
    }
  }

  const handleExportOrders = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/export/orders`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `orders_${Date.now()}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()

      alert('Orders exported successfully!')
    } catch (error) {
      console.error('Error exporting orders:', error)
      alert('Failed to export orders')
    }
  }

  const handleExportArtworks = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/export/artworks`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `artworks_${Date.now()}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()

      alert('Artworks exported successfully!')
    } catch (error) {
      console.error('Error exporting artworks:', error)
      alert('Failed to export artworks')
    }
  }

  const handleExportFeedback = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/export/feedback`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `feedback_${Date.now()}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()

      alert('Feedback exported successfully!')
    } catch (error) {
      console.error('Error exporting feedback:', error)
      alert('Failed to export feedback')
    }
  }

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(o => o.status === filterStatus)

  const filteredFeedback = feedbackFilter === 'all'
    ? feedback
    : feedback.filter(f => f.status === feedbackFilter)

  // LOGIN PAGE
  if (!isLoggedIn) {
    return (
      <div className="container fade-in admin-page">
        <div className="hero">
          <h1>Admin Login</h1>
          <p>Choose your preferred login method</p>
        </div>

        <div className="info-section" style={{ maxWidth: '500px', margin: '0 auto' }}>
          
          <div style={{ 
            background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)', 
            padding: '2rem', 
            borderRadius: '12px', 
            marginBottom: '2rem',
            textAlign: 'center'
          }}>
            <h3 style={{ marginBottom: '1rem', color: '#1976d2' }}>Quick Login with Google</h3>
            <p style={{ color: '#666', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
              Secure and fast authentication
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={() => {
                  setError('Google login failed. Please try again.')
                }}
                theme="filled_blue"
                size="large"
                text="signin_with"
                shape="rectangular"
              />
            </div>
          </div>

          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            margin: '2rem 0',
            gap: '1rem'
          }}>
            <div style={{ flex: 1, height: '1px', background: '#ddd' }}></div>
            <span style={{ color: '#666', fontWeight: 600 }}>OR</span>
            <div style={{ flex: 1, height: '1px', background: '#ddd' }}></div>
          </div>

          <div style={{ 
            background: '#f9f7f5', 
            padding: '2rem', 
            borderRadius: '12px'
          }}>
            <h3 style={{ marginBottom: '1.5rem', color: '#8b7355', textAlign: 'center' }}>
              Login with Username & Password
            </h3>
            
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label>Username</label>
                <input 
                  type="text" 
                  required 
                  value={loginData.username}
                  onChange={(e) => setLoginData({...loginData, username: e.target.value})}
                  placeholder="Enter your username"
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input 
                  type="password" 
                  required 
                  value={loginData.password}
                  onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                  placeholder="Enter your password"
                />
              </div>

              <button type="submit" className="btn" disabled={loading} style={{ width: '100%' }}>
                {loading ? 'Logging in...' : 'Login with Password'}
              </button>
            </form>
          </div>

          {error && (
            <div style={{ 
              marginTop: '1.5rem', 
              color: '#d32f2f', 
              background: '#ffebee', 
              padding: '1rem', 
              borderRadius: '8px',
              border: '1px solid #f44336'
            }}>
              <strong>Error:</strong> {error}
            </div>
          )}

          {loading && (
            <div style={{ 
              marginTop: '1.5rem', 
              color: '#1976d2', 
              background: '#e3f2fd', 
              padding: '1rem', 
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              Verifying credentials...
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="container fade-in admin-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Admin Dashboard</h1>
        <button className="btn btn-secondary" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid #e5e5e5', flexWrap: 'wrap' }}>
        {['dashboard', 'artworks', 'categories', 'orders', 'feedback', 'export'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '1rem 2rem',
              cursor: 'pointer',
              border: 'none',
              background: 'none',
              fontSize: '1.05rem',
              color: activeTab === tab ? '#8b7355' : '#666',
              borderBottom: activeTab === tab ? '3px solid #8b7355' : '3px solid transparent',
              fontWeight: activeTab === tab ? 600 : 400,
              fontFamily: 'inherit'
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'dashboard' && (
        <div className="info-section">
          <h2>Dashboard Overview</h2>
          {dashboardStats ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ background: '#e3f2fd', padding: '1.5rem', borderRadius: '12px', textAlign: 'center' }}>
                  <h3 style={{ fontSize: '2rem', margin: 0 }}>{dashboardStats.orders.total_orders}</h3>
                  <p>Total Orders</p>
                </div>
                <div style={{ background: '#fff3cd', padding: '1.5rem', borderRadius: '12px', textAlign: 'center' }}>
                  <h3 style={{ fontSize: '2rem', margin: 0 }}>{dashboardStats.orders.pending_orders}</h3>
                  <p>Pending Orders</p>
                </div>
                <div style={{ background: '#d4edda', padding: '1.5rem', borderRadius: '12px', textAlign: 'center' }}>
                  <h3 style={{ fontSize: '2rem', margin: 0 }}>{dashboardStats.orders.completed_orders}</h3>
                  <p>Completed Orders</p>
                </div>
                <div style={{ background: '#f8d7da', padding: '1.5rem', borderRadius: '12px', textAlign: 'center' }}>
                  <h3 style={{ fontSize: '2rem', margin: 0 }}>{dashboardStats.artworks.total_artworks}</h3>
                  <p>Total Artworks</p>
                </div>
              </div>

              <h3>Recent Orders</h3>
              {dashboardStats.recentOrders.length > 0 ? (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {dashboardStats.recentOrders.map(order => (
                    <div key={order.id} style={{ background: '#f9f7f5', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid #8b7355' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <strong>#{order.id} - {order.order_type.toUpperCase()}</strong>
                        <span style={{ 
                          padding: '0.3rem 0.8rem', 
                          borderRadius: '12px', 
                          fontSize: '0.85rem',
                          background: order.status === 'Completed' ? '#d4edda' : order.status === 'Pending' ? '#fff3cd' : '#f8d7da'
                        }}>
                          {order.status}
                        </span>
                      </div>
                      <p style={{ margin: '0.5rem 0', color: '#666' }}>
                        {order.customer_name} - {new Date(order.created_at).toLocaleDateString()}
                      </p>
                      {order.artwork_title && <p style={{ color: '#555' }}>Artwork: {order.artwork_title}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#666' }}>No recent orders</p>
              )}
            </>
          ) : (
            <div className="loading">Loading dashboard...</div>
          )}
        </div>
      )} 

      {activeTab === 'artworks' && (
        <div className="info-section">
          <h2>Manage Artworks</h2>
          
          <h3>Add New Artwork</h3>
          <form onSubmit={handleAddArtwork}>
            <div className="form-group">
              <label>Title *</label>
              <input 
                type="text" 
                required 
                value={newArtwork.title}
                onChange={(e) => setNewArtwork({...newArtwork, title: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Category *</label>
              <select 
                required 
                value={newArtwork.category}
                onChange={(e) => setNewArtwork({...newArtwork, category: e.target.value})}
              >
                <option value="">Select category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Price *</label>
              <input 
                type="text" 
                required 
                placeholder="Rs 2,500"
                value={newArtwork.price}
                onChange={(e) => setNewArtwork({...newArtwork, price: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea 
                rows="3"
                placeholder="Brief description of the artwork..."
                value={newArtwork.description}
                onChange={(e) => setNewArtwork({...newArtwork, description: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Medium/Materials</label>
              <input 
                type="text"
                placeholder="e.g., Acrylic on canvas, Watercolor"
                value={newArtwork.medium}
                onChange={(e) => setNewArtwork({...newArtwork, medium: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Dimensions</label>
              <input 
                type="text"
                placeholder="e.g., 18x24 inches, 45x60 cm"
                value={newArtwork.dimensions}
                onChange={(e) => setNewArtwork({...newArtwork, dimensions: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Year Created</label>
              <input 
                type="text"
                placeholder="e.g., 2024"
                value={newArtwork.year}
                onChange={(e) => setNewArtwork({...newArtwork, year: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Artwork Photos (Upload multiple) *</label>
              <input 
                type="file" 
                id="artworkImages"
                accept="image/*" 
                multiple 
                onChange={handleFileSelect}
                style={{ padding: '0.5rem' }}
              />
              {selectedFiles.length > 0 && (
                <p style={{ marginTop: '0.5rem', color: '#8b7355' }}>
                  {selectedFiles.length} file(s) selected
                </p>
              )}
            </div>

            <button type="submit" className="btn" disabled={uploading}>
              {uploading ? 'Uploading...' : 'Add Artwork'}
            </button>
          </form>

          <h3 style={{ marginTop: '3rem' }}>Existing Artworks</h3>
          {artworks.length > 0 ? (
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {artworks.map(art => {
                const photos = typeof art.photos === 'string' ? JSON.parse(art.photos) : art.photos
                return (
                  <div key={art.id} style={{ display: 'flex', gap: '1.5rem', padding: '1.5rem', background: '#f9f7f5', borderRadius: '12px', alignItems: 'center' }}>
                    <img 
                      src={photos[0]?.url} 
                      alt={art.title}
                      style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '8px' }}
                      onError={(e) => { e.target.src = 'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27120%27 height=%27120%27%3E%3Crect fill=%27%23e8ddd0%27 width=%27120%27 height=%27120%27/%3E%3C/svg%3E' }}
                    />
                    <div style={{ flex: 1 }}>
                      <h4>{art.title}</h4>
                      <p style={{ color: '#666', margin: '0.5rem 0' }}>
                        {art.category} - {art.price}
                      </p>
                      {art.medium && <p style={{ color: '#555', fontSize: '0.9rem' }}>{art.medium}</p>}
                      <p style={{ color: '#8b7355', fontSize: '0.9rem' }}>
                        {photos.length} photo{photos.length > 1 ? 's' : ''}
                      </p>
                    </div>
                    <button 
                      className="btn btn-danger" 
                      onClick={() => handleDeleteArtwork(art.id)}
                      style={{ padding: '0.6rem 1.2rem' }}
                    >
                      Delete
                    </button>
                  </div>
                )
              })}
            </div>
          ) : (
            <p style={{ color: '#666' }}>No artworks yet</p>
          )}
        </div>
      )}

      {activeTab === 'categories' && (
        <div className="info-section">
          <h2>Manage Categories</h2>
          
          <h3>Add New Category</h3>
          <form onSubmit={handleAddCategory}>
            <div className="form-group">
              <label>Category Name *</label>
              <input 
                type="text" 
                required 
                placeholder="e.g., Watercolors, Sketches"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
            </div>
            <button type="submit" className="btn">Add Category</button>
          </form>

          <h3 style={{ marginTop: '3rem' }}>Existing Categories</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            {categories.map(cat => (
              <div key={cat.id} style={{ padding: '1rem 1.5rem', background: '#f9f7f5', borderRadius: '8px', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <span>{cat.name} ({cat.artwork_count})</span>
                <button 
                  className="btn btn-danger" 
                  onClick={() => handleDeleteCategory(cat.id)}
                  style={{ padding: '0.3rem 0.8rem', fontSize: '0.9rem' }}
                >
                  X
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="info-section">
          <h2>Manage Orders</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ background: '#e3f2fd', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
              <h3>{orderStats.total_orders || 0}</h3>
              <p>Total</p>
            </div>
            <div style={{ background: '#fff3cd', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
              <h3>{orderStats.pending_orders || 0}</h3>
              <p>Pending</p>
            </div>
            <div style={{ background: '#d4edda', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
              <h3>{orderStats.completed_orders || 0}</h3>
              <p>Completed</p>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ marginRight: '1rem', fontWeight: 600 }}>Filter by Status:</label>
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ padding: '0.5rem', borderRadius: '6px', border: '2px solid #ddd' }}
            >
              <option value="all">All Orders</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {filteredOrders.length > 0 ? (
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {filteredOrders.map(order => {
                const details = typeof order.order_details === 'string' 
                  ? JSON.parse(order.order_details) 
                  : order.order_details

                return (
                  <div key={order.id} style={{ background: '#f9f7f5', padding: '2rem', borderRadius: '12px', borderLeft: '4px solid #8b7355' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <h4>Order #{order.id} - {order.order_type.toUpperCase()}</h4>
                      <span style={{ color: '#666' }}>{new Date(order.created_at).toLocaleString()}</span>
                    </div>

                    {order.order_type === 'regular' && (
                      <>
                        <p><strong>Artwork:</strong> {order.artwork_title}</p>
                        <p><strong>Price:</strong> {details.price}</p>
                        <p><strong>Size:</strong> {details.size}</p>
                        {details.notes && <p><strong>Notes:</strong> {details.notes}</p>}
                      </>
                    )}

                    {order.order_type === 'custom' && (
                      <>
                        <p><strong>Idea:</strong> {details.idea?.substring(0, 100)}...</p>
                        <p><strong>Medium:</strong> {details.medium}</p>
                      </>
                    )}

                    {order.order_type === 'bulk' && (
                      <>
                        <p><strong>Organization:</strong> {details.orgName}</p>
                        <p><strong>Item Type:</strong> {details.itemType}</p>
                        <p><strong>Quantity:</strong> {details.quantity}</p>
                        <p><strong>Deadline:</strong> {details.deadline}</p>
                      </>
                    )}

                    <p><strong>Customer:</strong> {order.customer_name}</p>
                    <p><strong>Email:</strong> {order.customer_email}</p>
                    <p><strong>Phone:</strong> {order.customer_phone || 'N/A'}</p>
                    {order.delivery_address && <p><strong>Address:</strong> {order.delivery_address}</p>}

                    <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <label style={{ fontWeight: 600 }}>Status:</label>
                      <select 
                        value={order.status}
                        onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                        style={{ padding: '0.5rem', borderRadius: '6px', border: '2px solid #ddd' }}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDeleteOrder(order.id)}
                      style={{ marginTop: '1rem' }}
                    >
                      Delete Order
                    </button>
                  </div>
                )
              })}
            </div>
          ) : (
            <p style={{ color: '#666' }}>No orders found</p>
          )}
        </div>
      )}

      {activeTab === 'feedback' && (
        <div className="info-section">
          <h2>Customer Feedback</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ background: '#e3f2fd', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
              <h3>{feedbackStats.total_feedback || 0}</h3>
              <p>Total Feedback</p>
            </div>
            <div style={{ background: '#fff3cd', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
              <h3>{feedbackStats.average_rating ? feedbackStats.average_rating.toFixed(1) : '0.0'}</h3>
              <p>Avg Rating</p>
            </div>
            <div style={{ background: '#d4edda', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
              <h3>{feedbackStats.appreciation_feedback || 0}</h3>
              <p>Appreciations</p>
            </div>
            <div style={{ background: '#f8d7da', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
              <h3>{feedbackStats.complaints || 0}</h3>
              <p>Complaints</p>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <label style={{ fontWeight: 600 }}>Filter by Status:</label>
            <select 
              value={feedbackFilter}
              onChange={(e) => setFeedbackFilter(e.target.value)}
              style={{ padding: '0.5rem', borderRadius: '6px', border: '2px solid #ddd' }}
            >
              <option value="all">All Feedback</option>
              <option value="New">New</option>
              <option value="In Review">In Review</option>
              <option value="Resolved">Resolved</option>
              <option value="Archived">Archived</option>
            </select>

            <button className="btn" onClick={handleExportFeedback} style={{ marginLeft: 'auto' }}>
               Export Feedback to Excel
            </button>
          </div>

          {filteredFeedback.length > 0 ? (
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {filteredFeedback.map(item => (
                <div key={item.id} style={{ 
                  background: '#f9f7f5', 
                  padding: '2rem', 
                  borderRadius: '12px', 
                  borderLeft: `4px solid ${
                    item.rating === 5 ? '#10b981' : 
                    item.rating === 4 ? '#3b82f6' : 
                    item.rating === 3 ? '#f59e0b' : 
                    item.rating === 2 ? '#f97316' : '#ef4444'
                  }` 
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <h4>Feedback #{item.id}</h4>
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                        {[1,2,3,4,5].map(star => (
                          <span key={star} style={{ color: star <= item.rating ? '#fbbf24' : '#d1d5db', fontSize: '1.2rem' }}>
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                    <span style={{ color: '#666', fontSize: '0.9rem' }}>
                      {new Date(item.created_at).toLocaleString()}
                    </span>
                  </div>

                  <div style={{ 
                    display: 'inline-block',
                    padding: '0.4rem 0.8rem', 
                    borderRadius: '12px', 
                    fontSize: '0.85rem',
                    marginBottom: '1rem',
                    background: '#e0f2fe',
                    color: '#0369a1',
                    fontWeight: 600
                  }}>
                    {(item.feedback_type || 'unknown').replace(/_/g, ' ').toUpperCase()}                  </div>

                  <p style={{ marginBottom: '0.5rem' }}><strong>From:</strong> {item.customer_name}</p>
                  <p style={{ marginBottom: '0.5rem' }}><strong>Email:</strong> {item.customer_email}</p>
                  
                  <div style={{ 
                    background: 'white', 
                    padding: '1rem', 
                    borderRadius: '8px', 
                    margin: '1rem 0',
                    borderLeft: '3px solid #cbd5e1'
                  }}>
                    <strong>Message:</strong>
                    <p style={{ marginTop: '0.5rem', color: '#374151' }}>{item.message}</p>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <label style={{ fontWeight: 600 }}>Status:</label>
                    <select 
                      value={item.status}
                      onChange={(e) => handleUpdateFeedbackStatus(item.id, e.target.value)}
                      style={{ padding: '0.5rem', borderRadius: '6px', border: '2px solid #ddd' }}
                    >
                      <option value="New">New</option>
                      <option value="In Review">In Review</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Archived">Archived</option>
                    </select>

                    <button
                      className="btn btn-danger"
                      onClick={() => handleDeleteFeedback(item.id)}
                      style={{ marginLeft: 'auto', padding: '0.5rem 1rem' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>No feedback found</p>
          )}
        </div>
      )}

      {activeTab === 'export' && (
        <div className="info-section">
          <h2>Export Data</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div style={{ background: '#f9f7f5', padding: '2rem', borderRadius: '12px' }}>
              <h3>Export Orders</h3>
              <p>Download all order data as Excel spreadsheet</p>
              <button className="btn" onClick={handleExportOrders} style={{ marginTop: '1rem' }}>
                Download Orders Excel
              </button>
            </div>

            <div style={{ background: '#f9f7f5', padding: '2rem', borderRadius: '12px' }}>
              <h3>Export Artworks</h3>
              <p>Download all artwork data as Excel spreadsheet</p>
              <button className="btn" onClick={handleExportArtworks} style={{ marginTop: '1rem' }}>
                Download Artworks Excel
              </button>
            </div>

            <div style={{ background: '#f9f7f5', padding: '2rem', borderRadius: '12px' }}>
              <h3>Export Feedback</h3>
              <p>Download all customer feedback as Excel spreadsheet</p>
              <button className="btn" onClick={handleExportFeedback} style={{ marginTop: '1rem' }}>
                Download Feedback Excel
              </button>
            </div>
          </div>

          <div style={{ background: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)', padding: '2rem', borderRadius: '12px', marginTop: '2rem', border: '2px solid #ff9800' }}>
            <h3>Export Tips</h3>
            <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem' }}>
              <li style={{ padding: '0.5rem 0' }}> Excel files include all data fields</li>
              <li style={{ padding: '0.5rem 0' }}> Orders are color-coded by status</li>
              <li style={{ padding: '0.5rem 0' }}> Feedback includes star ratings and statistics</li>
              <li style={{ padding: '0.5rem 0' }}> Perfect for business records and analysis</li>
              <li style={{ padding: '0.5rem 0' }}> Compatible with Excel, Google Sheets, LibreOffice</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

export default Admin