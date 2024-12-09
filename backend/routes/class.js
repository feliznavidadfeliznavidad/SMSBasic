const express = require("express");
const router = express.Router();
const { admin } = require("../config/firebaseAdmin");
const { verifyToken, checkRole } = require("../middleware/auth");

/**
 * @swagger
 * components:
 *   schemas:
 *     Class:
 *       type: object
 *       required:
 *         - className
 *       properties:
 *         classId:
 *           type: string
 *           description: The auto-generated id of the class
 *         className:
 *           type: string
 *           description: The name of the class
 *         lecturerId:
 *           type: string
 *           description: ID of the lecturer
 *         lecturerName:
 *           type: string
 *           description: Name of the lecturer
 *         studentsCount:
 *           type: number
 *           description: Number of students in the class
 *     Student:
 *       type: object
 *       required:
 *         - studentId
 *         - studentName
 *       properties:
 *         studentId:
 *           type: string
 *           description: Student's ID
 *         studentName:
 *           type: string
 *           description: Student's name
 */

const validateClass = (req, res, next) => {
  const { className } = req.body;
  if (!className || className.trim().length < 3) {
    return res
      .status(400)
      .json({ message: "Class name must be at least 3 characters long" });
  }
  next();
};

const validateStudent = (req, res, next) => {
  const { studentId, studentName } = req.body;
  if (!studentId || !studentName || studentName.trim().length < 2) {
    return res.status(400).json({ message: "Invalid student information" });
  }
  next();
};

/**
 * @swagger
 * /api/classes:
 *   post:
 *     summary: Create a new class
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - className
 *             properties:
 *               className:
 *                 type: string
 *                 minimum: 3
 *     responses:
 *       201:
 *         description: Class created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 classId:
 *                   type: string
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - User does not have required role
 *       500:
 *         description: Server error
 */
router.post(
  "/",
  verifyToken,
  checkRole(["admin", "lecturer"]),
  validateClass,
  async (req, res) => {
    try {
      const { className } = req.body;

      const classRef = admin.firestore().collection("Classes").doc();
      await classRef.set({
        classId: classRef.id,
        className,
        lecturerId: req.user.uid,
        lecturerName: req.user.name,
        studentsCount: 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      res.status(201).json({
        message: "Class created successfully",
        classId: classRef.id,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

/**
 * @swagger
 * /api/classes:
 *   get:
 *     summary: Get all classes (filtered by lecturer if role is lecturer)
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of classes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Class'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/", verifyToken, async (req, res) => {
  try {
    let classesRef = admin.firestore().collection("Classes");

    if (req.user.role === "lecturer") {
      classesRef = classesRef.where("lecturerId", "==", req.user.uid);
    }

    const snapshot = await classesRef.get();
    const classes = [];

    snapshot.forEach((doc) => {
      classes.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json(classes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/classes/{classId}:
 *   put:
 *     summary: Update a class
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
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
 *             $ref: '#/components/schemas/Class'
 *     responses:
 *       200:
 *         description: Class updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - User does not have required role
 *       404:
 *         description: Class not found
 *       500:
 *         description: Server error
 */
router.put(
  "/:classId",
  verifyToken,
  checkRole(["admin", "lecturer"]),
  validateClass,
  async (req, res) => {
    try {
      const { classId } = req.params;
      const updateData = req.body;

      const classRef = admin.firestore().collection("Classes").doc(classId);
      const doc = await classRef.get();

      if (!doc.exists) {
        return res.status(404).json({ message: "Class not found" });
      }

      if (
        req.user.role === "lecturer" &&
        doc.data().lecturerId !== req.user.uid
      ) {
        return res.status(403).json({ message: "Permission denied" });
      }

      updateData.updatedAt = admin.firestore.FieldValue.serverTimestamp();
      await classRef.update(updateData);

      res.status(200).json({ message: "Class updated successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

/**
 * @swagger
 * /api/classes/{classId}/students:
 *   post:
 *     summary: Add a student to a class
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
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
 *             $ref: '#/components/schemas/Student'
 *     responses:
 *       201:
 *         description: Student added successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Class not found
 *       500:
 *         description: Server error
 */
router.post(
  "/:classId/students",
  verifyToken,
  checkRole(["admin", "lecturer"]),
  validateStudent,
  async (req, res) => {
    try {
      const { classId } = req.params;
      const { studentId, studentName } = req.body;

      // Check if class exists
      const classRef = admin.firestore().collection("Classes").doc(classId);
      const classDoc = await classRef.get();

      if (!classDoc.exists) {
        return res.status(404).json({ message: "Class not found" });
      }

      const studentRef = classRef.collection("Students").doc(studentId);
      await studentRef.set({
        studentId,
        studentName,
      });
      await classRef.update({
        studentsCount: admin.firestore.FieldValue.increment(1),
      });

      res.status(201).json({ message: "Student added to class successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

/**
 * @swagger
 * /api/classes/{classId}/students:
 *   get:
 *     summary: Get all students in a class
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of students
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 students:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Student'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Class not found
 *       500:
 *         description: Server error
 */
router.get("/:classId/students", verifyToken, async (req, res) => {
  try {
    const { classId } = req.params;

    const classRef = admin.firestore().collection("Classes").doc(classId);
    const classDoc = await classRef.get();

    if (!classDoc.exists) {
      return res.status(404).json({ message: "Class not found" });
    }

    const studentsSnapshot = await classRef.collection("Students").get();
    const students = [];

    studentsSnapshot.forEach((doc) => {
      students.push(doc.data());
    });

    res.status(200).json({ students });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/classes/{classId}:
 *   delete:
 *     summary: Delete a class and all its students
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Class deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 *       500:
 *         description: Server error
 */
router.delete(
  "/:classId",
  verifyToken,
  checkRole(["admin"]),
  async (req, res) => {
    try {
      const { classId } = req.params;
      const classRef = admin.firestore().collection("Classes").doc(classId);

      // Delete all students in subcollection
      const studentsSnapshot = await classRef.collection("Students").get();
      const batch = admin.firestore().batch();
      studentsSnapshot.forEach((doc) => batch.delete(doc.ref));

      // Delete class
      batch.delete(classRef);
      await batch.commit();

      res
        .status(200)
        .json({ message: "Class and related students deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

/**
 * @swagger
 * /api/classes/{classId}/students/{studentId}:
 *   delete:
 *     summary: Remove a student from a class
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Student removed successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Class or student not found
 *       500:
 *         description: Server error
 */
router.delete(
  "/:classId/students/:studentId",
  verifyToken,
  checkRole(["admin", "lecturer"]),
  async (req, res) => {
    try {
      const { classId, studentId } = req.params;

      const classRef = admin.firestore().collection("Classes").doc(classId);
      const classDoc = await classRef.get();

      if (!classDoc.exists) {
        return res.status(404).json({ message: "Class not found" });
      }

      if (
        req.user.role === "lecturer" &&
        classDoc.data().lecturerId !== req.user.uid
      ) {
        return res.status(403).json({ message: "Permission denied" });
      }

      const studentRef = classRef.collection("Students").doc(studentId);
      const studentDoc = await studentRef.get();

      if (!studentDoc.exists) {
        return res
          .status(404)
          .json({ message: "Student not found in this class" });
      }
      await studentRef.delete();
      await classRef.update({
        studentsCount: admin.firestore.FieldValue.increment(-1),
      });

      res
        .status(200)
        .json({ message: "Student removed from class successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;
