# Backend

## Tapline integration

Set the replacement key in `Backend/.env`:

```env
TAPLINE_API_KEY=replace-with-your-tapline-key
```

Never expose this key in `Frontend` or commit the `.env` file. The backend proxies South African Airbnb searches through `POST /api/tapline/search` and always sends `currency: ZAR` to `https://api.tapline.sh/api/v1/airbnb/search`.
# Airbnb Clone — Backend API

Node.js / Express / MongoDB (Mongoose) backend for the Zaio iHub Capstone Project.
Handles Users (auth), Accommodations (listings), and Reservations (bookings) for both
the public Airbnb-style frontend and the Admin frontend.

---

## Tech Stack

- **Node.js** + **Express** — server & routing
- **MongoDB** + **Mongoose** — database & schemas
- **JWT** (`jsonwebtoken`) — authentication
- **bcryptjs** — password hashing
- **express-async-handler** — cleaner async error handling
- **Jest** + **Supertest** — testing

---

## Project Structure

```
backend/
├── src/
│   ├── config/db.js              # MongoDB connection
│   ├── models/                   # Mongoose schemas
│   │   ├── User.js
│   │   ├── Accommodation.js
│   │   └── Reservation.js
│   ├── controllers/              # Business logic per resource
│   ├── routes/                   # Express routers
│   ├── middleware/
│   │   ├── authMiddleware.js     # protect / admin / hostOrAdmin
│   │   └── errorMiddleware.js    # notFound + central errorHandler
│   ├── utils/generateToken.js
│   └── app.js                    # Express app setup
├── tests/                        # Jest test suite
├── server.js                     # Entry point
├── Procfile                      # For Heroku/Render deployment
├── .env.example
└── package.json
```

---

## Getting Started

### 1. Install dependencies
```bash
cd backend
npm install
```

### 2. Set up environment variables
Copy `.env.example` to `.env` and fill in your own values:
```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `PORT` | Port the server runs on (default 5000) |
| `NODE_ENV` | `development` or `production` |
| `MONGO_URI` | Your MongoDB connection string (MongoDB Atlas recommended) |
| `JWT_SECRET` | Any long random string, used to sign tokens |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `7d` |

**Getting a free MongoDB Atlas URI:**
1. Go to mongodb.com/cloud/atlas → create a free cluster
2. Database Access → add a user with a password
3. Network Access → allow access from anywhere (`0.0.0.0/0`) for deployment
4. Connect → "Connect your application" → copy the connection string into `MONGO_URI`

### 3. Run locally
```bash
npm run dev     # with nodemon, auto-restarts on file changes
# or
npm start        # plain node
```

Server runs at `http://localhost:5000`. Test it's alive:
```bash
curl http://localhost:5000/api/health
```

### 4. Run tests
```bash
npm test
```

---

## API Reference

All responses follow this shape:
```json
{ "success": true, "data": { ... } }
```
or on error:
```json
{ "success": false, "message": "..." }
```

Protected routes require a header:
```
Authorization: Bearer <token>
```

### Auth

| Method | Endpoint | Access | Body | Description |
|---|---|---|---|---|
| POST | `/api/auth/register` | Public | `{ name, email, password, role? }` | Register as guest or host. Returns user + token. |
| POST | `/api/auth/login` | Public | `{ email, password }` | Login. Returns user + token. |
| GET | `/api/auth/me` | Private | — | Get the logged-in user's profile. |

### Accommodations (Listings)

| Method | Endpoint | Access | Body / Query | Description |
|---|---|---|---|---|
| GET | `/api/accommodations` | Public | `?city=&minPrice=&maxPrice=&guests=` | Search/browse listings. |
| GET | `/api/accommodations/:id` | Public | — | Get one listing's full details. |
| POST | `/api/accommodations` | Private (host/admin) | `{ title, description, pricePerNight, location:{address,city,country}, images[], amenities[], maxGuests, bedrooms, bathrooms }` | Create a listing. |
| PUT | `/api/accommodations/:id` | Private (owner/admin) | any subset of the above fields | Update a listing. |
| DELETE | `/api/accommodations/:id` | Private (owner/admin) | — | Delete a listing. |

