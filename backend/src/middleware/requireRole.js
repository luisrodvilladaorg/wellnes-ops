module.exports = function requireRole(role) {
    return function (req, res, next) {
        if (!req.user || req.user.role !== role) {
            return res.status(403).json({
                error: "Forbidden: insufficient privileges"
            });
        }
        next();
    };
};
