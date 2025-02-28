const sql = require("../lib/config");


// 🔹 Fetch Chat History
exports.getMessage = async (req, res) => {
  try {
    const [results] = await sql
      .query(
        "SELECT username, message, timestamp FROM messages ORDER BY timestamp ASC"
      );

    res.json(results);
  } catch (error) {
    console.error("❌ Error loading messages:", error);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการโหลดข้อความ" });
  }
};