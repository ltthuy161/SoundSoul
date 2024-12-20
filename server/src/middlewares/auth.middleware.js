import jwt from 'jsonwebtoken';

export const protectedRoute = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized - No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Unauthorized - Invalid token' });
        }

        req.user = decoded;
        next();
    });
}
