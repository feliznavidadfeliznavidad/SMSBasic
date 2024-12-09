import "../styles/AddClassModal.css";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import React, { useEffect, useState } from "react";

const AddClassModal = ({ isOpen, onClose }) => {
  const [subject, setSubject] = useState("");
  const [lecturerName, setLecturerName] = useState("");
  const [lecturers, setLecturers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { jwtToken } = useAuth();

  useEffect(() => {
    if (isOpen) {
      fetchLecturers();
    }
  }, [isOpen]);

  const fetchLecturers = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get("api/users/lecturers", {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });
      setLecturers(response.data);
    } catch (err) {
      setError("Failed to fetch lecturers");
      console.error("Error fetching lecturers:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      // Validation
      if (!subject.trim()) {
        setError("Subject name is required");
        return;
      }

      if (!lecturerName) {
        setError("Please select a lecturer");
        return;
      }

      const selectedLecturer = lecturers.find(
        (lecturer) => lecturer.name === lecturerName
      );

      if (!selectedLecturer) {
        setError("Invalid lecturer selected");
        return;
      }

      const classData = {
        className: subject.trim(),
        lecturerId: selectedLecturer.id,
        lecturerName: selectedLecturer.name,
        students: [],
      };

      fetch("http://localhost:8888/api/classes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json", 
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
        body: JSON.stringify(classData), 
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json(); 
        })
        .then((data) => {
          console.log("Response from server:", data);
          console.log("Data sent:", classData); 
        })
        .catch((err) => console.error("Error:", err.message));
      setSubject("");
      setLecturerName("");
      setError("");

      onClose();
    } catch (err) {
      setError("Failed to create class");
      console.error("Error creating class:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h2>Add New Class</h2>
        <div className="form-container">
          {error && <div className="error-message">{error}</div>}

          <label>
            Subject:
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter Subject"
              disabled={loading}
            />
          </label>

          <label>
            Lecturer Name:
            <select
              value={lecturerName}
              onChange={(e) => setLecturerName(e.target.value)}
              disabled={loading}
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
            <button
              onClick={handleSubmit}
              className="submit-btn"
              disabled={loading}
            >
              {loading ? "Loading..." : "Submit"}
            </button>
            <button onClick={onClose} className="close-btn" disabled={loading}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddClassModal;