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
    ChevronDown,
    Calendar,
    MapPin,
    Camera,
    Trash2,
    Image
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
    const fetchFacilities = React.useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api/devices`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success && Array.isArray(response.data.devices)) {
                let facilitiesData = response.data.devices
                    .map(d => d.facility)
                    .filter((v, i, a) => a && v && a.findIndex(t => t && (t.id === v.id)) === i);

                if (facilitiesData.length === 0) {
                    facilitiesData = [
                        { id: 'mock-1', name: 'Main Production Plant' },
                        { id: 'mock-2', name: 'West Wing Warehouse' },
                        { id: 'mock-3', name: 'Research Lab A' },
                        { id: 'mock-4', name: 'Corporate Office' }
                    ];
                }
                setFacilities(facilitiesData);
            } else {
                setFacilities([
                    { id: 'mock-1', name: 'Main Production Plant' },
                    { id: 'mock-2', name: 'West Wing Warehouse' },
                    { id: 'mock-3', name: 'Research Lab A' },
                    { id: 'mock-4', name: 'Corporate Office' }
                ]);
            }
        } catch (error) {
            console.error('Error fetching facilities:', error);
            setFacilities([
                { id: 'mock-1', name: 'Main Production Plant' },
                { id: 'mock-2', name: 'West Wing Warehouse' },
                { id: 'mock-3', name: 'Research Lab A' },
                { id: 'mock-4', name: 'Corporate Office' }
            ]);
        }
    }, []);

    // Fetch tickets
    const fetchTickets = React.useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            console.log(`[TicketCenter] Fetching tickets from ${API_URL}/api/services`);

            const response = await axios.get(`${API_URL}/api/services`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('[TicketCenter] Response:', response.data);

            if (response.data.success && Array.isArray(response.data.tickets)) {
                console.log(`[TicketCenter] Found ${response.data.tickets.length} tickets`);
                setTickets(response.data.tickets);
            } else {
                console.warn('[TicketCenter] Invalid response structure:', response.data);
                setTickets([]);
            }
        } catch (error) {
            console.error('[TicketCenter] Error fetching tickets:', error);
            setTickets([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTickets();
        fetchFacilities();
    }, [fetchTickets, fetchFacilities]);

    const handlePhotoChange = React.useCallback((e) => {
        const files = Array.from(e.target.files);
        if (files.length + selectedPhotos.length > 5) {
            alert('Maximum 5 photos allowed');
            return;
        }

        setSelectedPhotos(prev => [...prev, ...files]);

        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPhotoPreviews(prev => [...prev, ...newPreviews]);
    }, [selectedPhotos.length]);

    const removePhoto = React.useCallback((index) => {
        setSelectedPhotos(prev => prev.filter((_, i) => i !== index));
        setPhotoPreviews(prev => {
            const newPreviews = [...prev];
            URL.revokeObjectURL(newPreviews[index]);
            return newPreviews.filter((_, i) => i !== index);
        });
    }, []);

    const handleCreateTicket = React.useCallback(async (e) => {
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
    }, [newTicket, selectedPhotos, fetchTickets]);

    const handleCloseTicket = React.useCallback(async (ticketId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`${API_URL}/api/services/${ticketId}/close`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchTickets();
        } catch (error) {
            console.error('Error closing ticket:', error);
        }
    }, [fetchTickets]);

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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight-head">
                        Service Tickets
                    </h1>
                    <p className="text-slate-500 font-medium text-lg">
                        Manage facility maintenance and support requests
                    </p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsCreateModalOpen(true)}
                    className="inline-flex items-center px-6 py-3.5 bg-slate-900 text-white rounded-2xl font-bold text-sm shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Raise New Ticket
                </motion.button>
            </div>

            {/* Filters Banner */}
            <div className="glass rounded-[2rem] p-4 flex flex-wrap items-center gap-4">
                <div className="relative flex-1 min-w-[300px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search by title or facility..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border border-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900/5 transition-all text-slate-900 font-medium placeholder:text-slate-400"
                    />
                </div>

                <div className="flex items-center gap-2 p-1.5 bg-slate-100/50 rounded-xl border border-slate-100">
                    {['all', 'open', 'closed'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all ${filterStatus === status
                                ? 'bg-white text-slate-900 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Results Table */}
            <div className="glass-card rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Service Item</th>
                                <th className="px-6 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Location</th>
                                <th className="px-6 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Visuals</th>
                                <th className="px-6 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Activity</th>
                                <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Control</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            <AnimatePresence mode="popLayout">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-slate-400 font-medium italic">
                                            Loading registry...
                                        </td>
                                    </tr>
                                ) : filteredTickets.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-slate-400 font-medium">
                                            No matches found for your current search criteria
                                        </td>
                                    </tr>
                                ) : (
                                    filteredTickets.map((ticket) => (
                                        <motion.tr
                                            key={ticket.id}
                                            layout
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="group hover:bg-slate-50/50 transition-colors"
                                        >
                                            <td className="px-6 py-5">
                                                <div className="space-y-1">
                                                    <div className="font-bold text-slate-900 group-hover:text-black transition-colors">
                                                        {ticket.title}
                                                    </div>
                                                    <div className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : 'N/A'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2 text-slate-600 font-semibold">
                                                    <MapPin className="w-4 h-4 text-slate-400" />
                                                    {ticket.facility?.name || 'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex -space-x-2">
                                                    {ticket.photos?.slice(0, 3).map((photo, i) => (
                                                        <motion.img
                                                            key={i}
                                                            whileHover={{ y: -4, zIndex: 10, scale: 1.1 }}
                                                            onClick={() => setSelectedImage(`${API_URL}${photo}`)}
                                                            src={`${API_URL}${photo}`}
                                                            className="inline-block h-10 w-10 rounded-xl ring-2 ring-white object-cover cursor-pointer shadow-sm"
                                                            alt="Ticket"
                                                        />
                                                    ))}
                                                    {ticket.photos?.length > 3 && (
                                                        <div className="flex items-center justify-center h-10 w-10 rounded-xl ring-2 ring-white bg-slate-100 text-[11px] font-black text-slate-600 shadow-sm">
                                                            +{ticket.photos.length - 3}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <StatusBadge status={ticket.status} />
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="text-xs font-black text-slate-400 uppercase tracking-wider">
                                                    {ticket.status === 'closed' ? 'Archived' : 'Active Channel'}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                {ticket.status !== 'closed' ? (
                                                    <button
                                                        onClick={() => handleCloseTicket(ticket.id)}
                                                        className="inline-flex items-center gap-1.5 px-4 py-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-all font-bold text-sm"
                                                    >
                                                        <CheckCircle2 className="w-4 h-4" />
                                                        Close
                                                    </button>
                                                ) : (
                                                    <span className="text-slate-300">Closed</span>
                                                )}
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Ticket Modal */}
            <AnimatePresence>
                {isCreateModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsCreateModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100"
                        >
                            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight-head">New Service Request</h2>
                                    <p className="text-slate-500 font-medium text-sm text-balance">Fill in the details below to initiate a maintenance ticket</p>
                                </div>
                                <button
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-2xl transition-all"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateTicket} className="p-8 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Ticket Heading</label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="Brief issue title..."
                                            value={newTicket.title}
                                            onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                                            className="w-full px-5 py-4 bg-slate-50/50 rounded-2xl border border-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900/5 transition-all text-slate-900 font-medium"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Asset Location</label>
                                        <FacilityDropdown
                                            facilities={facilities}
                                            value={newTicket.facilityId}
                                            onChange={(id) => setNewTicket({ ...newTicket, facilityId: id })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Detailed Description</label>
                                    <textarea
                                        required
                                        rows="4"
                                        placeholder="Explain the maintenance requirements or reported anomaly..."
                                        value={newTicket.description}
                                        onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                                        className="w-full px-5 py-4 bg-slate-50/50 rounded-2xl border border-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900/5 transition-all text-slate-900 font-medium resize-none"
                                    ></textarea>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
                                            Evidence & Photos ({selectedPhotos.length}/5)
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => document.getElementById('photo-upload').click()}
                                            className="text-sm font-bold text-slate-900 hover:underline flex items-center gap-1.5"
                                        >
                                            <Camera className="w-4 h-4" />
                                            Attach File
                                        </button>
                                    </div>

                                    <input
                                        id="photo-upload"
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handlePhotoChange}
                                        className="hidden"
                                    />

                                    <div className="flex flex-wrap gap-4 min-h-[100px] p-6 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200">
                                        {photoPreviews.length === 0 ? (
                                            <div className="w-full flex flex-col items-center justify-center text-slate-400 py-4">
                                                <Image className="w-8 h-8 mb-2 opacity-50" />
                                                <p className="text-xs font-medium uppercase tracking-widest">No visuals attached</p>
                                            </div>
                                        ) : (
                                            photoPreviews.map((preview, index) => (
                                                <motion.div
                                                    key={index}
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className="relative group h-24 w-24 rounded-2xl overflow-hidden shadow-lg"
                                                >
                                                    <img src={preview} alt="Preview" className="h-full w-full object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={() => removePhoto(index)}
                                                        className="absolute top-2 right-2 p-1.5 bg-white shadow-xl text-rose-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </motion.div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                    type="submit"
                                    className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-slate-900/20 hover:bg-slate-800 transition-all mt-4"
                                >
                                    Initialize Ticket Chain
                                </motion.button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Image Viewer Modal */}
            <AnimatePresence>
                {selectedImage && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedImage(null)}
                            className="absolute inset-0 bg-slate-900/95 backdrop-blur-xl"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                            transition={{ type: "spring", damping: 25 }}
                            className="relative max-w-5xl w-full flex items-center justify-center pointer-events-none"
                        >
                            <img src={selectedImage} alt="Enlarged Visual" className="max-w-full max-h-[85vh] rounded-3xl shadow-2xl ring-1 ring-white/10 pointer-events-auto" />
                            <button
                                onClick={() => setSelectedImage(null)}
                                className="absolute -top-16 right-0 p-4 text-white/50 hover:text-white transition-all pointer-events-auto hover:rotate-90 transition-transform duration-300"
                            >
                                <X className="w-10 h-10" />
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TicketCenter;
