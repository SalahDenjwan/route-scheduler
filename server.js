const express = require('express');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

 app.get('/', (req, res) => {
  res.send('Route Scheduler API is running  ');   //   to test api is running
});

 const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// add new driver
  app.post('/drivers', async (req, res) => {
  try {
    const { name, licenseType, availability } = req.body;

    const driver = await prisma.driver.create({
      data: {
        name,
        licenseType,
        availability: availability ?? true,
      },
    });

    res.json(driver);
  } catch (error) {
    console.error(" Error creating driver:", error);
    res.status(500).json({ error: error.message });    // real error for depugging 
  }
});
 // get all drivers
app.get('/drivers', async (req, res) => {
  try {
    const drivers = await prisma.driver.findMany();
    res.json(drivers);
  } catch (error) {
    console.error(" Error fetching drivers:", error);
    res.status(500).json({ error: error.message });
  }
});

// get driver by id
app.get('/drivers/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const driver = await prisma.driver.findUnique({
      where: { id: parseInt(id) },
    });

    if (!driver) {
      return res.status(404).json({ error: "Driver not found" });
    }

    res.json(driver);
  } catch (error) {
    console.error(" Error fetching driver:", error);
    res.status(500).json({ error: error.message });
  }
});

// add new route
// POST /routes - add new route and assign available driver
app.post('/routes', async (req, res) => {
  try {
    const { startLocation, endLocation, distance, estimatedTime } = req.body;

    if (!startLocation || !endLocation || !distance || !estimatedTime) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // create the route first
    const route = await prisma.route.create({
      data: { startLocation, endLocation, distance, estimatedTime },
    });

    // find first available driver
    const driver = await prisma.driver.findFirst({
      where: { availability: true },
    });

    let assignment = null;

    if (driver) {
      // create assignment
      assignment = await prisma.assignment.create({
        data: {
          driverId: driver.id,
          routeId: route.id,
        },
      });
    }

    // return route info + assigned driver if exists
    res.json({
      route,
      assignedDriver: driver ? driver.name : "unassigned",
    });

  } catch (error) {
    console.error("  Error creating route:", error);
    res.status(500).json({ error: error.message });
  }
});

// get schedule of routes with assigned drivers
app.get("/schedule", async (req, res) => {
  try {
    // fetch all routes with their assignments
    const routes = await prisma.route.findMany({
      include: { assignments: { include: { driver: true } } },
    });

    // fetch all available drivers (availability = true)
    const availableDrivers = await prisma.driver.findMany({
      where: { availability: true },
    });

    // build schedule
    const schedule = routes.map(route => {
      // check if route already has an assignment
      const assignedDriver = route.assignments[0]?.driver;

      if (assignedDriver) {
        return {
          routeId: route.id,
          route: `${route.startLocation} -> ${route.endLocation}`,
          driver: assignedDriver.name,
        };
      }

      // assign first available driver if exists
      const driver = availableDrivers.shift(); // take first available driver

      if (driver) {
        return {
          routeId: route.id,
          route: `${route.startLocation} -> ${route.endLocation}`,
          driver: driver.name,
        };
      }

      // if no driver available, mark as unassigned
      return {
        routeId: route.id,
        route: `${route.startLocation} -> ${route.endLocation}`,
        driver: "unassigned",
      };
    });

    res.json(schedule);
  } catch (error) {
    console.error("  Error fetching schedule:", error);
    res.status(500).json({ error: error.message });
  }
});


// get route history for a specific driver
app.get("/drivers/:id/history", async (req, res) => {
  try {
    const { id } = req.params;

    // find driver to make sure it exists
    const driver = await prisma.driver.findUnique({
      where: { id: parseInt(id) },
    });

    if (!driver) {
      return res.status(404).json({ error: "Driver not found" });
    }

    // fetch all assignments for this driver
    const assignments = await prisma.assignment.findMany({
      where: { driverId: parseInt(id) },
      include: { route: true }, // include route details
    });

    // build history array
    const history = assignments.map(a => ({
      routeId: a.route.id,
      route: `${a.route.startLocation} -> ${a.route.endLocation}`,
      assignedAt: a.assignedAt,
    }));

    res.json({
      driver: driver.name,
      history,
    });
  } catch (error) {
    console.error("  Error fetching driver history:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET /routes - with pagination
app.get("/routes", async (req, res) => {
  try {
    // get page and limit from query, default values
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // fetch routes with assignments
    const routes = await prisma.route.findMany({
      skip,
      take: limit,
      include: { assignments: { include: { driver: true } } },
    });

    // total number of routes
    const total = await prisma.route.count();

    // format routes for response
    const formattedRoutes = routes.map(route => ({
      routeId: route.id,
      route: `${route.startLocation} -> ${route.endLocation}`,
      assignedDriver: route.assignments[0]?.driver?.name || "unassigned"
    }));

    res.json({
      page,
      limit,
      total,
      routes: formattedRoutes
    });

  } catch (error) {
    console.error(" Error fetching routes:", error);
    res.status(500).json({ error: error.message });
  }
});
