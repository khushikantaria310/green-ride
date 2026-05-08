import "dotenv/config"; // 🔥 LINE 1: Load environment variables
import express from "express";
import cors from "cors";
import { PrismaClient } from "./prisma/generated/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createServer } from "http";
import { Server } from "socket.io";
import Razorpay from "razorpay";
import crypto from "crypto";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json());

// 🔌 Database Connection
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const JWT_SECRET = process.env.JWT_SECRET || "greenride-super-secret-key-2026";

// 🔥 RAZORPAY SECURITY AUDIT LOGS
const rzpId = process.env.RAZORPAY_KEY_ID || "";
const rzpSecret = process.env.RAZORPAY_KEY_SECRET || "";

console.log("-----------------------------------------");
console.log("🛠️  BOOTING SECURE PAYMENT GATEWAY...");
console.log(`🔑 ID: ${rzpId.substring(0, 12)}...${rzpId.slice(-3)} (Status: ${rzpId ? 'LOADED ✅' : 'MISSING ❌'})`);
console.log(`🔐 Secret: ${rzpSecret.substring(0, 3)}...${rzpSecret.slice(-3)} (Length: ${rzpSecret.length})`);
console.log("-----------------------------------------");

const razorpay = new Razorpay({
  key_id: rzpId,
  key_secret: rzpSecret,
});

io.on("connection", (socket) => {
  console.log(`📡 New Device Connected to Live Grid: ${socket.id}`);
  socket.on("disconnect", () => console.log(`🔌 Device Disconnected: ${socket.id}`));
});

// 🛡️ Middleware: Authentication
const authenticate = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized. Please log in." });
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token." });
  }
};

// 👑 Middleware: Admin Access
const authenticateAdmin = async (req: any, res: any, next: any) => {
  authenticate(req, res, async () => {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user || user.role !== "ADMIN") {
      return res.status(403).json({ error: "Access Denied: Level 5 Clearance Required." });
    }
    next();
  });
};

// 📍 ROUTES
app.get("/", (req, res) => res.send("⚡ GreenRide API is Online."));

app.get("/api/stations", async (req, res) => {
  try {
    const stations = await prisma.station.findMany({ orderBy: { city: 'asc' } });
    res.json(stations);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch stations" });
  }
});

app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: "Email already in use." });

    const hashedPassword = await bcrypt.hash(password, 10);
    const role = email.toLowerCase().includes("admin") ? "ADMIN" : "OPERATOR";

    const user = await prisma.user.create({
      data: { email, password: hashedPassword, balance: 1000.00, role }
    });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: "Registration failed." });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) return res.status(400).json({ error: "Invalid credentials." });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: "Invalid credentials." });

    if (email.toLowerCase().includes("admin") && user.role !== "ADMIN") {
      await prisma.user.update({ where: { id: user.id }, data: { role: "ADMIN" } });
      user.role = "ADMIN";
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: "Login failed." });
  }
});

app.get("/api/users/me", authenticate, async (req: any, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    res.json(user || {});
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

app.get("/api/admin/stats", authenticateAdmin, async (req: any, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalBookings = await prisma.booking.count();
    const revenueResult = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { type: "BOOKING", status: "SUCCESS" }
    });
    const totalRevenue = revenueResult._sum.amount || 0;
    res.json({ totalUsers, totalBookings, totalRevenue });
  } catch (error) {
    res.status(500).json({ error: "Failed to compile matrix stats." });
  }
});

app.get("/api/bookings", authenticate, async (req: any, res) => {
  try {
    const bookings = await prisma.booking.findMany({ where: { userId: req.user.userId }, orderBy: { createdAt: 'desc' } });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch allocations" });
  }
});

