import React from 'react';
import { Navbar, Container, Dropdown } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { FaUserCircle, FaBell } from 'react-icons/fa';

export const Header = () => {
  const { user, logout } = useAuth();
  
  return (
    <Navbar className="header bg-white border-bottom">
      <Container fluid>
        <div></div>
        <div className="d-flex align-items-center">
          <Dropdown className="me-3">
            <Dropdown.Toggle variant="light" id="notification-dropdown" className="border-0">
              <FaBell size={20} />
              <span className="notification-badge"></span>
            </Dropdown.Toggle>
            <Dropdown.Menu align="end">
              <Dropdown.Item>New message from teacher</Dropdown.Item>
              <Dropdown.Item>Attendance updated</Dropdown.Item>
              <Dropdown.Item>New grades posted</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          
          <Dropdown>
            <Dropdown.Toggle variant="light" id="profile-dropdown" className="border-0 d-flex align-items-center">
              <FaUserCircle size={24} className="me-2" />
              <span>{user?.email}</span>
            </Dropdown.Toggle>
            <Dropdown.Menu align="end">
              <Dropdown.Item>Profile</Dropdown.Item>
              <Dropdown.Item>Settings</Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item onClick={logout}>Logout</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </Container>
    </Navbar>
  );
};