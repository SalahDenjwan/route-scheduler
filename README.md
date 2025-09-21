# Route Scheduler API

A small REST API to manage drivers, routes, and assignments.  
Built with **Node.js**, **Express**, and **Prisma** (SQLite database).  

---

## Features

- **POST /drivers**: Add a new driver with name, license type, and availability.  
- **POST /routes**: Add a new route with start/end location, distance, and estimated time. Automatically assigns the first available driver if any.  
- **GET /schedule**: See all routes and which driver is assigned. Routes without available drivers are marked as `unassigned`.  
- **GET /drivers/:id/history**: Get all past routes assigned to a specific driver.  
- **GET /routes?page=&limit=**: Pagination support for routes. Default page = 1, default limit = 10.  

---

## Setup Instructions

1. **Clone the repo**
```bash
git clone https://github.com/YourUsername/route-scheduler.git
cd route-scheduler


2 - Install dependencies
npm install


3- Run migrations and generate Prisma client
npx prisma migrate dev --name init
npx prisma generate

4 Start the server
npm run dev

5 Test the API

Use Postman
 or similar tool.

Base URL: http://localhost:3000


Assumptions

Each driver can handle only one active route at a time.

When adding a new route, the system automatically assigns the first available driver.

If no drivers are available, the route is marked as unassigned.

The database used is SQLite for simplicity.

Notes

This is a simple backend project to demonstrate API design, Prisma ORM usage, and business logic implementation.

All endpoints accept and return JSON.


