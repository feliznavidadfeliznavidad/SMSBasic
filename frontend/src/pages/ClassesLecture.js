import React, { useEffect, useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { Header } from "../components/Header";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import ListStudentModal from "../components/Modal_ShowListStudent_Lecturer";
import "../styles/ClassesLecturer.css";
const ClassesLecture = () => {
  const [classes, setClasses] = useState([]);
  const { currentUser, jwtToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chosenClass, setChosenClass] = useState(null);
  const fetchClasses = () => {
    setLoading(true);
    axios
      .get(`/api/classes/teaching`, {
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
  useEffect(() => {
    fetchClasses();
  }, []);
  useEffect(() => {
    console.log("alo: ", classes);
  }, [classes]);

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
          <h1>Class Management for Lecture</h1>
        </div>

        {/* Centered class list */}
        <div className="class-list-container">
          {classes.length > 0 ? (
            <div className="class-list">
              {classes.map((classItem) => (
                <div
                  key={classItem.id}
                  className="class-card"
                  onClick={() => {
                    setChosenClass(classItem.id);
                    setIsModalOpen(true);
                  }}
                >
                  <h2>{classItem.className}</h2>
                  <p>
                    <strong>Lecturer:</strong> {classItem.lecturerName}
                  </p>
                  <p>
                    <strong>Created At:</strong>{" "}
                    {new Date(
                      classItem.createdAt._seconds * 1000
                    ).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-classes-text">No classes available</p>
          )}
        </div>
      </div>
      {/* List Student Modal */}
      <ListStudentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        classId={chosenClass}
      />
    </div>
  );
};

export default ClassesLecture;
