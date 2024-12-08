const express = require('express');
const router = express.Router();
const { admin } = require('../config/firebaseAdmin');
const { verifyToken, checkRole } = require('../middleware/auth');

router.post('/', 
  verifyToken, 
  checkRole(['admin', 'lecturer']), 
  async (req, res) => {
    try {
      const { className } = req.body;
      
      const classRef = admin.firestore().collection('Classes').doc();
      await classRef.set({
        classId: classRef.id,
        className,
        lecturerId: req.user.uid,
        lecturerName: req.user.name,
        studentsCount: 0
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


router.post('/:classId/students', verifyToken, checkRole(['admin', 'lecturer']), async (req, res) => {
  try {
    const { classId } = req.params;
    const { studentId, studentName } = req.body;

    // Kiểm tra xem lớp học có tồn tại không
    const classRef = admin.firestore().collection('Classes').doc(classId);
    const classDoc = await classRef.get();
    if (!classDoc.exists) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Thêm sinh viên vào subcollection
    const studentRef = classRef.collection('Students').doc(studentId);
    await studentRef.set({
      studentId,
      studentName,
    });

    // Cập nhật số lượng sinh viên
    await classRef.update({
      studentsCount: admin.firestore.FieldValue.increment(1),
    });

    res.status(201).json({ message: 'Student added to class successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.get('/:classId/students', verifyToken, async (req, res) => {
  try {
    const { classId } = req.params;

    // Kiểm tra xem lớp học có tồn tại không
    const classRef = admin.firestore().collection('Classes').doc(classId);
    const classDoc = await classRef.get();
    if (!classDoc.exists) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Lấy danh sách sinh viên từ subcollection
    const studentSnapshots = await classRef.collection('Students').get();
    const students = [];
    studentSnapshots.forEach((doc) => {
      students.push(doc.data());
    });

    res.status(200).json({ students });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Xóa lớp học (Admin only)
router.delete('/:classId', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const { classId } = req.params;

    const classRef = admin.firestore().collection('Classes').doc(classId);

    // Xóa tất cả sinh viên trong subcollection
    const studentsSnapshot = await classRef.collection('Students').get();
    const batch = admin.firestore().batch();
    studentsSnapshot.forEach((doc) => batch.delete(doc.ref));

    // Xóa lớp học
    batch.delete(classRef);

    // Commit các thay đổi
    await batch.commit();

    res.status(200).json({ message: 'Class and related students deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;