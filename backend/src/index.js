// 🔥 dotenv must be loaded at import time (ESM safe)
import "dotenv/config";

import http from "http";
import { Server } from "socket.io";

import app from "./app.js";
import main from "./config/db.js";
import { registerOpdSocket } from "./sockets/opd.socket.js";

// import redisClient from "./config/redis.js";

const PORT = process.env.PORT || 5000;

/* ================= CREATE HTTP SERVER ================= */
const server = http.createServer(app);

/* ================= CREATE SOCKET.IO ================= */
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:8080",
      "http://localhost:5173",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

/* ================= EXPOSE IO TO EXPRESS ================= */
app.set("io", io);

/* ================= REGISTER SOCKET LOGIC ================= */
registerOpdSocket(io);

/* ================= OPTIONAL DEBUG ================= */
io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("🔴 Socket disconnected:", socket.id);
  });
});

/* ================= START SERVER ================= */
async function startServer() {
  try {
    await main();
    console.log("MongoDB Connected ✅");

    // await redisClient.connect();
    // console.log("Redis Connected ✅");

    server.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`);
    });
  } catch (err) {
    console.error("Server startup failed ❌", err);
    process.exit(1);
  }
}

startServer();