### Reservations (Bookings)

| Method | Endpoint | Access | Body | Description |
|---|---|---|---|---|
| POST | `/api/reservations` | Private (any logged-in user) | `{ accommodationId, checkIn, checkOut, numGuests }` | Book a stay. Price is calculated server-side. |
| GET | `/api/reservations/mine` | Private | — | Get the logged-in user's own bookings. |
| GET | `/api/reservations` | Private (admin) | — | Get every reservation on the platform. |
| GET | `/api/reservations/:id` | Private (owner/admin) | — | Get one reservation's details. |
| PUT | `/api/reservations/:id` | Private (owner/admin) | `{ status }` | Update status: `pending` / `confirmed` / `cancelled`. |
| DELETE | `/api/reservations/:id` | Private (owner/admin) | — | Cancel/delete a reservation. |

---

## Example requests (for Postman / your frontend `fetch`)

**Register:**
```json
POST /api/auth/register
{
  "name": "Jane Host",
  "email": "jane@example.com",
  "password": "password123",
  "role": "host"
}
```

**Create a listing (host token required):**
```json
POST /api/accommodations
Authorization: Bearer <token>
{
  "title": "Cozy Apartment in Sandton",
  "description": "A modern 2-bedroom apartment close to everything.",
  "pricePerNight": 950,
  "location": { "address": "12 Main St", "city": "Johannesburg", "country": "South Africa" },
  "maxGuests": 4,
  "bedrooms": 2,
  "bathrooms": 1,
  "amenities": ["WiFi", "Pool", "Parking"]
}
```

**Book a stay (guest token required):**
```json
POST /api/reservations
Authorization: Bearer <token>
{
  "accommodationId": "<accommodation _id>",
  "checkIn": "2026-10-01",
  "checkOut": "2026-10-05",
  "numGuests": 2
}
```

---

## Roles and access

| Role | Can do |
|---|---|
| `guest` | Register, login, browse, book stays, view own bookings |
| `host` | Register, login through the dashboard, create listings, and edit or delete only their own listings |
| `admin` | Login directly through the dashboard and create, edit, delete, and share listings; view/manage all users and reservations |

> Note: `admin` accounts should be created directly in the database (or via a
> one-off seed script) — public registration only allows `guest` or `host`
> for security.

### Frontend login flow

- Guests sign up or log in from the public guest login dialog. Guests can reserve and share listings and view their own reservations in My Trips.
- Hosts select `Become a host`, create a host account at `/admin/login`, then log in there to open their host dashboard.
- Administrators use the Admin login option at `/admin/login`; no admin signup is provided.
- Hosts see the Listings dashboard only. The API verifies ownership for listing updates and deletes, so a host cannot modify another host's listing.

---

## Deployment (Render, since Heroku's free tier no longer exists)

1. Push this backend folder to its own GitHub repo (or a subfolder if using a monorepo)
2. On Render: New → Web Service → connect your repo
3. Build command: `npm install`
4. Start command: `npm start`
5. Add your environment variables (`MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `NODE_ENV=production`) in Render's dashboard
6. Deploy, then confirm `https://your-app.onrender.com/api/health` returns `{ success: true }`
7. Update your frontend's API base URL to point at this live URL

The `Procfile` (`web: node server.js`) is included so this also deploys unchanged
if your class specifically requires/still has access to Heroku.

---

## Testing

`tests/` contains Jest unit tests validating the Mongoose schemas (required fields,
password length, date logic, default values). Run with:
```bash
npm test
```

For full integration testing against a live database, use Postman against your
running local server, or extend the test suite with Supertest + a real/staging
MongoDB connection.
