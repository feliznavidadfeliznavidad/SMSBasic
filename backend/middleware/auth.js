const { admin } = require('../config/firebaseAdmin');
const jwt = require('jsonwebtoken');
const SECRET_KEY = 'hsuuniversity';

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(403).json({ message: 'No token provided' });
  }

  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : authHeader;

  jwt.verify(token, SECRET_KEY, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    try {
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