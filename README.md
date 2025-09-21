# Route Scheduler API

A small REST API to manage drivers, routes, and assignments.  
Built with **Node.js**, **Express**, **Prisma**, and **SQLite**.

---

## Features & Endpoints

### 1. Add a Driver
**POST** `/drivers`  
**Payload Example:**
```json
{
  "id": 1,
  "name": "Salah Denjwan",
  "licenseType": "Heavy",
  "availability": true
}
Adds a new driver to the system.

availability defaults to true if not provided.

2. Add a Route
POST /routes
Payload Example:
 
{
  "startLocation": "Cairo",
  "endLocation": "Alexandria",
  "distance": 220,
  "estimatedTime": 4
}
Adds a new route.

Automatically assigns the first available driver (if any).

If no drivers are available, the route remains unassigned.

3. Get Schedule
GET /schedule

Returns all active route assignments.

Shows which driver is assigned to which route.

Sample Response:

 
[
  {
    "routeId": 1,
    "startLocation": "Cairo",
    "endLocation": "Alexandria",
    "driver": "Salah Denjwan"
  },
  {
    "routeId": 2,
    "startLocation": "Giza",
    "endLocation": "Luxor",
    "driver": null
  }
]
4. Get Driver History
GET /drivers/:id/history

Returns all past routes assigned to a specific driver.

Sample Response:

 
{
  "driver": "Salah Denjwan",
  "history": [
    { "routeId": 1, "startLocation": "Cairo", "endLocation": "Alexandria" }
  ]
}
5. Pagination for Routes
GET /routes?page=&limit=

Supports pagination for listing routes.

Default: page=1, limit=10.

Logic & Business Rules
Each driver can handle only one active route at a time.

Drivers with availability = true are preferred.

If no drivers are available, the route is marked unassigned.

The database used is SQLite for simplicity.

Setup Instructions
Clone the repository:

 
git clone https://github.com/SalahDenjwan/route-scheduler.git
cd route-scheduler
Install dependencies:

 
npm install
Run migrations and generate Prisma client:

 
npx prisma migrate dev --name init
npx prisma generate
Start the server:

 
npm run dev
Test the API using Postman or any similar tool.
Base URL: http://localhost:3000

Assumptions
Drivers are always added before routes.

Driver IDs are unique.

Estimated time and distance are provided as integers.

API responses and requests are in JSON format.

Notes
Simple backend project to demonstrate API design, Prisma ORM usage, and business logic implementation.

All endpoints are fully functional and tested with Postman. 