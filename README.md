#  ChitraVaani – Handmade Art E-Commerce Platform

**ChitraVaani** is a complete online marketplace where artists can showcase and sell their handmade artwork, and customers can discover and purchase unique, one-of-a-kind pieces. Think of it as an Etsy for handmade art, built from scratch!

---

##  Live Website

**Visit:** [https://chitravaani.vercel.app](https://chitravaani.vercel.app)

The website is fully functional and live. You can browse artworks, place orders, and experience the complete shopping journey!

---

##  What is ChitraVaani?

ChitraVaani (meaning "Voice of Art" in Sanskrit) is a platform that bridges the gap between artists and art lovers. It's designed to make selling and buying handmade art simple, beautiful, and secure.

### For Customers:
- **Browse** stunning handmade artworks
- **Filter** by categories (Sketches, Digital Art, Crafts, Paintings, etc.)
- **View** detailed information about each piece
- **Order** securely with contact details
- **Connect** with the artist directly via WhatsApp or email

### For Artists (Admin):
- **Add** new artworks with images, prices, and descriptions
- **Manage** inventory and availability
- **Organize** artworks into categories
- **Track** orders and update their status
- **Control** everything from a secure admin dashboard

---

##  Key Features

###  Customer Experience
- **Beautiful Gallery:** Clean, modern interface showcasing artworks
- **Smart Filtering:** Find exactly what you're looking for by category
- **Detailed Views:** High-quality images and complete artwork information
- **Easy Ordering:** Simple form to place orders with your details
- **Direct Communication:** WhatsApp and email integration for quick artist contact
- **Mobile Friendly:** Works perfectly on phones, tablets, and desktops

###  Admin Dashboard
- **Secure Login:** Password-protected access with encrypted credentials
- **Artwork Management:** Add, edit, or delete artworks with ease
- **Category Control:** Create and manage artwork categories
- **Order Management:** View all orders and update their status
- **Image Uploads:** Direct image hosting integration
- **Real-time Updates:** Changes reflect immediately on the website

###  Security Features
- **Encrypted Passwords:** Admin passwords are hashed using industry-standard bcrypt
- **Protected Routes:** Only authorized admins can access the dashboard
- **Secure Database:** All data stored safely in MySQL
- **Environment Protection:** Sensitive information kept private
- **Safe Queries:** Protection against SQL injection attacks

---

##  Technology Stack

### Frontend (What You See)
- **React** - Modern JavaScript framework for building the interface
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - For beautiful, responsive styling
- **Axios** - For communicating with the backend

### Backend (Behind the Scenes)
- **Node.js** - JavaScript runtime for the server
- **Express** - Web framework for building APIs
- **MySQL** - Database for storing all information
- **bcrypt** - For password encryption

### Cloud & Deployment
- **Vercel** - Hosting platform (both frontend and backend)
- **Cloudinary** - Image storage and optimization
- **MySQL Database** - Secure cloud database

---

##  How It Works

### The Simple Flow:

1. **Customer visits website** → Sees beautiful artwork gallery
2. **Customer clicks on artwork** → Views full details
3. **Customer places order** → Fills out order form
4. **Order saved to database** → Artist receives notification
5. **Artist manages via dashboard** → Updates order status
6. **Customer contacted** → Order fulfilled!

### The Technical Flow:

```
Customer Browser
       ↓
Frontend (React App)
       ↓
API Requests (Axios)
       ↓
Backend (Express Server)
       ↓
Database (MySQL)
```

---

##  Project Structure

```
ChitraVaani/
├── client/                  # Frontend React application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Different pages (Home, Admin, etc.)
│   │   ├── services/       # API communication logic
│   │   └── App.jsx         # Main application component
│   └── package.json        # Frontend dependencies
│
├── server/                  # Backend Node.js application
│   ├── routes/             # API endpoints
│   ├── config/             # Database configuration
│   ├── middleware/         # Security and authentication
│   └── server.js           # Main server file
│
├── database_setup.sql       # Database structure
└── README.md               # This file!
```

---

##  Database Structure

The application uses four main tables:

### 1. **Admin Table**
Stores admin login credentials (password is encrypted)

### 2. **Categories Table**
Different types of art (Sketches, Paintings, Digital Art, etc.)

### 3. **Artworks Table**
All the details about each artwork:
- Title, description, price
- Images
- Availability status
- Which category it belongs to

### 4. **Orders Table**
Customer orders with:
- Customer name, email, phone
- Artwork details
- Order status (Pending, Completed, Cancelled)
- Order date

---

##  Running Locally

Want to run this on your own computer? Here's how:

### Prerequisites
- Node.js installed on your computer
- MySQL database
- A code editor (like VS Code)

### Steps:

#### 1. **Clone the Repository**
```bash
git clone https://github.com/yourusername/chitravaani.git
cd chitravaani
```

#### 2. **Set Up Backend**
```bash
cd server
npm install
```

Create a `.env` file in the server folder with your database details:
```
DB_HOST=your-database-host
DB_USER=your-database-username
DB_PASSWORD=your-database-password
DB_NAME=chitravaani
```

Start the server:
```bash
npm start
```

#### 3. **Set Up Frontend**
Open a new terminal:
```bash
cd client
npm install
```

Create a `.env` file in the client folder:
```
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm run dev
```

#### 4. **Visit the Website**
Open your browser and go to: `http://localhost:5173`

---

##  Deployment

The website is deployed on **Vercel**, a modern cloud platform:

### Frontend Deployment
- Automatically builds from the `client` folder
- Every code push triggers a new deployment
- Live at: https://chitravaani.vercel.app

### Backend Deployment
- Runs as serverless functions
- Automatically scales based on traffic
- All API routes available at `/api/...`

### Database
- Hosted on a cloud MySQL provider
- Secure connection with encrypted credentials
- Automatic backups enabled

---

##  Security Measures

1. **Password Encryption:** All admin passwords are hashed using bcrypt
2. **Environment Variables:** Sensitive data never committed to code
3. **SQL Injection Protection:** All database queries are sanitized
4. **CORS Configuration:** Only allowed origins can access the API
5. **Route Protection:** Admin routes require authentication

---

##  Future Enhancements

Planned features for future versions:

-  **Payment Integration:** Razorpay/Stripe for online payments
-  **Shopping Cart:** Add multiple items before checkout
-  **Reviews & Ratings:** Customer feedback on artworks
-  **Email Notifications:** Automatic order confirmations
-  **Analytics Dashboard:** Sales insights and statistics
-  **Advanced Search:** Search by price, date, popularity
-  **User Accounts:** Save addresses and order history
-  **Artist Profiles:** Multiple artists on one platform

---

##  Contact & Support

- **Website:** [chitravaani.vercel.app](https://chitravaani.vercel.app)
- **Email:** Available on website
- **WhatsApp:** Direct messaging from website

---

##  License

This project is built for educational and commercial purposes. All artwork displayed belongs to their respective creators.

---

##  Acknowledgments

Built with for artists and art lovers. ChitraVaani represents the perfect blend of technology and creativity, making handmade art accessible to everyone.

---

##  For Developers

### API Endpoints

**Public Routes:**
- `GET /api/artworks` - Get all artworks
- `GET /api/artworks/:id` - Get single artwork
- `GET /api/categories` - Get all categories
- `POST /api/orders` - Place an order

**Protected Routes (Require Admin Auth):**
- `POST /api/admin/login` - Admin login
- `POST /api/artworks` - Add new artwork
- `PUT /api/artworks/:id` - Update artwork
- `DELETE /api/artworks/:id` - Delete artwork
- `GET /api/orders` - Get all orders
- `PUT /api/orders/:id` - Update order status

### Environment Variables Required

**Server (.env):**
```
PORT=5000
DB_HOST=your-host
DB_USER=your-user
DB_PASSWORD=your-password
DB_NAME=chitravaani
CLOUD_NAME=your-cloudinary-name
CLOUD_API_KEY=your-key
CLOUD_API_SECRET=your-secret
JWT_SECRET=your-jwt-secret
CLIENT_URL=https://your-frontend-url.com
```

**Client (.env):**
```
VITE_API_URL=https://your-backend-url.com/api
VITE_WHATSAPP_NUMBER=your-number
VITE_ARTIST_EMAIL=your-email
```

---

##  Learning Resources

This project demonstrates:
- Full-stack development (Frontend + Backend + Database)
- RESTful API design
- Authentication and authorization
- Cloud deployment
- Modern React patterns
- Database design and relationships
- Security best practices

Perfect for understanding how real-world e-commerce applications work!

---

**Made by DEBASMITA | ChitraVaani © 2025**