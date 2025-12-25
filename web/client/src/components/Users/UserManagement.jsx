import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { AuthContext } from '../../context/AuthContext';
import './UserManagement.css';

const UserManagement = () => {
    const { user } = useContext(AuthContext);
    const [employees, setEmployees] = useState([]);
    const [showCreateEmployee, setShowCreateEmployee] = useState(false);
    const [loading, setLoading] = useState(true);

    const [newEmployee, setNewEmployee] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: ''
    });

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const response = await fetch(`${API_URL}/api/users/company-employees`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setEmployees(data.employees);
            }
        } catch (error) {
            console.error('Error fetching employees:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateEmployee = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_URL}/api/users/create-employee`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(newEmployee)
            });
            const data = await response.json();
            if (data.success) {
                alert('Employee created successfully!');
                setShowCreateEmployee(false);
                setNewEmployee({ email: '', password: '', firstName: '', lastName: '' });
                fetchEmployees();
            } else {
                alert(data.error || 'Failed to create employee');
            }
        } catch (error) {
            console.error('Error creating employee:', error);
            alert('Error creating employee');
        }
    };

    const handleSuspendEmployee = async (employeeId) => {
        if (!confirm('Are you sure you want to suspend this employee?')) return;

        try {
            const response = await fetch(`${API_URL}/api/users/suspend/${employeeId}`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                alert('Employee suspended successfully!');
                fetchEmployees();
            } else {
                alert(data.error || 'Failed to suspend employee');
            }
        } catch (error) {
            console.error('Error suspending employee:', error);
            alert('Error suspending employee');
        }
    };

    const handleReactivateEmployee = async (employeeId) => {
        if (!confirm('Are you sure you want to reactivate this employee?')) return;

        try {
            const response = await fetch(`${API_URL}/api/users/reactivate/${employeeId}`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                alert('Employee reactivated successfully!');
                fetchEmployees();
            } else {
                alert(data.error || 'Failed to reactivate employee');
            }
        } catch (error) {
            console.error('Error reactivating employee:', error);
            alert('Error reactivating employee');
        }
    };

    if (loading) {
        return (
            <div className="user-management-loading">
                <div className="spinner"></div>
                <p>Loading employees...</p>
            </div>
        );
    }

    return (
        <div className="user-management">
            <div className="user-management-header">
                <div>
                    <h1>👥 Employee Management</h1>
                    <p className="subtitle">Manage your company's employee accounts</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-add-employee"
                    onClick={() => setShowCreateEmployee(true)}
                >
                    ➕ Add Employee
                </motion.button>
            </div>

            <div className="employees-stats">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="stat-card"
                >
                    <div className="stat-icon">👥</div>
                    <div className="stat-content">
                        <h3>{employees.length}</h3>
                        <p>Total Employees</p>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="stat-card"
                >
                    <div className="stat-icon">✅</div>
                    <div className="stat-content">
                        <h3>{employees.filter(e => e.status === 'active').length}</h3>
                        <p>Active Employees</p>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="stat-card"
                >
                    <div className="stat-icon">⏸️</div>
                    <div className="stat-content">
                        <h3>{employees.filter(e => e.status === 'suspended').length}</h3>
                        <p>Suspended</p>
                    </div>
                </motion.div>
            </div>

            <div className="employees-list">
                <h2>All Employees</h2>
                {employees.length === 0 ? (
                    <div className="empty-state">
                        <p>No employees yet. Add your first employee to get started!</p>
                    </div>
                ) : (
                    <div className="employees-grid">
                        {employees.map((employee) => (
                            <motion.div
                                key={employee.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="employee-card"
                            >
                                <div className="employee-header">
                                    <div className="employee-avatar">
                                        {employee.firstName?.[0]}{employee.lastName?.[0]}
                                    </div>
                                    <div className="employee-info">
                                        <h3>{employee.firstName} {employee.lastName}</h3>
                                        <p className="employee-email">{employee.email}</p>
                                    </div>
                                </div>
                                <div className="employee-details">
                                    <div className="detail-item">
                                        <span className="detail-label">Status:</span>
                                        <span className={`status-badge ${employee.status}`}>
                                            {employee.status}
                                        </span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Role:</span>
                                        <span className="role-badge">{employee.role}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Joined:</span>
                                        <span>{new Date(employee.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="employee-actions">
                                    {employee.status === 'active' ? (
                                        <button
                                            className="btn-suspend"
                                            onClick={() => handleSuspendEmployee(employee.id)}
                                        >
                                            🔒 Suspend
                                        </button>
                                    ) : (
                                        <button
                                            className="btn-reactivate"
                                            onClick={() => handleReactivateEmployee(employee.id)}
                                        >
                                            🔓 Reactivate
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Employee Modal */}
            {showCreateEmployee && (
                <div className="modal-overlay" onClick={() => setShowCreateEmployee(false)}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="modal-content"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2>Add New Employee</h2>
                        <form onSubmit={handleCreateEmployee}>
                            <div className="form-group">
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    value={newEmployee.email}
                                    onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                                    placeholder="employee@company.com"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Password</label>
                                <input
                                    type="password"
                                    value={newEmployee.password}
                                    onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })}
                                    placeholder="Secure password"
                                    required
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>First Name</label>
                                    <input
                                        type="text"
                                        value={newEmployee.firstName}
                                        onChange={(e) => setNewEmployee({ ...newEmployee, firstName: e.target.value })}
                                        placeholder="John"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Last Name</label>
                                    <input
                                        type="text"
                                        value={newEmployee.lastName}
                                        onChange={(e) => setNewEmployee({ ...newEmployee, lastName: e.target.value })}
                                        placeholder="Doe"
                                    />
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowCreateEmployee(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-submit">
                                    Add Employee
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
