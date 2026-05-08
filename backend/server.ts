import "dotenv/config";
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

// 🔌 Database Connection (Prisma 7 Adapter)
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const JWT_SECRET = process.env.JWT_SECRET || "greenride-super-secret-key-2026";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

// 📡 Socket.io Lifecycle
io.on("connection", (socket) => {
  console.log(`📡 Device Connected to Grid: ${socket.id}`);
  socket.on("disconnect", () => console.log(`🔌 Device Offline: ${socket.id}`));
});

// 🛡️ Middleware: Authentication
const authenticate = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized. Missing Token." });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Session Expired. Please login again." });
  }
};

// 👑 Middleware: Admin Access
const authenticateAdmin = async (req: any, res: any, next: any) => {
  authenticate(req, res, async () => {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user || user.role !== "ADMIN") return res.status(403).json({ error: "Access Denied. Admin Clearance Required." });
    next();
  });
};

// 📍 PUBLIC INFRASTRUCTURE ROUTES
app.get("/api/stations", async (req, res) => {
  try {
    const stations = await prisma.station.findMany({ orderBy: { city: 'asc' } });
    res.json(stations);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch grid nodes." });
  }
});

// 👤 AUTHENTICATION PIPELINE
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: "Identity already exists." });

    const hashedPassword = await bcrypt.hash(password, 10);
    const role = email.toLowerCase().includes("admin") ? "ADMIN" : "USER";

    const user = await prisma.user.create({
      data: { email, password: hashedPassword, balance: 500.00, role }
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
    const user = await prisma.user.findUnique({ where: { id: email } }); // Check by email
    const foundUser = user || await prisma.user.findUnique({ where: { email } });
    
    if (!foundUser || !foundUser.password) return res.status(400).json({ error: "Invalid credentials." });

    const validPassword = await bcrypt.compare(password, foundUser.password);
    if (!validPassword) return res.status(400).json({ error: "Invalid credentials." });

    const token = jwt.sign({ userId: foundUser.id }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { email: foundUser.email, role: foundUser.role } });
  } catch (error) {
    res.status(500).json({ error: "Login failed." });
  }
});

app.get("/api/users/me", authenticate, async (req: any, res) => {
  const user = await prisma.user.findUnique({ 
    where: { id: req.user.userId },
    select: { id: true, email: true, balance: true, role: true }
  });
  res.json(user || {});
});

// 📋 MATRIX ALLOCATIONS (BOOKINGS)
app.get("/api/bookings", authenticate, async (req: any, res) => {
  try {
    const bookings = await prisma.booking.findMany({ 
      where: { userId: req.user.userId }, 
      include: { 
        station: true // 🔥 NECESSARY: Joins station name/address for UI cards
      }, 
      orderBy: { createdAt: 'desc' } 
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch active reservations." });
  }
});

app.post("/api/bookings", authenticate, async (req: any, res) => {
  try {
    const { stationId } = req.body;
    const SWAP_FEE = 149.00;

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: req.user.userId } });
      if (!user || user.balance < SWAP_FEE) throw new Error("Insufficient balance in wallet.");

      // 1. Deduct Capital
      await tx.user.update({ where: { id: user.id }, data: { balance: { decrement: SWAP_FEE } } });
      
      // 2. Log Transaction
      await tx.transaction.create({ 
        data: { userId: user.id, amount: SWAP_FEE, type: "BOOKING", status: "SUCCESS" } 
      });
      
      // 3. Update Hardware State
      const station = await tx.station.update({ 
        where: { id: stationId }, 
        data: { availableBatteries: { decrement: 1 } } 
      });

      if (station.availableBatteries < 0) throw new Error("Node currently depleted. Transaction reversed.");

      // 4. Create Allocation
      return await tx.booking.create({ 
        data: { 
          userId: user.id, 
          stationId, 
          status: "CONFIRMED", 
          expiresAt: new Date(Date.now() + 30 * 60000) 
        },
        include: { station: true } // Return full object for instant UI update
      });
    });

    // 🔄 Sync Global Grid
    io.emit("grid_update", { message: "Node secured by operative." });
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// 💰 LEDGER (TRANSACTIONS)
app.get("/api/transactions", authenticate, async (req: any, res) => {
  try {
    const transactions = await prisma.transaction.findMany({ 
      where: { userId: req.user.userId }, 
      orderBy: { createdAt: 'desc' } 
    });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch ledger history." });
  }
});

// 💳 PAYMENT GATEWAY (RAZORPAY)
app.post("/api/payments/create-order", authenticate, async (req: any, res) => {
  try {
    const options = { amount: req.body.amount * 100, currency: "INR", receipt: `rcpt_${Date.now()}` };
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: "Gateway handshake failed." });
  }
});

app.post("/api/payments/verify", authenticate, async (req: any, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = req.body;
  const secret = process.env.RAZORPAY_KEY_SECRET || "";
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto.createHmac("sha256", secret).update(body).digest("hex");

  if (expectedSignature !== razorpay_signature) return res.status(400).json({ error: "Forgery detected: Invalid signature." });

  await prisma.$transaction([
    prisma.user.update({ where: { id: req.user.userId }, data: { balance: { increment: amount } } }),
    prisma.transaction.create({ 
      data: { userId: req.user.userId, amount, type: "TOPUP", upiRef: razorpay_payment_id, status: "SUCCESS" } 
    })
  ]);

  io.emit("grid_update", { message: "Capital injected into system." });
  res.json({ success: true });
});

// 🔋 IoT HARDWARE INTERFACE
app.post("/api/iot/update", async (req, res) => {
  const { secret, stationId, batteries } = req.body;
  if (secret !== "super-secret-iot-key") return res.status(403).json({ error: "Unauthorized Hardware Identity." });

  try {
    const updated = await prisma.station.update({
      where: { id: stationId },
      data: { availableBatteries: batteries }
    });

    console.log(`[IoT SYNC] ⚡ Node ${updated.name}: Status Updated to ${batteries} units.`);
    io.emit("grid_update", { message: "Hardware telemetry received." });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Hardware cloud sync failed." });
  }
});

// 🏁 BOOT SEQUENCE
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
    console.log("-----------------------------------------");
    console.log(`🚀 GreenRide OS: Online at Port ${PORT}`);
    console.log(`🧠 PostgreSQL State: Connected via Prisma`);
    console.log(`📡 Real-time Grid: Websocket Active`);
    console.log("-----------------------------------------");
});
