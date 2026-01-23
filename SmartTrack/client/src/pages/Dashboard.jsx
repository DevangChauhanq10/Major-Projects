import { useState, useEffect } from 'react';
import API from '../api/axios';
import { Plus, CheckCircle, Clock, XCircle, Briefcase, Search, Edit, Trash2, Save, X, FileText, Filter } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
    const [applications, setApplications] = useState([]);
    // Removed filteredApplications state since we use server-side matching
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
        // Debounce search
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

    // ... (rest of handlers remain similar, but ensure state updates are safe)
    
    // Keeping existing handlers...
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
    // Note: statusCounts will only reflect CURRENT PAGE. Ideally we need a separate endpoint for stats or use the one we just got if we want full stats, but basic charts for current view is fine for now or we disable charts. 
    
    
    // ... Chart data ...
    const chartData = [
        { name: 'Applied', count: statusCounts['applied'] || 0 },
        { name: 'In Progress', count: statusCounts['in-progress'] || 0 },
        { name: 'Offer', count: statusCounts['offer'] || 0 },
        { name: 'Rejected', count: statusCounts['rejected'] || 0 },
    ];

    return (
        <div className="container mx-auto px-6 py-8">
            {/* Message Alert */}
            {message.text && (
                <div className={`mb-6 p-4 rounded-lg ${
                    message.type === 'success' 
                        ? 'bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/30' 
                        : 'bg-destructive/20 text-destructive border border-destructive/30'
                }`}>
                    {message.text}
                </div>
            )}

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <StatCard icon={<Briefcase className="text-blue-500" />} title="Applied" count={statusCounts['applied'] || 0} />
                <StatCard icon={<Clock className="text-yellow-500" />} title="In Progress" count={statusCounts['in-progress'] || 0} />
                <StatCard icon={<CheckCircle className="text-green-500" />} title="Offers" count={statusCounts['offer'] || 0} />
                <StatCard icon={<XCircle className="text-destructive" />} title="Rejected" count={statusCounts['rejected'] || 0} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Applications List */}
                <div className="lg:col-span-2">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-foreground">
                             Applications ({totalApps})
                        </h2>
                        <button 
                            onClick={() => setShowForm(!showForm)}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg flex items-center space-x-2 transition-all shadow-lg shadow-primary/20"
                        >
                            <Plus size={20} />
                            <span>Add New</span>
                        </button>
                    </div>

                    {/* Search and Filter */}
                    <div className="mb-6 flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
                            <input
                                type="text"
                                placeholder="Search by company or role..."
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                                className="w-full bg-background border border-border text-foreground px-4 py-2 pl-10 rounded-lg focus:border-primary focus:outline-none placeholder:text-muted-foreground"
                            />
                        </div>
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
                            <select
                                value={statusFilter}
                                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                                className="bg-background border border-border text-foreground px-4 py-2 pl-10 pr-8 rounded-lg focus:border-primary focus:outline-none appearance-none"
                            >
                                <option value="all">All Status</option>
                                <option value="applied">Applied</option>
                                <option value="in-progress">In Progress</option>
                                <option value="offer">Offer</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                    </div>

                    {showForm && (
                        <form onSubmit={handleAddApplication} className="bg-card p-6 rounded-xl border border-border mb-6">
                            <h3 className="text-lg font-bold mb-4 text-card-foreground">Add New Application</h3>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input 
                                        placeholder="Company Name" 
                                        className="bg-background border border-border text-foreground px-4 py-2 rounded-lg focus:border-primary focus:outline-none placeholder:text-muted-foreground"
                                        value={newApp.companyName}
                                        onChange={(e) => setNewApp({...newApp, companyName: e.target.value})}
                                        required
                                    />
                                    <input 
                                        placeholder="Role" 
                                        className="bg-background border border-border text-foreground px-4 py-2 rounded-lg focus:border-primary focus:outline-none placeholder:text-muted-foreground"
                                        value={newApp.role}
                                        onChange={(e) => setNewApp({...newApp, role: e.target.value})}
                                        required
                                    />
                                </div>
                                <input 
                                    placeholder="OA Link (Optional)" 
                                    className="w-full bg-background border border-border text-foreground px-4 py-2 rounded-lg focus:border-primary focus:outline-none placeholder:text-muted-foreground"
                                    value={newApp.oaLink}
                                    onChange={(e) => setNewApp({...newApp, oaLink: e.target.value})}
                                />
                                <textarea 
                                    placeholder="Notes (Optional)" 
                                    rows="3"
                                    className="w-full bg-background border border-border text-foreground px-4 py-2 rounded-lg focus:border-primary focus:outline-none resize-none placeholder:text-muted-foreground"
                                    value={newApp.notes}
                                    onChange={(e) => setNewApp({...newApp, notes: e.target.value})}
                                />
                                <div className="flex space-x-2">
                                    <button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg transition-colors">
                                        Save
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            setShowForm(false);
                                            setNewApp({ companyName: '', role: '', oaLink: '', notes: '' });
                                        }}
                                        className="bg-secondary hover:bg-secondary/80 text-secondary-foreground px-4 py-2 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}

                    <div className="space-y-4">
                        {applications.length === 0 ? (
                            <div className="bg-card p-8 rounded-xl border border-border text-center text-muted-foreground">
                                {totalApps === 0 && !searchQuery
                                    ? 'No applications yet. Add your first application!' 
                                    : 'No applications match your search criteria.'}
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
                            <div className="flex justify-center items-center space-x-4 mt-6">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className={`px-4 py-2 rounded-lg bg-card border border-border text-foreground transition-colors ${
                                        page === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary'
                                    }`}
                                >
                                    Previous
                                </button>
                                <span className="text-muted-foreground">
                                    Page <span className="text-foreground font-bold">{page}</span> of {totalPages}
                                </span>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className={`px-4 py-2 rounded-lg bg-card border border-border text-foreground transition-colors ${
                                        page === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary'
                                    }`}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Analytics */}
                <div className="bg-card p-6 rounded-2xl border border-border h-fit">
                    <h3 className="text-xl font-bold mb-6 text-foreground">Analytics</h3>
                    <div className="h-64">
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--popover-foreground))' }}
                                    cursor={{fill: 'hsl(var(--muted))'}}
                                />
                                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon, title, count }) => (
    <div className="bg-card p-6 rounded-2xl border border-border flex items-center space-x-4 hover:border-primary/50 transition-colors shadow-sm">
        <div className="p-3 bg-muted rounded-xl">
            {icon}
        </div>
        <div>
            <p className="text-muted-foreground text-sm">{title}</p>
            <p className="text-2xl font-bold text-foreground">{count}</p>
        </div>
    </div>
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
        <div className="bg-card p-5 rounded-xl border border-border hover:border-primary/50 transition-all group shadow-sm">
            {!isEditing ? (
                <>
                    <div className="flex justify-between items-start mb-4">
                         <div className="flex-1">
                            <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">{app.companyName}</h3>
                            <p className="text-muted-foreground text-sm">{app.role}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                app.status === 'offer' ? 'bg-green-500/20 text-green-600 dark:text-green-400' :
                                app.status === 'rejected' ? 'bg-red-500/20 text-red-600 dark:text-red-400' :
                                app.status === 'in-progress' ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400' :
                                'bg-blue-500/20 text-blue-600 dark:text-blue-400'
                            }`}>
                                {app.status.replace('-', ' ').toUpperCase()}
                            </span>
                            <button
                                onClick={() => onEditClick(app)}
                                className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-primary"
                                title="Edit"
                            >
                                <Edit size={16} />
                            </button>
                            <button
                                onClick={() => onDelete(app._id)}
                                className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-destructive"
                                title="Delete"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Quick Status Update */}
                    <div className="mb-4 flex flex-wrap gap-2">
                        {['applied', 'in-progress', 'offer', 'rejected'].map(status => (
                            <button
                                key={status}
                                onClick={() => onStatusUpdate(app._id, status)}
                                disabled={app.status === status}
                                className={`px-3 py-1 rounded-lg text-xs transition-colors ${
                                    app.status === status
                                        ? 'bg-primary/20 text-primary cursor-not-allowed'
                                        : 'bg-background border border-border text-muted-foreground hover:border-primary hover:text-primary'
                                }`}
                            >
                                {status.replace('-', ' ')}
                            </button>
                        ))}
                    </div>

                    {app.notes && (
                        <div className="mb-4 p-3 bg-muted/40 rounded-lg border border-border">
                            <div className="flex items-start space-x-2">
                                <FileText size={16} className="text-muted-foreground mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-foreground">{app.notes}</p>
                            </div>
                        </div>
                    )}

                    {app.stages && app.stages.length > 0 && (
                        <div className="mb-4">
                            <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Stages</h4>
                            <div className="flex flex-wrap gap-2">
                                {app.stages.map((stage, i) => (
                                    <div key={i} className={`flex items-center space-x-2 text-xs px-3 py-1.5 rounded-lg border ${
                                        stage.status === 'cleared' ? 'bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400' :
                                        stage.status === 'rejected' ? 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400' :
                                        'bg-background border-border text-foreground'
                                    }`}>
                                        <span className="font-medium">{stage.name}</span>
                                        <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                                            stage.status === 'cleared' ? 'bg-green-500/20' :
                                            stage.status === 'rejected' ? 'bg-red-500/20' :
                                            'bg-muted'
                                        }`}>
                                            {stage.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {/* Add Stage Form or Button */}
                    {!isAddingStage ? (
                        <button 
                            onClick={() => setAddingStageId(app._id)}
                            className="mb-4 text-xs flex items-center space-x-1 text-primary hover:text-primary/80 transition-colors"
                        >
                            <Plus size={14} />
                            <span>Add Stage</span>
                        </button>
                    ) : (
                        <form onSubmit={(e) => onAddStage(e, app._id)} className="mb-4 p-3 bg-background rounded-lg border border-border animate-fadeIn">
                             <div className="flex justify-between items-center mb-2">
                                <h4 className="text-xs font-bold text-foreground">New Stage</h4>
                                <button type="button" onClick={() => setAddingStageId(null)} className="text-muted-foreground hover:text-foreground">
                                    <X size={14} />
                                </button>
                            </div>
                            <div className="grid grid-cols-1 gap-2 mb-2">
                                <input
                                    placeholder="Stage Name (e.g., Technical Round)"
                                    className="bg-muted/40 border border-border text-foreground px-3 py-1.5 rounded text-xs focus:border-primary focus:outline-none placeholder:text-muted-foreground"
                                    value={newStage.stageName}
                                    onChange={(e) => setNewStage({...newStage, stageName: e.target.value})}
                                    required
                                />
                                <div className="flex gap-2">
                                    <select
                                        className="flex-1 bg-muted/40 border border-border text-foreground px-3 py-1.5 rounded text-xs focus:border-primary focus:outline-none appearance-none"
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
                                        className="flex-1 bg-muted/40 border border-border text-foreground px-3 py-1.5 rounded text-xs focus:border-primary focus:outline-none"
                                        value={newStage.date}
                                        onChange={(e) => setNewStage({...newStage, date: e.target.value})}
                                    />
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 px-3 py-1.5 rounded text-xs transition-colors">
                                Add Stage
                            </button>
                        </form>
                    )}

                    <div className="pt-4 border-t border-border flex justify-between text-xs text-muted-foreground">
                        <span>Applied: {new Date(app.appliedDate).toLocaleDateString()}</span>
                        {app.oaLink && (
                            <a href={app.oaLink} target="_blank" rel="noreferrer" className="text-primary hover:underline">OA Link</a>
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
                            className="w-full bg-background border border-border text-foreground px-4 py-2 rounded-lg focus:border-primary focus:outline-none placeholder:text-muted-foreground"
                            required
                        />
                        <input
                            type="text"
                            placeholder="Role"
                            value={editApp.role}
                            onChange={(e) => setEditApp({...editApp, role: e.target.value})}
                            className="w-full bg-background border border-border text-foreground px-4 py-2 rounded-lg focus:border-primary focus:outline-none placeholder:text-muted-foreground"
                            required
                        />
                        <input
                            type="text"
                            placeholder="OA Link"
                            value={editApp.oaLink}
                            onChange={(e) => setEditApp({...editApp, oaLink: e.target.value})}
                            className="w-full bg-background border border-border text-foreground px-4 py-2 rounded-lg focus:border-primary focus:outline-none placeholder:text-muted-foreground"
                        />
                        <textarea
                            placeholder="Notes"
                            rows="3"
                            value={editApp.notes}
                            onChange={(e) => setEditApp({...editApp, notes: e.target.value})}
                            className="w-full bg-background border border-border text-foreground px-4 py-2 rounded-lg focus:border-primary focus:outline-none resize-none placeholder:text-muted-foreground"
                        />
                        <select
                            value={editApp.status}
                            onChange={(e) => setEditApp({...editApp, status: e.target.value})}
                            className="w-full bg-background border border-border text-foreground px-4 py-2 rounded-lg focus:border-primary focus:outline-none appearance-none"
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
                            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
                        >
                            <Save size={16} />
                            <span>Save</span>
                        </button>
                        <button
                            onClick={onCancelEdit}
                            className="flex-1 bg-secondary hover:bg-secondary/80 text-secondary-foreground px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
                        >
                            <X size={16} />
                            <span>Cancel</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
