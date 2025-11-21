# ChitraVaani — Handmade Art E-Commerce Platform

ChitraVaani is a full-stack e-commerce web application focused on **handmade art and custom creations**. It lets visitors browse artworks, view details, and place orders, while the admin can securely manage artworks, categories, and orders through a protected dashboard.

The project is built using **React (Vite) + Node.js + Express + MySQL** and is **deployed on Vercel**. This README documents the **architecture, implementation details, database design, APIs, and deployment steps** for academic / professional evaluation.

---

## Live Project

* **Frontend:** https://chitravaani.vercel.app
* **Backend:** Deployed on Vercel serverless functions (`/api/...`)
* **Database:** MySQL (import via `database_setup.sql`)

> Sensitive values like DB credentials and tokens are stored in `.env` files and **not committed** to GitHub.

---

## Table of Contents

1.  [Project Overview](#1-project-overview)
2.  [System Architecture](#2-system-architecture)
3.  [Features](#3-features)
4.  [Tech Stack](#4-tech-stack)
5.  [Folder Structure](#5-folder-structure)
6.  [Database Design](#6-database-design)
7.  [Backend Implementation (Node + Express)](#7-backend-implementation-node--express)
8.  [Frontend Implementation (React + Vite)](#8-frontend-implementation-react--vite)
9.  [Environment Variables](#9-environment-variables)
10. [Running the Project Locally](#10-running-the-project-locally)
11. [Deployment on Vercel](#11-deployment-on-vercel)
12. [Security & Best Practices](#12-security--best-practices)
13. [Future Enhancements](#13-future-enhancements)
14. [Conclusion](#conclusion)

---

## 1. Project Overview

ChitraVaani focuses on presenting **meaningful handmade artwork**, created with creativity and passion. The platform enables:

* Artists/Admins to manage artworks, categories, and orders securely.
* Users to browse, explore, and order unique art pieces.
* Orders to be stored in a real database along with user and artwork info.

ChitraVaani functions both as a **real art business platform** and a **full-stack engineering project**.

---

## 2. System Architecture

The application follows a standard three-tier architecture:

\`\`\`yaml
+-------------------------+         +-------------------------+
|        Frontend         |         |         Backend         |
| React + Vite (Client)   | <-----> | Node.js + Express (API) |
+------------+------------+         +------------+------------+
             ^                                   |
             | API Request/Response              v
             |                         +------------------+
             +-----------------------> |     MySQL DB     |
                                       | Art, Orders,     |
                                       | Categories,      |
                                       | Admin Users      |
                                       +------------------+
\`\`\`

* **Frontend** hosted on Vercel (static site)
* **Backend** on Vercel serverless functions
* **Database** using MySQL with secure credentials

---

## 3. Features

### User Features

* Browse artworks with images, price, title, and availability.
* Filter by categories (Sketches, Digital Art, Crafts, etc.).
* View full description of each artwork.
* Secure art order placement with contact details.

### Admin Features

* Encrypted admin authentication using **bcrypt**.
* Add / edit / delete artworks.
* Manage categories.
* View and update order statuses.

### Technical Features

* REST API architecture with Express.
* SQL relational database.
* Cloud-ready configuration via `.env`.
* Clean Git repository (ignores `node_modules`, `.env`, build files).

---

## 4. Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React (Vite), Axios, Tailwind/CSS |
| **Backend** | Node.js, Express, MySQL2 |
| **Security** | bcrypt, CORS |
| **Database** | MySQL |
| **Deployment** | Vercel (Client + Serverless APIs) |

---

## 5. Folder Structure

\`\`\`bash
chitra.vaani/
│
├── client/                     # React Frontend
│   ├── public/                 # Static assets
│   └── src/
│       ├── pages/              # Screens (Home, Gallery, Admin...)
│       ├── components/         # UI Components (Navbar, Cards, Forms...)
│       ├── App.jsx             # Main React Component
│       └── main.jsx            # Root Entry
│
├── server/                     # Backend
│   ├── db.js                   # MySQL Connection Pool
│   ├── routes/                 # API Routes
│   ├── server.js               # Express App
│   └── vercel.json             # Serverless Deploy Config
│
├── database_setup.sql          # Database Schema
├── .gitignore                  # Ignore rules (node_modules, env, build)
├── package.json                # Project Dependencies
└── README.md                   # Documentation
\`\`\`

---

## 6. Database Design

| Table | Description |
| :--- | :--- |
| `admin` | Stores admin login credentials (hashed password) |
| `categories` | Stores artwork category names |
| `artworks` | Stores product info (image, price, availability, etc.) |
| `orders` | Stores customer order details |

---

## 7. Backend Implementation (Node + Express)

The backend uses Express Router to structure routes for artworks, categories, and admin authentication. Passwords are hashed using **bcrypt**, ensuring no plain text credentials are stored. The server interacts with MySQL using a connection pool for improved performance. All queries and routes are built using `async/await` for cleaner logic.

### Example: Admin Login

\`\`\`javascript
app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body;
  const [rows] = await pool.query('SELECT * FROM admin WHERE username = ?', [username]);
  if (!rows.length) return res.status(401).json({ message: 'Invalid user' });

  const isValid = await bcrypt.compare(password, rows[0].password_hash);
  if (!isValid) return res.status(401).json({ message: 'Wrong password' });

  res.json({ message: 'Login Successful' });
});
\`\`\`

---

## 8. Frontend Implementation (React + Vite)

The frontend is built using React with Vite, providing fast build performance. UI is component-based, with separate files for cards, forms, navbars, and pages. All data is fetched via **Axios** from `/api/...` endpoints. Admin forms submit data using POST, while public views fetch data using GET.

### Example Fetch Call

\`\`\`javascript
const fetchArtworks = async () => {
  const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/artworks`);
  setData(res.data);
};
\`\`\`

---

## 9. Environment Variables

Environment variables are used to securely store configuration values. **Never commit `.env` files to GitHub.**

### Server `.env`

\`\`\`ini
PORT=5000
NODE_ENV=development

DB_HOST=your-db-host-url
DB_USER=your-db-username
DB_PASSWORD=your-db-password
DB_NAME=your-database-name
DB_PORT=your-db-port

CLOUD_NAME=your-cloud-name
CLOUD_API_KEY=your-cloud-api-key
CLOUD_API_SECRET=your-cloud-api-secret

JWT_SECRET=your-secure-random-secret
ADMIN_DEFAULT_PASSWORD=your-admin-password

CLIENT_URL=https://your-frontend-url.com

WHATSAPP_NUMBER=your-phone
ARTIST_EMAIL=your-email

GOOGLE_CLIENT_ID=your-google-client-id
ADMIN_EMAILS=email1@gmail.com,email2@gmail.com

GMAIL_APP_PASSWORD=your-gmail-app-password
\`\`\`

### Client `.env`

\`\`\`ini
VITE_API_URL=https://your-backend-api.com/api
VITE_WHATSAPP_NUMBER=your-number
VITE_ARTIST_EMAIL=your-email
VITE_INSTAGRAM=@your-instagram
VITE_GOOGLE_CLIENT_ID=your-google-client-id
\`\`\`

---

## 10. Running the Project Locally

### Backend

\`\`\`bash
cd server
npm install
# Ensure .env is configured
node server.js
\`\`\`

### Frontend

\`\`\`bash
cd client
npm install
# Ensure .env is configured
npm run dev
\`\`\`

---

## 11. Deployment on Vercel

### Frontend

The frontend is deployed as a static site:

* **Imported from:** GitHub repository
* **Build Command:** `npm run build`
* **Output Folder:** `dist`

### Backend (Vercel Serverless)

The backend is configured for Vercel Serverless using a `vercel.json` configuration file, which points to the main Express app export:

\`\`\`javascript
module.exports = app;
\`\`\`
All `/api/...` routes are deployed as serverless functions automatically. Environment variables are configured directly in the Vercel dashboard.

---

## 12. Security & Best Practices

* Admin passwords hashed using **bcrypt**.
* Environment secrets stored securely in `.env` and Vercel environment variables.
* Sanitized MySQL queries to prevent **SQL injection**.
* **CORS** enabled for controlled cross-origin resource sharing.
* GitHub repository is clean (excludes `node_modules`, `.env`, `dist/`, etc.).

---

## 13. Future Enhancements

* Integrate **Razorpay / Stripe** for seamless payment processing.
* Add a full **shopping cart system** for multi-item orders.
* Develop an **Admin analytics dashboard** for sales and inventory insights.
* Implement **Email order confirmations** using a service like Nodemailer.
* Add product **reviews and ratings**.

---

## Conclusion

ChitraVaani successfully merges handmade creativity with modern web development, demonstrating end-to-end engineering across frontend UI, backend APIs, secure authentication, database design, and cloud deployment. It stands as both a practical business tool and a strong full-stack development showcase.
