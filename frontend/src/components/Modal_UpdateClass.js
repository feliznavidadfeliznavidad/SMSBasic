import React, { useState, useEffect, Alert } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

const EditClassModal = ({ isOpen, onClose, classData }) => {
  const { jwtToken } = useAuth();
  const [editClass, setEditClass] = useState(null);
  const [error, setError] = useState(null);
  const [lecturers, setLecturers] = useState([]);

  useEffect(() => {
    if (classData) {
      console.log(classData);
      setEditClass(classData);
    }
    // Fetch lecturers for the dropdown
    axios
      .get("api/users/lecturers", {
        headers: { Authorization: `Bearer ${jwtToken}` },
      })
      .then((response) => {
        setLecturers(response.data);
      })
      .catch((err) => setError(err.message));
  }, [classData, jwtToken]);

  const handleSave = () => {
    axios
      .put(`/api/classes/${editClass.id}`, editClass, {
        headers: { Authorization: `Bearer ${jwtToken}` },
      })
      .then(() => {
        onClose();
        // You might want to add a callback here to refresh the class list
      })
      .catch((err) => setError(err.message));
  };

  return (
    <Modal show={isOpen} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Edit Class</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Class Name</Form.Label>
            <Form.Control
              type="text"
              value={editClass?.className || ""}
              onChange={(e) =>
                setEditClass({ ...editClass, className: e.target.value })
              }
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Lecturer</Form.Label>
            <Form.Select
              value={editClass?.lecturerId || ""}
              onChange={(e) =>
                setEditClass({
                  ...editClass,
                  lecturerId: e.target.value,
                  lecturerName: lecturers.find((l) => l.id === e.target.value)
                    ?.name,
                })
              }
            >
              <option value="">Select Lecturer</option>
              {lecturers.map((lecturer) => (
                <option key={lecturer.id} value={lecturer.id}>
                  {lecturer.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditClassModal;
