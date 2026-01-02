import React, { useState, useEffect, useContext, useCallback } from "react";
import {
    Plus,
    Search,
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
    Image,
    User,
    FileText,
} from "lucide-react";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

/**
 * Simple status pill
 */
const StatusBadge = ({ status }) => {
    if (!status) return null;
    const normalized = status.toLowerCase();
    const colors = {
        open: "bg-blue-50 text-blue-700 border-blue-200",
        in_progress: "bg-amber-50 text-amber-700 border-amber-200",
        closed: "bg-emerald-50 text-emerald-700 border-emerald-200",
        created: "bg-slate-50 text-slate-700 border-slate-200",
    };
    const label = normalized.replace("_", " ");

    return (
        <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[normalized] || colors.open}`}
        >
            {normalized === "open" && (
                <Clock className="w-3.5 h-3.5" aria-hidden="true" />
            )}
            {normalized === "in_progress" && (
                <Clock className="w-3.5 h-3.5" aria-hidden="true" />
            )}
            {normalized === "closed" && (
                <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
            )}
            {normalized === "created" && (
                <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
            )}
            <span className="capitalize">{label}</span>
        </span>
    );
};

/**
 * Simple dropdown for facilities
 */
const FacilityDropdown = ({ facilities, value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectedFacility = facilities.find((f) => f.id === value);

    return (
        <div className="relative">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Facility
            </label>
            <button
                type="button"
                onClick={() => setIsOpen((v) => !v)}
                className="w-full flex items-center justify-between px-3 py-2.5 bg-white border border-slate-300 rounded-md text-sm"
            >
                <span
                    className={
                        selectedFacility ? "text-slate-900" : "text-slate-400"
                    }
                >
                    {selectedFacility
                        ? selectedFacility.name
                        : "Select facility"}
                </span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>
            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-md shadow-sm max-h-56 overflow-auto">
                        {facilities.length === 0 ? (
                            <div className="px-3 py-2 text-sm text-slate-400">
                                No facilities available
                            </div>
                        ) : (
                            facilities.map((facility) => (
                                <button
                                    key={facility.id}
                                    type="button"
                                    onClick={() => {
                                        onChange(facility.id);
                                        setIsOpen(false);
                                    }}
                                    className={`block w-full text-left px-3 py-2 text-sm hover:bg-slate-50 ${
                                        value === facility.id
                                            ? "bg-slate-50 text-slate-900"
                                            : "text-slate-700"
                                    }`}
                                >
                                    {facility.name}
                                </button>
                            ))
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

/**
 * Compact header + actions
 */
const TicketHeader = ({ onCreate }) => (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
            <h1 className="text-2xl font-semibold text-slate-900">
                Service Tickets
            </h1>
            <p className="text-sm text-slate-500">
                Track and manage maintenance and support requests
            </p>
        </div>
        <button
            type="button"
            onClick={onCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-md"
        >
            <Plus className="w-4 h-4" />
            New Ticket
        </button>
    </div>
);

/**
 * Simple search + status filter row
 */
const TicketFilters = ({
    searchQuery,
    setSearchQuery,
    filterStatus,
    setFilterStatus,
}) => (
    <div className="flex flex-col md:flex-row gap-3 md:items-center mb-4">
        <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by company, location, or equipment"
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-md text-sm"
            />
        </div>
        <div className="flex gap-1">
            {["all", "open", "in_progress", "closed"].map((status) => (
                <button
                    key={status}
                    type="button"
                    onClick={() => setFilterStatus(status)}
                    className={`px-3 py-1.5 text-xs rounded-md border text-sm capitalize ${
                        filterStatus === status
                            ? "bg-slate-900 text-white border-slate-900"
                            : "bg-white text-slate-700 border-slate-300"
                    }`}
                >
                    {status.replace("_", " ")}
                </button>
            ))}
        </div>
    </div>
);

/**
 * Simple stats row
 */
const TicketStats = ({ tickets }) => {
    const total = tickets.length;
    const open = tickets.filter((t) => t.status === "open").length;
    const inProgress = tickets.filter((t) => t.status === "in_progress").length;
    const closed = tickets.filter((t) => t.status === "closed").length;

    const Item = ({ label, value }) => (
        <div className="flex flex-col px-3 py-2 border border-slate-200 rounded-md text-sm">
            <span className="text-slate-500">{label}</span>
            <span className="text-slate-900 font-semibold text-base">
                {value}
            </span>
        </div>
    );

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
            <Item label="Total" value={total} />
            <Item label="Open" value={open} />
            <Item label="In Progress" value={inProgress} />
            <Item label="Closed" value={closed} />
        </div>
    );
};

/**
 * Simple table row for a ticket
 */
const TicketRow = ({ ticket, onViewDetails, onClose, onImageClick }) => {
    const createdAt = ticket.created_at
        ? new Date(ticket.created_at).toLocaleString()
        : "N/A";

    const inspectionDate = ticket.inspection_date
        ? new Date(ticket.inspection_date).toLocaleDateString()
        : "";

    const inspectionTime = ticket.inspection_time
        ? new Date(ticket.inspection_time).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
          })
        : "";

    return (
        <tr className="border-b border-slate-100 text-sm">
            <td className="px-3 py-2 align-top">
                <div className="font-medium text-slate-900">
                    {ticket.company_name || "-"}
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" />
                    <span>{ticket.location || "-"}</span>
                </div>
            </td>
            <td className="px-3 py-2 align-top">
                <div className="text-slate-900">
                    {ticket.equipment_type || "-"}
                </div>
                <div className="text-xs text-slate-500">
                    {ticket.brand_name || "-"}
                </div>
            </td>
            <td className="px-3 py-2 align-top">
                <StatusBadge status={ticket.status} />
                <div className="mt-1 text-xs text-slate-500">{createdAt}</div>
            </td>
            <td className="px-3 py-2 align-top">
                <div className="text-xs text-slate-500 mb-1">
                    Inspection: {inspectionDate} {inspectionTime}
                </div>
                <div className="flex -space-x-1">
                    {ticket.photos?.slice(0, 3).map((photo, i) => (
                        <button
                            key={i}
                            type="button"
                            onClick={() => onImageClick(`${API_URL}${photo}`)}
                            className="inline-block w-7 h-7 rounded border border-white overflow-hidden bg-slate-100"
                        >
                            <img
                                src={`${API_URL}${photo}`}
                                alt="ticket"
                                className="w-full h-full object-cover"
                            />
                        </button>
                    ))}
                    {ticket.photos && ticket.photos.length > 3 && (
                        <div className="inline-flex items-center justify-center w-7 h-7 rounded bg-slate-100 text-[10px] text-slate-600 border border-white">
                            +{ticket.photos.length - 3}
                        </div>
                    )}
                </div>
            </td>
            <td className="px-3 py-2 align-top text-right">
                <div className="flex flex-col gap-1 items-end">
                    <button
                        type="button"
                        onClick={onViewDetails}
                        className="px-2 py-1 text-xs border border-slate-300 rounded-md text-slate-700 bg-white"
                    >
                        Details
                    </button>
                    {ticket.status !== "closed" && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-2 py-1 text-xs rounded-md text-emerald-700 border border-emerald-300 bg-emerald-50"
                        >
                            Close
                        </button>
                    )}
                </div>
            </td>
        </tr>
    );
};

/**
 * Simple tickets table
 */
const TicketTable = ({
    tickets,
    loading,
    onViewTicket,
    onCloseTicket,
    onImageClick,
}) => {
    if (loading) {
        return (
            <div className="border border-slate-200 rounded-md p-6 text-sm text-slate-500 flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded-full border-2 border-slate-300 border-t-slate-600 animate-spin" />
                Loading tickets...
            </div>
        );
    }

    if (!loading && tickets.length === 0) {
        return (
            <div className="border border-slate-200 rounded-md p-6 text-sm text-slate-500 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                No tickets found. Adjust filters or create a new ticket.
            </div>
        );
    }

    return (
        <div className="border border-slate-200 rounded-md overflow-x-auto">
            <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                    <tr>
                        <th className="px-3 py-2 font-medium">Company</th>
                        <th className="px-3 py-2 font-medium">Equipment</th>
                        <th className="px-3 py-2 font-medium">Status</th>
                        <th className="px-3 py-2 font-medium">
                            Inspection & Photos
                        </th>
                        <th className="px-3 py-2 font-medium text-right">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white">
                    {tickets.map((ticket) => (
                        <TicketRow
                            key={ticket.id}
                            ticket={ticket}
                            onViewDetails={() => onViewTicket(ticket)}
                            onClose={() => onCloseTicket(ticket.id)}
                            onImageClick={onImageClick}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
};

/**
 * Read-only details view in a simple modal
 */
const TicketDetailsModal = ({ ticket, onClose }) => {
    if (!ticket) return null;

    const inspectionDate = ticket.inspection_date
        ? new Date(ticket.inspection_date).toLocaleDateString()
        : "N/A";

    const inspectionTime = ticket.inspection_time
        ? new Date(ticket.inspection_time).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
          })
        : "N/A";

    const createdAt = ticket.created_at
        ? new Date(ticket.created_at).toLocaleString()
        : "N/A";

    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
            <div className="bg-white max-w-2xl w-full mx-4 rounded-md shadow-md max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
                    <div>
                        <h2 className="text-base font-semibold text-slate-900">
                            Ticket Details
                        </h2>
                        <p className="text-xs text-slate-500">
                            Created: {createdAt}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-slate-100"
                    >
                        <X className="w-4 h-4 text-slate-500" />
                    </button>
                </div>

                <div className="p-4 space-y-4 text-sm">
                    <section>
                        <h3 className="flex items-center gap-1 text-xs font-semibold text-slate-500 uppercase mb-1">
                            <User className="w-3.5 h-3.5" />
                            Company
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div>
                                <div className="text-slate-500 text-xs">
                                    Name
                                </div>
                                <div className="text-slate-900">
                                    {ticket.company_name || "-"}
                                </div>
                            </div>
                            <div>
                                <div className="text-slate-500 text-xs">
                                    Phone
                                </div>
                                <div className="text-slate-900">
                                    {ticket.company_phone || "-"}
                                </div>
                            </div>
                            <div>
                                <div className="text-slate-500 text-xs">
                                    Email
                                </div>
                                <div className="text-slate-900">
                                    {ticket.company_email || "-"}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h3 className="flex items-center gap-1 text-xs font-semibold text-slate-500 uppercase mb-1">
                            <MapPin className="w-3.5 h-3.5" />
                            Location & Inspection
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div className="md:col-span-2">
                                <div className="text-slate-500 text-xs">
                                    Location
                                </div>
                                <div className="text-slate-900">
                                    {ticket.location || "-"}
                                </div>
                            </div>
                            <div>
                                <div className="text-slate-500 text-xs">
                                    Inspection Date
                                </div>
                                <div className="text-slate-900">
                                    {inspectionDate}
                                </div>
                            </div>
                            <div>
                                <div className="text-slate-500 text-xs">
                                    Inspection Time
                                </div>
                                <div className="text-slate-900">
                                    {inspectionTime}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h3 className="flex items-center gap-1 text-xs font-semibold text-slate-500 uppercase mb-1">
                            <FileText className="w-3.5 h-3.5" />
                            Equipment
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div>
                                <div className="text-slate-500 text-xs">
                                    Type
                                </div>
                                <div className="text-slate-900">
                                    {ticket.equipment_type || "-"}
                                </div>
                            </div>
                            <div>
                                <div className="text-slate-500 text-xs">
                                    Brand
                                </div>
                                <div className="text-slate-900">
                                    {ticket.brand_name || "-"}
                                </div>
                            </div>
                            <div>
                                <div className="text-slate-500 text-xs">
                                    Serial No.
                                </div>
                                <div className="text-slate-900">
                                    {ticket.equipment_sl_no || "-"}
                                </div>
                            </div>
                            <div>
                                <div className="text-slate-500 text-xs">
                                    Capacity
                                </div>
                                <div className="text-slate-900">
                                    {ticket.capacity || "-"}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h3 className="flex items-center gap-1 text-xs font-semibold text-slate-500 uppercase mb-1">
                            <User className="w-3.5 h-3.5" />
                            Point of Contact
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            <div>
                                <div className="text-slate-500 text-xs">
                                    Name
                                </div>
                                <div className="text-slate-900">
                                    {ticket.poc_name || "-"}
                                </div>
                            </div>
                            <div>
                                <div className="text-slate-500 text-xs">
                                    Phone
                                </div>
                                <div className="text-slate-900">
                                    {ticket.poc_phone || "-"}
                                </div>
                            </div>
                            <div>
                                <div className="text-slate-500 text-xs">
                                    Email
                                </div>
                                <div className="text-slate-900">
                                    {ticket.poc_email || "-"}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h3 className="flex items-center gap-1 text-xs font-semibold text-slate-500 uppercase mb-1">
                            <FileText className="w-3.5 h-3.5" />
                            Problem Statement
                        </h3>
                        <p className="text-slate-900 whitespace-pre-line">
                            {ticket.problem_statement || "-"}
                        </p>
                    </section>

                    {ticket.photos && ticket.photos.length > 0 && (
                        <section>
                            <h3 className="flex items-center gap-1 text-xs font-semibold text-slate-500 uppercase mb-1">
                                <Camera className="w-3.5 h-3.5" />
                                Photos
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {ticket.photos.map((photo, i) => (
                                    <a
                                        key={i}
                                        href={`${API_URL}${photo}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block w-20 h-20 rounded-md overflow-hidden border border-slate-200 bg-slate-50"
                                    >
                                        <img
                                            src={`${API_URL}${photo}`}
                                            alt={`Attachment ${i + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </a>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
};

/**
 * Simple full-screen image viewer
 */
const ImageViewer = ({ src, onClose }) => {
    if (!src) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
            <div className="relative max-w-4xl w-full mx-4">
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute -top-10 right-0 text-white p-1"
                >
                    <X className="w-5 h-5" />
                </button>
                <img
                    src={src}
                    alt="Preview"
                    className="w-full max-h-[80vh] object-contain rounded-md bg-black"
                />
            </div>
        </div>
    );
};

/**
 * Ticket creation form (modal)
 */
const TicketFormModal = ({
    open,
    onClose,
    onSubmit,
    newTicket,
    setNewTicket,
    selectedPhotos,
    photoPreviews,
    handlePhotoChange,
    removePhoto,
}) => {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
            <div className="bg-white max-w-3xl w-full mx-4 rounded-md shadow-md max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
                    <h2 className="text-base font-semibold text-slate-900">
                        New Service Ticket
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-slate-100"
                    >
                        <X className="w-4 h-4 text-slate-500" />
                    </button>
                </div>

                <form onSubmit={onSubmit} className="p-4 space-y-4 text-sm">
                    <section className="space-y-2">
                        <h3 className="text-xs font-semibold text-slate-500 uppercase">
                            Company
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs text-slate-600 mb-1">
                                    Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={newTicket.company_name}
                                    onChange={(e) =>
                                        setNewTicket((t) => ({
                                            ...t,
                                            company_name: e.target.value,
                                        }))
                                    }
                                    className="w-full border border-slate-300 rounded-md px-2 py-1.5"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-600 mb-1">
                                    Phone *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={newTicket.company_phone}
                                    onChange={(e) =>
                                        setNewTicket((t) => ({
                                            ...t,
                                            company_phone: e.target.value,
                                        }))
                                    }
                                    className="w-full border border-slate-300 rounded-md px-2 py-1.5"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-600 mb-1">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={newTicket.company_email}
                                    onChange={(e) =>
                                        setNewTicket((t) => ({
                                            ...t,
                                            company_email: e.target.value,
                                        }))
                                    }
                                    className="w-full border border-slate-300 rounded-md px-2 py-1.5"
                                />
                            </div>
                        </div>
                    </section>

                    <section className="space-y-2">
                        <h3 className="text-xs font-semibold text-slate-500 uppercase">
                            Equipment
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs text-slate-600 mb-1">
                                    Type *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={newTicket.equipment_type}
                                    onChange={(e) =>
                                        setNewTicket((t) => ({
                                            ...t,
                                            equipment_type: e.target.value,
                                        }))
                                    }
                                    className="w-full border border-slate-300 rounded-md px-2 py-1.5"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-600 mb-1">
                                    Brand
                                </label>
                                <input
                                    type="text"
                                    value={newTicket.brand_name}
                                    onChange={(e) =>
                                        setNewTicket((t) => ({
                                            ...t,
                                            brand_name: e.target.value,
                                        }))
                                    }
                                    className="w-full border border-slate-300 rounded-md px-2 py-1.5"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-600 mb-1">
                                    Serial No.
                                </label>
                                <input
                                    type="text"
                                    value={newTicket.equipment_sl_no}
                                    onChange={(e) =>
                                        setNewTicket((t) => ({
                                            ...t,
                                            equipment_sl_no: e.target.value,
                                        }))
                                    }
                                    className="w-full border border-slate-300 rounded-md px-2 py-1.5"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-600 mb-1">
                                    Capacity
                                </label>
                                <input
                                    type="text"
                                    value={newTicket.capacity}
                                    onChange={(e) =>
                                        setNewTicket((t) => ({
                                            ...t,
                                            capacity: e.target.value,
                                        }))
                                    }
                                    className="w-full border border-slate-300 rounded-md px-2 py-1.5"
                                />
                            </div>
                        </div>
                    </section>

                    <section className="space-y-2">
                        <h3 className="text-xs font-semibold text-slate-500 uppercase">
                            Location & Inspection
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="md:col-span-2">
                                <label className="block text-xs text-slate-600 mb-1">
                                    Location *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={newTicket.location}
                                    onChange={(e) =>
                                        setNewTicket((t) => ({
                                            ...t,
                                            location: e.target.value,
                                        }))
                                    }
                                    className="w-full border border-slate-300 rounded-md px-2 py-1.5"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-600 mb-1">
                                    Inspection Date *
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={newTicket.inspection_date}
                                    onChange={(e) =>
                                        setNewTicket((t) => ({
                                            ...t,
                                            inspection_date: e.target.value,
                                        }))
                                    }
                                    className="w-full border border-slate-300 rounded-md px-2 py-1.5"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-600 mb-1">
                                    Inspection Time *
                                </label>
                                <input
                                    type="time"
                                    required
                                    value={newTicket.inspection_time}
                                    onChange={(e) =>
                                        setNewTicket((t) => ({
                                            ...t,
                                            inspection_time: e.target.value,
                                        }))
                                    }
                                    className="w-full border border-slate-300 rounded-md px-2 py-1.5"
                                />
                            </div>
                        </div>
                    </section>

                    <section className="space-y-2">
                        <h3 className="text-xs font-semibold text-slate-500 uppercase">
                            Contact
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                                <label className="block text-xs text-slate-600 mb-1">
                                    POC Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={newTicket.poc_name}
                                    onChange={(e) =>
                                        setNewTicket((t) => ({
                                            ...t,
                                            poc_name: e.target.value,
                                        }))
                                    }
                                    className="w-full border border-slate-300 rounded-md px-2 py-1.5"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-600 mb-1">
                                    POC Phone *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={newTicket.poc_phone}
                                    onChange={(e) =>
                                        setNewTicket((t) => ({
                                            ...t,
                                            poc_phone: e.target.value,
                                        }))
                                    }
                                    className="w-full border border-slate-300 rounded-md px-2 py-1.5"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-600 mb-1">
                                    POC Email *
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={newTicket.poc_email}
                                    onChange={(e) =>
                                        setNewTicket((t) => ({
                                            ...t,
                                            poc_email: e.target.value,
                                        }))
                                    }
                                    className="w-full border border-slate-300 rounded-md px-2 py-1.5"
                                />
                            </div>
                        </div>
                    </section>

                    <section className="space-y-2">
                        <h3 className="text-xs font-semibold text-slate-500 uppercase">
                            Problem
                        </h3>
                        <div>
                            <label className="block text-xs text-slate-600 mb-1">
                                Description *
                            </label>
                            <textarea
                                required
                                rows={3}
                                value={newTicket.problem_statement}
                                onChange={(e) =>
                                    setNewTicket((t) => ({
                                        ...t,
                                        problem_statement: e.target.value,
                                    }))
                                }
                                className="w-full border border-slate-300 rounded-md px-2 py-1.5 resize-vertical"
                            />
                        </div>
                    </section>

                    <section className="space-y-2">
                        <h3 className="text-xs font-semibold text-slate-500 uppercase">
                            Photos
                        </h3>
                        <div className="flex items-center justify-between">
                            <p className="text-xs text-slate-500">
                                {selectedPhotos.length}/5 photos
                            </p>
                            <button
                                type="button"
                                onClick={() =>
                                    document
                                        .getElementById("ticket-photo-input")
                                        ?.click()
                                }
                                className="inline-flex items-center gap-1 text-xs border border-slate-300 rounded-md px-2 py-1 bg-white text-slate-700"
                            >
                                <Upload className="w-3.5 h-3.5" />
                                Add Photos
                            </button>
                        </div>
                        <input
                            id="ticket-photo-input"
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handlePhotoChange}
                            className="hidden"
                        />
                        <div className="flex flex-wrap gap-2">
                            {photoPreviews.length === 0 && (
                                <div className="flex items-center gap-2 text-xs text-slate-400 border border-dashed border-slate-300 rounded-md px-3 py-2">
                                    <Image className="w-4 h-4" />
                                    No photos selected
                                </div>
                            )}
                            {photoPreviews.map((preview, index) => (
                                <div
                                    key={index}
                                    className="relative w-16 h-16 rounded-md overflow-hidden border border-slate-200"
                                >
                                    <img
                                        src={preview}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removePhoto(index)}
                                        className="absolute top-0 right-0 bg-black/50 text-white p-0.5"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>

                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white text-slate-700"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-3 py-1.5 text-xs rounded-md bg-slate-900 text-white"
                        >
                            Create Ticket
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

/**
 * Main TicketCenter container
 * - Minimal styling
 * - Very few animations (only tiny loading spinner)
 * - Split into small presentational components above
 */
const TicketCenter = () => {
    const { user } = useContext(AuthContext);

    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [filterStatus, setFilterStatus] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    const [facilities, setFacilities] = useState([]);
    const [newTicket, setNewTicket] = useState({
        company_name: "",
        company_phone: "",
        company_email: "",
        brand_name: "",
        years_of_operation_in_equipment: "",
        location: "",
        inspection_date: "",
        inspection_time: "",
        photos: [],
        gst: "",
        billing_address: "",
        equipment_type: "",
        equipment_sl_no: "",
        capacity: "",
        specification_plate_photo: "",
        poc_name: "",
        poc_phone: "",
        poc_email: "",
        problem_statement: "",
    });

    const [selectedPhotos, setSelectedPhotos] = useState([]);
    const [photoPreviews, setPhotoPreviews] = useState([]);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);

    // Facilities fetch (kept for completeness, though not wired to form yet)
    const fetchFacilities = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${API_URL}/api/devices`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.data.success && Array.isArray(response.data.devices)) {
                let facilitiesData = response.data.devices
                    .map((d) => d.facility)
                    .filter(
                        (v, i, a) =>
                            a &&
                            v &&
                            a.findIndex((t) => t && t.id === v.id) === i,
                    );

                if (facilitiesData.length === 0) {
                    facilitiesData = [
                        { id: "mock-1", name: "Main Plant" },
                        { id: "mock-2", name: "Warehouse" },
                    ];
                }

                setFacilities(facilitiesData);
            } else {
                setFacilities([
                    { id: "mock-1", name: "Main Plant" },
                    { id: "mock-2", name: "Warehouse" },
                ]);
            }
        } catch (error) {
            console.error("Error fetching facilities:", error);
            setFacilities([
                { id: "mock-1", name: "Main Plant" },
                { id: "mock-2", name: "Warehouse" },
            ]);
        }
    }, []);

    // Tickets fetch
    const fetchTickets = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${API_URL}/api/services`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.data.success && Array.isArray(response.data.tickets)) {
                setTickets(response.data.tickets);
            } else {
                setTickets([]);
            }
        } catch (error) {
            console.error("Error fetching tickets:", error);
            setTickets([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTickets();
        fetchFacilities();
    }, [fetchTickets, fetchFacilities]);

    // Photo handling
    const handlePhotoChange = useCallback(
        (e) => {
            const files = Array.from(e.target.files || []);
            if (files.length + selectedPhotos.length > 5) {
                alert("Maximum 5 photos allowed");
                return;
            }

            setSelectedPhotos((prev) => [...prev, ...files]);

            const newPreviews = files.map((file) => URL.createObjectURL(file));
            setPhotoPreviews((prev) => [...prev, ...newPreviews]);
        },
        [selectedPhotos.length],
    );

    const removePhoto = useCallback((index) => {
        setSelectedPhotos((prev) => prev.filter((_, i) => i !== index));
        setPhotoPreviews((prev) => {
            const cp = [...prev];
            URL.revokeObjectURL(cp[index]);
            cp.splice(index, 1);
            return cp;
        });
    }, []);

    // Create ticket
    const handleCreateTicket = useCallback(
        async (e) => {
            e.preventDefault();
            try {
                const token = localStorage.getItem("token");
                const formData = new FormData();

                let inspection_time_iso = "";
                if (newTicket.inspection_date && newTicket.inspection_time) {
                    inspection_time_iso = new Date(
                        `${newTicket.inspection_date}T${newTicket.inspection_time}`,
                    ).toISOString();
                }

                Object.entries({
                    ...newTicket,
                    inspection_time: inspection_time_iso || "",
                }).forEach(([key, value]) => {
                    formData.append(key, value == null ? "" : value);
                });

                selectedPhotos.forEach((photo) => {
                    formData.append("photos", photo);
                });

                await axios.post(`${API_URL}/api/services`, formData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                });

                setIsCreateModalOpen(false);
                setNewTicket({
                    company_name: "",
                    company_phone: "",
                    company_email: "",
                    brand_name: "",
                    years_of_operation_in_equipment: "",
                    location: "",
                    inspection_date: "",
                    inspection_time: "",
                    photos: [],
                    gst: "",
                    billing_address: "",
                    equipment_type: "",
                    equipment_sl_no: "",
                    capacity: "",
                    specification_plate_photo: "",
                    poc_name: "",
                    poc_phone: "",
                    poc_email: "",
                    problem_statement: "",
                });
                setSelectedPhotos([]);
                setPhotoPreviews([]);
                fetchTickets();
            } catch (error) {
                console.error("Error creating ticket:", error);
                alert("Failed to create ticket");
            }
        },
        [newTicket, selectedPhotos, fetchTickets],
    );

    // Close ticket
    const handleCloseTicket = useCallback(
        async (ticketId) => {
            try {
                const token = localStorage.getItem("token");
                await axios.patch(
                    `${API_URL}/api/services/${ticketId}/close`,
                    {},
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    },
                );
                fetchTickets();
            } catch (error) {
                console.error("Error closing ticket:", error);
                alert("Failed to close ticket");
            }
        },
        [fetchTickets],
    );

    // Filtering
    const filteredTickets = tickets.filter((ticket) => {
        const matchesStatus =
            filterStatus === "all" || ticket.status === filterStatus;

        const q = searchQuery.toLowerCase();
        const matchesSearch =
            (ticket.company_name || "").toLowerCase().includes(q) ||
            (ticket.location || "").toLowerCase().includes(q) ||
            (ticket.equipment_type || "").toLowerCase().includes(q);

        return matchesStatus && matchesSearch;
    });

    return (
        <div className="p-4 md:p-6 max-w-6xl mx-auto">
            <TicketHeader onCreate={() => setIsCreateModalOpen(true)} />
            <TicketFilters
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                filterStatus={filterStatus}
                setFilterStatus={setFilterStatus}
            />
            <TicketStats tickets={tickets} />
            <TicketTable
                tickets={filteredTickets}
                loading={loading}
                onViewTicket={setSelectedTicket}
                onCloseTicket={handleCloseTicket}
                onImageClick={setSelectedImage}
            />

            <TicketFormModal
                open={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreateTicket}
                newTicket={newTicket}
                setNewTicket={setNewTicket}
                selectedPhotos={selectedPhotos}
                photoPreviews={photoPreviews}
                handlePhotoChange={handlePhotoChange}
                removePhoto={removePhoto}
            />

            <TicketDetailsModal
                ticket={selectedTicket}
                onClose={() => setSelectedTicket(null)}
            />

            <ImageViewer
                src={selectedImage}
                onClose={() => setSelectedImage(null)}
            />
        </div>
    );
};

export default TicketCenter;
