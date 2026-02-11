require("dotenv").config();
const express = require('express');
const cors = require('cors');
const healthRoutes = require('./routes/health.routes');
const pool = require('./db');
pool.query("SELECT NOW()")
    .then(result => {
        console.log("Database connected at:", result.rows[0].now);
    })
    .catch(err => {
        console.error("Database connection error:", err);
    });
const app = express();
app.use("/api", healthRoutes);
// Allow requests from your React dev server (http://localhost:5173)
app.use(
    cors({
        origin: /^http:\/\/localhost:\d+$/,
    })
);

// This lets Express read JSON bodies (later for POST requests)
app.use(express.json());


const PORT = 5050;
app.listen(PORT, () => {
    console.log(`API server listening on http://localhost:${PORT}`);
});
