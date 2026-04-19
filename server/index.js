require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const healthRoutes = require("./routes/health.routes");
const pool = require("./db");
const categoryRoutes = require("./routes/categories.routes");
const trainingItemsRoutes = require("./routes/trainingItems.routes");
const authRoutes = require("./routes/auth.routes");
const staffCategoriesRoutes = require("./routes/staffCategories.routes");
const employeesRoutes = require("./routes/employees.routes");
const assignmentsRoutes = require("./routes/assignments.routes");
const foldersRoutes = require("./routes/folders.routes");
const employeeViewRoutes = require("./routes/employeeView.routes");
const completionsRoutes = require("./routes/completions.routes");
const quizRoutes = require("./routes/quizzes.routes");
const businessRoutes = require("./routes/business.routes");
const adminRoutes = require("./routes/admin.routes");
const notificationsRoutes = require("./routes/notifications.routes");

const PORT = 5050;
const app = express();

pool.query("SELECT NOW()")
    .then((result) => {
        console.log("Database connected at:", result.rows[0].now);
    })
    .catch((err) => {
        console.error("Database connection error:", err);
    });

pool.query("SELECT current_database(), current_user, inet_server_addr(), inet_server_port()")
    .then((result) => {
        console.log("DB info:", result.rows[0]);
    })
    .catch((err) => {
        console.error("DB info error:", err);
    });

pool.query("SELECT current_database(), current_user")
    .then((result) => {
        console.log("DB info:", result.rows[0]);
    })
    .catch((err) => {
        console.error("DB info error:", err);
    });

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

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api", healthRoutes);
app.use("/api", categoryRoutes);
app.use("/api", trainingItemsRoutes);
app.use("/api", authRoutes);
app.use("/api", staffCategoriesRoutes);
app.use("/api", employeesRoutes);
app.use("/api", assignmentsRoutes);
app.use("/api", foldersRoutes);
app.use("/api", employeeViewRoutes);
app.use("/api", completionsRoutes);
app.use("/api", quizRoutes);
app.use("/api", businessRoutes);
app.use("/api", adminRoutes);
app.use("/api", notificationsRoutes);

if (require.main === module) {
    app.listen(PORT, "0.0.0.0", () => {
        console.log(`API server listening on http://localhost:${PORT}`);
    });
}

module.exports = app;