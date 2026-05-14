# FoodExpress

FoodExpress is a complete MERN food delivery application with customer ordering, JWT authentication, cart checkout, role-based dashboards, and admin management for foods, users, and orders.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Axios, lucide-react, react-hot-toast
- Backend: Node.js, Express.js, MongoDB, Mongoose, JWT, bcryptjs

## Project Structure

```text
frontend/
backend/
```

## Backend Setup

```bash
cd backend
npm install
cp .env.example .env
npm run seed
npm run dev
```

Set `MONGO_URI` and `JWT_SECRET` in `backend/.env` before running the server.

Backend runs on `http://localhost:5000`.

## Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend runs on `http://localhost:5173`.

## API Routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/foods`
- `GET /api/foods/:id`
- `POST /api/foods` admin only
- `PUT /api/foods/:id` admin only
- `DELETE /api/foods/:id` admin only
- `POST /api/orders` protected
- `GET /api/orders/my-orders` protected
- `GET /api/orders` admin only
- `PUT /api/orders/:id/status` admin only
- `GET /api/users` admin only
- `GET /api/users/stats` admin only
- `PUT /api/users/profile` protected

## Notes

- User signup is available at `/register`.
- Admin signup is available at `/admin/register`.
- Admin login is available at `/admin/login`.
- Seed foods are in `backend/seed/foodSeed.js`.
