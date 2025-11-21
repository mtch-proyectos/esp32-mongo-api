// middleware/authMiddleware.js

const ADMIN_KEY = process.env.ADMIN_API_KEY; 

const requireApiKey = (req, res, next) => {
    const providedKey = req.headers['x-admin-key']; 

    if (!providedKey || providedKey !== ADMIN_KEY) {
        return res.status(401).json({ error: 'Acceso no autorizado.' });
    }
    next(); 
};

module.exports = requireApiKey;