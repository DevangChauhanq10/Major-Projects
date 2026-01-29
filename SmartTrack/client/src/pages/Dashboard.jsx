import { useState, useEffect } from 'react';
import API from '../api/axios';
import { Plus, CheckCircle, Clock, XCircle, Briefcase, Search, Edit, Trash2, Save, X, FileText, Filter, Zap, Activity, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import MotionCard from '../components/ui/MotionCard';

const Dashboard = () => {
    const [applications, setApplications] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [newApp, setNewApp] = useState({ companyName: '', role: '', oaLink: '', notes: '' });
    const [editApp, setEditApp] = useState({ companyName: '', role: '', oaLink: '', notes: '', status: 'applied' });
    const [addingStageId, setAddingStageId] = useState(null);
    const [newStage, setNewStage] = useState({ stageName: '', status: 'upcoming', date: '' });
    const [message, setMessage] = useState({ type: '', text: '' });
    
    // Pagination State
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalApps, setTotalApps] = useState(0);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchApplications();
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [page, searchQuery, statusFilter]);

    const fetchApplications = async () => {
        try {
            let query = `/applications?page=${page}&limit=6`; 
            if (searchQuery) query += `&search=${searchQuery}`;
            if (statusFilter !== 'all') query += `&status=${statusFilter}`;
            
            const { data } = await API.get(query);
            
            setApplications(data.applications);
            setTotalPages(data.totalPages);
            setTotalApps(data.totalApplications);
        } catch (error) {
            console.error('Error fetching applications', error);
            showMessage('error', 'Failed to load applications');
        }
    };

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };

    const handleAddApplication = async (e) => {
        e.preventDefault();
        try {
            const { data } = await API.post('/applications', newApp);
            setApplications([data, ...applications]); 
            setShowForm(false);
            setNewApp({ companyName: '', role: '', oaLink: '', notes: '' });
            showMessage('success', 'Application added successfully!');
            fetchApplications(); 
        } catch (error) {
            console.error('Error adding application', error);
            showMessage('error', 'Failed to add application');
        }
    };

    // ... Keeping existing simple handlers mostly same logic ...
    const handleEditClick = (app) => {
        setEditingId(app._id);
        setEditApp({
            companyName: app.companyName,
            role: app.role,
            oaLink: app.oaLink || '',
            notes: app.notes || '',
            status: app.status
        });
    };

    const handleUpdateApplication = async (id) => {
        try {
            const { data } = await API.put(`/applications/${id}`, editApp);
            setApplications(applications.map(app => app._id === id ? data : app));
            setEditingId(null);
            showMessage('success', 'Application updated successfully!');
        } catch (error) {
            console.error('Error updating application', error);
            showMessage('error', 'Failed to update application');
        }
    };

    const handleDeleteApplication = async (id) => {
        if (!window.confirm('Are you sure you want to delete this application?')) {
            return;
        }
        try {
            await API.delete(`/applications/${id}`);
            setApplications(applications.filter(app => app._id !== id));
            showMessage('success', 'Application deleted successfully!');
            fetchApplications(); 
        } catch (error) {
            console.error('Error deleting application', error);
            showMessage('error', 'Failed to delete application');
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            const { data } = await API.put(`/applications/${id}`, { status: newStatus });
            setApplications(applications.map(app => app._id === id ? data : app));
            showMessage('success', 'Status updated successfully!');
        } catch (error) {
            console.error('Error updating status', error);
            showMessage('error', 'Failed to update status');
        }
    };

    const handleAddStage = async (e, applicationId) => {
        e.preventDefault();
        try {
            const { data } = await API.put(`/applications/${applicationId}/stage`, newStage);
            setApplications(applications.map(app => app._id === applicationId ? data : app));
            setAddingStageId(null);
            setNewStage({ stageName: '', status: 'upcoming', date: '' });
            showMessage('success', 'Stage added successfully!');
        } catch (error) {
            console.error('Error adding stage', error);
            showMessage('error', 'Failed to add stage');
        }
    };

    const statusCounts = applications.reduce((acc, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1;
        return acc;
    }, {});

    const chartData = [
        { name: 'Applied', count: statusCounts['applied'] || 0, color: 'hsl(var(--primary))' },
        { name: 'In Progress', count: statusCounts['in-progress'] || 0, color: 'hsl(var(--primary))' },
        { name: 'Offer', count: statusCounts['offer'] || 0, color: 'hsl(var(--primary))' },
        { name: 'Rejected', count: statusCounts['rejected'] || 0, color: 'hsl(var(--muted-foreground))' },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    return (
        <div className="container mx-auto px-6 py-12 min-h-screen bg-background text-foreground">
            {/* Minimalist Hero */}
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-12"
            >
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl font-bold text-primary tracking-tight mb-2">
                            Dashboard
                        </h1>
                        <p className="text-muted-foreground text-lg">Your career, organized.</p>
                    </div>
                    <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowForm(!showForm)}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-xl flex items-center space-x-2 transition-all font-medium shadow-sm"
                    >
                        <Plus size={18} />
                        <span>Add Application</span>
                    </motion.button>
                </div>
            </motion.div>

            {/* Message Alert */}
            <AnimatePresence>
                {message.text && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`mb-8 p-4 rounded-lg border ${
                            message.type === 'success' 
                                ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/10 dark:text-green-400 dark:border-green-900/20' 
                                : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/10 dark:text-red-400 dark:border-red-900/20'
                        }`}
                    >
                        {message.text}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Stats Overview - Clean Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                <StatCard delay={0.1} title="Applied" count={statusCounts['applied'] || 0} />
                <StatCard delay={0.2} title="In Progress" count={statusCounts['in-progress'] || 0} />
                <StatCard delay={0.3} title="Offers" count={statusCounts['offer'] || 0} />
                <StatCard delay={0.4} title="Rejected" count={statusCounts['rejected'] || 0} />
            </div>

            <div className="flex flex-col lg:flex-row gap-12">
                {/* Applications List */}
                <div className="flex-1">
                    <div className="flex justify-between items-center mb-8 border-b border-border pb-4">
                        <h2 className="text-xl font-semibold text-foreground flex items-center">
                             Recent Activity
                        </h2>
                         <div className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
                            {totalApps} Total
                        </div>
                    </div>

                    {/* Search and Filter */}
                    <div className="mb-8 flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                            <input
                                type="text"
                                placeholder="Search companies..."
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                                className="w-full bg-card border border-border text-foreground px-4 py-2.5 pl-10 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none placeholder:text-muted-foreground transition-all"
                            />
                        </div>
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                            <select
                                value={statusFilter}
                                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                                className="bg-card border border-border text-foreground px-4 py-2.5 pl-10 pr-10 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none appearance-none cursor-pointer"
                            >
                                <option value="all">All Status</option>
                                <option value="applied">Applied</option>
                                <option value="in-progress">In Progress</option>
                                <option value="offer">Offer</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                    </div>

                    <AnimatePresence>
                        {showForm && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-10"
                            >
                                <div className="bg-card p-8 rounded-xl border border-border shadow-sm">
                                    <h3 className="text-lg font-bold mb-6 text-foreground">
                                        Add New Application
                                    </h3>
                                    <form onSubmit={handleAddApplication} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Company</label>
                                                <input 
                                                    className="w-full bg-muted/30 border border-border text-foreground px-4 py-2 rounded-lg focus:border-primary focus:outline-none"
                                                    value={newApp.companyName}
                                                    onChange={(e) => setNewApp({...newApp, companyName: e.target.value})}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Role</label>
                                                <input 
                                                    className="w-full bg-muted/30 border border-border text-foreground px-4 py-2 rounded-lg focus:border-primary focus:outline-none"
                                                    value={newApp.role}
                                                    onChange={(e) => setNewApp({...newApp, role: e.target.value})}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Link</label>
                                            <input 
                                                className="w-full bg-muted/30 border border-border text-foreground px-4 py-2 rounded-lg focus:border-primary focus:outline-none"
                                                value={newApp.oaLink}
                                                onChange={(e) => setNewApp({...newApp, oaLink: e.target.value})}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Notes</label>
                                            <textarea 
                                                rows="3"
                                                className="w-full bg-muted/30 border border-border text-foreground px-4 py-2 rounded-lg focus:border-primary focus:outline-none resize-none"
                                                value={newApp.notes}
                                                onChange={(e) => setNewApp({...newApp, notes: e.target.value})}
                                            />
                                        </div>
                                        <div className="flex space-x-3 pt-4">
                                            <button 
                                                type="submit" 
                                                className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-lg transition-colors font-medium text-sm"
                                            >
                                                Save Application
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={() => {
                                                    setShowForm(false);
                                                    setNewApp({ companyName: '', role: '', oaLink: '', notes: '' });
                                                }}
                                                className="bg-muted hover:bg-muted/80 text-foreground px-6 py-2 rounded-lg transition-colors text-sm font-medium"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-4"
                    >
                        {applications.length === 0 ? (
                            <div className="text-center py-24 border border-dashed border-border rounded-xl">
                                <h3 className="text-lg font-medium text-foreground">No applications found</h3>
                                <p className="text-muted-foreground mt-2 text-sm">Get started by adding a new job application.</p>
                            </div>
                        ) : (
                            applications.map((app) => (
                                <ApplicationCard 
                                    key={app._id} 
                                    app={app}
                                    editingId={editingId}
                                    editApp={editApp}
                                    setEditApp={setEditApp}
                                    onEditClick={handleEditClick}
                                    onUpdate={handleUpdateApplication}
                                    onDelete={handleDeleteApplication}
                                    onStatusUpdate={handleStatusUpdate}
                                    onCancelEdit={() => setEditingId(null)}
                                    addingStageId={addingStageId}
                                    setAddingStageId={setAddingStageId}
                                    newStage={newStage}
                                    setNewStage={setNewStage}
                                    onAddStage={handleAddStage}
                                />
                            ))
                        )}
                        
                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center space-x-8 mt-12">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className={`flex items-center space-x-2 text-sm font-medium transition-colors ${
                                        page === 1 ? 'text-muted-foreground opacity-50 cursor-not-allowed' : 'text-foreground hover:text-primary'
                                    }`}
                                >
                                    <span>&larr; Previous</span>
                                </button>
                                <span className="text-muted-foreground text-sm font-medium">
                                    Page {page} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className={`flex items-center space-x-2 text-sm font-medium transition-colors ${
                                        page === totalPages ? 'text-muted-foreground opacity-50 cursor-not-allowed' : 'text-foreground hover:text-primary'
                                    }`}
                                >
                                    <span>Next &rarr;</span>
                                </button>
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* Analytics Sidebar */}
                <div className="lg:w-80">
                    <MotionCard delay={0.5} className="sticky top-8 bg-card border border-border shadow-none">
                        <h3 className="text-lg font-bold mb-6 text-foreground">Analytics</h3>
                        <div className="h-48 w-full mb-4">
                             <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                                    <Tooltip 
                                        cursor={{fill: 'transparent'}}
                                        contentStyle={{ 
                                            backgroundColor: 'hsl(var(--card))', 
                                            borderColor: 'hsl(var(--border))', 
                                            borderRadius: '8px', 
                                            color: 'hsl(var(--foreground))',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
                                        }}
                                    />
                                    <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={40}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <p className="text-xs text-muted-foreground text-center">Applications Overview</p>
                    </MotionCard>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, count, delay }) => (
    <MotionCard delay={delay} className="flex flex-col justify-between h-28 border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
        <p className="text-muted-foreground text-sm font-medium uppercase tracking-wide">{title}</p>
        <p className="text-4xl font-semibold text-primary">{count}</p>
    </MotionCard>
);

const ApplicationCard = ({ 
    app, 
    editingId, 
    editApp, 
    setEditApp, 
    onEditClick, 
    onUpdate, 
    onDelete, 
    onStatusUpdate,
    onCancelEdit,
    addingStageId,
    setAddingStageId,
    newStage,
    setNewStage,
    onAddStage
}) => {
    const isEditing = editingId === app._id;
    const isAddingStage = addingStageId === app._id;

    return (
        <MotionCard className="group bg-card border border-border hover:border-primary/50 transition-colors shadow-none">
            {!isEditing ? (
                <>
                    <div className="flex justify-between items-start mb-4">
                         <div>
                            <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                                {app.companyName}
                            </h3>
                            <p className="text-muted-foreground text-sm font-medium">{app.role}</p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                                app.status === 'offer' ? 'bg-green-50 border-green-200 text-green-700' :
                                app.status === 'rejected' ? 'bg-red-50 border-red-200 text-red-700' :
                                app.status === 'in-progress' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
                                'bg-blue-50 border-blue-200 text-blue-700'
                            }`}>
                                {app.status.replace('-', ' ')}
                            </span>
                            <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => onEditClick(app)}
                                    className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <Edit size={14} />
                                </button>
                                <button
                                    onClick={() => onDelete(app._id)}
                                    className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-destructive transition-colors"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Minimalist Status Buttons */}
                    <div className="mb-6 flex flex-wrap gap-2">
                        {['applied', 'in-progress', 'offer', 'rejected'].map(status => (
                            <button
                                key={status}
                                onClick={() => onStatusUpdate(app._id, status)}
                                disabled={app.status === status}
                                className={`px-3 py-1 rounded-md text-xs font-medium transition-all border ${
                                    app.status === status
                                        ? 'bg-primary text-primary-foreground border-primary'
                                        : 'bg-transparent border-border hover:border-primary/50 text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                {status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                            </button>
                        ))}
                    </div>

                    {app.notes && (
                        <div className="mb-6">
                            <p className="text-sm text-foreground/70 leading-relaxed font-light">{app.notes}</p>
                        </div>
                    )}

                    {/* Timeline / Stages */}
                    {app.stages && app.stages.length > 0 && (
                        <div className="mb-4 pt-4 border-t border-border border-dashed">
                             <div className="flex flex-wrap gap-2">
                                {app.stages.map((stage, i) => (
                                    <div key={i} className={`flex items-center space-x-2 text-xs px-2.5 py-1 rounded border ${
                                        stage.status === 'cleared' ? 'bg-green-50/50 border-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 dark:border-green-800' :
                                        stage.status === 'rejected' ? 'bg-red-50/50 border-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800' :
                                        'bg-muted/30 border-border text-muted-foreground dark:bg-secondary/50 dark:text-gray-300'
                                    }`}>
                                        <span className="font-medium">{stage.name}</span>
                                        {stage.status === 'cleared' && <CheckCircle size={10} />}
                                        {stage.status === 'rejected' && <XCircle size={10} />}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {!isAddingStage ? (
                        <button 
                            onClick={() => setAddingStageId(app._id)}
                            className="text-xs flex items-center space-x-1 text-muted-foreground hover:text-primary transition-colors font-medium mt-2"
                        >
                            <Plus size={12} />
                            <span>Add Stage</span>
                        </button>
                    ) : (
                        <motion.form 
                             initial={{ opacity: 0, scale: 0.98 }}
                             animate={{ opacity: 1, scale: 1 }}
                            onSubmit={(e) => onAddStage(e, app._id)} 
                            className="mt-4 p-4 bg-muted/30 rounded-lg"
                        >
                             <div className="flex justify-between items-center mb-3">
                                <h4 className="text-xs font-bold text-foreground uppercase tracking-wide">New Stage</h4>
                                <button type="button" onClick={() => setAddingStageId(null)} className="text-muted-foreground hover:text-foreground">
                                    <X size={14} />
                                </button>
                            </div>
                            <div className="space-y-3 mb-3">
                                <input
                                    placeholder="Stage Name"
                                    className="w-full bg-card border border-border text-foreground px-3 py-2 rounded text-xs focus:border-primary focus:outline-none"
                                    value={newStage.stageName}
                                    onChange={(e) => setNewStage({...newStage, stageName: e.target.value})}
                                    required
                                />
                                <div className="flex gap-2">
                                    <select
                                        className="flex-1 bg-card border border-border text-foreground px-3 py-2 rounded text-xs focus:border-primary focus:outline-none appearance-none"
                                        value={newStage.status}
                                        onChange={(e) => setNewStage({...newStage, status: e.target.value})}
                                    >
                                        <option value="upcoming">Upcoming</option>
                                        <option value="pending">Pending</option>
                                        <option value="cleared">Cleared</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                    <input 
                                        type="date"
                                        className="flex-1 bg-card border border-border text-foreground px-3 py-2 rounded text-xs focus:border-primary focus:outline-none"
                                        value={newStage.date}
                                        onChange={(e) => setNewStage({...newStage, date: e.target.value})}
                                    />
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-primary text-primary-foreground px-3 py-2 rounded text-xs transition-colors font-medium">
                                Save
                            </button>
                        </motion.form>
                    )}

                    <div className="pt-4 mt-4 border-t border-border flex justify-between text-xs text-muted-foreground">
                        <span>{new Date(app.appliedDate).toLocaleDateString()}</span>
                        {app.oaLink && (
                            <a href={app.oaLink} target="_blank" rel="noreferrer" className="flex items-center hover:text-primary transition-colors">
                                Valid Link <ArrowRight size={10} className="ml-1" />
                            </a>
                        )}
                    </div>
                </>
            ) : (
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-foreground">Edit Application</h3>
                    <div className="space-y-3">
                        <input
                            type="text"
                            placeholder="Company Name"
                            value={editApp.companyName}
                            onChange={(e) => setEditApp({...editApp, companyName: e.target.value})}
                            className="w-full bg-card border border-border text-foreground px-4 py-2 rounded-lg focus:border-primary focus:outline-none"
                            required
                        />
                        <input
                            type="text"
                            placeholder="Role"
                            value={editApp.role}
                            onChange={(e) => setEditApp({...editApp, role: e.target.value})}
                            className="w-full bg-card border border-border text-foreground px-4 py-2 rounded-lg focus:border-primary focus:outline-none"
                            required
                        />
                         <input 
                            placeholder="OA Link" 
                            className="w-full bg-card border border-border text-foreground px-4 py-2 rounded-lg focus:border-primary focus:outline-none"
                            value={editApp.oaLink}
                            onChange={(e) => setEditApp({...editApp, oaLink: e.target.value})}
                        />
                        <textarea
                            placeholder="Notes"
                            rows="3"
                            value={editApp.notes}
                            onChange={(e) => setEditApp({...editApp, notes: e.target.value})}
                            className="w-full bg-card border border-border text-foreground px-4 py-2 rounded-lg focus:border-primary focus:outline-none resize-none"
                        />
                        <select
                            value={editApp.status}
                            onChange={(e) => setEditApp({...editApp, status: e.target.value})}
                            className="w-full bg-card border border-border text-foreground px-4 py-2 rounded-lg focus:border-primary focus:outline-none appearance-none"
                        >
                            <option value="applied">Applied</option>
                            <option value="in-progress">In Progress</option>
                            <option value="offer">Offer</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => onUpdate(app._id)}
                            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                        >
                            Save
                        </button>
                        <button
                            onClick={onCancelEdit}
                            className="flex-1 bg-muted hover:bg-muted/80 text-foreground px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </MotionCard>
    );
};

export default Dashboard;
