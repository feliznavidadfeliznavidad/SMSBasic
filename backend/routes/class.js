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
        lecturerName: req.user.name,
        students: []
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

// Lấy danh sách sinh viên theo classId
router.get('/:classId/students', verifyToken, async (req, res) => {
  try {
    const { classId } = req.params;

    // Lấy thông tin lớp học từ Firestore
    const classDoc = await admin.firestore().collection('Classes').doc(classId).get();

    if (!classDoc.exists) {
      return res.status(404).json({ message: 'Class not found' });
    }

    const classData = classDoc.data();

    // Lấy danh sách sinh viên từ mảng `students` trong lớp
    const studentIds = classData.students || [];

    if (studentIds.length === 0) {
      return res.status(200).json({ students: [] }); // Lớp chưa có sinh viên
    }

    // Lấy thông tin chi tiết của từng sinh viên
    const studentSnapshots = await admin
      .firestore()
      .collection('Students')
      .where('uid', 'in', studentIds)
      .get();

    const students = [];
    studentSnapshots.forEach((doc) => {
      students.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json({ students });
  } catch (error) {
    // Xử lý lỗi Firestore hoặc logic
    if (error.code === 400) {
      return res.status(400).json({ message: 'Invalid student IDs provided' });
    }
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