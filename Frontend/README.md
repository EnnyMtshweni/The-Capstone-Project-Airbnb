# Airbnb South Africa Frontend

React and Vite frontend for the Airbnb South Africa capstone application. The frontend provides public guest browsing, listing details, reservations, saved homes, sharing, maps, guest reviews, host listing management, and an admin dashboard.
- Node.js 18 or newer
- The backend running on `http://localhost:5000`

The Vite development server runs on `http://localhost:5174` and proxies `/api` requests to the backend.

## Setup

```bash
- Administrators log in directly at `/admin/login`. Admins can:

- Create, edit, delete, and share listings
cd Frontend
npm install

Admin accounts are seeded or created directly in the backend and are not available through public signup.
npm run dev
```

For a production build:

```bash
npm run build
npm run preview
```

Available scripts:

| Command | Purpose |
|---|---|
| `npm run dev` | Start the Vite development server |
| `npm run build` | Create a production build |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |

## Main routes

| Route | Purpose |
|---|---|
| `/` | Guest home page with search and South African homes |
| `/listing/:id` | Listing details, map, reviews, sharing, saving, and reservation form |
| `/login` | Guest login page |
| `/trips` | Logged-in guest reservations, called My Trips |
| `/admin/reservations` | Reservation management |
| `/admin/users` | User and role management |

### Guest

Guests sign up or log in through the guest login flow. They can:

- Browse and search listings
- Open listing details
- View maps and reviews
- Save and share listings
- Make reservations
- View and cancel their own reservations in My Trips

Guests cannot create, edit, or delete listings.

### Host

Hosts select `Become a host`, sign up at `/admin/login`, and then log in with their host account. The host dashboard allows them to:

- Create listings
- View their own listings
- Edit their own listings
- Delete their own listings

Hosts cannot manage another host's listing, view admin users or reservations, or make guest reservations. Ownership is enforced by the backend.

### Admin

- View and manage all reservations
- View users and update roles

## Frontend structure

```text
src/
├── admin/       Admin dashboard, listing, reservation, and user pages
├── components/  Shared navigation, footer, authentication, and logo
├── pages/       Guest home, listing details, My Trips, host, and login pages
├── assets/      Local frontend assets, including the Airbnb logo
├── Lib/api.js   API calls, session helpers, normalization, and demo fallbacks
├── App.jsx      Public and admin route configuration
└── main.jsx     React entry point and BrowserRouter
```

## Backend connection

The frontend expects the backend API at port `5000`. Start it in another terminal:

```bash
cd Backend
npm install
npm run dev
```

If the backend is unavailable, the frontend uses local demo listing and reservation data so the interface remains viewable. Real reservations and host listing changes require a running backend and a valid logged-in account.

## Notes

- Listing maps open Google Maps using the listing address and city.
- The Save action stores saved listing IDs in browser local storage.
- Share uses the browser share dialog when supported and otherwise copies or presents the listing URL.
- Do not run multiple backend processes on port `5000`; `EADDRINUSE` means another process already owns that port.











If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
