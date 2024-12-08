const express = require('express');
const router = express.Router();
const { admin } = require('../config/firebaseAdmin');
const { verifyToken, checkRole } = require('../middleware/auth');

// Tạo điểm danh mới
router.post('/:classId', 
  verifyToken, 
  checkRole(['admin', 'lecturer']), 
  async (req, res) => {
    try {
      const { classId } = req.params;
      const { date, students } = req.body;
      
      // Kiểm tra lớp học tồn tại
      const classDoc = await admin.firestore()
        .collection('Classes')
        .doc(classId)
        .get();
        
      if (!classDoc.exists) {
        return res.status(404).json({ message: 'Class not found' });
      }
      
      // Kiểm tra quyền: admin hoặc giảng viên phụ trách
      if (req.user.role === 'lecturer' && classDoc.data().lecturerId !== req.user.uid) {
        return res.status(403).json({ message: 'Permission denied' });
      }
      
      const attendanceRef = admin.firestore().collection('Attendance').doc();
      await attendanceRef.set({
        classId,
        date: admin.firestore.Timestamp.fromDate(new Date(date)),
        students,
        createdBy: req.user.uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      res.status(201).json({ 
        message: 'Attendance created successfully',
        attendanceId: attendanceRef.id 
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
});

// Lấy danh sách điểm danh của lớp
router.get('/:classId', verifyToken, async (req, res) => {
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
    
    if (req.user.role === 'student' && 
        !classDoc.data().students.includes(req.user.uid)) {
      return res.status(403).json({ message: 'Permission denied' });
    }
    
    const snapshot = await admin.firestore()
      .collection('Attendance')
      .where('classId', '==', classId)
      .orderBy('date', 'desc')
      .get();
      
    const attendance = [];
    snapshot.forEach(doc => {
      // Nếu là sinh viên, chỉ trả về thông tin điểm danh của họ
      if (req.user.role === 'student') {
        const studentAttendance = doc.data().students
          .find(s => s.studentId === req.user.uid);
        if (studentAttendance) {
          attendance.push({
            id: doc.id,
            date: doc.data().date,
            status: studentAttendance.status,
            note: studentAttendance.note
          });
        }
      } else {
        attendance.push({ id: doc.id, ...doc.data() });
      }
    });
    
    res.status(200).json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Cập nhật điểm danh
router.put('/:attendanceId', 
  verifyToken, 
  checkRole(['admin', 'lecturer']), 
  async (req, res) => {
    try {
      const { attendanceId } = req.params;
      const { students } = req.body;
      
      const attendanceRef = admin.firestore()
        .collection('Attendance')
        .doc(attendanceId);
      
      const doc = await attendanceRef.get();
      if (!doc.exists) {
        return res.status(404).json({ message: 'Attendance record not found' });
      }
      
      // Kiểm tra quyền: admin hoặc giảng viên phụ trách
      const classDoc = await admin.firestore()
        .collection('Classes')
        .doc(doc.data().classId)
        .get();
        
      if (req.user.role === 'lecturer' && 
          classDoc.data().lecturerId !== req.user.uid) {
        return res.status(403).json({ message: 'Permission denied' });
      }
      
      await attendanceRef.update({
        students,
        updatedBy: req.user.uid,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      res.status(200).json({ message: 'Attendance updated successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
});

module.exports = router;