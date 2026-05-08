# 🎟️ EventMaster — MERN Event Management Platform

A full-stack event management platform built with the **MERN stack** (MongoDB, Express, React, Node.js). Users can browse events, book tickets with QR codes, and scan them for verification. Admins can create, edit, and delete events.

---

## ✨ Features

### 👤 For Users
- Browse all upcoming events with category filters
- Book tickets by entering attendee name & ID
- View booked tickets with scannable **QR codes** on the Dashboard
- Real-time seat availability with progress bar

### 👑 For Admins
- Create new events (title, category, date, location, spots, description)
- Edit and delete existing events
- Scan QR codes with any phone camera to instantly see attendee Name & ID

---

## 🛠️ Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React.js (Vite), Vanilla CSS        |
| Backend    | Node.js, Express.js                 |
| Database   | MongoDB Atlas (Mongoose ODM)        |
| Auth       | JWT (JSON Web Tokens) + bcryptjs    |
| QR Codes   | qrcode.react                        |

---

## 📂 Project Structure

```
mern-event-platform/
├── backend/
│   ├── config/
│   │   └── db.js               # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js   # Register, Login, Profile
│   │   └── eventController.js  # CRUD + Book + Verify
│   ├── middleware/
│   │   └── authMiddleware.js   # JWT protect & admin check
│   ├── models/
│   │   ├── User.js             # User schema (with bookedTickets)
│   │   └── Event.js            # Event schema (spots, totalSpots)
│   ├── routes/
│   │   ├── authRoutes.js       # /api/auth/*
│   │   └── eventRoutes.js      # /api/events/*
│   ├── server.js               # Express app entry point
│   └── .env                    # Environment variables (not in git)
│
└── frontend/
    └── src/
        ├── components/
        │   └── Navbar.jsx      # Navigation bar
        ├── pages/
        │   ├── Home.jsx        # Event listing + booking modal
        │   ├── Dashboard.jsx   # User's booked tickets + QR codes
        │   ├── Login.jsx       # Login form
        │   ├── Register.jsx    # Registration form
        │   ├── CreateEvent.jsx # Admin: create event form
        │   ├── EditEvent.jsx   # Admin: edit event form
        │   └── VerifyTicket.jsx# QR scan result page
        ├── index.css           # All global styles & design tokens
        └── App.jsx             # Routes configuration
```

---

## ▶️ How to Run Locally

### Prerequisites
- Node.js installed
- A MongoDB Atlas account (free tier works)

### 1. Clone the repository
```bash
git clone https://github.com/sakshisk11/mern-event-platform.git
cd mern-event-platform
```

### 2. Set up the Backend
```bash
cd backend
npm install
```

Create a `.env` file inside the `backend/` folder:
```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secret_key
ORGANIZER_EMAIL=admin@eventpro.com
```

Start the backend server:
```bash
node server.js
```

### 3. Set up the Frontend
Open a **new terminal**:
```bash
cd frontend
npm install
npm run dev
```

### 4. Open in browser
- **PC:** `http://localhost:5173`
- **Phone (same WiFi):** `http://<your-pc-ip>:5173`

---

## 🔐 Default Accounts

| Role  | Email                  | Password   |
|-------|------------------------|------------|
| Admin | admin@eventpro.com     | admin123   |
| User  | Register via /register | your choice |

> The admin account is determined by the `ORGANIZER_EMAIL` in your `.env` file.

---

## 🔗 API Endpoints

### Auth — `/api/auth`
| Method | Endpoint    | Description        | Auth Required |
|--------|-------------|--------------------|---------------|
| POST   | `/register` | Create new account | No            |
| POST   | `/login`    | Login              | No            |
| GET    | `/profile`  | Get user + tickets | Yes           |

### Events — `/api/events`
| Method | Endpoint          | Description           | Auth Required |
|--------|-------------------|-----------------------|---------------|
| GET    | `/`               | Get all events        | No            |
| GET    | `/:id`            | Get single event      | No            |
| POST   | `/`               | Create event          | Admin only    |
| PUT    | `/:id`            | Update event          | Admin only    |
| DELETE | `/:id`            | Delete event          | Admin only    |
| PUT    | `/:id/book`       | Book a ticket         | Yes           |
| GET    | `/verify/:ticketId` | Verify QR ticket    | No            |

---

## 📱 QR Code Scanning

Each ticket on the Dashboard has a QR code that encodes the attendee's **Name and ID as plain text**.

- **No internet needed** — any phone camera can scan it directly
- **No IP address required** — works anywhere, any network
- Scanning shows a popup like:
  ```
  Name: Sakshi
  ID: 1234
  ```

Simply open your phone camera, point at the QR code, and the info appears instantly.

---

## 👩‍💻 Author

**Sakshi** — [github.com/sakshisk11](https://github.com/sakshisk11)