app.get("/api/transactions", authenticate, async (req: any, res) => {
  try {
    const transactions = await prisma.transaction.findMany({ where: { userId: req.user.userId }, orderBy: { createdAt: 'desc' } });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

// 💳 RAZORPAY ROUTES
app.post("/api/payments/create-order", authenticate, async (req: any, res) => {
  try {
    console.log(`💰 Creating Razorpay order: ₹${req.body.amount}`);
    const { amount } = req.body; 
    const options = {
      amount: amount * 100, 
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };
    const order = await razorpay.orders.create(options);
    console.log("✅ Order success:", order.id);
    res.json(order);
  } catch (error) {
    console.error("❌ RAZORPAY REJECTED THE ORDER:", error);
    res.status(500).json({ error: "Failed to create payment order." });
  }
});

app.post("/api/payments/verify", authenticate, async (req: any, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = req.body;
    const secret = process.env.RAZORPAY_KEY_SECRET || "";
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto.createHmac("sha256", secret).update(body.toString()).digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: "Invalid payment signature." });
    }

    const result = await prisma.$transaction(async (tx) => {
      await tx.user.update({ where: { id: req.user.userId }, data: { balance: { increment: amount } } });
      return await tx.transaction.create({
        data: { userId: req.user.userId, amount: amount, type: "TOPUP", upiRef: razorpay_payment_id, status: "SUCCESS" }
      });
    });

    io.emit("grid_update", { message: "Capital Injected!" });
    res.json({ success: true, transaction: result });
  } catch (error) {
    res.status(500).json({ error: "Failed to verify payment." });
  }
});

app.post("/api/bookings", authenticate, async (req: any, res) => {
  try {
    const { stationId, upiId } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user) return res.status(400).json({ error: "User not found." });

    const SWAP_FEE = 149.00;
    if (user.balance < SWAP_FEE) return res.status(400).json({ error: "Insufficient balance." });

    const result = await prisma.$transaction(async (tx) => {
      await tx.user.update({ where: { id: user.id }, data: { balance: { decrement: SWAP_FEE } } });
      await tx.transaction.create({ data: { userId: user.id, amount: SWAP_FEE, type: "BOOKING", upiRef: upiId || "WALLET_AUTO", status: "SUCCESS" } });
      const station = await tx.station.update({ where: { id: stationId }, data: { availableBatteries: { decrement: 1 } } });
      if (station.availableBatteries < 0) throw new Error("Node depleted.");
      return await tx.booking.create({ data: { userId: user.id, stationId: stationId, status: "CONFIRMED", expiresAt: new Date(Date.now() + 30 * 60000) } });
    });

    io.emit("grid_update", { message: "A node was secured!" });
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// 🔋 IoT HARDWARE WEBHOOK (STABILIZED)
app.post("/api/iot/update", async (req, res) => {
  try {
    const { secret } = req.body;
    if (secret !== "super-secret-iot-key") return res.status(403).json({ error: "Unauthorized Hardware." });

    const stations = await prisma.station.findMany();
    
    if (!stations || stations.length === 0) {
      console.log("⚠️  GRID ALERT: No stations found in database. Hardware has nothing to sync.");
      return res.status(404).json({ error: "Grid is empty. Please add stations via Prisma Studio." });
    }

    const randomStation = stations[Math.floor(Math.random() * stations.length)];
    
    // Simple Phase 5 logic - No Intelligence Metrics
    const currentInv = randomStation.availableBatteries ?? 0;

    const change = Math.random() > 0.5 ? 1 : -1;
    let newBatteries = Math.max(currentInv + change, 0);

    const updated = await prisma.station.update({ 
      where: { id: randomStation.id }, 
      data: { availableBatteries: newBatteries } 
    });

    console.log(`[GRID SYNC] ⚡ ${updated.name}: ${currentInv} -> ${newBatteries} batteries.`);
    
    io.emit("grid_update", { message: "Hardware Battery Swap Detected" });
    res.json({ success: true, station: updated.name, batteries: newBatteries });

  } catch (error: any) { 
    console.error("❌ GRID DATABASE ERROR:", error.message || "Unknown error"); 
    res.status(500).json({ error: "IoT Sync Failed" }); 
  }
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`🚀 GreenRide API live at http://localhost:${PORT}`));
