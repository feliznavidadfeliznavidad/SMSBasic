const { admin } = require('../config/firebaseAdmin');
const jwt = require('jsonwebtoken');
const SECRET_KEY = 'hsuuniversity';

// Middleware xác thực JWT
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(403).json({ message: 'No token provided' });
  }

  // Kiểm tra và loại bỏ tiền tố 'Bearer '
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : authHeader;

  jwt.verify(token, SECRET_KEY, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    try {
      // Lấy thông tin user từ Firestore
      const userDoc = await admin.firestore()
        .collection('Users')
        .doc(decoded.uid)
        .get();

      if (!userDoc.exists) {
        return res.status(404).json({ message: 'User not found' });
      }

      req.user = {
        ...decoded,
        ...userDoc.data()
      };
      next();
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
};

// Middleware kiểm tra role
const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Permission denied' });
    }

    next();
  };
};

module.exports = { verifyToken, checkRole };