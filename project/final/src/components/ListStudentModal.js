// ListStudentModal.jsx
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";

// ListStudentModal.css
import "../styles/ListStudentModal.css";

const ListStudentModal = ({ isOpen, onClose, classId, jwtToken }) => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [allStudents, setAllStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchStudentsInClass = useCallback(async () => {
    if (!isOpen || !classId) return;

    setLoading(true);
    try {
      const response = await axios.get(`/api/classes/${classId}/students`, {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });
      setStudents(response.data.students || []);
    } catch (err) {
      console.error("Error fetching class students:", err);
    } finally {
      setLoading(false);
    }
  }, [isOpen, classId, jwtToken]);

  const fetchStudents = async () => {
    try {
      const response = await axios.get(`/api/users/students`);
      setAllStudents(response.data || []);
    } catch (err) {
      console.error("Error fetching all students:", err);
    }
  };

  const addStudent = async (data) => {
    try {
      await axios.post(`api/classes/${classId}/students`, data, {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });
      // Refresh the students list after adding
      await fetchStudentsInClass();
      // Reset selection
      setSelectedStudent("");
    } catch (err) {
      console.error("Error adding student:", err.response?.data || err.message);
    }
  };

  const handleAdd = () => {
    const selectedStudentDetails = allStudents.find(
      (stu) => stu.id === selectedStudent
    );

    if (!selectedStudentDetails) {
      console.log("No student selected!");
      return;
    }

    addStudent({
      studentId: selectedStudentDetails.id,
      studentName: selectedStudentDetails.name,
    });
  };

  const handleDelete = async (classId, studentId) => {
    try {
      await axios.delete(`/api/classes/${classId}/students/${studentId}`, {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });
      // Refresh the students list after deletion
      await fetchStudentsInClass();
    } catch (err) {
      console.error("Error deleting student:", err);
    }
  };

  useEffect(() => {
    fetchStudentsInClass();
    fetchStudents();
  }, [classId, fetchStudentsInClass]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h4>List of Students</h4>
        <div className="add-student-row">
          <select
            className="dropdown-box"
            onChange={(e) => setSelectedStudent(e.target.value)}
            value={selectedStudent}
          >
            <option value="">Select Student</option>
            {allStudents.map((stu) => (
              <option key={stu.id} value={stu.id}>
                {stu.name}
              </option>
            ))}
          </select>
          <button
            className="add-btn"
            onClick={handleAdd}
            disabled={!selectedStudent}
          >
            Add
          </button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <table className="student-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td>{student.studentId}</td>
                  <td>{student.studentName}</td>
                  <td>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(classId, student.studentId)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <button className="close-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default ListStudentModal;
