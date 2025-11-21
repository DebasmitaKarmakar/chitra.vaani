import { useEffect, useState } from 'react'
import axios from 'axios'
import ArtworkCard from '../components/ArtworkCard'

const API_URL = import.meta.env.VITE_API_URL || 'https://chitravaani-api.vercel.app/api'
function Gallery() {
  const [artworks, setArtworks] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchCategories()
    fetchArtworks()
  }, [])

  const fetchCategories = async () => {
    try {
      console.log(' Fetching categories from:', `${API_URL}/categories`)
      const response = await axios.get(`${API_URL}/categories`)
      console.log(' Categories loaded:', response.data)
      setCategories(response.data)
    } catch (error) {
      console.error(' Error fetching categories:', error)
    }
  }

  const fetchArtworks = async () => {
    try {
      setLoading(true)
      console.log(' Fetching artworks from:', `${API_URL}/artworks`)
      const response = await axios.get(`${API_URL}/artworks`)
      console.log(' Artworks loaded:', response.data)
      setArtworks(response.data)
      setError(null)
    } catch (error) {
      console.error(' Error fetching artworks:', error)
      setError('Failed to load artworks. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const filteredArtworks = selectedCategory === 'all' 
    ? artworks 
    : artworks.filter(art => art.category === selectedCategory)

  return (
    <div className="container fade-in">
      <div className="hero">
        <h1>Art Gallery</h1>
        <p>Explore our collection of handcrafted artworks</p>
      </div>

      {/* Category Filter */}
      <div className="category-pills" style={{ marginTop: '2rem' }}>
        <div 
          className={`category-pill ${selectedCategory === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('all')}
        >
          All
        </div>
        {categories.map(cat => (
          <div 
            key={cat.id}
            className={`category-pill ${selectedCategory === cat.name ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat.name)}
          >
            {cat.name} ({cat.artwork_count})
          </div>
        ))}
      </div>

      {/* Artworks Grid */}
      {loading ? (
        <div className="loading">Loading artworks...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : filteredArtworks.length > 0 ? (
        <div className="gallery-grid">
          {filteredArtworks.map(artwork => (
            <ArtworkCard key={artwork.id} artwork={artwork} />
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#666' }}>
          <p style={{ fontSize: '1.2rem' }}>No artworks found in this category.</p>
          <button 
            className="btn" 
            style={{ marginTop: '1rem' }}
            onClick={() => setSelectedCategory('all')}
          >
            View All Artworks
          </button>
        </div>
      )}
    </div>
  )
}

export default Gallery