import React, { useEffect, useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { Header } from "../components/Header";
import { useAuth } from "../contexts/AuthContext";
import ListStudentModal from "../components/Modal_ShowListStudent_Admin";
import AddClassModal from "../components/Modal_CreateNewClass";
import axios from "axios";
import { Table, Button, Spinner, Container, Alert } from "react-bootstrap";

const ClassManagement = () => {
  const { jwtToken } = useAuth();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddClassModal, setIsAddClassModal] = useState(false);
  const [chosenClass, setChosenClass] = useState(null);

  const fetchClasses = () => {
    setLoading(true);
    axios
      .get("/api/classes", {
        headers: { Authorization: `Bearer ${jwtToken}` },
      })
      .then((response) => {
        setClasses(response.data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to fetch classes.");
        setLoading(false);
      });
  };

  const handleDelete = (classID) => {
    axios
      .delete(`/api/classes/${classID}`, {
        headers: { Authorization: `Bearer ${jwtToken}` },
      })
      .then(() => fetchClasses())
      .catch((err) => setError("Failed to delete class."));
  };

  useEffect(() => {
    fetchClasses();
  }, [jwtToken]);

  return (
    <div className="d-flex">
      <Sidebar />
      <div className="main-content flex-grow-1">
        <Header />
        <Container className="py-4">
          <h2 className="mb-4">Class Management</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          <div className="d-flex justify-content-end mb-3">
            <Button variant="primary" onClick={() => setIsAddClassModal(true)}>
              + Add New Class
            </Button>
          </div>
          {loading ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : (
            <Table responsive bordered hover>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Class Name</th>
                  <th>Lecturer ID</th>
                  <th>Lecturer Name</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {classes.map((cls, index) => (
                  <tr key={cls.id}>
                    <td>{index + 1}</td>
                    <td>{cls.className}</td>
                    <td>{cls.lecturerId}</td>
                    <td>{cls.lecturerName}</td>
                    <td>
                      <Button
                        variant="info"
                        size="sm"
                        onClick={() => {
                          setChosenClass(cls.id);
                          setIsModalOpen(true);
                        }}
                      >
                        View Students
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        className="ms-2"
                        onClick={() => handleDelete(cls.id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Container>

        {/* List Student Modal */}
        <ListStudentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          classId={chosenClass}
        />

        {/* Add Class Modal */}
        <AddClassModal
          isOpen={isAddClassModal}
          onClose={() => setIsAddClassModal(false)}
        />
      </div>
    </div>
  );
};

export default ClassManagement;