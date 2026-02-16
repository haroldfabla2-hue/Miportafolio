import React, { useState, useEffect } from 'react';
import {
    ChevronLeft, ChevronRight,
    Plus, X, Loader2
} from 'lucide-react';
import { eventsApi } from '../../services/api';
import type { CalendarEvent, EventType } from '../../types/models';
import { useAuth } from '../../context/AuthContext';

// Color map for event types
const TYPE_COLORS: Record<EventType, string> = {
    MEETING: '#3b82f6',
    CALL: '#10b981',
    DEADLINE: '#ef4444',
    REMINDER: '#f59e0b',
    PROJECT_MILESTONE: '#8b5cf6'
};

export const CalendarView: React.FC = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newEventStart, setNewEventStart] = useState<Date | null>(null);

    // Navigation
    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const goToToday = () => setCurrentDate(new Date());

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            const start = new Date(year, month, 1);
            start.setDate(start.getDate() - start.getDay());

            const end = new Date(year, month + 1, 0);
            end.setDate(end.getDate() + (6 - end.getDay()));

            const data = await eventsApi.getAll({
                start: start.toISOString(),
                end: end.toISOString()
            });
            setEvents(data);
        } catch (error) {
            console.error("Failed to fetch events", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, [currentDate]);

    const renderCalendarDays = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        const days = [];
        // Prev month padding
        for (let i = firstDay.getDay(); i > 0; i--) {
            days.push(new Date(year, month, 1 - i));
        }
        // Current month
        for (let i = 1; i <= lastDay.getDate(); i++) {
            days.push(new Date(year, month, i));
        }
        // Next month padding
        const lastDayIndex = lastDay.getDay();
        for (let i = 1; i < 7 - lastDayIndex; i++) {
            days.push(new Date(year, month + 1, i));
        }

        return days.map((day, index) => {
            const isToday = day.toDateString() === new Date().toDateString();
            const isCurrentMonth = day.getMonth() === month;
            const dayEvents = events.filter(e => {
                const eDate = new Date(e.startTime);
                return eDate.toDateString() === day.toDateString();
            });

            return (
                <div
                    key={index}
                    className={`min-h-[120px] p-2 border-b border-r border-slate-100 relative group transition-colors cursor-pointer ${!isCurrentMonth ? 'bg-slate-50/50' : 'bg-white hover:bg-slate-50'}`}
                    onClick={() => {
                        setNewEventStart(day);
                        setSelectedEvent(null);
                        setIsModalOpen(true);
                    }}
                >
                    <div className="flex justify-between items-start mb-1">
                        <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-indigo-600 text-white' : isCurrentMonth ? 'text-slate-700' : 'text-slate-400'}`}>
                            {day.getDate()}
                        </span>
                    </div>

                    <div className="space-y-1">
                        {dayEvents.slice(0, 3).map(event => (
                            <div
                                key={event.id}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedEvent(event);
                                    setIsModalOpen(true);
                                }}
                                className="px-2 py-1 rounded text-[10px] truncate transition-transform hover:scale-[1.02] border-l-2 shadow-sm"
                                style={{
                                    backgroundColor: event.color ? `${event.color}15` : `${TYPE_COLORS[event.type as EventType]}15`,
                                    borderLeftColor: event.color || TYPE_COLORS[event.type as EventType],
                                    color: event.color || TYPE_COLORS[event.type as EventType]
                                }}
                            >
                                <span className="font-bold mr-1">{new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                                {event.title}
                            </div>
                        ))}
                        {dayEvents.length > 3 && (
                            <div className="text-[10px] text-slate-400 pl-1 font-medium italic">
                                + {dayEvents.length - 3} more
                            </div>
                        )}
                    </div>
                </div>
            );
        });
    };

    if (loading && events.length === 0) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="animate-spin h-12 w-12 text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white">
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold text-slate-800">
                        {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </h2>
                    <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                        <button onClick={prevMonth} className="p-1 hover:bg-white rounded-md transition-colors"><ChevronLeft size={20} className="text-slate-600" /></button>
                        <button onClick={goToToday} className="px-3 py-1 text-sm font-medium text-slate-600 hover:bg-white rounded-md">Today</button>
                        <button onClick={nextMonth} className="p-1 hover:bg-white rounded-md transition-colors"><ChevronRight size={20} className="text-slate-600" /></button>
                    </div>
                </div>
                <button
                    onClick={() => {
                        setNewEventStart(new Date());
                        setSelectedEvent(null);
                        setIsModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md transition-all font-medium"
                >
                    <Plus size={18} /> New Event
                </button>
            </div>

            {/* Days Header */}
            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="py-2 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 overflow-y-auto custom-scroll">
                <div className="grid grid-cols-7 auto-rows-fr min-h-full">
                    {renderCalendarDays()}
                </div>
            </div>

            {/* Event Modal */}
            {isModalOpen && (
                <EventModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    event={selectedEvent}
                    initialDate={newEventStart}
                    onSave={() => {
                        fetchEvents();
                        setIsModalOpen(false);
                    }}
                />
            )}
        </div>
    );
};

// --- Sub-component: Event Modal ---
interface EventModalProps {
    isOpen: boolean;
    onClose: () => void;
    event: CalendarEvent | null;
    initialDate: Date | null;
    onSave: () => void;
}

const EventModal: React.FC<EventModalProps> = ({ isOpen, onClose, event, initialDate, onSave }) => {
    const [formData, setFormData] = useState({
        title: event?.title || '',
        description: event?.description || '',
        startDate: event ? new Date(event.startTime).toISOString().split('T')[0] : (initialDate ? initialDate.toISOString().split('T')[0] : ''),
        startTime: event ? new Date(event.startTime).toTimeString().slice(0, 5) : '09:00',
        endDate: event ? new Date(event.endTime).toISOString().split('T')[0] : (initialDate ? initialDate.toISOString().split('T')[0] : ''),
        endTime: event ? new Date(event.endTime).toTimeString().slice(0, 5) : '10:00',
        allDay: event?.allDay || false,
        type: event?.type || 'MEETING' as EventType,
        projectId: event?.projectId || '',
        clientId: event?.clientId || '',
        color: event?.color || TYPE_COLORS[(event?.type as EventType) || 'MEETING']
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const startDateTime = new Date(`${formData.startDate}T${formData.startTime}:00`);
            const endDateTime = new Date(`${formData.endDate}T${formData.endTime}:00`);

            const payload = {
                ...formData,
                startTime: startDateTime.toISOString(),
                endTime: endDateTime.toISOString()
            };

            if (event) {
                await eventsApi.update(event.id, payload);
            } else {
                await eventsApi.create(payload);
            }
            onSave();
        } catch (error) {
            console.error(error);
            alert('Failed to save event');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!event || !confirm('Delete this event?')) return;
        setSaving(true);
        try {
            await eventsApi.delete(event.id);
            onSave();
        } catch (error) {
            alert('Failed to delete');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-bold text-lg text-slate-800">
                        {event ? 'Edit Event' : 'New Event'}
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full transition-colors"><X size={20} className="text-slate-500" /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Title</label>
                        <input
                            type="text"
                            required
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-slate-800"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Brief description..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Start</label>
                            <div className="flex gap-2">
                                <input type="date" required className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} />
                                <input type="time" required className="w-24 p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" value={formData.startTime} onChange={e => setFormData({ ...formData, startTime: e.target.value })} />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">End</label>
                            <div className="flex gap-2">
                                <input type="date" required className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} />
                                <input type="time" required className="w-24 p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" value={formData.endTime} onChange={e => setFormData({ ...formData, endTime: e.target.value })} />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Type</label>
                            <select
                                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium"
                                value={formData.type}
                                onChange={e => {
                                    const newType = e.target.value as EventType;
                                    setFormData({ ...formData, type: newType, color: TYPE_COLORS[newType] });
                                }}
                            >
                                {Object.keys(TYPE_COLORS).map(type => (
                                    <option key={type} value={type}>{type.replace('_', ' ')}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Color</label>
                            <div className="flex gap-2 pt-1">
                                {Object.values(TYPE_COLORS).map(c => (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, color: c })}
                                        className={`w-6 h-6 rounded-full border-2 ${formData.color === c ? 'border-slate-800 scale-110' : 'border-transparent'}`}
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description</label>
                        <textarea
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm h-24 resize-none focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Optional notes..."
                        ></textarea>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-slate-100 mt-4">
                        {event && (
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg font-medium transition-colors"
                            >
                                Delete
                            </button>
                        )}
                        <div className="flex-1"></div>
                        <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg font-medium transition-colors">Cancel</button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 shadow-md transition-all disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save Event'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CalendarView;
