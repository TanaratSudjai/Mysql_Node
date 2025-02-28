const mysql = require("mysql2");

// เชื่อมต่อ MySQL
const pool = mysql.createPool({
  host: "mysql", // เปลี่ยนตามสภาพแวดล้อม ถ้าใช้ Docker ให้ใช้ service name
  user: "root",
  password: "root12345",
  database: "msql_nodejs",
  waitForConnections: true,
  connectionLimit: 10, // ตั้งค่าจำกัดการเชื่อมต่อพร้อมกัน
  queueLimit: 0,
});

// ทดสอบการเชื่อมต่อ
pool.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Error connecting to MySQL:", err);
  } else {
    console.log("✅ Connected to MySQL Successfully!");
    connection.release(); // ปล่อยการเชื่อมต่อกลับสู่ pool
  }
});

module.exports = pool.promise(); // ใช้ .promise() เพื่อรองรับ async/await
