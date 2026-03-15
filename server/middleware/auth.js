const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
    try {
        const header = req.headers.authorization;

        if (!header || !header.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Missing Authorization header" });
        }

        const token = header.slice(7).trim();
        const payload = jwt.verify(token, process.env.JWT_SECRET);

        req.user = {
            userId: payload.userId,
            businessId: payload.businessId,
            role: payload.role
        };

        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
}

function requireRole(role) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (req.user.role !== role) {
            return res.status(403).json({ message: "Forbidden" });
        }

        next();
    };
}

module.exports = { requireAuth, requireRole };