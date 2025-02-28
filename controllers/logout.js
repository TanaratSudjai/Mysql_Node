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
// 🔹 Logout API with try-catch
exports.logout = async (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        console.error("❌ Error destroying session:", err);
        return res.status(500).json({ error: "เกิดข้อผิดพลาดในการออกจากระบบ" });
      }
      res.json({ msg: "ออกจากระบบสำเร็จ" });
    });
  } catch (error) {
    console.error("❌ Unexpected error in logout:", error);
    res.status(500).json({ error: "เกิดข้อผิดพลาดภายในระบบ" });
  }
};
