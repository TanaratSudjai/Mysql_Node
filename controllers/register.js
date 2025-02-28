const sql = require("../lib/config");
const bcrypt = require("bcryptjs");
exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "กรุณากรอกข้อมูลให้ครบถ้วน" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query =
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
    sql.query(query, [username, email, hashedPassword]);
    res.status(200).json({ success: "register successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
