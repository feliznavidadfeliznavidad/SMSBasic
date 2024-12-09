import React from 'react';
import { Container, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
  const navigate = useNavigate();

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <Container 
      className="d-flex flex-column align-items-center justify-content-center text-center" 
      style={{ minHeight: '100vh' }}
    >
      <h1 className="display-4 text-danger">Unauthorized</h1>
      <p className="lead mt-3">
        You do not have permission to access this page.
      </p>
      <Button variant="primary" onClick={handleBackToLogin} className="mt-4">
        Back to Login
      </Button>
    </Container>
  );
};

export default Unauthorized;