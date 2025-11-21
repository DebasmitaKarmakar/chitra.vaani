function Footer() {
  const email = import.meta.env.VITE_ARTIST_EMAIL
  const instagram = import.meta.env.VITE_INSTAGRAM

  return (
    <footer className="footer">
      <p>&copy; 2025 DEBASMITA - Chitra Vaani. All rights reserved.</p>
      <p>
        Email: <a href={`mailto:${email}`}>{email}</a>
      </p>
      <p style={{ marginTop: '1rem' }}>
        <a href={`https://instagram.com/${instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer">
          Instagram: {instagram}
        </a>
      </p>
    </footer>
  )
}

export default Footer