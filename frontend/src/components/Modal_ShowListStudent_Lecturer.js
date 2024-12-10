import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import "../styles/ListStudentModal.css";

const ListStudentModal = ({ isOpen, onClose, classId, jwtToken }) => {
  const [students, setStudents] = useState([]);
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

  useEffect(() => {
    fetchStudentsInClass();
  }, [classId, fetchStudentsInClass]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h2>Manage Students</h2>

        <div className="section"></div>

        <div className="section">
          <h3>Student List</h3>
          {loading ? (
            <p className="loading-text">Loading students...</p>
          ) : (
            <div className="student-table-container">
              <table className="student-table">
                <thead>
                  <tr>
                    <th>Name</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id}>
                      <td>{student.studentName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ListStudentModal;
