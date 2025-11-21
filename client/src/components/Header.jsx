import { Link, useLocation } from 'react-router-dom'

function Header() {
  const location = useLocation()

  const isActive = (path) => {
    return location.pathname === path ? 'active' : ''
  }

  return (
    <header className="header">
      <nav>
        <ul>
          <li><Link to="/" className={isActive('/')}> Home</Link></li>
          <li><Link to="/gallery" className={isActive('/gallery')}> Gallery</Link></li>
          <li><Link to="/custom-order" className={isActive('/custom-order')}> Custom Orders</Link></li>
          <li><Link to="/bulk-order" className={isActive('/bulk-order')}> Bulk Orders</Link></li>
          <li><Link to="/contact" className={isActive('/contact')}> Contact & Feedback</Link></li>
          <li><Link to="/admin" className={isActive('/admin')}> Admin</Link></li>
        </ul>
      </nav>
    </header>
  )
}

export default Header