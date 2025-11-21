import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Gallery from './pages/Gallery'
import Artwork from './pages/Artwork'
import CustomOrder from './pages/CustomOrder'
import BulkOrder from './pages/BulkOrder'
import Contact from './pages/Contact'
import Admin from './pages/Admin'

function App() {
  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/artwork/:id" element={<Artwork />} />
          <Route path="/custom-order" element={<CustomOrder />} />
          <Route path="/bulk-order" element={<BulkOrder />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App