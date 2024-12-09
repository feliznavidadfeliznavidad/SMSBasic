const express = require('express');
const { admin, auth } = require('../config/firebaseAdmin');
const { clientAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } = require('../config/firebaseClient');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const SECRET_KEY = process.env.JWT_SECRET || 'hsuuniversity';
const TOKEN_EXPIRES_IN = '2h';

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         uid:
 *           type: string
 *         email:
 *           type: string
 *         name:
 *           type: string
 *         role:
 *           type: string
 *           enum: [student, lecturer]
 *         photo:
 *           type: string
 *     AuthResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         token:
 *           type: string
 *         user:
 *           $ref: '#/components/schemas/User'
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 */

const generateToken = (user) => {
  return jwt.sign(
    {
      uid: user.uid,
      email: user.email,
      role: user.role,
    },
    SECRET_KEY,
    { expiresIn: TOKEN_EXPIRES_IN }
  );
};

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *                 minimum: 6
 *               name:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [student, lecturer]
 *                 default: student
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Invalid input or email already in use
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role = 'student' } = req.body;

    if (!['student', 'lecturer'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be either student or lecturer' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const userCredential = await createUserWithEmailAndPassword(clientAuth, email, password);
    const user = userCredential.user;

    const userData = {
      email,
      name,
      role,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      photo: '',
      active: true,
      lastLogin: null,
    };

    await admin.firestore().collection('Users').doc(user.uid).set(userData);

    const token = generateToken({ uid: user.uid, email, role });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { uid: user.uid, email: user.email, name, role },
    });
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      return res.status(400).json({ message: 'Email already in use' });
    }
    res.status(400).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login with email and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Authentication failed
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const userCredential = await signInWithEmailAndPassword(clientAuth, email, password);
    const user = userCredential.user;

    const userDoc = await admin.firestore().collection('Users').doc(user.uid).get();
    if (!userDoc.exists) {
      throw new Error('User data not found');
    }

    const userData = userDoc.data();
    if (!userData.active) {
      throw new Error('Account is disabled');
    }

    await userDoc.ref.update({
      lastLogin: admin.firestore.FieldValue.serverTimestamp(),
    });

    const token = generateToken({
      uid: user.uid,
      email: user.email,
      role: userData.role,
    });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        uid: user.uid,
        email: user.email,
        name: userData.name,
        role: userData.role,
        photo: userData.photo,
      },
    });
  } catch (error) {
    let errorMessage = 'An error occurred';
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'User not found';
    } else if (error.code === 'auth/wrong-password') {
      errorMessage = 'Incorrect password';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email format';
    } else {
      errorMessage = error.message;
    }

    res.status(401).json({ message: errorMessage });
  }
});

/**
* @swagger
* /api/auth/google-login:
*   post:
*     tags: [Auth]
*     summary: Login or register with Google
*     description: Logs in with Google account. If account doesn't exist, creates new student account
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             required:
*               - idToken
*             properties:
*               idToken:
*                 type: string
*     responses:
*       200:
*         description: Login or registration successful
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 message:
*                   type: string
*                   example: Account created and logged in successfully
*                 token:
*                   type: string
*                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
*                 user:
*                   type: object
*                   properties:
*                     uid:
*                       type: string
*                     email:
*                       type: string
*                     name:
*                       type: string  
*                     role:
*                       type: string
*                       enum: [student]
*                     photo:
*                       type: string
*                       nullable: true
*       400:
*         description: Error during login/registration process
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 message:
*                   type: string
*/
router.post('/google-login', async (req, res) => {
  try {
    const { idToken } = req.body;
    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;
    const { email, name, picture } = decodedToken;
 
    let userDoc = await admin.firestore()
      .collection('Users')
      .doc(uid)
      .get();
 
    let userData;
    
    if (!userDoc.exists) {
      const newUser = {
        uid,
        email,
        name: name || email.split('@')[0],
        role: 'student',
        photo: picture || null,
        active: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        lastLogin: admin.firestore.FieldValue.serverTimestamp()
      };
 
      await admin.firestore()
        .collection('Users')
        .doc(uid)
        .set(newUser);
 
      userData = newUser;
    } else {
      userData = userDoc.data();
      
      await userDoc.ref.update({
        lastLogin: admin.firestore.FieldValue.serverTimestamp(),
      });
 
      if (!userData.active) {
        throw new Error('The account has been disabled');
      }
    }
 
    const token = generateToken({
      uid,
      email: userData.email,
      role: userData.role,
    });
 
    res.status(200).json({
      message: userDoc.exists ? 'Google login successful' : 'Account created and logged in successfully',
      token,
      user: {
        uid,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        photo: userData.photo,
      },
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
 });

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     tags: [Auth]
 *     summary: Get user profile
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const userDoc = await admin.firestore()
      .collection('Users')
      .doc(req.user.uid)
      .get();

    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userData = userDoc.data();
    delete userData.password;

    res.status(200).json({
      user: {
        uid: userDoc.id,
        ...userData
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     tags: [Auth]
 *     summary: Request password reset
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset email sent successfully
 *       400:
 *         description: Failed to initiate password reset
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    const userRecord = await admin.auth().getUserByEmail(email);
    
    const resetLink = await admin.auth().generatePasswordResetLink(email);

    res.status(200).json({ 
      message: 'Password reset email sent successfully',
      resetLink
    });
  } catch (error) {
    res.status(400).json({ message: 'Failed to initiate password reset' });
  }
});

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout user
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       500:
 *         description: Server error
 */
router.post('/logout', verifyToken, async (req, res) => {
  try {
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;