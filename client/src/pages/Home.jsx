import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import axios from 'axios'
import ArtworkCard from '../components/ArtworkCard'

const API_URL = import.meta.env.VITE_API_URL || 'https://chitravaani-api.vercel.app/api'

function Home() {
  const [featuredArtworks, setFeaturedArtworks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeaturedArtworks()
  }, [])

  const fetchFeaturedArtworks = async () => {
    try {
      console.log(' Fetching featured artworks from:', `${API_URL}/artworks`)
      const response = await axios.get(`${API_URL}/artworks`)
      console.log(' Featured artworks loaded:', response.data)
      // Get latest 3 artworks
      setFeaturedArtworks(response.data.slice(0, 3))
    } catch (error) {
      console.error(' Error fetching featured artworks:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fade-in">
      <div className="hero">
        <h1>Welcome to Chitra Vaani</h1>
        <p>Where every color tells a story. Browse beautiful artworks, order custom pieces, or collaborate on bulk projects.</p>
      </div>

      <div className="container">
        {/* Featured Artworks */}
        <section style={{ marginBottom: '5rem' }}>
          <h2 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '2rem', color: '#1a1a1a' }}>
             Featured Artworks
          </h2>
          
          {loading ? (
            <div className="loading">Loading artworks...</div>
          ) : featuredArtworks.length > 0 ? (
            <>
              <div className="gallery-grid">
                {featuredArtworks.map(artwork => (
                  <ArtworkCard key={artwork.id} artwork={artwork} />
                ))}
              </div>
              <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <Link to="/gallery" className="btn">View Full Gallery</Link>
              </div>
            </>
          ) : (
            <p style={{ textAlign: 'center', color: '#666' }}>No artworks available yet.</p>
          )}
        </section>

        {/* Services */}
        <section>
          <h2 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '2rem', color: '#1a1a1a' }}>
             Our Services
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div className="info-section">
              <h3> Custom Orders</h3>
              <p>Have a unique vision? Let's bring it to life with personalized artwork tailored just for you.</p>
              <Link to="/custom-order" className="btn">Order Custom Art</Link>
            </div>

            <div className="info-section">
              <h3> Bulk Orders</h3>
              <p>Perfect for colleges, institutions, events. Get special pricing for multiple pieces.</p>
              <Link to="/bulk-order" className="btn">Request Bulk Quote</Link>
            </div>

            <div className="info-section">
              <h3> Ready Artworks</h3>
              <p>Browse our collection of ready-to-ship artworks. Find the perfect piece for your space.</p>
              <Link to="/gallery" className="btn">Browse Gallery</Link>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section style={{ marginTop: '4rem' }}>
          <div className="info-section" style={{ background: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)', border: '2px solid #ff9800' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Why Choose Chitra Vaani?</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
              <div>
                <h3> Handcrafted Quality</h3>
                <p>Every piece is carefully crafted with attention to detail and artistic excellence.</p>
              </div>
              <div>
                <h3> Fair Pricing</h3>
                <p>Transparent pricing with special discounts for bulk orders and institutions.</p>
              </div>
              <div>
                <h3> Safe Delivery</h3>
                <p>Secure packaging and reliable shipping to ensure your artwork arrives safely.</p>
              </div>
              <div>
                <h3> Custom Solutions</h3>
                <p>Work directly with the artist to create something uniquely yours.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Home