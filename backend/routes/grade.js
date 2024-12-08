const express = require('express');
const router = express.Router();
const { admin } = require('../config/firebaseAdmin');
const { verifyToken, checkRole } = require('../middleware/auth');

// Tiếp tục từ route tạo/cập nhật điểm số
router.post('/:classId/student/:studentId', 
  verifyToken, 
  checkRole(['admin', 'lecturer']), 
  async (req, res) => {
    try {
      const { classId, studentId } = req.params;
      const { assignments, finalGrade } = req.body;
      
      // Kiểm tra lớp học và quyền truy cập
      const classDoc = await admin.firestore()
        .collection('Classes')
        .doc(classId)
        .get();
        
      if (!classDoc.exists) {
        return res.status(404).json({ message: 'Class not found' });
      }
      
      if (req.user.role === 'lecturer' && 
          classDoc.data().lecturerId !== req.user.uid) {
        return res.status(403).json({ message: 'Permission denied' });
      }
      
      // Kiểm tra sinh viên có trong lớp
      if (!classDoc.data().students.includes(studentId)) {
        return res.status(404).json({ message: 'Student not found in class' });
      }
      
      // Tạo/Cập nhật điểm số
      const gradeRef = admin.firestore()
        .collection('Grades')
        .doc(`${classId}_${studentId}`);

      await gradeRef.set({
        classId,
        studentId,
        assignments,
        finalGrade,
        updatedBy: req.user.uid,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      res.status(200).json({ message: 'Grades updated successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
});

// Lấy điểm số của một sinh viên trong lớp
router.get('/:classId/student/:studentId', 
  verifyToken, 
  async (req, res) => {
    try {
      const { classId, studentId } = req.params;
      
      // Kiểm tra quyền truy cập
      if (req.user.role === 'student' && req.user.uid !== studentId) {
        return res.status(403).json({ message: 'Permission denied' });
      }
      
      const gradeDoc = await admin.firestore()
        .collection('Grades')
        .doc(`${classId}_${studentId}`)
        .get();
        
      if (!gradeDoc.exists) {
        return res.status(404).json({ message: 'Grades not found' });
      }
      
      res.status(200).json(gradeDoc.data());
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
});

// Lấy điểm số của cả lớp
router.get('/:classId', 
  verifyToken, 
  checkRole(['admin', 'lecturer']), 
  async (req, res) => {
    try {
      const { classId } = req.params;
      
      // Kiểm tra quyền truy cập lớp học
      const classDoc = await admin.firestore()
        .collection('Classes')
        .doc(classId)
        .get();
        
      if (!classDoc.exists) {
        return res.status(404).json({ message: 'Class not found' });
      }
      
      if (req.user.role === 'lecturer' && 
          classDoc.data().lecturerId !== req.user.uid) {
        return res.status(403).json({ message: 'Permission denied' });
      }
      
      const snapshot = await admin.firestore()
        .collection('Grades')
        .where('classId', '==', classId)
        .get();
        
      const grades = [];
      snapshot.forEach(doc => {
        grades.push(doc.data());
      });
      
      res.status(200).json(grades);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
});

module.exports = router;