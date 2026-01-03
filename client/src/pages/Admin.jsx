import { useState, useEffect } from 'react'
import { GoogleLogin } from '@react-oauth/google'
import axios from 'axios'
import { useNavigate } from 'react-router-dom';
import '../assets/styles.css';

const API_URL = import.meta.env.VITE_API_URL || 'https://chitravaani-api.vercel.app/api'

function Admin() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loginData, setLoginData] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [token, setToken] = useState(null)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [artistProfileImage, setArtistProfileImage] = useState(null)
  const [uploadingArtistImage, setUploadingArtistImage] = useState(false)
  const [artworks, setArtworks] = useState([])
  const [categories, setCategories] = useState([])
  const [orders, setOrders] = useState([])
  const [orderStats, setOrderStats] = useState({})
  const [dashboardStats, setDashboardStats] = useState(null)
  const [stats, setStats] = useState(null);
  
  // Login form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  // FEEDBACK STATE
  const [feedback, setFeedback] = useState([])
  const [feedbackStats, setFeedbackStats] = useState({})
  const [feedbackFilter, setFeedbackFilter] = useState('all')
  
  const [artists, setArtists] = useState([])
  const [newArtist, setNewArtist] = useState({
    name: '',
    location: '',
    style: '',
    bio: '',
    email: '',
    phone: '',
    instagram: '',
    facebook: '',
    website: '',
    profile_image_url: ''
  })
  const [editingArtist, setEditingArtist] = useState(null)
  const [showArtistForm, setShowArtistForm] = useState(false)

  const [newArtwork, setNewArtwork] = useState({
    title: '',
    description: '',
    category: '',
    medium: '',
    dimensions: '',
    year: '',
    price: '',
    artist_id: ''
  })
  const [selectedFiles, setSelectedFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [newCategory, setNewCategory] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  
  // Auto-refresh dashboard every 30 seconds
useEffect(() => {
  if (isLoggedIn && token && activeTab === 'dashboard') {
    const interval = setInterval(() => {
      console.log(' Auto-refreshing dashboard...')
      loadDashboardData(false)
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }
}, [isLoggedIn, token, activeTab])

  useEffect(() => {
    const savedToken = localStorage.getItem('adminToken')
    if (savedToken) {
      axios.get(`${API_URL}/admin/verify`, {
        headers: { Authorization: `Bearer ${savedToken}` }
      })
      .then((response) => {
        if (response.data.valid) {
          setToken(savedToken)
          setIsLoggedIn(true)
        }
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

    // Verify token is valid
  const verifyToken = async (savedToken) => {
    try {
      const response = await axios.get(`${API_URL}/admin/verify`, {
        headers: { Authorization: `Bearer ${savedToken}` }
      })
      
      if (response.data.valid) {
        setToken(savedToken)
        setIsLoggedIn(true)
      } else {
        localStorage.removeItem('adminToken')
        setIsLoggedIn(false)
      }
    } catch (error) {
      console.error('Token verification failed:', error)
      localStorage.removeItem('adminToken')
      setIsLoggedIn(false)
    }
  }

  // Create axios instance with auth header
  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${token}` }
  })


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
    } catch (error) {
      console.error('Login error:', error)
      if (error.response) {
        setError(error.response.data.error || 'Login failed')
      } else {
        setError('Cannot connect to server.')
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
    setActiveTab('dashboard')
  }

const loadDashboardData = async (forceRefresh = false) => {
  if (!token) return

  try {
    const headers = { Authorization: `Bearer ${token}` }

    console.log(' Loading dashboard data...')
    console.log('Active tab:', activeTab)
    console.log('Force refresh:', forceRefresh)

    // Always load dashboard stats if on dashboard OR force refresh
    if (activeTab === 'dashboard' || forceRefresh) {
      console.log(' Fetching dashboard stats...')
      
      const [dashboardRes, feedbackStatsRes] = await Promise.all([
        axios.get(`${API_URL}/admin/dashboard/stats`, { headers }),
        axios.get(`${API_URL}/feedback/stats/summary`, { headers }).catch(() => ({
          data: {
            total_feedback: 0,
            average_rating: 0,
            pending_feedback: 0,
            reviewed_feedback: 0,
            resolved_feedback: 0,
            five_star: 0,
            appreciation_feedback: 0,
            new_feedback: 0,
            complaints: 0
          }
        }))
      ])
      
      console.log(' Dashboard stats received:', dashboardRes.data)
      console.log(' Feedback stats received:', feedbackStatsRes.data)
      
      setDashboardStats(dashboardRes.data)
      setFeedbackStats(feedbackStatsRes.data)
    }

    if (activeTab === 'artworks' || forceRefresh) {
      console.log(' Fetching artworks...')
      const [artworksRes, categoriesRes] = await Promise.all([
        axios.get(`${API_URL}/artworks`),
        axios.get(`${API_URL}/categories`)
      ])
      console.log(' Artworks:', artworksRes.data.length)
      setArtworks(artworksRes.data)
      setCategories(categoriesRes.data)
    }

    if (activeTab === 'categories' || forceRefresh) {
      console.log(' Fetching categories...')
      const response = await axios.get(`${API_URL}/categories`)
      console.log(' Categories:', response.data.length)
      setCategories(response.data)
    }

    if (activeTab === 'orders' || forceRefresh) {
      console.log(' Fetching orders...')
      const [ordersRes, statsRes] = await Promise.all([
        axios.get(`${API_URL}/orders`, { headers }),
        axios.get(`${API_URL}/orders/stats/summary`, { headers })
      ])
      console.log(' Orders:', ordersRes.data.length)
      console.log(' Order stats:', statsRes.data)
      setOrders(ordersRes.data)
      setOrderStats(statsRes.data)
    }

    if (activeTab === 'feedback' || forceRefresh) {
      console.log(' Fetching feedback...')
      try {
        const [feedbackRes, statsRes] = await Promise.all([
          axios.get(`${API_URL}/feedback`, { headers }),
          axios.get(`${API_URL}/feedback/stats/summary`, { headers })
        ])
        console.log(' Feedback:', feedbackRes.data.length)
        console.log(' Feedback stats:', statsRes.data)
        setFeedback(feedbackRes.data)
        setFeedbackStats(statsRes.data)
      } catch (err) {
        console.error('Error loading feedback:', err)
        setFeedback([])
        setFeedbackStats({})
      }
    }

    if (activeTab === 'artists' || forceRefresh) {
      console.log(' Fetching artists...')
      const response = await axios.get(`${API_URL}/artists/admin/list`, { headers })
      console.log(' Artists:', response.data.length)
      setArtists(response.data)
    }

    console.log(' Dashboard data loaded successfully')

  } catch (error) {
    console.error(' Error loading dashboard data:', error)
    console.error('Error details:', error.response?.data)
    
    if (error.response && error.response.status === 401) {
      alert('Session expired. Please login again.')
      handleLogout()
    } else {
      alert('Failed to load data: ' + (error.response?.data?.error || error.message))
    }
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
    formData.append('artist_id', newArtwork.artist_id)  

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
      title: '', description: '', category: '', medium: '', 
      dimensions: '', year: '', price: '', artist_id: ''
    })
    setSelectedFiles([])
    document.getElementById('artworkImages').value = ''
    
    // Force refresh all data
    await loadDashboardData(true)
  } catch (error) {
    console.error('Error adding artwork:', error)
    alert('Failed to add artwork: ' + (error.response?.data?.error || error.message))
  } finally {
    setUploading(false)
  }
}

const handleDeleteArtwork = async (id) => {
  if (!window.confirm('Delete this artwork?')) return
  try {
    await axios.delete(`${API_URL}/artworks/${id}`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    alert('Artwork deleted successfully!')
    await loadDashboardData(true) // Force refresh
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
      { headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }}
    )
    alert('Category added successfully!')
    setNewCategory('')
    await loadDashboardData(true) // Force refresh
  } catch (error) {
    console.error('Error adding category:', error)
    alert(error.response?.data?.error || 'Failed to add category')
  }
}

const handleDeleteCategory = async (id) => {
  if (!window.confirm('Delete this category?')) return
  try {
    await axios.delete(`${API_URL}/categories/${id}`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    alert('Category deleted successfully!')
    await loadDashboardData(true) // Force refresh
  } catch (error) {
    console.error('Error deleting category:', error)
    alert(error.response?.data?.error || 'Failed to delete category')
  }
}

const handleUpdateOrderStatus = async (orderId, newStatus) => {
  try {
    await axios.patch(`${API_URL}/orders/${orderId}/status`,
      { status: newStatus },
      { headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }}
    )
    alert('Order status updated!')
    await loadDashboardData(true) // Force refresh
  } catch (error) {
    console.error('Error updating order status:', error)
    alert('Failed to update status')
  }
}

const handleDeleteOrder = async (orderId) => {
  if (!window.confirm("Are you sure you want to delete this order?")) return
  try {
    await axios.delete(`${API_URL}/orders/${orderId}`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    alert("Order deleted successfully!")
    await loadDashboardData(true) // Force refresh
  } catch (error) {
    console.error("Error deleting order:", error)
    alert(error.response?.data?.error || 'Failed to delete order')
  }
}

const handleUpdateFeedbackStatus = async (feedbackId, newStatus) => {
  try {
    await axios.patch(`${API_URL}/feedback/${feedbackId}/status`,
      { status: newStatus },
      { headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }}
    )
    alert('Feedback status updated!')
    await loadDashboardData(true) // Force refresh
  } catch (error) {
    console.error('Error updating feedback status:', error)
    alert('Failed to update status')
  }
}

const handleDeleteFeedback = async (feedbackId) => {
  if (!window.confirm("Are you sure you want to delete this feedback?")) return
  try {
    await axios.delete(`${API_URL}/feedback/${feedbackId}`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    alert("Feedback deleted successfully!")
    await loadDashboardData(true) // Force refresh
  } catch (error) {
    console.error("Error deleting feedback:", error)
    alert("Failed to delete feedback.")
  }
}

const handleAddArtist = async (e) => {
  e.preventDefault()
  
  if (!newArtist.name || newArtist.name.trim().length < 2) {
    alert(' Artist name is required (minimum 2 characters)')
    return
  }

  if (newArtist.email && !newArtist.email.includes('@')) {
    alert(' Please enter a valid email address')
    return
  }

  try {
    setUploadingArtistImage(true)
    console.log(' Creating new artist...')
    
    // Create FormData for file upload
    const formData = new FormData()
    formData.append('name', newArtist.name.trim())
    formData.append('location', newArtist.location?.trim() || '')
    formData.append('style', newArtist.style?.trim() || '')
    formData.append('bio', newArtist.bio?.trim() || '')
    formData.append('email', newArtist.email?.trim().toLowerCase() || '')
    formData.append('phone', newArtist.phone?.trim() || '')
    formData.append('instagram', newArtist.instagram?.trim() || '')
    formData.append('facebook', newArtist.facebook?.trim() || '')
    formData.append('website', newArtist.website?.trim() || '')
    
    // Add profile image if selected
    if (artistProfileImage) {
      formData.append('profileImage', artistProfileImage)
    }
    
await axios.post(
      `${API_URL}/artists/admin/test-create`, 
      formData, 
      {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    )
    
    alert(' Artist added successfully!')
    
    // Reset form
    setNewArtist({
      name: '', location: '', style: '', bio: '', email: '',
      phone: '', instagram: '', facebook: '',  
      website: '', profile_image_url: ''
    })
    setArtistProfileImage(null)
    // Clear file input
    const fileInput = document.getElementById('artistProfileImage')
    if (fileInput) fileInput.value = ''
    
    setShowArtistForm(false)
    await loadDashboardData(true)
    
  } catch (error) {
    console.error(' Error:', error)
    alert('Failed: ' + (error.response?.data?.error || error.message))
  } finally {
    setUploadingArtistImage(false)
  }
}

const handleUpdateArtist = async (e) => {
  e.preventDefault()
  
  if (!editingArtist.name || editingArtist.name.trim().length < 2) {
    alert(' Artist name is required')
    return
  }

  if (editingArtist.email && !editingArtist.email.includes('@')) {
    alert(' Please enter a valid email address')
    return
  }

  try {
    setUploadingArtistImage(true)
    console.log(' Updating artist...')
    
    // Create FormData for file upload
    const formData = new FormData()
    formData.append('name', editingArtist.name.trim())
    formData.append('location', editingArtist.location?.trim() || '')
    formData.append('style', editingArtist.style?.trim() || '')
    formData.append('bio', editingArtist.bio?.trim() || '')
    formData.append('email', editingArtist.email?.trim().toLowerCase() || '')
    formData.append('phone', editingArtist.phone?.trim() || '')
    formData.append('instagram', editingArtist.instagram?.trim() || '')
    formData.append('facebook', editingArtist.facebook?.trim() || '')
    formData.append('website', editingArtist.website?.trim() || '')
    
    // Add profile image if new one selected
    if (artistProfileImage) {
      formData.append('profileImage', artistProfileImage)
    }
    
    await axios.put(
      `${API_URL}/artists/admin/update/${editingArtist.id}`,
      formData,
      {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    )
    
    alert(' Artist updated successfully!')
    setEditingArtist(null)
    setArtistProfileImage(null)
    await loadDashboardData(true)
    
  } catch (error) {
    alert('Failed: ' + (error.response?.data?.error || error.message))
  } finally {
    setUploadingArtistImage(false)
  }
}

const handleDeleteArtist = async (id, name) => {
  if (!window.confirm(`Delete "${name}"? Artworks will be preserved.`)) return
  
  try {
    await axios.delete(`${API_URL}/artists/admin/delete/${id}`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    alert(' Artist deleted!')
    await loadDashboardData(true)
    
  } catch (error) {
    alert('Failed: ' + (error.response?.data?.error || error.message))
  }
}

  const handleExportOrders = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/export/orders`, {
        headers: { 
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json'
},
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
      if (error.response && error.response.status === 401) {
        alert('Session expired. Please login again.')
        handleLogout()
      } else {
        alert('Failed to export orders')
      }
        }
  }

  const handleExportArtworks = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/export/artworks`, {
        headers: { 
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json'
},
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
      if (error.response && error.response.status === 401) {
        alert('Session expired. Please login again.')
        handleLogout()
      } else {
        alert('Failed to export artworks')
      }    
    }
  }

const handleExportArtists = async () => {
  try {
    const response = await axios.get(`${API_URL}/admin/export/artists`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      responseType: 'blob'
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `artists_${Date.now()}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();

    alert('Artists exported successfully!');
  } catch (error) {
    console.error('Error exporting artists:', error);
    alert('Failed to export artists');
  }
};

// Replace your handleExportFeedback function in Admin.jsx

const handleExportFeedback = async () => {
  try {
    console.log(' Starting feedback export...');
    console.log(' API URL:', API_URL);
    console.log(' Token exists:', !!token);

    const response = await axios.get(`${API_URL}/admin/export/feedback`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      responseType: 'blob',
      timeout: 30000 // 30 second timeout
    });

    console.log(' Response received:', response.status);
    console.log(' Content type:', response.headers['content-type']);

    // Check if response is actually an error (sometimes errors come as JSON blobs)
    if (response.data.type === 'application/json') {
      const text = await response.data.text();
      const error = JSON.parse(text);
      throw new Error(error.error || 'Export failed');
    }

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `feedback_${Date.now()}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    alert(' Feedback exported successfully!');
    console.log(' Export complete');

  } catch (error) {
    console.error(' Error exporting feedback:', error);
    console.error(' Error response:', error.response?.data);
    console.error(' Error status:', error.response?.status);
    
    // Better error message
    let errorMessage = 'Failed to export feedback. ';
    
    if (error.response?.status === 404) {
      errorMessage += 'No feedback found to export.';
    } else if (error.response?.status === 401) {
      errorMessage += 'Please login again.';
    } else if (error.response?.status === 500) {
      errorMessage += 'Server error. Check if backend is running.';
    } else if (error.message.includes('Network Error')) {
      errorMessage += 'Cannot connect to server. Check your internet connection.';
    } else {
      errorMessage += error.message || 'Unknown error';
    }
    
    alert('x' + errorMessage);
  }
};


// Force refresh all data after any action
const refreshAllData = async () => {
  console.log(' Refreshing all dashboard data...');
  
  try {
    const headers = { Authorization: `Bearer ${token}` };
    
    // Always fetch dashboard stats
    const [dashboardRes, ordersRes, feedbackRes] = await Promise.all([
      axios.get(`${API_URL}/admin/dashboard/stats`, { headers }),
      axios.get(`${API_URL}/orders/stats/summary`, { headers }),
      axios.get(`${API_URL}/feedback/stats/summary`, { headers }).catch(() => ({
        data: { total_feedback: 0, average_rating: 0 }
      }))
    ]);
    
    setDashboardStats(dashboardRes.data);
    setOrderStats(ordersRes.data);
    setFeedbackStats(feedbackRes.data);
    
    // Also refresh the current tab's data
    await loadDashboardData(false);
    
    console.log(' Dashboard refreshed');
  } catch (error) {
    console.error(' Error refreshing:', error);
  }
};

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
        <div className="hero" style={{ padding: '3rem 2rem 4rem' }}>
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
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input 
                type="password" 
                required 
                value={loginData.password}
                onChange={(e) => setLoginData({...loginData, password: e.target.value})}
              />
            </div>

                        {error && (
              <div style={{ marginBottom: '1rem', color: '#d32f2f', background: '#ffebee', padding: '1rem', borderRadius: '8px' }}>
                {error}
              </div>
            )}

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
        {['dashboard', 'artworks', 'categories', 'orders', 'feedback', 'artists', 'export'].map(tab => (
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
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
      <h2>Dashboard Overview</h2>
      <button 
        className="btn" 
        onClick={async () => {
          console.log('Refresh button clicked')
          await loadDashboardData(true)
          alert('Dashboard refreshed successfully!')
        }}
        style={{ padding: '0.6rem 1.2rem' }}
      >
        Refresh Data
      </button>
    </div>
    {dashboardStats ? (
      <>
        {/* Updated Stats Grid - Removed Completed Orders, Added Feedback */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          {/* Total Orders */}
          <div style={{ background: '#e3f2fd', padding: '1.5rem', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '2.5rem', margin: 0, color: '#1976d2' }}>{Number(dashboardStats.orders?.total_orders) || 0}</h3>
            <p style={{ margin: '0.5rem 0 0 0', color: '#555', fontWeight: 600 }}>Total Orders</p>
          </div>

          {/* Pending Orders */}
          <div style={{ background: '#fff3cd', padding: '1.5rem', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '2.5rem', margin: 0, color: '#856404' }}>{Number(dashboardStats.orders?.pending_orders) || 0}</h3>
            <p style={{ margin: '0.5rem 0 0 0', color: '#555', fontWeight: 600 }}>Pending Orders</p>
          </div>

          {/* Total Artworks */}
          <div style={{ background: '#f8d7da', padding: '1.5rem', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '2.5rem', margin: 0, color: '#721c24' }}>{Number(dashboardStats.artworks?.total_artworks) || 0}</h3>
            <p style={{ margin: '0.5rem 0 0 0', color: '#555', fontWeight: 600 }}>Total Artworks</p>
          </div>

          {/* NEW: Total Feedback */}
          <div style={{ background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)', padding: '1.5rem', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '2.5rem', margin: 0, color: '#0369a1' }}>
              {Number(feedbackStats?.total_feedback) || 0}
            </h3>
            <p style={{ margin: '0.5rem 0 0 0', color: '#555', fontWeight: 600 }}>Customer Feedback</p>
          </div>
        </div>

        {/* Additional Insights Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {/* Completed Orders - Smaller card */}
          <div style={{ background: '#d4edda', padding: '1rem', borderRadius: '10px', textAlign: 'center', border: '2px solid #c3e6cb' }}>
            <h4 style={{ fontSize: '1.8rem', margin: 0, color: '#155724' }}>{Number(dashboardStats.orders?.completed_orders) || 0}</h4>
            <p style={{ margin: '0.3rem 0 0 0', color: '#155724', fontSize: '0.9rem', fontWeight: 500 }}>Completed Orders</p>
          </div>

          {/* Average Feedback Rating */}
          <div style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', padding: '1rem', borderRadius: '10px', textAlign: 'center', border: '2px solid #fcd34d' }}>
            <h4 style={{ fontSize: '1.8rem', margin: 0, color: '#92400e' }}>
              {Number(feedbackStats?.average_rating) ? `${feedbackStats.average_rating.toFixed(1)} ★` : 'N/A'}
            </h4>
            <p style={{ margin: '0.3rem 0 0 0', color: '#92400e', fontSize: '0.9rem', fontWeight: 500 }}>Avg Feedback Rating</p>
          </div>

          {/* New Feedback */}
          <div style={{ background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)', padding: '1rem', borderRadius: '10px', textAlign: 'center', border: '2px solid #a5b4fc' }}>
            <h4 style={{ fontSize: '1.8rem', margin: 0, color: '#3730a3' }}>
              {Number(feedbackStats?.new_feedback) || 0}
            </h4>
            <p style={{ margin: '0.3rem 0 0 0', color: '#3730a3', fontSize: '0.9rem', fontWeight: 500 }}>New Feedback</p>
          </div>

          {/* Total Categories */}
          <div style={{ background: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)', padding: '1rem', borderRadius: '10px', textAlign: 'center', border: '2px solid #f9a8d4' }}>
            <h4 style={{ fontSize: '1.8rem', margin: 0, color: '#831843' }}>
             {dashboardStats.categories?.total_categories || dashboardStats.categories || 0}
            </h4>
            <p style={{ margin: '0.3rem 0 0 0', color: '#831843', fontSize: '0.9rem', fontWeight: 500 }}>Art Categories</p>
          </div>
        </div>

        {/* Quick Stats Banner */}
        <div style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
          padding: '1.5rem', 
          borderRadius: '12px', 
          marginBottom: '2rem',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-around',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
              {feedbackStats?.five_star || 0}
            </div>
            <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>5-Star Reviews</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
              {feedbackStats?.appreciation_feedback || 0}
            </div>
            <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Appreciations</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
              {feedbackStats?.resolved_feedback || 0}
            </div>
            <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Resolved Issues</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
              {dashboardStats.orders?.total_orders > 0
                ? ((Number(dashboardStats.orders.completed_orders) / Number(dashboardStats.orders.total_orders)) * 100).toFixed(0)
                : 0}%            
            </div>
            <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Completion Rate</div>
          </div>
        </div>

        <h3 style={{ marginBottom: '1rem', color: '#333' }}>Recent Orders</h3>
        {dashboardStats.recentOrders && dashboardStats.recentOrders.length > 0 ? (          
          <div style={{ display: 'grid', gap: '1rem' }}>
            {dashboardStats.recentOrders.map(order => (
              <div key={order.id} style={{ 
                background: '#f9f7f5', 
                padding: '1.5rem', 
                borderRadius: '8px', 
                borderLeft: '4px solid #8b7355',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(5px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <strong style={{ fontSize: '1.1rem' }}>#{order.id} - {order.order_type.toUpperCase()}</strong>
                    <p style={{ margin: '0.5rem 0', color: '#666' }}>
                      {order.customer_name} • {new Date(order.created_at).toLocaleDateString()}
                    </p>
                    {order.artwork_title && (
                      <p style={{ color: '#555', margin: '0.3rem 0' }}>
                         {order.artwork_title}
                      </p>
                    )}
                  </div>
                  <span style={{ 
                    padding: '0.4rem 1rem', 
                    borderRadius: '20px', 
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    background: order.status === 'Completed' ? '#d4edda' : 
                               order.status === 'Pending' ? '#fff3cd' : '#f8d7da',
                    color: order.status === 'Completed' ? '#155724' : 
                           order.status === 'Pending' ? '#856404' : '#721c24'
                  }}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem', 
            background: '#f9f7f5', 
            borderRadius: '12px',
            color: '#666'
          }}>
            <p style={{ fontSize: '1.2rem', margin: 0 }}> No recent orders</p>
            <p style={{ fontSize: '0.9rem', marginTop: '0.5rem', color: '#999' }}>
              New orders will appear here
            </p>
          </div>
        )}
      </>
    ) : (
      <div className="loading" style={{ 
        textAlign: 'center', 
        padding: '4rem',
        fontSize: '1.2rem',
        color: '#8b7355' 
      }}>
        Loading dashboard...
      </div>
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
              <label>Artist (Optional)</label>
              <select
                value={newArtwork.artist_id}
                onChange={(e) => setNewArtwork({...newArtwork, artist_id: e.target.value})}
              >
                <option value="">No artist assigned</option>
                {artists.map(artist => (
                  <option key={artist.id} value={artist.id}>
                    {artist.name} {artist.location ? `- ${artist.location}` : ''}
                  </option>
                ))}
              </select>
              <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
                Link this artwork to an artist 
              </p>
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

    {/* Statistics Cards */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
      <div style={{ background: '#e3f2fd', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
        <h3>{(feedbackStats && feedbackStats.total_feedback) || 0}</h3>
        <p>Total Feedback</p>
      </div>
      <div style={{ background: '#fff3cd', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
      <h3 style={{ fontSize: '1.8rem', margin: 0, color: '#92400e' }}>
        {feedbackStats?.average_rating && Number(feedbackStats.average_rating) > 0
          ? `${Number(feedbackStats.average_rating).toFixed(1)} ★` 
          : 'N/A'}
      </h3>
        <p>Avg Rating</p>
      </div>
      <div style={{ background: '#d4edda', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
        <h3>{(feedbackStats && feedbackStats.appreciation_feedback) || 0}</h3>
        <p>Appreciations</p>
      </div>
      <div style={{ background: '#f8d7da', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
        <h3>{(feedbackStats && feedbackStats.complaints) || 0}</h3>
        <p>Complaints</p>
      </div>
    </div>

    {/* Filter and Export */}
    <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
      <label style={{ fontWeight: 600 }}>Filter by Status:</label>
      <select 
        value={feedbackFilter}
        onChange={(e) => setFeedbackFilter(e.target.value)}
        style={{ padding: '0.5rem', borderRadius: '6px', border: '2px solid #ddd' }}
      >
        <option value="all">All Feedback</option>
        <option value="Pending">Pending</option>
        <option value="Reviewed">Reviewed</option>
        <option value="Resolved">Resolved</option>
      </select>

    </div>

    {/* Feedback List */}
    {feedback && Array.isArray(feedback) && feedback.length > 0 ? (
      <div style={{ display: 'grid', gap: '1.5rem' }}>
        {feedback
          .filter(f => feedbackFilter === 'all' || f.status === feedbackFilter)
          .map(item => {
            // Safe defaults
            const rating = parseInt(item.rating) || 0;
            const feedbackType = item.feedback_type || 'other';
            const customerName = item.customer_name || 'Unknown';
            const customerEmail = item.customer_email || 'No email';
            const message = item.message || 'No message';
            const status = item.status || 'New';
            const createdAt = item.created_at || new Date();

            // Rating color
            let borderColor = '#cbd5e1';
            if (rating === 5) borderColor = '#10b981';
            else if (rating === 4) borderColor = '#3b82f6';
            else if (rating === 3) borderColor = '#f59e0b';
            else if (rating === 2) borderColor = '#f97316';
            else if (rating === 1) borderColor = '#ef4444';

            return (
              <div key={item.id} style={{ 
                background: '#f9f7f5', 
                padding: '2rem', 
                borderRadius: '12px', 
                borderLeft: `4px solid ${borderColor}` 
              }}>
                {/* Header */}
                <div style={{ 
                  display: 'flex', 
                  gap: '0.3rem', 
                  marginTop: '0.5rem',
                  alignItems: 'center'
                }}>
                  {[1,2,3,4,5].map(star => (
                    <span key={star} style={{ 
                      color: star <= rating ? '#fbbf24' : '#d1d5db', 
                      fontSize: '1.3rem',
                      lineHeight: '1',
                      display: 'inline-block'
                    }}>
                      ★
                    </span>
                  ))}
                  <span style={{ 
                    marginLeft: '0.5rem', 
                    fontSize: '0.9rem', 
                    color: '#6B7280',
                    fontWeight: '600'
                  }}>
                    ({rating}/5)
                  </span>
                </div>

                {/* Category Badge */}
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
                  {feedbackType.replace(/_/g, ' ').toUpperCase()}
                </div>

                {/* Customer Info */}
                <p style={{ marginBottom: '0.5rem' }}>
                  <strong>From:</strong> {customerName}
                </p>
                <p style={{ marginBottom: '0.5rem' }}>
                  <strong>Email:</strong> {customerEmail}
                </p>
                
                {/* Message */}
                <div style={{ 
                  background: 'white', 
                  padding: '1rem', 
                  borderRadius: '8px', 
                  margin: '1rem 0',
                  borderLeft: '3px solid #cbd5e1'
                }}>
                  <strong>Message:</strong>
                  <p style={{ marginTop: '0.5rem', color: '#374151', whiteSpace: 'pre-wrap' }}>
                    {message}
                  </p>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <label style={{ fontWeight: 600 }}>Status:</label>
                    <select 
                      value={status}
                      onChange={(e) => handleUpdateFeedbackStatus(item.id, e.target.value)}
                      style={{ padding: '0.5rem', borderRadius: '6px', border: '2px solid #ddd' }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Reviewed">Reviewed</option>
                      <option value="Resolved">Resolved</option>
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
            );
          })}
      </div>
    ) : (
      <div style={{ textAlign: 'center', padding: '3rem', background: '#f9f7f5', borderRadius: '12px' }}>
        <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '1rem' }}>
           No feedback yet
        </p>
        <p style={{ color: '#999' }}>
          Feedback submissions will appear here
        </p>
      </div>
    )}
  </div>
)}

{activeTab === 'artists' && (
        <div className="info-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2>Manage Artists</h2>
            <button 
              className="btn" 
              onClick={() => {
                setShowArtistForm(!showArtistForm)
                setEditingArtist(null)
              }}
              style={{ padding: '0.8rem 1.5rem' }}
            >
              {showArtistForm ? 'Cancel' : '+ Add New Artist'}
            </button>
          </div>

          {/* ===== ADD/EDIT ARTIST FORM ===== */}
          {(showArtistForm || editingArtist) && (
            <form 
              onSubmit={editingArtist ? handleUpdateArtist : handleAddArtist}
              style={{ 
                background: '#f9f7f5', 
                padding: '2rem', 
                borderRadius: '12px', 
                marginBottom: '2rem',
                border: '2px solid #8b7355'
              }}
            >
              <h3 style={{ marginBottom: '1.5rem', color: '#8b7355' }}>
                {editingArtist ? ' Edit Artist' : ' Add New Artist'}
              </h3>

              <div className="form-group">
                <label>Artist Name *</label>
                <input
                  type="text"
                  required
                  value={editingArtist ? editingArtist.name : newArtist.name}
                  onChange={(e) => editingArtist
                    ? setEditingArtist({...editingArtist, name: e.target.value})
                    : setNewArtist({...newArtist, name: e.target.value})
                  }
                  placeholder="Full name of the artist"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    value={editingArtist ? editingArtist.location : newArtist.location}
                    onChange={(e) => editingArtist
                      ? setEditingArtist({...editingArtist, location: e.target.value})
                      : setNewArtist({...newArtist, location: e.target.value})
                    }
                    placeholder="e.g., Mumbai, India"
                  />
                </div>

                <div className="form-group">
                  <label>Art Style</label>
                  <input
                    type="text"
                    value={editingArtist ? editingArtist.style : newArtist.style}
                    onChange={(e) => editingArtist
                      ? setEditingArtist({...editingArtist, style: e.target.value})
                      : setNewArtist({...newArtist, style: e.target.value})
                    }
                    placeholder="e.g., Watercolor, Digital Art"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Biography</label>
                <textarea
                  rows="4"
                  value={editingArtist ? editingArtist.bio : newArtist.bio}
                  onChange={(e) => editingArtist
                    ? setEditingArtist({...editingArtist, bio: e.target.value})
                    : setNewArtist({...newArtist, bio: e.target.value})
                  }
                  placeholder="Tell us about the artist, their journey, achievements..."
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={editingArtist ? editingArtist.email : newArtist.email}
                    onChange={(e) => editingArtist
                      ? setEditingArtist({...editingArtist, email: e.target.value})
                      : setNewArtist({...newArtist, email: e.target.value})
                    }
                    placeholder="artist@example.com"
                  />
                </div>

                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    value={editingArtist ? editingArtist.phone : newArtist.phone}
                    onChange={(e) => editingArtist
                      ? setEditingArtist({...editingArtist, phone: e.target.value})
                      : setNewArtist({...newArtist, phone: e.target.value})
                    }
                    placeholder="10-digit phone number"
                  />
                </div>
              </div>

              <h4 style={{ marginTop: '1.5rem', marginBottom: '1rem', color: '#8b7355' }}>
                Social Media Links
              </h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Instagram</label>
                  <input
                    type="text"
                    value={editingArtist ? editingArtist.instagram : newArtist.instagram}
                    onChange={(e) => editingArtist
                      ? setEditingArtist({...editingArtist, instagram: e.target.value})
                      : setNewArtist({...newArtist, instagram: e.target.value})
                    }
                    placeholder="@username"
                  />
                </div>

                <div className="form-group">
                  <label>Facebook</label>
                  <input
                    type="text"
                    value={editingArtist ? editingArtist.facebook : newArtist.facebook}
                    onChange={(e) => editingArtist
                      ? setEditingArtist({...editingArtist, facebook: e.target.value})
                      : setNewArtist({...newArtist, facebook: e.target.value})
                    }
                    placeholder="Facebook profile URL"
                  />
                </div>

                <div className="form-group">
                  <label>Website</label>
                  <input
                    type="url"
                    value={editingArtist ? editingArtist.website : newArtist.website}
                    onChange={(e) => editingArtist
                      ? setEditingArtist({...editingArtist, website: e.target.value})
                      : setNewArtist({...newArtist, website: e.target.value})
                    }
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Profile Photo *</label>
                <input
                  type="file"
                  id="artistProfileImage"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setArtistProfileImage(e.target.files[0])
                    }
                  }}
                  style={{ padding: '0.5rem' }}
                />
                {artistProfileImage && (
                  <p style={{ marginTop: '0.5rem', color: '#8b7355', fontSize: '0.9rem' }}>
                    ✓ Selected: {artistProfileImage.name}
                  </p>
                )}
                {editingArtist && editingArtist.profile_image_url && !artistProfileImage && (
                  <div style={{ marginTop: '1rem' }}>
                    <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
                      Current photo:
                    </p>
                    <img 
                      src={editingArtist.profile_image_url}
                      alt="Current profile"
                      style={{
                        width: '100px',
                        height: '100px',
                        borderRadius: '8px',
                        objectFit: 'cover',
                        border: '2px solid #8b7355'
                      }}
                    />
                    <p style={{ fontSize: '0.85rem', color: '#999', marginTop: '0.5rem' }}>
                      Upload a new image to replace this
                    </p>
                  </div>
                )}
                <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
                   Upload JPG, PNG, or WebP (max 5MB)
                </p>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="btn" disabled={uploadingArtistImage}>
                  {uploadingArtistImage 
                    ? ' Uploading...' 
                    : editingArtist ? 'Update Artist' : ' Add Artist'
                  }
                </button>
                {editingArtist && (
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setEditingArtist(null)}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          )}

          {/* ===== ARTISTS LIST ===== */}
          <h3 style={{ marginBottom: '1.5rem' }}>
            All Artists ({artists.length})
          </h3>
          
          {artists.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '3rem', 
              background: '#f9f7f5', 
              borderRadius: '12px',
              border: '2px dashed #8b7355'
            }}>
              <p style={{ color: '#666', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                 No artists yet
              </p>
              <p style={{ color: '#999', fontSize: '0.95rem' }}>
                Click "Add New Artist" to create your first artist profile
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {artists.map(artist => (
                <div 
                  key={artist.id} 
                  style={{ 
                    display: 'flex', 
                    gap: '1.5rem', 
                    padding: '1.5rem', 
                    background: '#f9f7f5', 
                    borderRadius: '12px',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    border: '1px solid #e8ddd0'
                  }}
                >
                  {/* Profile Image */}
                  <img
                    src={artist.profile_image_url || 'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27100%27 height=%27100%27%3E%3Crect fill=%27%23e8ddd0%27 width=%27100%27 height=%27100%27/%3E%3Ctext x=%2750%25%27 y=%2750%25%27 dominant-baseline=%27middle%27 text-anchor=%27middle%27 font-size=%2740%27 fill=%27%238b7355%27%3E%3C/text%3E%3C/svg%3E'}
                    alt={artist.name}
                    style={{
                      width: '100px',
                      height: '100px',
                      borderRadius: '8px',
                      objectFit: 'cover',
                      border: '2px solid #8b7355'
                    }}
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27100%27 height=%27100%27%3E%3Crect fill=%27%23e8ddd0%27 width=%27100%27 height=%27100%27/%3E%3Ctext x=%2750%25%27 y=%2750%25%27 dominant-baseline=%27middle%27 text-anchor=%27middle%27 font-size=%2740%27 fill=%27%238b7355%27%3E%3C/text%3E%3C/svg%3E'
                    }}
                  />
                  
                  {/* Artist Info */}
                  <div style={{ flex: 1, minWidth: '250px' }}>
                    <h4 style={{ marginBottom: '0.5rem', fontSize: '1.2rem' }}>
                      {artist.name}
                    </h4>
                    {artist.location && (
                      <p style={{ color: '#666', fontSize: '0.9rem', margin: '0.3rem 0' }}>
                         {artist.location}
                      </p>
                    )}
                    {artist.style && (
                      <p style={{ color: '#8b7355', fontSize: '0.9rem', margin: '0.3rem 0' }}>
                         {artist.style}
                      </p>
                    )}
                    <p style={{ 
                      color: '#999', 
                      fontSize: '0.85rem', 
                      marginTop: '0.5rem',
                      background: '#e8ddd0',
                      padding: '0.3rem 0.6rem',
                      borderRadius: '12px',
                      display: 'inline-block'
                    }}>
                      {artist.artwork_count || 0} artwork{artist.artwork_count !== 1 ? 's' : ''}
                    </p>
                    {artist.email && (
                      <p style={{ color: '#666', fontSize: '0.85rem', marginTop: '0.3rem' }}>
                         {artist.email}
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '0.8rem', flexDirection: 'column' }}>
                    <button
                      className="btn"
                      onClick={() => {
                        setEditingArtist(artist)
                        setShowArtistForm(false)
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }}
                      style={{ padding: '0.6rem 1.2rem', minWidth: '100px' }}
                    >
                       Edit
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDeleteArtist(artist.id, artist.name)}
                      style={{ padding: '0.6rem 1.2rem', minWidth: '100px' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
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

            <div style={{ background: '#f9f7f5', padding: '2rem', borderRadius: '12px' }}>
            <div className="export-card">
              <h3>Export Artists</h3>
              <p>Download all artist profiles as Excel spreadsheet</p>
              <button className="btn" onClick={handleExportArtists} style={{ marginTop: '1rem' }}>
                Download Artist Excel
              </button>
            </div>
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