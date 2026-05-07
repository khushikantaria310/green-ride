import express from "express";
import cors from "cors";
import { PrismaClient } from "./prisma/generated/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const app = express();

app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json());

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

app.get("/", (req, res) => res.send("⚡ GreenRide API is Online."));

// 🟢 GET: Fetch all stations
app.get("/api/stations", async (req, res) => {
  try {
    const stations = await prisma.station.findMany({ orderBy: { city: 'asc' } });
    res.json(stations);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch stations" });
  }
});

// 🟢 GET: Fetch User Profile (To show real Balance!)
app.get("/api/users/me", async (req, res) => {
  try {
    const user = await prisma.user.findFirst();
    res.json(user || {});
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// 🟢 GET: Fetch active bookings
app.get("/api/bookings", async (req, res) => {
  try {
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

// 🟢 GET: Fetch Transaction Ledger
app.get("/api/transactions", async (req, res) => {
  try {
    const user = await prisma.user.findFirst();
    if (!user) return res.json([]);
    const transactions = await prisma.transaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

// 🟢 POST: Secure Booking & Payment Pipeline
app.post("/api/bookings", async (req, res) => {
  try {
    const { stationId, upiId } = req.body;
    const user = await prisma.user.findFirst();
    
    if (!user) return res.status(400).json({ error: "No user found in the system" });

    const SWAP_FEE = 149.00;

    // 1. Verify Funds before doing anything
    if (user.balance < SWAP_FEE) {
      return res.status(400).json({ error: "Insufficient wallet balance." });
    }

    const expiresAt = new Date(Date.now() + 30 * 60000); 

    // 🔥 THE PRISMA TRANSACTION (All or Nothing)
    const result = await prisma.$transaction(async (tx) => {
      
      // Step A: Deduct the fee from user's balance
      await tx.user.update({
        where: { id: user.id },
        data: { balance: { decrement: SWAP_FEE } }
      });

      // Step B: Record the transaction in the ledger
      await tx.transaction.create({
        data: {
          userId: user.id,
          amount: SWAP_FEE,
          type: "BOOKING",
          upiRef: upiId || "WALLET_AUTO",
          status: "SUCCESS"
        }
      });

      // Step C: Remove 1 battery from the station
      const station = await tx.station.update({
        where: { id: stationId },
        data: { availableBatteries: { decrement: 1 } }
      });

      // Step D: Failsafe if station is empty
      if (station.availableBatteries < 0) {
        throw new Error("Node is completely depleted.");
      }

      // Step E: Create the Booking
      const newBooking = await tx.booking.create({
        data: {
          userId: user.id,
          stationId: stationId,
          status: "CONFIRMED",
          expiresAt: expiresAt
        }
      });

      return newBooking;
    });

    res.json(result);
  } catch (error: any) {
    console.error("Payment Pipeline Error:", error);
    res.status(400).json({ error: error.message || "Transaction failed." });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 GreenRide API live at http://localhost:${PORT}`);
});
