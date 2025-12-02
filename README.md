# ChitraVaani - Handmade Art E-Commerce Platform

A complete full-stack web application for showcasing and selling handmade artwork, featuring a customer-facing gallery and a secure admin dashboard for inventory management.

**Live Website:** [https://chitravaani.vercel.app](https://chitravaani.vercel.app)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Installation](#installation)
- [Configuration](#configuration)
- [Database Schema](#database-schema)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Security](#security)
- [Future Enhancements](#future-enhancements)

---

## Overview

ChitraVaani (Sanskrit: "Voice of Art") is an online marketplace connecting artists with art enthusiasts. The platform enables artists to showcase their handmade creations while providing customers with an intuitive browsing and purchasing experience.

### Key Capabilities

**For Customers:**
- Browse curated artwork collections
- Filter by categories (Paintings, Bookmarks, Handbands, Origami, Clay Work etc.)
- View detailed artwork information with high-quality images
- Place orders through multiple channels WhatsApp for direct communication
- Submit feedback and ratings
- Direct artist communication via WhatsApp/Email

**For Artists (Admin):**
- Secure admin dashboard with authentication
- Complete artwork lifecycle management (Create, Read, Update, Delete)
- Category organization and management
- Order tracking and status updates
- Customer feedback monitoring
- Data export functionality (Excel format)

---

## Features

### Customer Interface
- **Responsive Gallery** - Mobile-first design with grid layout
- **Advanced Filtering** - Category-based artwork filtering
- **Detailed Views** - Multiple image carousel with zoom capability
- **Dual Ordering System** - Database orders + instant WhatsApp integration
- **Feedback System** - Star ratings with detailed feedback forms
- **Direct Communication** - Integrated WhatsApp and email contact

### Admin Dashboard
- **Authentication System** - Secure login with JWT tokens and Google OAuth
- **Artwork Management** - CRUD operations with image upload to Cloudinary
- **Category Control** - Dynamic category creation and management
- **Order Management** - Real-time order tracking with status updates
- **Feedback Dashboard** - Customer feedback overview with statistics
- **Data Export** - Excel export for orders, artworks, and feedback
- **Real-time Stats** - Dashboard metrics with auto-refresh capability

### Security Features
- Password hashing using bcrypt (10 salt rounds)
- JWT-based authentication with 7-day expiration
- Protected API routes with middleware verification
- SQL injection prevention through parameterized queries
- CORS protection with whitelist configuration
- Rate limiting on authentication endpoints
- Environment variable protection

---

## Technology Stack

### Frontend
```
React 18.3.1          - UI framework
Vite 5.3.0            - Build tool and dev server
React Router 6.28.0   - Client-side routing
Axios 1.7.2           - HTTP client
Google OAuth 0.12.2   - Google authentication
```

### Backend
```
Node.js 22.x          - Runtime environment
Express 4.21.2        - Web framework
MySQL2 3.15.3         - Database driver
bcryptjs 2.4.3        - Password hashing
jsonwebtoken 9.0.2    - JWT authentication
Multer 1.4.5          - File upload handling
Cloudinary 1.41.3     - Image hosting
ExcelJS 4.4.0         - Excel generation
Joi 18.0.2            - Input validation
Helmet 8.1.0          - Security headers
Express Rate Limit    - DDoS protection
```

### Cloud Services
```
Vercel                - Frontend & Backend hosting
Cloudinary            - Image CDN and storage
MySQL (Aiven)         - Cloud database with SSL
```

---

## Architecture

### System Design

```
┌─────────────────┐
│  Client Browser │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  React Frontend │ (Vercel)
│   Port: 5173    │
└────────┬────────┘
         │
         ▼ HTTP/HTTPS
┌─────────────────┐
│  Express API    │ (Vercel Serverless)
│   Port: 5000    │
└────────┬────────┘
         │
         ├─────────► Cloudinary (Images)
         │
         └─────────► MySQL Database (Aiven)
```

### Directory Structure

```
chitravaani/
├── client/                      # Frontend application
│   ├── public/
│   │   ├── favicon.ico
│   │   └── payment-qr.jpg
│   ├── src/
│   │   ├── assets/
│   │   │   └── styles.css       # Global styles
│   │   ├── components/
│   │   │   ├── ArtworkCard.jsx  # Gallery card component
│   │   │   ├── Footer.jsx
│   │   │   └── Header.jsx
│   │   ├── pages/
│   │   │   ├── Admin.jsx        # Admin dashboard
│   │   │   ├── Artwork.jsx      # Single artwork view
│   │   │   ├── BulkOrder.jsx    # Bulk order form
│   │   │   ├── Contact.jsx      # Contact & feedback
│   │   │   ├── CustomOrder.jsx  # Custom order form
│   │   │   ├── Gallery.jsx      # Main gallery
│   │   │   └── Home.jsx         # Landing page
│   │   ├── App.jsx              # Main app component
│   │   ├── main.jsx             # Entry point
│   │   └── index.html
│   ├── .env                     # Environment variables
│   ├── package.json
│   ├── vite.config.js
│   └── vercel.json              # Vercel config
│
├── server/                      # Backend application
│   ├── middleware/
│   │   ├── auth.js              # JWT verification
│   │   └── validation.js        # Input validation schemas
│   ├── routes/
│   │   ├── admin.js             # Admin auth & dashboard
│   │   ├── artworks.js          # Artwork CRUD
│   │   ├── categories.js        # Category management
│   │   ├── feedback.js          # Customer feedback
│   │   └── orders.js            # Order management
│   ├── change-password.js       # Password update utility
│   ├── cloudinary.js            # Image upload config
│   ├── db.js                    # Database connection
│   ├── excelExport.js           # Excel generation logic
│   ├── security-check.js        # Security audit script
│   ├── server.js                # Express server
│   ├── setup-admin.js           # Admin creation script
│   ├── .env                     # Environment variables
│   ├── package.json
│   └── vercel.json              # Vercel config
│
├── database_setup.sql           # Database schema
├── .gitignore
└── README.md
```

---

## Installation

### Prerequisites

- Node.js 18.x or higher
- MySQL 8.0 or higher
- npm or yarn package manager
- Cloudinary account (for image hosting)
- Aiven Database server for hosting cloud database service
- Git

### Local Development Setup

#### 1. Clone Repository

```bash
git clone https://github.com/DebasmitaKarmakar/chitra.vaani.git
cd chitra.vaani
```

#### 2. Database Setup

```bash
# Connect to MySQL
mysql -u root -p

# Create database
CREATE DATABASE chitravaani;
USE chitravaani;

# Import schema
SOURCE database_setup.sql;

# Verify tables
SHOW TABLES;
```

#### 3. Backend Setup

```bash
cd server
npm install

# Create .env file (see Configuration section)
touch .env

# Initialize admin user
node setup-admin.js

# Start server
npm start
```

Server will run at `http://localhost:5000`

#### 4. Frontend Setup

```bash
cd client
npm install

# Create .env file
touch .env

# Start development server
npm run dev
```

Frontend will run at `http://localhost:5173`

---

## Configuration

### Server Environment Variables

Create `server/.env`:

```env
# Server
PORT=5000
NODE_ENV=development

# Database (Aiven Cloud MySQL)
DB_HOST=your-mysql-host.aivencloud.com
DB_USER=avnadmin
DB_PASSWORD=your-secure-password
DB_NAME=defaultdb
DB_PORT=given_port_by_aiven

# Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
ADMIN_USERNAME=your-admin-username
ADMIN_PASSWORD=your-secure-password

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com

# Cloudinary Image Storage
CLOUD_NAME=your-cloudinary-name
CLOUD_API_KEY=your-api-key
CLOUD_API_SECRET=your-api-secret

# CORS
CLIENT_URL=http://localhost:5173
```

### Client Environment Variables

Create `client/.env`:

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api

# Contact Information
VITE_WHATSAPP_NUMBER=your_number
VITE_ARTIST_EMAIL=artist@example.com
VITE_INSTAGRAM=@your.handle

# Google OAuth (optional)
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

---

## Database Schema

### Tables Overview

#### 1. admin
```sql
id              INT PRIMARY KEY AUTO_INCREMENT
username        VARCHAR(50) UNIQUE NOT NULL
password_hash   VARCHAR(255) NOT NULL
created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

#### 2. categories
```sql
id              INT PRIMARY KEY AUTO_INCREMENT
name            VARCHAR(100) UNIQUE NOT NULL
created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

#### 3. artworks
```sql
id              INT PRIMARY KEY AUTO_INCREMENT
title           VARCHAR(255) NOT NULL
description     TEXT
category_id     INT (FK → categories.id)
medium          VARCHAR(100)
dimensions      VARCHAR(100)
year            VARCHAR(10)
price           VARCHAR(50) NOT NULL
photos          JSON NOT NULL
created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

#### 4. orders
```sql
id                 INT PRIMARY KEY AUTO_INCREMENT
order_type         ENUM('regular', 'custom', 'bulk')
artwork_id         INT (FK → artworks.id)
customer_name      VARCHAR(255) NOT NULL
customer_email     VARCHAR(255) NOT NULL
customer_phone     VARCHAR(20) NOT NULL
delivery_address   TEXT
order_details      JSON NOT NULL
status             ENUM('Pending', 'Completed', 'Cancelled')
created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at         TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
```

#### 5. feedback
```sql
id                 INT PRIMARY KEY AUTO_INCREMENT
customer_name      VARCHAR(255) NOT NULL
customer_email     VARCHAR(255) NOT NULL
customer_phone     VARCHAR(20)
subject            VARCHAR(200) NOT NULL
message            TEXT NOT NULL
rating             INT (1-5) NOT NULL
status             VARCHAR(20) DEFAULT 'Pending'
created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at         TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
```

---

## API Documentation

### Base URL
- **Development:** `http://localhost:5000/api`
- **Production:** `https://chitravaani-api.vercel.app/api`

### Public Endpoints

#### Artworks
```
GET    /artworks              - Get all artworks
GET    /artworks/:id          - Get single artwork
```

#### Categories
```
GET    /categories            - Get all categories
```

#### Orders
```
POST   /orders                - Create new order
```

#### Feedback
```
POST   /feedback              - Submit feedback
```

### Protected Endpoints (Require JWT)

#### Authentication
```
POST   /admin/login           - Admin login
POST   /admin/google-login    - Google OAuth login
GET    /admin/verify          - Verify JWT token
POST   /admin/change-password - Update password
```

#### Admin Dashboard
```
GET    /admin/dashboard/stats - Get dashboard statistics
```

#### Artwork Management
```
POST   /artworks              - Create artwork (with image upload)
DELETE /artworks/:id          - Delete artwork
```

#### Category Management
```
POST   /categories            - Create category
DELETE /categories/:id        - Delete category
```

#### Order Management
```
GET    /orders                - Get all orders
GET    /orders/:id            - Get single order
PATCH  /orders/:id/status     - Update order status
DELETE /orders/:id            - Delete order
GET    /orders/stats/summary  - Get order statistics
```

#### Feedback Management
```
GET    /feedback              - Get all feedback
GET    /feedback/:id          - Get single feedback
PATCH  /feedback/:id/status   - Update feedback status
DELETE /feedback/:id          - Delete feedback
GET    /feedback/stats/summary - Get feedback statistics
```

#### Data Export
```
GET    /admin/export/orders   - Export orders as Excel
GET    /admin/export/artworks - Export artworks as Excel
GET    /admin/export/feedback - Export feedback as Excel
```

### Request/Response Examples

#### Create Order
```http
POST /api/orders
Content-Type: application/json

{
  "order_type": "regular",
  "artwork_id": 5,
  "customer_name": "John Doe",
  "customer_email": "john@example.com",
  "customer_phone": "9876543210",
  "delivery_address": "123 Main St, City, State 12345",
  "order_details": {
    "size": "medium",
    "notes": "Please frame it"
  }
}
```

Response:
```json
{
  "message": "Order created successfully",
  "orderId": 42
}
```

#### Admin Login
```http
POST /api/admin/login
Content-Type: application/json

{
  "username": "admin",
  "password": "secure_password"
}
```

Response:
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": 1,
    "username": "admin",
    "role": "admin"
  }
}
```

---

## Deployment

### Vercel Deployment

#### Frontend Deployment

1. **Connect Repository to Vercel**
   - Import project from GitHub
   - Select `client` directory as root
   - Framework preset: Vite

2. **Configure Build Settings**
   ```
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

3. **Add Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add all variables from `client/.env`

#### Backend Deployment

1. **Configure Vercel Settings**
   - Select `server` directory as root
   - Add `vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ]
}
```

2. **Add Environment Variables**
   - Add all variables from `server/.env`
   - Ensure `CLIENT_URL` points to frontend URL

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Database Migration

For production database:

1. **Export Local Data**
   ```bash
   mysqldump -u root -p chitravaani > backup.sql
   ```

2. **Import to Cloud Database**
   ```bash
   mysql -h your-host -u user -p defaultdb < backup.sql
   ```

---

## Security

### Implemented Security Measures

1. **Authentication & Authorization**
   - JWT tokens with 7-day expiration
   - bcrypt password hashing (10 rounds)
   - Protected admin routes with middleware
   - Google OAuth integration

2. **Input Validation**
   - Joi schema validation on all inputs
   - SQL injection prevention via parameterized queries
   - XSS protection through input sanitization
   - File upload restrictions (images only, 10MB limit)

3. **Network Security**
   - CORS whitelist configuration
   - Rate limiting (15min window, 100 requests)
   - Helmet.js security headers
   - HTTPS enforcement in production

4. **Data Protection**
   - Environment variable isolation
   - Database connection with SSL
   - Sensitive data never logged
   - Secure session management

### Security Audit

Run security check:
```bash
cd server
node security-check.js
```

---

## Future Enhancements

### Phase 1 (Q1 2025)
- Payment gateway integration (Razorpay/Stripe)
- Shopping cart functionality
- Email notification system
- Order invoice generation

### Phase 2 (Q2 2025)
- Customer accounts with order history
- Advanced search and filtering
- Wishlist functionality
- Review and rating system for artworks

### Phase 3 (Q3 2025)
- Multi-vendor support
- Artist profile pages
- Analytics dashboard
- Mobile app (React Native)

### Phase 4 (Q4 2025)
- AI-powered artwork recommendations
- Augmented reality preview
- Social media integration
- Affiliate program

---

### Code Standards
- Follow ESLint configuration
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation for API changes
- Test all features before submitting


---

## Acknowledgments

- **Artist:** Debasmita Karmakar
- **Framework:** React, Express, MySQL
- **Hosting:** Vercel
- **Image CDN:** Cloudinary
- **Icons:** Lucide React

---

## Contact & Support

- **Live Website:** [chitravaani.vercel.app](https://chitravaani.vercel.app)
- **Email:** debasmitak10@gmail.com
- **Instagram:** @chitra.vaani

---

## Project Status

**Status:** Active Development  
**Version:** 2.0.0  
**Last Updated:** December 2025  
**Maintained:** Yes

---


**Built with passion for artists and art enthusiasts | ChitraVaani © 2025**

