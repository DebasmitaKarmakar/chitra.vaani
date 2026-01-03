import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'https://chitravaani-api.vercel.app/api'

function Artists() {
  const navigate = useNavigate()
  const [artists, setArtists] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedArtistId, setExpandedArtistId] = useState(null)
  const [artistArtworks, setArtistArtworks] = useState({})
  const [loadingArtworks, setLoadingArtworks] = useState({})

  useEffect(() => {
    fetchArtists()
  }, [])

  const fetchArtists = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_URL}/artists`)
      setArtists(response.data)
      setError(null)
    } catch (error) {
      console.error('Error fetching artists:', error)
      setError('Failed to load artists. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const fetchArtistArtworks = async (artistId) => {
    if (artistArtworks[artistId]) {
      // Already loaded
      return
    }

    try {
      setLoadingArtworks(prev => ({ ...prev, [artistId]: true }))
      const response = await axios.get(`${API_URL}/artists/${artistId}`)
      setArtistArtworks(prev => ({
        ...prev,
        [artistId]: response.data.artworks || []
      }))
    } catch (error) {
      console.error('Error fetching artist artworks:', error)
    } finally {
      setLoadingArtworks(prev => ({ ...prev, [artistId]: false }))
    }
  }

  const toggleArtistArtworks = async (artistId) => {
    if (expandedArtistId === artistId) {
      setExpandedArtistId(null)
    } else {
      setExpandedArtistId(artistId)
      await fetchArtistArtworks(artistId)
    }
  }

  const handleArtworkClick = (artworkId) => {
    navigate(`/artwork/${artworkId}`)
  }

  if (loading) {
    return <div className="loading">Loading artists...</div>
  }

  if (error) {
    return <div className="container"><div className="error">{error}</div></div>
  }

  return (
    <div className="container fade-in">
      <div className="hero" style={{ padding: '5rem 2rem 4rem' }}>
        <h1>Know Your Artists</h1>
        <p>Meet the talented creators behind Chitravaani's beautiful artworks</p>
      </div>

      {artists.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#666' }}>
          <p style={{ fontSize: '1.2rem' }}>No artists to display yet.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '2rem', marginTop: '3rem' }}>
          {artists.map(artist => (
            <div 
              key={artist.id} 
              style={{
                background: '#f9f7f5',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease'
              }}
            >
              {/* Artist Info Section */}
              <div style={{
                display: 'flex',
                gap: '2rem',
                padding: '2rem',
                flexWrap: 'wrap',
                alignItems: 'flex-start'
              }}>
                {/* Profile Image */}
                <div style={{ flexShrink: 0 }}>
                  <img 
                    src={artist.profile_image_url || 'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27150%27 height=%27150%27%3E%3Crect fill=%27%23e8ddd0%27 width=%27150%27 height=%27150%27/%3E%3Ctext x=%2750%25%27 y=%2750%25%27 dominant-baseline=%27middle%27 text-anchor=%27middle%27 font-size=%2760%27 fill=%27%238b7355%27%3E%3C/text%3E%3C/svg%3E'}
                    alt={artist.name}
                    style={{
                      width: '150px',
                      height: '150px',
                      borderRadius: '12px',
                      objectFit: 'cover',
                      border: '3px solid #8b7355'
                    }}
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27150%27 height=%27150%27%3E%3Crect fill=%27%23e8ddd0%27 width=%27150%27 height=%27150%27/%3E%3Ctext x=%2750%25%27 y=%2750%25%27 dominant-baseline=%27middle%27 text-anchor=%27middle%27 font-size=%2760%27 fill=%27%238b7355%27%3E%3C/text%3E%3C/svg%3E'
                    }}
                  />
                </div>

                {/* Artist Details */}
                <div style={{ flex: 1, minWidth: '300px' }}>
                  <h2 style={{ marginBottom: '0.5rem', color: '#8b7355' }}>
                    {artist.name}
                  </h2>
                  
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                    {artist.location && (
                      <span style={{ color: '#666', fontSize: '0.95rem' }}>
                         {artist.location}
                      </span>
                    )}
                    {artist.style && (
                      <span style={{ 
                        background: '#e8ddd0', 
                        padding: '0.3rem 0.8rem', 
                        borderRadius: '12px',
                        fontSize: '0.85rem',
                        color: '#8b7355',
                        fontWeight: 600
                      }}>
                        {artist.style}
                      </span>
                    )}
                  </div>

                  {artist.bio && (
                    <p style={{ 
                      color: '#555', 
                      lineHeight: '1.6',
                      marginBottom: '1rem'
                    }}>
                      {artist.bio}
                    </p>
                  )}

                  {/* Social Links */}
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    {artist.email && (
                      <a 
                        href={`mailto:${artist.email}`} 
                        style={{ color: '#8b7355', textDecoration: 'none' }}
                      >
                         Email
                      </a>
                    )}
                    {artist.instagram && (
                      <a 
                        href={`https://instagram.com/${artist.instagram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#8b7355', textDecoration: 'none' }}
                      >
                         Instagram
                      </a>
                    )}
                    {artist.facebook && (
                      <a 
                        href={artist.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#8b7355', textDecoration: 'none' }}
                      >
                         Facebook
                      </a>
                    )}
                    {artist.website && (
                      <a 
                        href={artist.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#8b7355', textDecoration: 'none' }}
                      >
                        Website
                      </a>
                    )}
                  </div>

                  {/* View Artworks Button */}
                  <button
                    className="btn"
                    onClick={() => toggleArtistArtworks(artist.id)}
                    style={{ 
                      padding: '0.8rem 1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    {expandedArtistId === artist.id ? '▲' : '▼'} 
                    {artist.artwork_count > 0 
                      ? `View Artworks (${artist.artwork_count})` 
                      : 'View Artworks'}
                  </button>
                </div>
              </div>

              {/* Artworks Section (Expandable) */}
              {expandedArtistId === artist.id && (
                <div style={{
                  background: '#fff',
                  padding: '2rem',
                  borderTop: '2px solid #e8ddd0'
                }}>
                  <h3 style={{ marginBottom: '1.5rem', color: '#8b7355' }}>
                    Artworks by {artist.name}
                  </h3>

                  {loadingArtworks[artist.id] ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                      Loading artworks...
                    </div>
                  ) : artistArtworks[artist.id]?.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                      No artworks available yet.
                    </div>
                  ) : (
                    <div style={{
                      display: 'flex',
                      gap: '1.5rem',
                      overflowX: 'auto',
                      paddingBottom: '1rem'
                    }}>
                      {artistArtworks[artist.id]?.map(artwork => {
                        const photos = typeof artwork.photos === 'string' 
                          ? JSON.parse(artwork.photos) 
                          : artwork.photos
                        
                        return (
                          <div
                            key={artwork.id}
                            onClick={() => handleArtworkClick(artwork.id)}
                            style={{
                              minWidth: '200px',
                              cursor: 'pointer',
                              transition: 'transform 0.2s',
                              borderRadius: '12px',
                              overflow: 'hidden',
                              background: '#f9f7f5',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                          >
                            <img
                              src={photos[0]?.url}
                              alt={artwork.title}
                              style={{
                                width: '100%',
                                height: '200px',
                                objectFit: 'cover'
                              }}
                              onError={(e) => {
                                e.target.src = 'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27200%27 height=%27200%27%3E%3Crect fill=%27%23e8ddd0%27 width=%27200%27 height=%27200%27/%3E%3Ctext x=%2750%25%27 y=%2750%25%27 dominant-baseline=%27middle%27 text-anchor=%27middle%27 font-size=%2740%27 fill=%27%238b7355%27%3E%3C/text%3E%3C/svg%3E'
                              }}
                            />
                            <div style={{ padding: '1rem' }}>
                              <h4 style={{ 
                                fontSize: '1rem', 
                                marginBottom: '0.5rem',
                                color: '#333'
                              }}>
                                {artwork.title}
                              </h4>
                              <p style={{ 
                                color: '#8b7355', 
                                fontWeight: 600,
                                fontSize: '0.95rem'
                              }}>
                                {artwork.price}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Artists;