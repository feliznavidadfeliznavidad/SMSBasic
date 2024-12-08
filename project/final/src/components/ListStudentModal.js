import React, { useEffect, useState, useCallback } from "react";
import "../styles/ListStudentModal.css";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

const ListStudentModal = ({ isOpen, onClose, classId }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const { jwtToken } = useAuth();

  const fetchStudents = useCallback(
    (classId) => {
      console.log(`/api/classes/${classId}/students`);

      if (!isOpen) return;
      setLoading(true);
      axios
        .get(`/api/classes/${classId}/students`, {
          headers: { Authorization: `Bearer ${jwtToken}` },
        })
        .then((response) => {
          setStudents(response.data.students || []); // Adjust based on API response structure
          setLoading(false);
        })

        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    },
    [isOpen, jwtToken]
  );

  useEffect(() => {
    fetchStudents(classId);
  }, [fetchStudents]);
  useEffect(() => {
    console.log(typeof students);
  }, [students]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h4>List of Students</h4>
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
                      //   onClick={() => handleDeleteStudent(student.studentId)}
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
