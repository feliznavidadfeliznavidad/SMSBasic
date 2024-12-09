import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { Table, Button, Modal, Form, Alert, Spinner, Card } from "react-bootstrap";

import { Sidebar } from "../components/Sidebar";
import { Header } from "../components/Header";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { currentUser, jwtToken } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, [jwtToken]);

  const fetchUsers = () => {
    setLoading(true);
    setError(null); // Reset error before fetching
    axios
      .get("/api/users", {
        headers: { Authorization: `Bearer ${jwtToken}` },
      })
      .then((response) => {
        setUsers(response.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  const handleDelete = (uid) => {
    axios
      .delete(`/api/users/${uid}`, {
        headers: { Authorization: `Bearer ${jwtToken}` },
      })
      .then(fetchUsers)
      .catch((err) => setError(err.message));
  };

  const handleSave = (uid) => {
    axios
      .put(`/api/users/${uid}`, editUser, {
        headers: { Authorization: `Bearer ${jwtToken}` },
      })
      .then(() => {
        fetchUsers();
        setShowModal(false);
      })
      .catch((err) => setError(err.message));
  };

  const handleCreateUser = () => {
    axios
      .post("/api/auth/register", newUser, {
        headers: { Authorization: `Bearer ${jwtToken}` },
      })
      .then(() => {
        fetchUsers();
        setShowCreateModal(false);
      })
      .catch((err) => setError(err.message));
  };

  const openModal = (user) => {
    setEditUser(user);
    setShowModal(true);
  };

  return (
    <div className="d-flex">
      <Sidebar />
      <div className="main-content" style={{ flex: 1, background: "#f8f9fa" }}>
        <Header />
        <div className="container py-4">
          <h2 className="text-center mb-4">User Management</h2>
          {error && (
            <Alert variant="danger" className="text-center">
              {error}
            </Alert>
          )}

          <Card className="mb-4 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">Manage Users</h5>
                <Button
                  variant="primary"
                  onClick={() => setShowCreateModal(true)}
                >
                  + Create New User
                </Button>
              </div>
              {loading ? (
                <div className="text-center py-4">
                  <Spinner animation="border" variant="primary" />
                </div>
              ) : (
                <Table
                  responsive
                  striped
                  bordered
                  hover
                  className="align-middle"
                >
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, index) => (
                      <tr key={user.id}>
                        <td>{index + 1}</td>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>
                          <span
                            className={`badge bg-${
                              user.role === "admin"
                                ? "danger"
                                : user.role === "lecturer"
                                ? "warning"
                                : "success"
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td>
                          <div className="btn-group" role="group">
                            <Button
                              variant="warning"
                              size="sm"
                              onClick={() => openModal(user)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDelete(user.uid)}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>

          {/* Edit User Modal */}
          <Modal show={showModal} onHide={() => setShowModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Edit User</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={editUser?.name || ""}
                    onChange={(e) =>
                      setEditUser({ ...editUser, name: e.target.value })
                    }
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={editUser?.email || ""}
                    onChange={(e) =>
                      setEditUser({ ...editUser, email: e.target.value })
                    }
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Role</Form.Label>
                  <Form.Select
                    value={editUser?.role || ""}
                    onChange={(e) =>
                      setEditUser({ ...editUser, role: e.target.value })
                    }
                  >
                    <option value="student">Student</option>
                    <option value="lecturer">Lecturer</option>
                    <option value="admin">Admin</option>
                  </Form.Select>
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => handleSave(editUser?.uid)}
              >
                Save Changes
              </Button>
            </Modal.Footer>
          </Modal>

          {/* Create New User Modal */}
          <Modal
            show={showCreateModal}
            onHide={() => setShowCreateModal(false)}
          >
            <Modal.Header closeButton>
              <Modal.Title>Create New User</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={newUser.name}
                    onChange={(e) =>
                      setNewUser({ ...newUser, name: e.target.value })
                    }
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser({ ...newUser, email: e.target.value })
                    }
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={newUser.password}
                    onChange={(e) =>
                      setNewUser({ ...newUser, password: e.target.value })
                    }
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Role</Form.Label>
                  <Form.Select
                    value={newUser.role}
                    onChange={(e) =>
                      setNewUser({ ...newUser, role: e.target.value })
                    }
                  >
                    <option value="student">Student</option>
                    <option value="lecturer">Lecturer</option>
                    <option value="admin">Admin</option>
                  </Form.Select>
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </Button>
              <Button variant="primary" onClick={handleCreateUser}>
                Create Account
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
