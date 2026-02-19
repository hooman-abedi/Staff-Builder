require("dotenv").config();
const express = require('express');
const cors = require('cors');
const healthRoutes = require('./routes/health.routes');
const pool = require('./db');
const categoryRoutes = require("./routes/categories.routes");
pool.query("SELECT NOW()")
    .then(result => {
        console.log("Database connected at:", result.rows[0].now);
    })
    .catch(err => {
        console.error("Database connection error:", err);
    });
const app = express();
// Allow requests from your React dev server (http://localhost:5173)
app.use(
    cors({
        origin: /^http:\/\/localhost:\d+$/,
    })
);
app.use(express.json());
app.use("/api", healthRoutes);
app.use("/api", categoryRoutes);
const PORT = 5050;
app.listen(PORT, () => {
    console.log(`API server listening on http://localhost:${PORT}`);
});
