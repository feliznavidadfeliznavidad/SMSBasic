const express = require('express');
const router = express.Router();
const { admin } = require('../config/firebaseAdmin');
const { verifyToken, checkRole } = require('../middleware/auth');

router.get('/', 
  verifyToken, 
  checkRole(['admin']), 
  async (req, res) => {
    try {
      const { role } = req.query;
      let usersRef = admin.firestore().collection('Users');
      
      if (role) {
        usersRef = usersRef.where('role', '==', role);
      }
      
      const snapshot = await usersRef.get();
      const users = [];
      
      snapshot.forEach(doc => {
        // Loại bỏ các trường nhạy cảm
        const userData = doc.data();
        delete userData.password;
        users.push({ uid: doc.id, ...userData });
      });
      
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
});

// Cập nhật thông tin người dùng
router.put('/:uid', 
  verifyToken, 
  async (req, res) => {
    try {
      const { uid } = req.params;
      const updateData = req.body;
      
      // Chỉ admin mới có thể cập nhật role
      if (updateData.role && req.user.role !== 'admin') {
        delete updateData.role;
      }
      
      // Kiểm tra quyền: admin hoặc chính người dùng đó
      if (req.user.role !== 'admin' && req.user.uid !== uid) {
        return res.status(403).json({ message: 'Permission denied' });
      }
      
      // Cập nhật trong Authentication
      if (updateData.email || updateData.name) {
        await admin.auth().updateUser(uid, {
          email: updateData.email,
          displayName: updateData.name
        });
      }
      
      // Cập nhật trong Firestore
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

// Xóa người dùng (Admin only)
router.delete('/:uid', 
  verifyToken, 
  checkRole(['admin']), 
  async (req, res) => {
    try {
      const { uid } = req.params;
      
      // Không thể xóa chính mình
      if (req.user.uid === uid) {
        return res.status(400).json({ message: 'Cannot delete yourself' });
      }
      
      // Xóa khỏi Authentication
      await admin.auth().deleteUser(uid);
      
      // Xóa khỏi Firestore và các dữ liệu liên quan
      const batch = admin.firestore().batch();
      
      // Xóa user document
      batch.delete(admin.firestore().collection('Users').doc(uid));
      
      // Xóa khỏi danh sách lớp học
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

// Thêm sinh viên vào lớp (Admin & Lecturer)
router.post('/class/:classId/students', 
  verifyToken, 
  checkRole(['admin', 'lecturer']), 
  async (req, res) => {
    try {
      const { classId } = req.params;
      const { studentIds } = req.body;
      
      const classRef = admin.firestore().collection('Classes').doc(classId);
      const classDoc = await classRef.get();
      
      if (!classDoc.exists) {
        return res.status(404).json({ message: 'Class not found' });
      }
      
      // Kiểm tra quyền
      if (req.user.role === 'lecturer' && 
          classDoc.data().lecturerId !== req.user.uid) {
        return res.status(403).json({ message: 'Permission denied' });
      }
      
      // Kiểm tra sinh viên tồn tại
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
      
      // Thêm sinh viên vào lớp
      await classRef.update({
        students: admin.firestore.FieldValue.arrayUnion(...studentIds)
      });
      
      res.status(200).json({ message: 'Students added successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
});

// Thêm route mới để lấy danh sách lecturers
router.get('/lecturers', 
  verifyToken, 
  checkRole(['admin']), // Chỉ admin được phép truy cập
  async (req, res) => {
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
  }
);


module.exports = router;