import express from "express";
import cors from "cors";
import { PrismaClient } from "./prisma/generated/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const app = express();

// 🔥 1. Bulletproof CORS: Explicitly allowing your Next.js frontend
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json());

// 2. Database Connection setup for Bun + Prisma 7
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// 🟢 Health Check Route (Fixes the "Cannot GET /" screen)
app.get("/", (req, res) => {
  res.send("⚡ GreenRide API is Online and Healthy.");
});

// 🟢 GET: Fetch all South India stations
app.get("/api/stations", async (req, res) => {
  try {
    const stations = await prisma.station.findMany({
      orderBy: { city: 'asc' }
    });
    res.json(stations);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch stations" });
  }
});

// 🟢 GET: Fetch active bookings for the user
app.get("/api/bookings", async (req, res) => {
  try {
    // Grabbing the first user since we don't have JWT auth yet
    const user = await prisma.user.findFirst();
    if (!user) return res.json([]);

    const bookings = await prisma.booking.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch allocations" });
  }
});

// 🟢 POST: Create a new booking
app.post("/api/bookings", async (req, res) => {
  try {
    const { stationId } = req.body;
    const user = await prisma.user.findFirst();
    
    if (!user) {
      return res.status(400).json({ error: "No user found in the system" });
    }

    // Set the Time-To-Live (TTL) for 30 minutes from now
    const expiresAt = new Date(Date.now() + 30 * 60000); 

    const newBooking = await prisma.booking.create({
      data: {
        userId: user.id,
        stationId: stationId,
        status: "CONFIRMED",
        expiresAt: expiresAt
      }
    });

    res.json(newBooking);
  } catch (error) {
    console.error("Booking Error:", error);
    res.status(500).json({ error: "Failed to secure node" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 GreenRide API live at http://localhost:${PORT}`);
});
