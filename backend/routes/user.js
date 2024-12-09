const express = require('express');
const router = express.Router();
const { admin } = require('../config/firebaseAdmin');
const { verifyToken, checkRole } = require('../middleware/auth');

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
 *           enum: [student, lecturer, admin]
 *         photo:
 *           type: string
 *         active:
 *           type: boolean
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     tags: [Users]
 *     summary: Get all users
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [student, lecturer, admin]
 *         description: Filter users by role
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       403:
 *         description: Permission denied
 */
router.get('/', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const { role } = req.query;
    let usersRef = admin.firestore().collection('Users');
    
    if (role) {
      usersRef = usersRef.where('role', '==', role);
    }
    
    const snapshot = await usersRef.get();
    const users = [];
    
    snapshot.forEach(doc => {
      const userData = doc.data();
      delete userData.password;
      users.push({ uid: doc.id, ...userData });
    });
    
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/users/{uid}:
 *   put:
 *     tags: [Users]
 *     summary: Update user information
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uid
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               name:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [student, lecturer, admin]
 *     responses:
 *       200:
 *         description: User updated successfully
 *       403:
 *         description: Permission denied
 */
router.put('/:uid', verifyToken, async (req, res) => {
  try {
    const { uid } = req.params;
    const updateData = req.body;
    
    if (updateData.role && req.user.role !== 'admin') {
      delete updateData.role;
    }
    
    if (req.user.role !== 'admin' && req.user.uid !== uid) {
      return res.status(403).json({ message: 'Permission denied' });
    }
    
    if (updateData.email || updateData.name) {
      await admin.auth().updateUser(uid, {
        email: updateData.email,
        displayName: updateData.name
      });
    }
    
    await admin.firestore()
      .collection('Users')
      .doc(uid)
      .update({
        ...updateData,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    
    res.status(200).json({ message: 'User updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/users/{uid}:
 *   delete:
 *     tags: [Users]
 *     summary: Delete user (Admin only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uid
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       400:
 *         description: Cannot delete yourself
 *       403:
 *         description: Permission denied
 */
router.delete('/:uid', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const { uid } = req.params;
    
    if (req.user.uid === uid) {
      return res.status(400).json({ message: 'Cannot delete yourself' });
    }
    
    await admin.auth().deleteUser(uid);
    
    const batch = admin.firestore().batch();
    
    batch.delete(admin.firestore().collection('Users').doc(uid));
    
    const classesSnapshot = await admin.firestore()
      .collection('Classes')
      .where('students', 'array-contains', uid)
      .get();
      
    classesSnapshot.forEach(doc => {
      batch.update(doc.ref, {
        students: admin.firestore.FieldValue.arrayRemove(uid)
      });
    });
    
    await batch.commit();
    
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/users/class/{classId}/students:
 *   post:
 *     tags: [Users]
 *     summary: Add students to class (Admin & Lecturer)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studentIds
 *             properties:
 *               studentIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Students added successfully
 *       400:
 *         description: Invalid student IDs
 *       403:
 *         description: Permission denied
 *       404:
 *         description: Class not found
 */
router.post('/class/:classId/students', verifyToken, checkRole(['admin', 'lecturer']), async (req, res) => {
  try {
    const { classId } = req.params;
    const { studentIds } = req.body;
    
    const classRef = admin.firestore().collection('Classes').doc(classId);
    const classDoc = await classRef.get();
    
    if (!classDoc.exists) {
      return res.status(404).json({ message: 'Class not found' });
    }
    
    if (req.user.role === 'lecturer' && classDoc.data().lecturerId !== req.user.uid) {
      return res.status(403).json({ message: 'Permission denied' });
    }
    
    const studentSnapshots = await Promise.all(
      studentIds.map(id => 
        admin.firestore().collection('Users').doc(id).get()
      )
    );
    
    const invalidStudents = studentSnapshots
      .filter(doc => !doc.exists || doc.data().role !== 'student')
      .map(doc => doc.id);
      
    if (invalidStudents.length > 0) {
      return res.status(400).json({
        message: 'Invalid student IDs',
        invalidIds: invalidStudents
      });
    }
    
    await classRef.update({
      students: admin.firestore.FieldValue.arrayUnion(...studentIds)
    });
    
    res.status(200).json({ message: 'Students added successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/users/lecturers:
 *   get:
 *     tags: [Users]
 *     summary: Get all lecturers (Admin only)
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of lecturers retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *       403:
 *         description: Permission denied
 */
router.get('/lecturers', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const usersRef = admin.firestore().collection('Users').where('role', '==', 'lecturer');
    const snapshot = await usersRef.get();

    const lecturers = [];
    snapshot.forEach(doc => {
      const userData = doc.data();
      lecturers.push({
        id: doc.id,
        name: userData.name || 'Unknown'
      });
    });

    res.status(200).json(lecturers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/users/students:
 *   get:
 *     tags: [Users]
 *     summary: Get all students (Admin only)
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of students retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *       403:
 *         description: Permission denied
 */
router.get('/students', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const usersRef = admin.firestore().collection('Users').where('role', '==', 'student');
    const snapshot = await usersRef.get();

    const students = [];
    snapshot.forEach(doc => {
      const userData = doc.data();
      students.push({
        id: doc.id,
        name: userData.name || 'Unknown'
      });
    });

    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;