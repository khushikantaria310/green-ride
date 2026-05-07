import express from "express";
import cors from "cors";
import { PrismaClient } from "./prisma/generated/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
// 🔥 1. Import HTTP and Socket.io
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();

// 🔥 2. Wrap Express with a standard HTTP server and attach Socket.io
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // 🔥 Changed to "*" to bypass CORS blocks for WebSockets
    methods: ["GET", "POST"]
  }
});

app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json());

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const JWT_SECRET = process.env.JWT_SECRET || "greenride-super-secret-key-2026";

// WebSockets: Listen for new connections
io.on("connection", (socket) => {
  console.log(`📡 New Device Connected to Live Grid: ${socket.id}`);
  socket.on("disconnect", () => console.log(`🔌 Device Disconnected: ${socket.id}`));
});

const authenticate = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized. Please log in." });
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
};

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
    const user = await prisma.user.create({ data: { email, password: hashedPassword, balance: 1000.00 } });
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

app.post("/api/bookings", authenticate, async (req: any, res) => {
  try {
    const { stationId, upiId } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user) return res.status(400).json({ error: "User not found." });
    const SWAP_FEE = 149.00;
    if (user.balance < SWAP_FEE) return res.status(400).json({ error: "Insufficient wallet balance." });

    const expiresAt = new Date(Date.now() + 30 * 60000); 

    const result = await prisma.$transaction(async (tx) => {
      await tx.user.update({ where: { id: user.id }, data: { balance: { decrement: SWAP_FEE } } });
      await tx.transaction.create({ data: { userId: user.id, amount: SWAP_FEE, type: "BOOKING", upiRef: upiId || "WALLET_AUTO", status: "SUCCESS" } });
      const station = await tx.station.update({ where: { id: stationId }, data: { availableBatteries: { decrement: 1 } } });
      if (station.availableBatteries < 0) throw new Error("Node is completely depleted.");
      return await tx.booking.create({ data: { userId: user.id, stationId: stationId, status: "CONFIRMED", expiresAt } });
    });

    // 🔥 3. BROADCAST THE UPDATE TO ALL CONNECTED PHONES
    io.emit("grid_update", { message: "A node was secured!" });

    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Transaction failed." });
  }
});

const PORT = process.env.PORT || 5000;
// 🔥 4. Change app.listen to httpServer.listen
httpServer.listen(PORT, () => console.log(`🚀 GreenRide API live at http://localhost:${PORT}`));
