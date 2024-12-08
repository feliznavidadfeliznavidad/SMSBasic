const express = require('express');
const { admin, auth } = require('../config/firebaseAdmin');
const { clientAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } = require('../config/firebaseClient');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const SECRET_KEY = process.env.JWT_SECRET || 'hsuuniversity';
const TOKEN_EXPIRES_IN = '2h';

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

router.post('/google-login', async (req, res) => {
  try {
    const { idToken } = req.body;

    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const userDoc = await admin.firestore()
      .collection('Users')
      .doc(uid)
      .get();

    if (!userDoc.exists) {
      return res.status(404).json({
        message: 'The account is not registered in the system. Please contact the administrator.',
      });
    }

    const userData = userDoc.data();

    await userDoc.ref.update({
      lastLogin: admin.firestore.FieldValue.serverTimestamp(),
    });

    if (!userData.active) {
      throw new Error('The account has been disabled');
    }

    const token = generateToken({
      uid,
      email: userData.email,
      role: userData.role,
    });

    res.status(200).json({
      message: 'Google login successful',
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

router.post('/logout', verifyToken, async (req, res) => {
  try {
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;