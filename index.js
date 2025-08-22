require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// connect / create SQLite database
const db = new sqlite3.Database("./registrations.db");

// create table if not exists
db.run(`CREATE TABLE IF NOT EXISTS registrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fullName TEXT,
  email TEXT,
  phone TEXT,
  college TEXT,
  year TEXT,
  department TEXT,
  submissionDate TEXT
)`);

// API endpoint: save new registration
app.post("/register", (req, res) => {
  const { fullName, email, phone, college, year, department, submissionDate } = req.body;

db.run(
  `INSERT INTO registrations 
    (fullName, email, phone, college, year, department, submissionDate) 
    VALUES (?, ?, ?, ?, ?, ?, ?)`,
  [fullName, email, phone, college, year, department, submissionDate],
  function (err) {
    if (err) return res.status(500).json({ error: err.message });

    res.json({ success: true, message: "Registration saved successfully!", id: this.lastID });
  }
);

});

app.get("/export", (req, res) => {
  db.all(`SELECT * FROM registrations ORDER BY id DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    // CSV header
    let csv = "ID,Full Name,Email,Phone,College,Year,Department,Submission Date\n";

    // Rows
    rows.forEach((row) => {
      csv += `${row.id},"${row.fullName}","${row.email}","${row.phone}","${row.college}","${row.year}","${row.department}","${row.submissionDate}"\n`;
    });

    // Send as downloadable CSV file
    res.header("Content-Type", "text/csv");
    res.attachment("registrations.csv");
    return res.send(csv);
  });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
