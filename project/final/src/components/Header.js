import React, { useState } from 'react';
import { Navbar, Container, Dropdown, Modal, Button, Card, Row, Col } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { FaUserCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

export const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const handleProfileClick = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleLogout = () => {
    logout(); 
    navigate('/'); 
  };

  const formatDate = (seconds) => {
    if (!seconds) return ''; 
    const date = new Date(seconds * 1000);
    return date.toLocaleString(); 
  };
  if (!user) {
    return null; 
  }

  return (
    <>
      <Navbar className="header bg-white border-bottom">
        <Container fluid>
          <div></div>
          <div className="d-flex align-items-center">
            <Dropdown>
              <Dropdown.Toggle variant="light" id="profile-dropdown" className="border-0 d-flex align-items-center">
                <FaUserCircle size={24} className="me-2" />
                <span>{user?.email}</span>
              </Dropdown.Toggle>
              <Dropdown.Menu align="end">
                <Dropdown.Item onClick={handleProfileClick}>Profile</Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </Container>
      </Navbar>

      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Profile Information</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col md={4} className="text-center">

              <div className="mb-3">
                {user?.photo ? (
                  <img
                    src={user.photo}
                    alt="Profile"
                    className="img-fluid rounded-circle"
                    style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                  />
                ) : (
                  <FaUserCircle size={150} />
                )}
              </div>
              <h4>{user?.name}</h4>
            </Col>
            <Col md={8}>
              <Card className="border-0 shadow-sm">
                <Card.Body>
                  <h5>Email</h5>
                  <p>{user?.email}</p>

                  <h5>Role</h5>
                  <p>{user?.role}</p>

                  <h5>Account Status</h5>
                  <p>{user?.active ? 'Active' : 'Inactive'}</p>

                  <h5>Account Created</h5>
                  <p>{formatDate(user?.createdAt?._seconds)}</p>

                  <h5>Last Login</h5>
                  <p>{formatDate(user?.lastLogin?._seconds)}</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};