require("dotenv").config();
const express = require('express');
const cors = require('cors');
const healthRoutes = require('./routes/health.routes');
const pool = require('./db');
const categoryRoutes = require("./routes/categories.routes");
const trainingItemsRoutes = require("./routes/trainingItems.routes");
const authRoutes = require("./routes/auth.routes");
const staffCategoriesRoutes = require("./routes/staffCategories.routes");
const employeesRoutes = require("./routes/employees.routes");
const assignmentsRoutes = require("./routes/assignments.routes");
const foldersRoutes = require("./routes/folders.routes");
const employeeViewRoutes = require("./routes/employeeView.routes");
const completionsRoutes = require("./routes/completions.routes");

pool.query("SELECT NOW()")
    .then(result => {
        console.log("Database connected at:", result.rows[0].now);
    })
    .catch(err => {
        console.error("Database connection error:", err);
    });
const app = express();
// Allow requests from your React dev server (http://localhost:5173)
app.get("/db-test", async (req, res) => {
    const r = await pool.query("SELECT now()");
    res.json(r.rows[0]);
});

app.use(
    cors({
        origin: true,
        credentials: true,
    })
);

app.use(express.json());
app.use((req, res, next) => {
    console.log("INCOMING:", req.method, req.url);
    res.on("finish", () => console.log("DONE:", req.method, req.url, res.statusCode));
    next();
});
const path = require("path");
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api", healthRoutes);
app.use("/api", categoryRoutes);
app.use("/api", trainingItemsRoutes)
app.use("/api", authRoutes);
app.use("/api", staffCategoriesRoutes);
app.use("/api", employeesRoutes);
app.use("/api", assignmentsRoutes);
app.use("/api", foldersRoutes);
app.use("/api", employeeViewRoutes);
app.use("/api", completionsRoutes);

const PORT = 5050;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`API server listening on http://localhost:${PORT}`);
});