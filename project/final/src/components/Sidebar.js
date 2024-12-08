import React, { useState } from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  FaHome, 
  FaUsers, 
  FaBookOpen, 
  FaUserGraduate, 
  FaChalkboardTeacher,
  FaUserCog,
  FaChartBar,
  FaCalendarCheck
} from 'react-icons/fa';

export const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const getNavItems = () => {
    switch (user?.role) {
      case 'admin':
        return [
          { title: 'Dashboard', path: '/', icon: <FaHome size={20} /> },
          { title: 'Users', path: '/accounts', icon: <FaUsers size={20} /> },
          { title: 'Classes', path: '/classes', icon: <FaBookOpen size={20} /> },
          { title: 'Attendance', path: '/attendance', icon: <FaCalendarCheck size={20} /> },
          { title: 'Grades', path: '/grades', icon: <FaChartBar size={20} /> }
        ];
      case 'lecturer':
        return [
          { title: 'Dashboard', path: '/', icon: <FaHome size={20} /> },
          { title: 'My Classes', path: '/my-classes', icon: <FaChalkboardTeacher size={20} /> },
          { title: 'Attendance', path: '/attendance', icon: <FaCalendarCheck size={20} /> },
          { title: 'Grades', path: '/grades', icon: <FaChartBar size={20} /> }
        ];
      case 'student':
        return [
          { title: 'Dashboard', path: '/', icon: <FaHome size={20} /> },
          { title: 'Profile', path: '/profile', icon: <FaUserCog size={20} /> },
          { title: 'Classes', path: '/classes', icon: <FaBookOpen size={20} /> },
          { title: 'Attendance', path: '/attendance', icon: <FaCalendarCheck size={20} /> },
          { title: 'Grades', path: '/grades', icon: <FaChartBar size={20} /> }
        ];
      default:
        return [];
    }
  };

  return (
    <div className={`sidebar bg-white shadow ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header border-bottom p-3">
        <div className="d-flex align-items-center">
          <FaUserGraduate size={24} className="text-primary me-2" />
          {!isCollapsed && <h5 className="mb-0">School Management</h5>}
        </div>
      </div>
      <Nav className="flex-column p-3">
        {getNavItems().map((item, index) => (
          <Nav.Link
            key={index}
            as={Link}
            to={item.path}
            className={`nav-link-custom mb-2 ${location.pathname === item.path ? 'active' : ''}`}
          >
            <div className="d-flex align-items-center">
              <span className="icon-wrapper">{item.icon}</span>
              {!isCollapsed && <span className="ms-2">{item.title}</span>}
            </div>
          </Nav.Link>
        ))}
      </Nav>
    </div>
  );
};