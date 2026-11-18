# Shoes Shop Admin

Back-office admin panel for the Shoes Shop e-commerce platform. Educational project.

## Tech Stack

- **React 19** + **TypeScript**
- **Vite** — build tool
- **React Router v7** — client-side routing
- **TanStack Query** — server state management
- **Axios** — HTTP client
- **Tailwind CSS** + **shadcn/ui** — styling and components
- **Keycloak** — authentication (admin role required via realm_access)

## Features

- **Products** — create, edit, delete products; manage variants, sizes, images
- **Categories** — create and manage product categories
- **Orders** — list all orders, filter by status, view order details
  - Update order status (Pending / Processing / Shipped / Delivered / Cancelled / Returned)
  - Set Nova Poshta TTN (tracking number) — auto-updates to Delivered/Returned via backend polling
  - Guest order support (name, phone, email displayed without account)
- **Reviews** — moderate product reviews (Approve / Reject / Delete), filter by status
- **Users** — list registered users
- **Login** — Keycloak authentication, redirects to login if cookie belongs to non-admin user

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

Requires an account with the `admin` realm role in Keycloak.

## API

Connects directly to backend services (no gateway). Base URL configured in `src/api/client.ts`.

Frontend repo: [shoes-shop-ui](https://github.com/vaytekus/shoes-shop-ui)

## Backlog

- **Dashboard** — order stats (today/week/month), revenue, product count, orders chart
- **httpOnly cookie for token** — replace localStorage JWT with httpOnly cookie
- **User detail page** — `/users/:id` with Keycloak info, order history, wishlist
- **CMS for static pages** — editor for `/info/*` static content pages
