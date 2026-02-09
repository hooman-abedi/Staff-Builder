const express = require('express');
const cors = require('cors');

const app = express();
// Allow requests from your React dev server (http://localhost:5173)
app.use(
    cors({
        origin: /^http:\/\/localhost:\d+$/,
    })
);

// This lets Express read JSON bodies (later for POST requests)
app.use(express.json());
// A simple test route to confirm the API is running
app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        message: "Staff Builder API is running",
    });
});

const PORT = 5050;
app.listen(PORT, () => {
    console.log(`API server listening on http://localhost:${PORT}`);
});