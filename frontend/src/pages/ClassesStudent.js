import React, { useEffect, useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { Header } from "../components/Header";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import "../styles/ClassesLecturer.css";
const ClassesLecture = () => {
  const [classes, setClasses] = useState([]);
  const { currentUser, jwtToken } = useAuth();
  const [loading, setLoading] = useState(false);

  const fetchClasses = () => {
    setLoading(true);
    axios
      .get(`/api/classes/enrolled`, {
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
          <h1>Class of student</h1>
        </div>

        {/* Centered class list */}
        <div className="class-list-container">
          {classes.length > 0 ? (
            <div className="class-list">
              {classes.map((classItem) => (
                <div key={classItem.id} className="class-card">
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
    </div>
  );
};

export default ClassesLecture;
