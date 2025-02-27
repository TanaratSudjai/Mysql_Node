const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const path = require("path");
const http = require("http");
const socketIo = require("socket.io");
const session = require("express-session");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const port = 3000;

// เชื่อมต่อ MySQL
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "msql_nodejs",
});

connection.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL: " + err);
    return;
  }
  console.log("Connected to MySQL Successfully!!");
});

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: true,
  })
);

app.post("/api/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "กรุณากรอกข้อมูลให้ครบถ้วน" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query =
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
    connection.query(
      query,
      [username, email, hashedPassword],
      (err, result) => {
        if (err) {
          console.error("Error inserting data: " + err);
          return res.status(500).json({ error: "เกิดข้อผิดพลาดภายในระบบ" });
        }
        res.json({ msg: "ลงทะเบียนสำเร็จ!", redirect: "/login" }); // ✅ ส่ง redirect กลับไป
      }
    );
  } catch (error) {
    res.status(500).json({ error: "เกิดข้อผิดพลาดภายในระบบ" });
  }
});

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "กรุณากรอกข้อมูลให้ครบถ้วน" });
  }

  const query = "SELECT * FROM users WHERE username = ?";
  connection.query(query, [username], async (err, results) => {
    if (err) {
      return res.status(500).json({ error: "เกิดข้อผิดพลาดภายในระบบ" });
    }
    if (results.length === 0) {
      return res
        .status(401)
        .json({ error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
    }

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res
        .status(401)
        .json({ error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
    }

    req.session.username = user.username;
    res.json({
      msg: "เข้าสู่ระบบสำเร็จ!",
      username: user.username,
      redirect: "/chat",
    }); // ✅ ส่ง redirect กลับไป
  });
});

// 📌 API ออกจากระบบ (Logout)
app.post("/api/logout", (req, res) => {
  req.session.destroy();
  res.json({ msg: "ออกจากระบบสำเร็จ" });
});

// API ดึงข้อความเก่าจากฐานข้อมูล
app.get("/api/chat-history", (req, res) => {
  const query =
    "SELECT username, message, timestamp FROM messages ORDER BY timestamp ASC";
  connection.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: "เกิดข้อผิดพลาดในการโหลดข้อความ" });
    }
    res.json(results); // ส่งข้อความทั้งหมดกลับไปที่ Frontend
  });
});

// 📌 เสิร์ฟหน้า HTML
app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "public", "register.html"))
);
app.get("/login", (req, res) =>
  res.sendFile(path.join(__dirname, "public", "login.html"))
);
app.get("/chat", (req, res) =>
  res.sendFile(path.join(__dirname, "public", "chat.html"))
);

// 📌 Socket.io สำหรับ Real-time Chat
io.on("connection", (socket) => {
    console.log("User connected");

    socket.on("chatMessage", (data) => {
        const { username, message } = data;

        // ✅ ตรวจสอบว่าข้อความถูกส่งมาถูกต้อง
        console.log(`Received message from ${username}: ${message}`);

        // ✅ บันทึกข้อความลงใน MySQL
        const query = "INSERT INTO messages (username, message) VALUES (?, ?)";
        connection.query(query, [username, message], (err, result) => {
            if (err) {
                console.error("❌ Error saving chat message:", err);
                return;
            }
            console.log("✅ Message saved to database"); // ตรวจสอบว่าเซิร์ฟเวอร์บันทึกข้อความได้หรือไม่
        });

        // ✅ ส่งข้อความไปยังทุกคน
        io.emit("chatMessage", data);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
});

// 📌 เริ่มเซิร์ฟเวอร์
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
