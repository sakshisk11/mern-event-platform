A full-stack event management platform built with the **MERN stack** (MongoDB, Express, React, Node.js). Users can browse events, book tickets with unique codes, and present them for verification. Admins can create, edit, and delete events.

---

## ✨ Features

### 👤 For Users
- **Secure Landing:** Application starts at the **Login** page to ensure authenticated access.
- **Browse Events:** View all upcoming events with category filters at `/home`.
- **Book Tickets:** Book tickets by entering attendee name & ID.
- **Dashboard:** View booked tickets with unique **8-character ticket codes**.
- **Real-time Availability:** Seat tracking with dynamic progress bars.

### 👑 For Admins
- **Event Management:** Create, edit, and delete events from a premium dashboard.
- **Manual Verification:** Use the **Verify Ticket** page to enter and validate ticket codes.
- **One-Time Use:** Each ticket can only be used **once** to prevent reuse.
  - ✅ **VALID** — first scan, allow entry (ticket marked as used in database).
  - ⚠️ **ALREADY USED** — previously validated, deny entry.
  - ❌ **INVALID** — code not found.
- **Admin Stats Dashboard:** A dedicated page (`/admin/dashboard`) to view booked/remaining spots and full attendee lists for every event.

---

## 🛠️ Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React.js (Vite), Vanilla CSS        |
| Backend    | Node.js, Express.js                 |
| Database   | MongoDB Atlas (Mongoose ODM)        |
| Auth       | JWT (JSON Web Tokens) + bcryptjs    |

---

## 📂 Project Structure

```
mern-event-platform/
├── backend/
│   ├── config/
│   │   └── db.js               # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js   # Register, Login, Profile (Auto-assigns codes)
│   │   └── eventController.js  # CRUD + Book + Verify by Code
│   ├── middleware/
│   │   └── authMiddleware.js   # JWT protect & admin check
│   ├── models/
│   │   ├── User.js             # User schema (with bookedTickets & scanned status)
│   │   └── Event.js            # Event schema (spots, totalSpots)
│   ├── routes/
│   │   ├── authRoutes.js       # /api/auth/*
│   │   └── eventRoutes.js      # /api/events/*
│   └── server.js               # Express app entry point
│
└── frontend/
    └── src/
        ├── components/
        │   └── Navbar.jsx      # Navigation bar
        ├── pages/
        │   ├── Login.jsx       # Landing page (root route '/')
        │   ├── Home.jsx        # Event listing (/home) + booking modal
        │   ├── Dashboard.jsx   # User's booked tickets with 8-char codes
        │   ├── Register.jsx    # Registration form
        │   ├── CreateEvent.jsx # Admin: create event form
        │   ├── EditEvent.jsx   # Admin: edit event form
        │   ├── VerifyTicket.jsx# Manual code verification page
        │   └── AdminDashboard.jsx # Admin: event stats & attendee lists
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
- **PC:** `http://localhost:5173` (Redirects to Login)

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
| POST   | `/verify-code/:c` | Verify ticket by code | No            |
| GET    | `/admin/stats`    | Get detailed stats    | Admin only    |

---

## 🎫 Ticket Verification System

### How the validation works:
1. **Booking:** User books a ticket → A unique **8-character code** (derived from the ticket ID) appears on their **Dashboard**.
2. **Presentation:** User shows this code to the admin at the event entry.
3. **Verification:** Admin opens the **🔍 Verify** page and types in the 8-character code.
4. **Validation Logic:**
   - **First entry** → Marks ticket as `scanned: true` → Shows ✅ **VALID** → Allow entry.
   - **Subsequent entry** → Detects already scanned status → Shows ⚠️ **ALREADY USED** → Deny entry.
   - **Unknown Code** → Shows ❌ **INVALID**.
5. **Dashboard Status:** Used tickets on the user's Dashboard show a 🔒 lock overlay and the exact scan timestamp.

> No special app or network IP needed — admin uses the web app on their device.

---

## 👩‍💻 Author

**Sakshi** — [github.com/sakshisk11](https://github.com/sakshisk11)
