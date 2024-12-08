import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { 
  FaUserGraduate, 
  FaBookOpen, 
  FaCalendarCheck, 
  FaChartBar 
} from 'react-icons/fa';

export const MainContent = ({ stats }) => (
  <Container fluid className="py-4">
    <h4 className="mb-4">Dashboard Overview</h4>
    <Row>
      <Col lg={3} md={6} className="mb-4">
        <Card className="stat-card h-100">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-muted mb-2">Total Classes</h6>
                <h3 className="mb-0">{stats.totalClasses}</h3>
              </div>
              <div className="icon-bg bg-primary">
                <FaBookOpen size={24} className="text-white" />
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>
      <Col lg={3} md={6} className="mb-4">
        <Card className="stat-card h-100">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-muted mb-2">Total Students</h6>
                <h3 className="mb-0">{stats.totalStudents}</h3>
              </div>
              <div className="icon-bg bg-success">
                <FaUserGraduate size={24} className="text-white" />
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>
      <Col lg={3} md={6} className="mb-4">
        <Card className="stat-card h-100">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-muted mb-2">Attendance Rate</h6>
                <h3 className="mb-0">{stats.attendance}%</h3>
              </div>
              <div className="icon-bg bg-info">
                <FaCalendarCheck size={24} className="text-white" />
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>
      <Col lg={3} md={6} className="mb-4">
        <Card className="stat-card h-100">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-muted mb-2">Average Grade</h6>
                <h3 className="mb-0">{stats.averageGrade}</h3>
              </div>
              <div className="icon-bg bg-warning">
                <FaChartBar size={24} className="text-white" />
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  </Container>
);