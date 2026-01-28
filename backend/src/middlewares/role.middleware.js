// src/middlewares/role.middleware.js

const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user || !req.user.role) {
        return res.status(403).json({
          success: false,
          message: "Access denied"
        });
      }

      // ✅ NORMALIZE ROLE (VERY IMPORTANT)
      const userRole = req.user.role.toUpperCase();
      const roles = allowedRoles.map(r => r.toUpperCase());

      if (!roles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to perform this action"
        });
      }

      next(); // ✅ role allowed

    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "Role verification failed"
      });
    }
  };
};

export default roleMiddleware;
