import React, { useEffect, useState } from "react";
import { Sidebar } from "./Sidebar";
import "../styles/ClassManagement.css";
import { Header } from "./Header";
import { useAuth } from "../contexts/AuthContext";
import ListStudentModal from "./ListStudentModal";
import AddClassModal from "./AddClassModal";
import axios from "axios";
const ClassManagement = () => {
  const { currentUser, jwtToken } = useAuth();
  const [clasess, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddClassModal, setIsAddClassModal] = useState(false);
  const [chosenClass, setChosenClass] = useState("");
  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };
  useEffect(() => {
    fetchClasses();
  }, [jwtToken, clasess]);

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
        console.log(err);
        setLoading(false);
      });
  };

  const handleSubmit = (data) => {
    createClass(data);
    console.log("Data submitted:", data);
  };

  const createClass = (data) => {
    axios
      .post("api/classes", data, {
        headers: { Authorization: `Bearer ${jwtToken}` },
      })

      .catch((err) => console.log(err.message));
  };

  const handleDelete = (classID) => {
    axios
      .delete(`/api/classes/${classID}`, {
        headers: { Authorization: `Bearer ${jwtToken}` },
      })
      //   .then(fetchUsers)
      .catch((e) => console.log(e));
  };

  return (
    <div className="class-management-container">
      {/* Sidebar */}
      <div className="sidebar-container">
        <Sidebar />
      </div>
      {/* Main Content */}
      <div className="CM-main-content">
        <Header />
        <div className="header-container">
          <h1>Class Management</h1>
          <button
            className="add-button"
            onClick={() => setIsAddClassModal(true)}
          >
            Add
          </button>
        </div>
        <table className="class-table">
          <thead>
            <tr>
              <th>Class ID</th>
              <th>Subject</th>
              <th>Lecturer ID</th>
              <th>Lecturer Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {clasess.map((item) => (
              <tr
                key={item.id}
                onClick={() => {
                  console.log("class: ", item.id);
                  openModal();
                  setChosenClass(item.id);
                }}
              >
                <td>{item.id}</td>
                <td>{item.className}</td>
                <td>{item.lecturerId}</td>
                <td>{item.lecturerName}</td>
                <td>
                  <button
                    className="delete-button"
                    onClick={() => handleDelete(item.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <ListStudentModal
          isOpen={isModalOpen}
          onClose={closeModal}
          classId={chosenClass}
        />
        <AddClassModal
          isOpen={isAddClassModal}
          onClose={() => {
            setIsAddClassModal(false);
          }}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
};

export default ClassManagement;
