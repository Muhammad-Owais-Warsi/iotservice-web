import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Settings,
    ChevronRight,
    Shield,
    Users,
    AlertTriangle,
    Plus,
    Building,
    UserPlus,
    ExternalLink,
    Search
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [companies, setCompanies] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState(null);
    const [showCreateCompany, setShowCreateCompany] = useState(false);
    const [showCreateMaster, setShowCreateMaster] = useState(false);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [newCompany, setNewCompany] = useState({
        name: '',
        industry: 'pharma'
    });

    const [newMaster, setNewMaster] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        companyId: ''
    });

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchCompanies();
        fetchAllUsers();
    }, []);

    const fetchCompanies = async () => {
        try {
            const response = await fetch(`${API_URL}/api/users/companies`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setCompanies(data.companies);
            }
        } catch (error) {
            console.error('Error fetching companies:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAllUsers = async () => {
        try {
            const response = await fetch(`${API_URL}/api/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setUsers(data.users);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const handleCreateCompany = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_URL}/api/users/companies`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(newCompany)
            });
            const data = await response.json();
            if (data.success) {
                setShowCreateCompany(false);
                setNewCompany({ name: '', industry: 'pharma' });
                fetchCompanies();
            } else {
                alert(data.error || 'Failed to create company');
            }
        } catch (error) {
            console.error('Error creating company:', error);
        }
    };

    const handleCreateMaster = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_URL}/api/users/create-master`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(newMaster)
            });
            const data = await response.json();
            if (data.success) {
                setShowCreateMaster(false);
                setNewMaster({ email: '', password: '', firstName: '', lastName: '', companyId: '' });
                fetchAllUsers();
                fetchCompanies();
            } else {
                alert(data.error || 'Failed to create master account');
            }
        } catch (error) {
            console.error('Error creating master:', error);
        }
    };

    const handleSuspendUser = async (userId) => {
        if (!confirm('Are you sure you want to suspend this user?')) return;
        try {
            const response = await fetch(`${API_URL}/api/users/suspend/${userId}`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                fetchAllUsers();
                fetchCompanies();
            }
        } catch (error) {
            console.error('Error suspending user:', error);
        }
    };

    const handleReactivateUser = async (userId) => {
        if (!confirm('Are you sure you want to reactivate this user?')) return;
        try {
            const response = await fetch(`${API_URL}/api/users/reactivate/${userId}`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                fetchAllUsers();
                fetchCompanies();
            }
        } catch (error) {
            console.error('Error reactivating user:', error);
        }
    };

    const filteredCompanies = (Array.isArray(companies) ? companies : []).filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.industry.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="admin-loading bg-slate-950">
                <div className="relative">
                    <div className="w-20 h-20 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                    <Shield className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-500" size={32} />
                </div>
                <p className="mt-8 font-black uppercase tracking-[0.3em] text-blue-500 text-xs animate-pulse">Establishing Secure Node...</p>
            </div>
        );
    }

    return (
        <div className="admin-dashboard">
            <header className="admin-header">
                <div>
                    <h1><Shield size={32} className="inline-block mr-3 text-blue-500" /> Cueron Command Center</h1>
                    <p className="admin-subtitle">Global Enterprise Resource & IoT Infrastructure Management</p>
                </div>
                <div className="admin-header-actions">
                    <div className="search-bar">
                        <Search size={18} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Find company..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </header>

            <div className="admin-quick-actions">
                <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="action-btn primary"
                    onClick={() => setShowCreateCompany(true)}
                >
                    <Building size={18} className="mr-2" />
                    <span>Expand Network</span>
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="action-btn secondary"
                    onClick={() => setShowCreateMaster(true)}
                >
                    <UserPlus size={18} className="mr-2" />
                    <span>Deploy Master</span>
                </motion.button>
            </div>

            <div className="stats-grid">
                {[
                    { label: 'Enterprises', val: (Array.isArray(companies) ? companies : []).length, icon: Building, color: 'blue' },
                    { label: 'Commanders', val: (Array.isArray(users) ? users : []).filter(u => u.role === 'MASTER').length, icon: Shield, color: 'purple' },
                    { label: 'Personnel', val: (Array.isArray(users) ? users : []).filter(u => u.role === 'EMPLOYEE').length, icon: Users, color: 'emerald' },
                    { label: 'Interventions', val: (Array.isArray(users) ? users : []).filter(u => u.status === 'suspended').length, icon: AlertTriangle, color: 'amber' }
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`admin-stat-card ${stat.color}`}
                    >
                        <div className="stat-info">
                            <h3>{stat.val}</h3>
                            <p>{stat.label}</p>
                        </div>
                        <stat.icon className="stat-bg-icon" />
                    </motion.div>
                ))}
            </div>

            <section className="companies-section">
                <div className="section-header">
                    <h2>Active Clients</h2>
                    <span className="count-badge">{filteredCompanies.length} Total</span>
                </div>

                <div className="companies-grid">
                    {filteredCompanies.map((company) => {
                        const isExpanded = selectedCompanyId === company.id;
                        return (
                            <motion.div
                                key={company.id}
                                layout
                                className={`company-card ${isExpanded ? 'active' : ''}`}
                            >
                                <div className="card-top" onClick={() => setSelectedCompanyId(isExpanded ? null : company.id)}>
                                    <div className="company-info-main">
                                        <div className="company-logo-placeholder">
                                            {company.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3>{company.name}</h3>
                                            <span className="industry-tag">{company.industry}</span>
                                        </div>
                                    </div>

                                    <div className="card-actions-mini">
                                        <button
                                            className="mini-action-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/client/${company.id}`);
                                            }}
                                            title="View Client Intelligence"
                                        >
                                            <ExternalLink size={18} />
                                        </button>
                                        <ChevronRight className={`arrow-icon ${isExpanded ? 'rotate-90' : ''}`} />
                                    </div>
                                </div>

                                <div className="card-stats-row">
                                    <div className="mini-stat">
                                        <span className="val">{company._count.users}</span>
                                        <span className="lbl">Staff</span>
                                    </div>
                                    <div className="mini-stat">
                                        <span className="val">{company._count.devices}</span>
                                        <span className="lbl">Nodes</span>
                                    </div>
                                    <div className="mini-stat">
                                        <span className="val text-amber-400">{company._count.alerts}</span>
                                        <span className="lbl">Events</span>
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="card-expanded-content"
                                        >
                                            <div className="personnel-list">
                                                <h4>Access Control Personnel</h4>
                                                {company.users.map((user) => (
                                                    <div key={user.id} className="person-row">
                                                        <div className="person-base">
                                                            <span className="p-name">{user.firstName} {user.lastName}</span>
                                                            <span className="p-role">{user.role}</span>
                                                        </div>
                                                        <div className="person-status">
                                                            <span className={`status-dot ${user.status}`}></span>
                                                            <span className="p-status-txt">{user.status}</span>
                                                        </div>
                                                        <div className="person-actions">
                                                            {user.status === 'active' ? (
                                                                <button onClick={() => handleSuspendUser(user.id)} className="ctrl-btn suspend">Deactivate</button>
                                                            ) : (
                                                                <button onClick={() => handleReactivateUser(user.id)} className="ctrl-btn reactivate">Authorize</button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="full-view-cta">
                                                <button onClick={() => navigate(`/client/${company.id}`)}>
                                                    Open Full Operational View
                                                    <ExternalLink size={14} className="ml-2" />
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </div>
            </section>

            {/* Modals remain similar but with updated styling classes */}
            <AnimatePresence>
                {showCreateCompany && (
                    <div className="admin-modal-overlay" onClick={() => setShowCreateCompany(false)}>
                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 50, scale: 0.9 }}
                            className="admin-modal-box"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <h2>Register New Enterprise</h2>
                                <button className="close-btn" onClick={() => setShowCreateCompany(false)}>&times;</button>
                            </div>
                            <form onSubmit={handleCreateCompany}>
                                <div className="input-group">
                                    <label>Corporate Entity Name</label>
                                    <input
                                        type="text"
                                        placeholder="Enter legal entity name"
                                        value={newCompany.name}
                                        onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="input-group">
                                    <label>Industrial Sector</label>
                                    <select
                                        value={newCompany.industry}
                                        onChange={(e) => setNewCompany({ ...newCompany, industry: e.target.value })}
                                        required
                                    >
                                        <option value="pharma">Pharmaceutical & Bioscience</option>
                                        <option value="food">Cold Chain Food Systems</option>
                                        <option value="chemical">Specialized Chemical Logistics</option>
                                    </select>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="cancel-btn" onClick={() => setShowCreateCompany(false)}>Abort</button>
                                    <button type="submit" className="confirm-btn">Execute Registration</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}

                {showCreateMaster && (
                    <div className="admin-modal-overlay" onClick={() => setShowCreateMaster(false)}>
                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 50, scale: 0.9 }}
                            className="admin-modal-box"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <h2>Deploy Master Intelligence</h2>
                                <button className="close-btn" onClick={() => setShowCreateMaster(false)}>&times;</button>
                            </div>
                            <form onSubmit={handleCreateMaster}>
                                <div className="input-group">
                                    <label>Target Enterprise</label>
                                    <select
                                        value={newMaster.companyId}
                                        onChange={(e) => setNewMaster({ ...newMaster, companyId: e.target.value })}
                                        required
                                    >
                                        <option value="">Select Target...</option>
                                        {companies.map((company) => (
                                            <option key={company.id} value={company.id}>{company.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label>Intelligence Email</label>
                                    <input
                                        type="email"
                                        placeholder="email@enterprise.com"
                                        value={newMaster.email}
                                        onChange={(e) => setNewMaster({ ...newMaster, email: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="input-group">
                                    <label>Initial Authorization Token (Password)</label>
                                    <input
                                        type="password"
                                        placeholder="Create secure credential"
                                        value={newMaster.password}
                                        onChange={(e) => setNewMaster({ ...newMaster, password: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="input-row">
                                    <div className="input-group">
                                        <label>Forename</label>
                                        <input
                                            type="text"
                                            value={newMaster.firstName}
                                            onChange={(e) => setNewMaster({ ...newMaster, firstName: e.target.value })}
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label>Surname</label>
                                        <input
                                            type="text"
                                            value={newMaster.lastName}
                                            onChange={(e) => setNewMaster({ ...newMaster, lastName: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="cancel-btn" onClick={() => setShowCreateMaster(false)}>Abort</button>
                                    <button type="submit" className="confirm-btn">Confirm Deployment</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminDashboard;
