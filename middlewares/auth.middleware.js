import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'maaj_super_secret_key_2026';

export const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Bearer <token>

    if (!token) {
        return res.status(403).json({ success: false, message: 'No token provided' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ success: false, message: 'Unauthorized / Invalid Token' });
        }
        req.user = decoded;
        next();
    });
};

export const authorize = (requiredPermission) => {
    return (req, res, next) => {
        if (!req.user) return res.status(403).json({ message: 'Not authenticated' });

        if (req.user.role === 'ADMIN') return next(); // Admin has all access
        if (req.user.permissions && req.user.permissions.includes('ALL_ACCESS')) return next();

        if (req.user.permissions && req.user.permissions.includes(requiredPermission)) {
            return next();
        }

        return res.status(403).json({ message: 'Access Denied: Insufficient Permissions' });
    };
};
