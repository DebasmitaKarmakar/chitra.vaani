#  ChitraVaani — Handmade Art E-Commerce Platform

ChitraVaani is a full-stack e-commerce web application focused on **handmade art and custom creations**.  
It lets visitors browse artworks, view details, and place orders, while the admin can securely manage artworks, categories, and orders through a protected dashboard.

The project is built as a **React (Vite) + Node.js + Express + MySQL** stack and is **deployed on Vercel**.  
This README documents the **architecture, implementation details, database design, APIs, and deployment steps** for academic / professional evaluation.

---

##  Live Project

- **Frontend (client):** `https://chitravaani.vercel.app`
- **Backend (server):** Deployed on **Vercel serverless functions** (API routes exposed under `/api/...`)
- **Database:** MySQL (configured using `database_setup.sql`)

>  Environment variables (DB credentials, secrets, etc.) are kept in `.env` files and are **not committed** to Git.

---

##  Table of Contents

1. [Project Overview](#-project-overview)  
2. [System Architecture](#-system-architecture)  
3. [Features](#-features)  
4. [Tech Stack](#-tech-stack)  
5. [Folder Structure](#-folder-structure)  
6. [Database Design](#-database-design)  
7. [Backend Implementation (Node + Express)](#-backend-implementation-node--express)  
8. [Frontend Implementation (React + Vite)](#-frontend-implementation-react--vite)  
9. [Environment Variables](#-environment-variables)  
10. [Running the Project Locally](#-running-the-project-locally)  
11. [Deployment on Vercel](#-deployment-on-vercel)  
12. [Security & Best Practices](#-security--best-practices)  
13. [Future Enhancements](#-future-enhancements)  
14. [Conclusion](#-conclusion)

---

## 📌 1. Project Overview

ChitraVaani focuses on offering art that carries meaning — not mass-produced items, but carefully crafted pieces made with emotion, discipline, and creativity.  
The platform allows:

- Users to browse art collections, view item details, and place orders.
- The artist/admin to manage artworks, categories, and orders through a secured dashboard.
- Orders to be stored in a real database along with customer information and purchase details.

ChitraVaani serves as both a **personal art business platform** and a strong demonstration of full-stack development.

---

## 🧱 System Architecture

High-level architecture:

```text
+-------------------------+        +-------------------------+
|        Frontend         |        |        Backend          |
|  React + Vite (Client)  | <----> | Node.js + Express (API) |
|                         |   API  |                         |
+------------+------------+        +------------+------------+
             ^                                   |
             |                                   v
             |                          +------------------+
             |                          |     MySQL DB     |
             +------------------------> | (Art, Orders,    |
                                        |  Categories,     |
                                        |  Admin Users)    |
                                        +------------------+
- Frontend hosted on **Vercel (static React build)**  
- Backend handled through **Vercel serverless functions**  
- Database stored in **MySQL**, accessed securely with environment variables

---

##  3. Features

### 🖼 User Features
- Browse all artworks with image, title, price, availability, etc.
- Filter by categories (Sketch, Craft, Digital, etc.)
- View complete details of each artwork
- Place orders securely by submitting customer details

###  Admin Features
- Secure login using **bcrypt-hashed password**
- Add / edit / delete artworks
- Manage orders and update order status
- Manage categories for product organization

### ⚙ Technical Features
- REST API with Express
- SQL relational DB with foreign keys
- Cloud-ready deployment with environment variables
- Clean `.gitignore` preventing `node_modules`, `.env`, and build files

---

## 🛠 4. Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React (Vite), Axios, CSS/Tailwind |
| **Backend** | Node.js, Express, MySQL2 |
| **Security** | bcrypt hashing, CORS |
| **Database** | MySQL |
| **Deployment** | Vercel (Client + APIs) |

---

##  5. Folder Structure
chitra.vaani/
│
├── client/ # React Frontend
│ ├── public/ # Static assets
│ └── src/
│ ├── pages/ # Screens (Admin, Gallery, Home...)
│ ├── components/ # UI Components (Card, Navbar, etc.)
│ ├── App.jsx # Main Component
│ ├── App.jsx # Main Component main.jsx # Root Entry
│ └── .env
├── server/ # Backend
│ ├── db.js # Database Connection Pool
│ ├── routes/ # API Routes
│ ├── server.js # Express App
│ ├── vercel.json # Deployment Config
│ └── .env
├── database_setup.sql # Table Creation + Schema
├── .gitignore # Ignored files
├── package.json # Dependencies
└── README.md # Documentation

##  6. Database Design
###  Tables Used
| Table | Purpose |
|-------|---------|
| `admin` | Stores admin login with hashed password |
| `categories` | Stores art types |
| `artworks` | Stores each product |
| `orders` | Stores customer orders |

##  7. Backend Implementation
### highlights
- Uses Express Router for cleaner API structure
- bcrypt.compare validates hashed passwords
- MySQL connection pooling for performance
- API endpoints use async/await

##  8. Frontend Implementation (React + Vite)
### highlights
- Fetches data from /api/... endpoints using Axios
- React Components used for UI separation
- Hooks used for state management (useState, useEffect)
- Admin forms submit data via POST

## 9. Environmental Variables
ChitraVaani uses environment variables for database connection, authentication, email services, media uploads, and frontend configuration.  
These values must be placed inside the `.env` file for the **Server** and `.env` or `.env.local` for the **Client**.

###  Server `.env` Configuration
=============== SERVER CONFIGURATION ==================
PORT=5000
NODE_ENV=development
=============== DATABASE (MySQL) ======================
DB_HOST=your-db-host-url
DB_USER=your-db-username
DB_PASSWORD=your-db-password
DB_NAME=your-database-name
DB_PORT=your-db-port
=============== CLOUDINARY (Image Uploads) ============
CLOUD_NAME=your-cloud-name
CLOUD_API_KEY=your-cloud-api-key
CLOUD_API_SECRET=your-cloud-api-secret
=============== SECURITY ==============================
JWT_SECRET=your-secure-random-jwt-secret
ADMIN_DEFAULT_PASSWORD=your-initial-admin-password # will be hashed automatically
=============== FRONTEND ORIGIN (CORS) ================
CLIENT_URL=https://your-frontend-domain.com
=============== WHATSAPP & EMAIL SERVICE ==============
WHATSAPP_NUMBER=your-phone-number-with-country-code
ARTIST_EMAIL=your-notification-email
=============== GOOGLE LOGIN ==========================
GOOGLE_CLIENT_ID=your-google-oauth-id
ADMIN_EMAILS=email1@gmail.com,email2@gmail.com # comma separated list
=============== GMAIL SMTP ============================
GMAIL_APP_PASSWORD=your-app-password-for-mail

###  Client `.env` (Frontend)

VITE_API_URL=https://your-backend-api-url.com/api
VITE_WHATSAPP_NUMBER=your-whatsapp-number
VITE_ARTIST_EMAIL=your-public-contact-email
VITE_INSTAGRAM=@your-instagram-handle
VITE_GOOGLE_CLIENT_ID=your-google-oauth-id

###  Security Note

>  **Never share `.env` files publicly.**  
> These files must be excluded from Git using `.gitignore`.

 Sensitive values include:
- Database passwords  
- JWT secret  
- Admin password  
- Cloudinary secrets  
- Gmail App Password  

🛡 If you accidentally exposed them, **generate new keys and update values immediately.**

---

###  Best Practices

- Generate a strong `JWT_SECRET` using online key generators.
- Avoid hardcoding admin username/password anywhere.
- Use environment-based switching (`production` vs `development`).
- Use separate credentials for local testing and deployment.

---

## 10. Running the Project Locally
###Backend
cd server
npm install
node server.js

###Frontend
cd client
npm install
npm run dev

## 11. Deployment on Vercel
###Frontend
- Imported directly from GitHub
- Build Command: npm run build
- Output: dist/

###Backend
- Use serverless exports:
   module.exports = app;

 All /api/... routes become backend endpoints on Vercel.

## 12. Security & Best Practices
- Passwords hashed using bcrypt
- .env values hidden
- MySQL queries sanitized
- CORS enabled
- GitHub free of node_modules & .env

## 13. Future Enhancements

 Add Razorpay / Stripe Payments
 Add Cart + Multiple-Item Checkout
 Add Admin Analytics Dashboard

## Conclusion

ChitraVaani beautifully merges handmade art with modern web technology, offering a maintainable, scalable, and secure e-commerce solution. It demonstrates strong understanding of frontend development, backend APIs, database design, authentication, and deployment.
