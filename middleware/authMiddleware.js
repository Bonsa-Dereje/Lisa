// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

// AUTHENTICATION - verifies who the user is via the JWT
function requireAuth(req, res, next) {
    const header = req.headers['authorization'];
    const token = header && header.split(' ')[1]; // "Bearer <token>"

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // { id, role }
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
}

// AUTHORIZATION - controls what the authenticated user is allowed to do
function requireRole(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: 'You are not allowed to do that' });
        }
        next();
    };
}

module.exports = { requireAuth, requireRole };
