const sql = require("../lib/config");
const bcrypt = require("bcrypt");

// 🔹 Login API
exports.login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: "กรุณากรอกข้อมูลให้ครบถ้วน" });

  try {
    const [results] = await sql
      .query("SELECT * FROM users WHERE username = ?", [username]);

    if (results.length === 0)
      return res
        .status(401)
        .json({ error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match)
      return res
        .status(401)
        .json({ error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });

    req.session.username = user.username;
    res.json({
      msg: "เข้าสู่ระบบสำเร็จ!",
      username: user.username,
      redirect: "/chat",
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ error: "เกิดข้อผิดพลาดภายในระบบ" });
  }
};