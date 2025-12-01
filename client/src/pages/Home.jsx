import { Link } from 'react-router-dom'

function Home() {
  return (
    <div className="container fade-in">
      <div className="hero">
        <h1>Welcome to Chitra Vaani</h1>
        <p>Handcrafted Art & Custom Creations</p>
      </div>

      <div className="info-section">
        <h2>About the Artist</h2>
        <p style={{ lineHeight: '1.8', fontSize: '1.1rem' }}>
          Welcome to my art studio. I create unique artworks ranging from paintings and sketches 
          to handmade crafts like bookmarks, handbands, and clay work. Each piece is carefully 
          crafted with attention to detail and quality.
        </p>
        <p style={{ lineHeight: '1.8', fontSize: '1.1rem', marginTop: '1rem' }}>
          Whether you're looking for a ready-made piece from my gallery or want something custom-designed 
          for you, I'm here to bring your vision to life.
        </p>
      </div>

      <div className="info-section">
        <h2>What I Offer</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
          
          <div style={{ 
            padding: '2rem', 
            background: '#f9f7f5', 
            borderRadius: '8px',
            border: '1px solid #e8ddd0'
          }}>
            <h3 style={{ color: '#8b7355', marginBottom: '1rem' }}>Gallery Artworks</h3>
            <p style={{ lineHeight: '1.6', color: '#555' }}>
              Browse my collection of ready-to-purchase artworks including paintings, 
              bookmarks, badges, handbands, and clay work.
            </p>
            <Link to="/gallery" className="btn" style={{ marginTop: '1.5rem', display: 'inline-block', textDecoration: 'none' }}>
              View Gallery
            </Link>
          </div>

          <div style={{ 
            padding: '2rem', 
            background: '#f9f7f5', 
            borderRadius: '8px',
            border: '1px solid #e8ddd0'
          }}>
            <h3 style={{ color: '#8b7355', marginBottom: '1rem' }}>Custom & Bulk Orders</h3>
            <p style={{ lineHeight: '1.6', color: '#555' }}>
              Have a specific idea or vision? I can create personalized artwork tailored 
              to your preferences and requirements.
            </p>
            <Link to="/Order" className="btn" style={{ marginTop: '1.5rem', display: 'inline-block', textDecoration: 'none' }}>
              Request Custom Art
            </Link>
          </div>
        </div>
      </div>

      <div className="info-section" style={{ background: '#f0f0f0', padding: '2rem', borderRadius: '8px' }}>
        <h2>Categories Available</h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
          gap: '1rem', 
          marginTop: '1.5rem' 
        }}>
          <div style={{ padding: '1rem', background: 'white', borderRadius: '6px', textAlign: 'center' }}>
            <strong>Paintings</strong>
          </div>
          <div style={{ padding: '1rem', background: 'white', borderRadius: '6px', textAlign: 'center' }}>
            <strong>Bookmarks</strong>
          </div>
          <div style={{ padding: '1rem', background: 'white', borderRadius: '6px', textAlign: 'center' }}>
            <strong>Handbands</strong>
          </div>
          <div style={{ padding: '1rem', background: 'white', borderRadius: '6px', textAlign: 'center' }}>
            <strong>Origami</strong>
          </div>
          <div style={{ padding: '1rem', background: 'white', borderRadius: '6px', textAlign: 'center' }}>
            <strong>Clay Work</strong>
          </div>
        </div>
      </div>

      <div className="info-section">
        <h2>How to Order</h2>
        <div style={{ marginTop: '1.5rem' }}>
          <div style={{ marginBottom: '1.5rem', paddingLeft: '1.5rem', borderLeft: '3px solid #8b7355' }}>
            <h4 style={{ color: '#8b7355', marginBottom: '0.5rem' }}>Step 1: Choose Your Option</h4>
            <p style={{ color: '#666' }}>Browse the gallery for ready-made items or request a custom piece</p>
          </div>
          <div style={{ marginBottom: '1.5rem', paddingLeft: '1.5rem', borderLeft: '3px solid #8b7355' }}>
            <h4 style={{ color: '#8b7355', marginBottom: '0.5rem' }}>Step 2: Place Your Order</h4>
            <p style={{ color: '#666' }}>Fill out the order form with your details and preferences</p>
          </div>
          <div style={{ marginBottom: '1.5rem', paddingLeft: '1.5rem', borderLeft: '3px solid #8b7355' }}>
            <h4 style={{ color: '#8b7355', marginBottom: '0.5rem' }}>Step 3: Confirmation</h4>
            <p style={{ color: '#666' }}>I'll contact you to confirm details and discuss payment</p>
          </div>
          <div style={{ paddingLeft: '1.5rem', borderLeft: '3px solid #8b7355' }}>
            <h4 style={{ color: '#8b7355', marginBottom: '0.5rem' }}>Step 4: Delivery</h4>
            <p style={{ color: '#666' }}>Your artwork will be carefully packaged and delivered</p>
          </div>
        </div>
      </div>

      <div className="info-section" style={{ textAlign: 'center', background: '#f9f7f5', padding: '2rem', borderRadius: '8px' }}>
        <h2>Get Started</h2>
        <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: '#555' }}>
          Ready to find your perfect artwork or create something unique?
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/gallery" className="btn" style={{ textDecoration: 'none' }}>
            Browse Gallery
          </Link>
          <Link to="/contact" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
            Contact Me
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Home