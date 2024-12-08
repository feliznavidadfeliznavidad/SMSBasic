const express = require('express');
const router = express.Router();
const { admin } = require('../config/firebaseAdmin');
const { verifyToken, checkRole } = require('../middleware/auth');

// Tạo lớp học mới (Admin & Lecturer only)
router.post('/', 
  verifyToken, 
  checkRole(['admin', 'lecturer']), 
  async (req, res) => {
    try {
      const { className, subject, schedule, semester, year } = req.body;
      
      const classRef = admin.firestore().collection('Classes').doc();
      await classRef.set({
        classId: classRef.id,
        className,
        lecturerId: req.user.uid,
        students: [],
        subject,
        schedule,
        semester,
        year,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      res.status(201).json({ 
        message: 'Class created successfully',
        classId: classRef.id 
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
});

// Lấy danh sách lớp học
router.get('/', verifyToken, async (req, res) => {
  try {
    let classesRef = admin.firestore().collection('Classes');
    
    // Nếu là giảng viên, chỉ lấy các lớp mình phụ trách
    if (req.user.role === 'lecturer') {
      classesRef = classesRef.where('lecturerId', '==', req.user.uid);
    }
    // Nếu là sinh viên, chỉ lấy các lớp mình tham gia
    else if (req.user.role === 'student') {
      classesRef = classesRef.where('students', 'array-contains', req.user.uid);
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

// Cập nhật thông tin lớp học
router.put('/:classId', 
  verifyToken, 
  checkRole(['admin', 'lecturer']), 
  async (req, res) => {
    try {
      const { classId } = req.params;
      const updateData = req.body;
      
      const classRef = admin.firestore().collection('Classes').doc(classId);
      const doc = await classRef.get();
      
      if (!doc.exists) {
        return res.status(404).json({ message: 'Class not found' });
      }
      
      // Kiểm tra quyền: admin hoặc giảng viên phụ trách
      if (req.user.role === 'lecturer' && doc.data().lecturerId !== req.user.uid) {
        return res.status(403).json({ message: 'Permission denied' });
      }
      
      await classRef.update(updateData);
      res.status(200).json({ message: 'Class updated successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
});

// Xóa lớp học (Admin only)
router.delete('/:classId', 
  verifyToken, 
  checkRole(['admin']), 
  async (req, res) => {
    try {
      const { classId } = req.params;
      
      await admin.firestore().collection('Classes').doc(classId).delete();
      
      // Xóa các dữ liệu liên quan (điểm danh, điểm số)
      const batch = admin.firestore().batch();
      
      // Xóa điểm danh
      const attendanceDocs = await admin.firestore()
        .collection('Attendance')
        .where('classId', '==', classId)
        .get();
        
      attendanceDocs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      // Xóa điểm số
      const gradeDocs = await admin.firestore()
        .collection('Grades')
        .where('classId', '==', classId)
        .get();
        
      gradeDocs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
      
      res.status(200).json({ message: 'Class and related data deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
});

module.exports = router;