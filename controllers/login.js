const sql = require("../lib/config");
const bcrypt = require("bcryptjs");
const express = require("express");
const session = require("express-session");
const app = express();
app.use(
  session({
    secret: "DJSNFJKSDBNFKSDNFKA",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);
exports.login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "กรุณากรอกข้อมูลให้ครบถ้วน" });
  }

  try {
    const [results] = await sql.query(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );

    if (results.length === 0) {
      return res
        .status(401)
        .json({ error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
    }

    const user = results[0];

    // ตรวจสอบว่า user.password เป็น string และไม่เป็น undefined
    if (typeof user.password !== "string") {
      return res.status(500).json({ error: "รหัสผ่านไม่ถูกต้องในระบบ" });
    }

    // ตรวจสอบว่า password เป็น string ก่อนที่จะส่งเข้า bcrypt.compare
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res
        .status(401)
        .json({ error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
    }

    res.json({
      msg: "เข้าสู่ระบบสำเร็จ!",
      username: user.username,
      redirect: "/chat",
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ error: "เกิดข้อผิดพลาดภายในระบบ" + error.message });
  }
};
