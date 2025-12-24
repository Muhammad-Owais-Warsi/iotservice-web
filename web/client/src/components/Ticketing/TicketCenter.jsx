import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Search,
    Filter,
    MoreVertical,
    Clock,
    CheckCircle2,
    AlertCircle,
    X,
    Upload,
    ChevronDown
} from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const FacilityDropdown = ({ facilities, value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectedFacility = facilities.find(f => f.id === value);

    return (
        <div className="relative">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Facility</label>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all hover:bg-slate-100/50"
            >
                <span className={`text-sm ${selectedFacility ? 'text-slate-900' : 'text-slate-400'}`}>
                    {selectedFacility ? selectedFacility.name : 'Select a facility'}
                </span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 5, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            className="absolute z-20 w-full bg-white border border-slate-200 rounded-xl shadow-xl shadow-slate-200/50 overflow-hidden py-1"
                        >
                            {facilities.length === 0 ? (
                                <div className="px-4 py-3 text-sm text-slate-400 italic">No facilities available</div>
                            ) : (
                                facilities.map((facility) => (
                                    <button
                                        key={facility.id}
                                        type="button"
                                        onClick={() => {
                                            onChange(facility.id);
                                            setIsOpen(false);
                                        }}
                                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-blue-50 hover:text-blue-600 ${value === facility.id ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-600'
                                            }`}
                                    >
                                        {facility.name}
                                    </button>
                                ))
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

const TicketCenter = () => {
    const { user } = useContext(AuthContext);
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const [facilities, setFacilities] = useState([]);
    const [newTicket, setNewTicket] = useState({
        title: '',
        facilityId: '',
        description: ''
    });
    const [selectedPhotos, setSelectedPhotos] = useState([]);
    const [photoPreviews, setPhotoPreviews] = useState([]);

    // Fetch facilities for the dropdown
    const fetchFacilities = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api/devices`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            let facilitiesData = response.data.map(d => d.facility).filter((v, i, a) => a && v && a.findIndex(t => t && (t.id === v.id)) === i);

            // Add mock data for testing if no facilities are found
            if (facilitiesData.length === 0) {
                facilitiesData = [
                    { id: 'mock-1', name: 'Main Production Plant' },
                    { id: 'mock-2', name: 'West Wing Warehouse' },
                    { id: 'mock-3', name: 'Research Lab A' },
                    { id: 'mock-4', name: 'Corporate Office' }
                ];
            }

            setFacilities(facilitiesData);
        } catch (error) {
            console.error('Error fetching facilities:', error);
            // Fallback to mock data on error
            setFacilities([
                { id: 'mock-1', name: 'Main Production Plant' },
                { id: 'mock-2', name: 'West Wing Warehouse' },
                { id: 'mock-3', name: 'Research Lab A' },
                { id: 'mock-4', name: 'Corporate Office' }
            ]);
        }
    };

    // Fetch tickets
    const fetchTickets = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api/services`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTickets(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching tickets:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
        fetchFacilities();
    }, []);

    const handlePhotoChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + selectedPhotos.length > 5) {
            alert('Maximum 5 photos allowed');
            return;
        }

        setSelectedPhotos(prev => [...prev, ...files]);

        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPhotoPreviews(prev => [...prev, ...newPreviews]);
    };

    const removePhoto = (index) => {
        setSelectedPhotos(prev => prev.filter((_, i) => i !== index));
        setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleCreateTicket = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('title', newTicket.title);
            formData.append('facilityId', newTicket.facilityId);
            formData.append('description', newTicket.description);

            selectedPhotos.forEach(photo => {
                formData.append('photos', photo);
            });

            await axios.post(`${API_URL}/api/services`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setIsCreateModalOpen(false);
            setNewTicket({ title: '', facilityId: '', description: '' });
            setSelectedPhotos([]);
            setPhotoPreviews([]);
            fetchTickets();
        } catch (error) {
            console.error('Error creating ticket:', error);
        }
    };

    const handleCloseTicket = async (ticketId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`${API_URL}/api/services/${ticketId}/close`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchTickets();
        } catch (error) {
            console.error('Error closing ticket:', error);
        }
    };

    const StatusBadge = ({ status }) => {
        const styles = {
            open: 'bg-blue-50 text-blue-600 border-blue-100',
            in_progress: 'bg-amber-50 text-amber-600 border-amber-100',
            closed: 'bg-emerald-50 text-emerald-600 border-emerald-100',
            created: 'bg-slate-50 text-slate-600 border-slate-100'
        };

        const icons = {
            open: <Clock className="w-3.5 h-3.5 mr-1" />,
            in_progress: <Clock className="w-3.5 h-3.5 mr-1" />,
            closed: <CheckCircle2 className="w-3.5 h-3.5 mr-1" />,
            created: <AlertCircle className="w-3.5 h-3.5 mr-1" />
        };

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || styles.open}`}>
                {icons[status] || icons.open}
                {status.replace('_', ' ').toUpperCase()}
            </span>
        );
    };

    const filteredTickets = tickets.filter(ticket => {
        const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
        const matchesSearch = (ticket.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (ticket.facility?.name?.toLowerCase() || '').includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const [selectedImage, setSelectedImage] = useState(null);

    return (
        <div className="space-y-8">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Service Tickets</h1>
                    <p className="text-slate-500 mt-1">Manage and track maintenance requests for your facilities.</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center justify-center px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Raise New Ticket
                </motion.button>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 transition-colors group-focus-within:text-blue-500" />
                    <input
                        type="text"
                        placeholder="Search tickets or facilities..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                    />
                </div>
                <div className="flex gap-2 bg-white p-1.5 border border-slate-200 rounded-2xl shadow-sm">
                    {['all', 'open', 'closed'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filterStatus === status
                                ? 'bg-blue-50 text-blue-600 shadow-sm'
                                : 'text-slate-500 hover:bg-slate-50'
                                }`}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tickets Table/Grid */}
            <div className="glass overflow-hidden rounded-2xl border border-slate-200 shadow-sm bg-white/50">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/50">
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ticket Details</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Facility</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Photos</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Raised On</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-12 text-center text-slate-400">Loading tickets...</td>
                            </tr>
                        ) : filteredTickets.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-12 text-center text-slate-400">No tickets found</td>
                            </tr>
                        ) : (
                            filteredTickets.map((ticket) => (
                                <tr key={ticket.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                                                {ticket.title || 'Untitled Ticket'}
                                            </span>
                                            <span className="text-xs text-slate-500 mt-1 line-clamp-1">
                                                {ticket.description || 'No description provided'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center mr-3">
                                                <Filter className="w-4 h-4 text-blue-500" />
                                            </div>
                                            <span className="text-sm text-slate-600">{ticket.facility?.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex -space-x-2 overflow-hidden">
                                            {ticket.photos?.slice(0, 3).map((photo, i) => (
                                                <motion.img
                                                    key={i}
                                                    whileHover={{ y: -2, zIndex: 10 }}
                                                    onClick={() => setSelectedImage(`${API_URL}${photo}`)}
                                                    src={`${API_URL}${photo}`}
                                                    className="inline-block h-8 w-8 rounded-lg ring-2 ring-white object-cover cursor-pointer"
                                                    alt={`Ticket photo ${i + 1}`}
                                                />
                                            ))}
                                            {ticket.photos?.length > 3 && (
                                                <div className="flex items-center justify-center h-8 w-8 rounded-lg ring-2 ring-white bg-slate-100 text-[10px] font-bold text-slate-500">
                                                    +{ticket.photos.length - 3}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <StatusBadge status={ticket.status} />
                                    </td>
                                    <td className="px-6 py-5 text-sm text-slate-500">
                                        {new Date(ticket.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex items-center justify-end space-x-2">
                                            {ticket.status !== 'closed' && (
                                                <button
                                                    onClick={() => handleCloseTicket(ticket.id)}
                                                    className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                                    title="Mark as Resolved"
                                                >
                                                    <CheckCircle2 className="w-5 h-5" />
                                                </button>
                                            )}
                                            <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                                                <MoreVertical className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Photo Viewer Modal */}
            <AnimatePresence>
                {selectedImage && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedImage(null)}
                            className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="relative max-w-4xl w-full flex items-center justify-center"
                        >
                            <img src={selectedImage} alt="Enlarged" className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl overflow-hidden" />
                            <button
                                onClick={() => setSelectedImage(null)}
                                className="absolute -top-12 right-0 p-2 text-white/70 hover:text-white transition-all"
                            >
                                <X className="w-8 h-8" />
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Create Ticket Modal - Simplified for now */}
            <AnimatePresence>
                {isCreateModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsCreateModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <h3 className="text-lg font-bold text-slate-900">Raise New Ticket</h3>
                                <button
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-full transition-all"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form className="p-6 space-y-5" onSubmit={handleCreateTicket}>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Ticket Title</label>
                                    <input
                                        type="text"
                                        required
                                        value={newTicket.title}
                                        onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                        placeholder="e.g., Sensor malfunction in Zone A"
                                    />
                                </div>

                                <FacilityDropdown
                                    facilities={facilities}
                                    value={newTicket.facilityId}
                                    onChange={(id) => setNewTicket({ ...newTicket, facilityId: id })}
                                />

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
                                    <textarea
                                        required
                                        value={newTicket.description}
                                        onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all h-28 resize-none"
                                        placeholder="Describe the issue in detail..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Photos (Max 5)</label>
                                    <div className="flex flex-wrap gap-3 mb-2">
                                        {photoPreviews.map((preview, index) => (
                                            <div key={index} className="relative w-24 h-24 rounded-xl overflow-hidden border border-slate-200 group shadow-sm">
                                                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => removePhoto(index)}
                                                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                        {photoPreviews.length < 5 && (
                                            <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all group">
                                                <Upload className="w-6 h-6 text-slate-400 group-hover:text-blue-500 mb-1" />
                                                <span className="text-[10px] font-bold text-slate-400 group-hover:text-blue-500 uppercase tracking-wider">Add Photo</span>
                                                <input
                                                    type="file"
                                                    multiple
                                                    accept="image/*"
                                                    onChange={handlePhotoChange}
                                                    className="hidden"
                                                />
                                            </label>
                                        )}
                                    </div>
                                </div>
                                <div className="pt-4 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsCreateModalOpen(false)}
                                        className="flex-1 px-4 py-3.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-3.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-600/25 hover:bg-blue-700 transition-all active:scale-[0.98]"
                                    >
                                        Submit Ticket
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TicketCenter;
