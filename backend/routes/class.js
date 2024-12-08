const express = require('express');
const router = express.Router();
const { admin } = require('../config/firebaseAdmin');
const { verifyToken, checkRole } = require('../middleware/auth');

// Validation middleware
const validateClass = (req, res, next) => {
  const { className } = req.body;
  if (!className || className.trim().length < 3) {
    return res.status(400).json({ message: 'Class name must be at least 3 characters long' });
  }
  next();
};

const validateStudent = (req, res, next) => {
  const { studentId, studentName } = req.body;
  if (!studentId || !studentName || studentName.trim().length < 2) {
    return res.status(400).json({ message: 'Invalid student information' });
  }
  next();
};

// Create a new class
router.post('/', 
  verifyToken, 
  checkRole(['admin', 'lecturer']),
  validateClass,
  async (req, res) => {
    try {
      const { className } = req.body;
      
      const classRef = admin.firestore().collection('Classes').doc();
      await classRef.set({
        classId: classRef.id,
        className,
        lecturerId: req.user.uid,
        lecturerName: req.user.name,
        studentsCount: 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      res.status(201).json({ 
        message: 'Class created successfully',
        classId: classRef.id 
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
});

// Get classes list
router.get('/', verifyToken, async (req, res) => {
  try {
    let classesRef = admin.firestore().collection('Classes');
    
    if (req.user.role === 'lecturer') {
      classesRef = classesRef.where('lecturerId', '==', req.user.uid);
    }
    
    const snapshot = await classesRef.get();
    const classes = [];
    
    snapshot.forEach(doc => {
      classes.push({ id: doc.id, ...doc.data() });
    });
    
    res.status(200).json(classes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update class
router.put('/:classId', 
  verifyToken, 
  checkRole(['admin', 'lecturer']), 
  validateClass,
  async (req, res) => {
    try {
      const { classId } = req.params;
      const updateData = req.body;
      
      const classRef = admin.firestore().collection('Classes').doc(classId);
      const doc = await classRef.get();
      
      if (!doc.exists) {
        return res.status(404).json({ message: 'Class not found' });
      }
      
      if (req.user.role === 'lecturer' && doc.data().lecturerId !== req.user.uid) {
        return res.status(403).json({ message: 'Permission denied' });
      }
      
      updateData.updatedAt = admin.firestore.FieldValue.serverTimestamp();
      await classRef.update(updateData);
      
      res.status(200).json({ message: 'Class updated successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
});

// Add student to class
router.post('/:classId/students', 
  verifyToken, 
  checkRole(['admin', 'lecturer']),
  validateStudent,
  async (req, res) => {
    try {
      const { classId } = req.params;
      const { studentId, studentName } = req.body;

      // Check if class exists
      const classRef = admin.firestore().collection('Classes').doc(classId);
      const classDoc = await classRef.get();

      if (!classDoc.exists) {
        return res.status(404).json({ message: 'Class not found' });
      }

      // Add student to subcollection
      const studentRef = classRef.collection('Students').doc(studentId);
      await studentRef.set({
        studentId,
        studentName,
      });

      // Update student count
      await classRef.update({
        studentsCount: admin.firestore.FieldValue.increment(1)
      });

      res.status(201).json({ message: 'Student added to class successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
});

// Get students in class
router.get('/:classId/students', verifyToken, async (req, res) => {
  try {
    const { classId } = req.params;

    const classRef = admin.firestore().collection('Classes').doc(classId);
    const classDoc = await classRef.get();

    if (!classDoc.exists) {
      return res.status(404).json({ message: 'Class not found' });
    }

    const studentsSnapshot = await classRef.collection('Students').get();
    const students = [];
    
    studentsSnapshot.forEach((doc) => {
      students.push(doc.data());
    });

    res.status(200).json({ students });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete class and all students
router.delete('/:classId', 
  verifyToken, 
  checkRole(['admin']), 
  async (req, res) => {
    try {
      const { classId } = req.params;
      const classRef = admin.firestore().collection('Classes').doc(classId);

      // Delete all students in subcollection
      const studentsSnapshot = await classRef.collection('Students').get();
      const batch = admin.firestore().batch();
      studentsSnapshot.forEach((doc) => batch.delete(doc.ref));

      // Delete class
      batch.delete(classRef);
      await batch.commit();

      res.status(200).json({ message: 'Class and related students deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
});

module.exports = router;