import "../styles/AddClassModal.css";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import React, { useEffect, useState } from "react";

const AddClassModal = ({ isOpen, onClose, onSubmit }) => {
  const [subject, setSubject] = useState("");
  const [lecturerName, setLecturerName] = useState("");
  const [lecturers, setLectures] = useState([]);
  const { currentUser, jwtToken } = useAuth();
  const [loading, setLoading] = useState(false);

  const fetchLectures = () => {
    setLoading(true);
    axios
      .get("api/users/lecturers", {
        headers: { Authorization: `Bearer ${jwtToken}` },
      })
      .then((response) => {
        setLectures(response.data);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchLectures();
  }, []);

  // Handle form submission
  const handleSubmit = () => {
    const selectedLecturer = lecturers.find(
      (lecturer) => lecturer.name === lecturerName
    );

    const classData = {
      className: subject,
      lecturerId: selectedLecturer?.id || null,
      lecturerName: lecturerName,
      students: [], // Default students array
    };

    console.log("Submitted Class Data:", classData);
    onSubmit(classData);
    onClose();
  };

  return isOpen ? (
    <div className="modal-overlay">
      <div className="modal-container">
        <h2>Add New Class</h2>
        <div className="form-container">
          {/* Form */}
          <label>
            Subject:
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter Subject"
            />
          </label>
          <label>
            Lecturer Name:
            <select
              value={lecturerName}
              onChange={(e) => setLecturerName(e.target.value)}
            >
              <option value="">Select Lecturer Name</option>
              {lecturers.map((lecturer) => (
                <option key={lecturer.id} value={lecturer.name}>
                  {lecturer.name}
                </option>
              ))}
            </select>
          </label>

          <div className="modal-btn-container">
            <button onClick={handleSubmit} className="submit-btn">
              Submit
            </button>
            <button onClick={onClose} className="close-btn">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  ) : null;
};

export default AddClassModal;
