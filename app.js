// server.js

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test Route
app.get("/", (req, res) => {
    res.send("MedBook Server Running...");
});

// Example API Route
app.post("/api/book-appointment", (req, res) => {
    const { patientName, doctorName, date, fee } = req.body;

    res.json({
        success: true,
        message: "Appointment booked successfully",
        data: {
            patientName,
            doctorName,
            date,
            fee
        }
    });
});

// Server Start
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`mona is running on port ${PORT}`);
});