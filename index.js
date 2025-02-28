const express = require("express");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const path = require("path");
const http = require("http");
const socketIo = require("socket.io");
const session = require("express-session");
const sql = require("./lib/config");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const port = 3000;
const router = express.Router();
// 🔹 Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.resolve(__dirname, "public")));

// 🔹 Import Routes Dynamically
const routesPath = path.resolve(__dirname, "routes");
fs.readdirSync(routesPath).forEach((file) => {
  if (file.endsWith(".js")) {
    const route = require(path.join(routesPath, file));
    if (typeof route === "function") {
      app.use("/api", route);
      console.log(route);
    } else {
      console.warn(`⚠️ Skipping invalid route file: ${file}`);
    }
  }
});


// 🔹 Serve Static HTML Pages
const servePage = (page) => (req, res) =>
  res.sendFile(path.resolve(__dirname, "public", `${page}.html`));

app.get("/", servePage("register"));
app.get("/login", servePage("login"));
app.get("/register", servePage("register"));
app.get("/chat", servePage("chat"));
// 🔹 Socket.io for Real-time Chat
io.on("connection", (socket) => {
  console.log("User connected");

  socket.on("chatMessage", async (data) => {
    const { username, message } = data;
    console.log(`📩 ${username}: ${message}`);

    try {
      await sql.query("INSERT INTO messages (username, message) VALUES (?, ?)", [
        username,
        message,
      ]);
      io.emit("chatMessage", data);
    } catch (error) {
      console.error("❌ Error saving chat message:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// 🔹 Start Server
server.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
