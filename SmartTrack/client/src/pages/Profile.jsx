import { useState, useEffect } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { User, Save, X, Plus, Eye, EyeOff, Lock } from 'lucide-react';

const Profile = () => {
    const { user: authUser } = useAuth();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        skills: []
    });
    const [newSkill, setNewSkill] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    const fetchProfile = async () => {
        try {
            const { data } = await API.get('/users/me');
            setUser(data);
            setFormData({
                name: data.name,
                email: data.email,
                skills: data.skills || []
            });
            setLoading(false);
        } catch (error) {
            console.error('Error fetching profile', error);
            setMessage({ type: 'error', text: 'Failed to load profile' });
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const { data } = await API.put('/users/me', formData);
            setUser(data);
            setEditing(false);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            console.error('Error updating profile', error);
            setMessage({ type: 'error', text: 'Failed to update profile' });
        }
    };

    const handleAddSkill = () => {
        if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
            setFormData({
                ...formData,
                skills: [...formData.skills, newSkill.trim()]
            });
            setNewSkill('');
        }
    };

    const handleRemoveSkill = (skillToRemove) => {
        setFormData({
            ...formData,
            skills: formData.skills.filter(skill => skill !== skillToRemove)
        });
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }
        
        if (passwordData.newPassword.length < 6) {
            setMessage({ type: 'error', text: 'New password must be at least 6 characters' });
            return;
        }
        
        try {
            await API.put('/users/change-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            setMessage({ type: 'success', text: 'Password changed successfully!' });
            setShowChangePassword(false);
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            console.error('Error changing password', error);
            setMessage({ 
                type: 'error', 
                text: error.response?.data?.message || 'Failed to change password' 
            });
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-6 py-8">
                <div className="text-center text-gray-400">Loading profile...</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-6 py-8 max-w-2xl">
            <div className="bg-card p-8 rounded-2xl border border-border">
                <div className="flex items-center space-x-4 mb-6">
                    <div className="p-4 bg-primary/20 rounded-xl">
                        <User className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
                        <p className="text-muted-foreground">Manage your account information</p>
                    </div>
                </div>

                {message.text && (
                    <div className={`mb-6 p-4 rounded-lg ${
                        message.type === 'success' 
                            ? 'bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/30' 
                            : 'bg-destructive/20 text-destructive border border-destructive/30'
                    }`}>
                        {message.text}
                    </div>
                )}

                {showChangePassword ? (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-foreground">Change Password</h2>
                            <button
                                onClick={() => {
                                    setShowChangePassword(false);
                                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                                }}
                                className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <div>
                                <label className="text-muted-foreground text-sm block mb-2">Current Password</label>
                                <div className="relative">
                                    <input
                                        type={showPasswords.current ? "text" : "password"}
                                        value={passwordData.currentPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                        className="w-full bg-background border border-border text-foreground px-4 py-2 pr-12 rounded-lg focus:border-primary focus:outline-none placeholder:text-muted-foreground"
                                        placeholder="Enter current password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="text-muted-foreground text-sm block mb-2">New Password</label>
                                <div className="relative">
                                    <input
                                        type={showPasswords.new ? "text" : "password"}
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                        className="w-full bg-background border border-border text-foreground px-4 py-2 pr-12 rounded-lg focus:border-primary focus:outline-none placeholder:text-muted-foreground"
                                        placeholder="Enter new password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="text-muted-foreground text-sm block mb-2">Confirm New Password</label>
                                <div className="relative">
                                    <input
                                        type={showPasswords.confirm ? "text" : "password"}
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                        className="w-full bg-background border border-border text-foreground px-4 py-2 pr-12 rounded-lg focus:border-primary focus:outline-none placeholder:text-muted-foreground"
                                        placeholder="Confirm new password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>
                            <div className="flex space-x-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
                                >
                                    <Lock size={18} />
                                    <span>Change Password</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowChangePassword(false);
                                        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                                    }}
                                    className="flex-1 bg-secondary hover:bg-secondary/80 text-secondary-foreground px-6 py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
                                >
                                    <X size={20} />
                                    <span>Cancel</span>
                                </button>
                            </div>
                        </form>
                    </div>
                ) : !editing ? (
                    <div className="space-y-6">
                        <div>
                            <label className="text-muted-foreground text-sm">Name</label>
                            <p className="text-foreground text-lg mt-1">{user?.name}</p>
                        </div>
                        <div>
                            <label className="text-muted-foreground text-sm">Email</label>
                            <p className="text-foreground text-lg mt-1">{user?.email}</p>
                        </div>
                        <div>
                            <label className="text-muted-foreground text-sm">Role</label>
                            <p className="text-foreground text-lg mt-1 capitalize">{user?.role || 'student'}</p>
                        </div>
                        <div>
                            <label className="text-muted-foreground text-sm">Skills</label>
                            {user?.skills && user.skills.length > 0 ? (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {user.skills.map((skill, index) => (
                                        <span 
                                            key={index}
                                            className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm border border-primary/30"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground text-sm mt-1">No skills added yet</p>
                            )}
                        </div>
                        <div className="flex space-x-4">
                            <button
                                onClick={() => setEditing(true)}
                                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
                            >
                                <span>Edit Profile</span>
                            </button>
                            <button
                                onClick={() => setShowChangePassword(true)}
                                className="flex-1 bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
                            >
                                <Lock size={18} />
                                <span>Change Password</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleUpdate} className="space-y-6">
                        <div>
                            <label className="text-muted-foreground text-sm block mb-2">Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-background border border-border text-foreground px-4 py-2 rounded-lg focus:border-primary focus:outline-none placeholder:text-muted-foreground"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-muted-foreground text-sm block mb-2">Email</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full bg-background border border-border text-foreground px-4 py-2 rounded-lg focus:border-primary focus:outline-none placeholder:text-muted-foreground"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-muted-foreground text-sm block mb-2">Skills</label>
                            <div className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    value={newSkill}
                                    onChange={(e) => setNewSkill(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                                    placeholder="Add a skill"
                                    className="flex-1 bg-background border border-border text-foreground px-4 py-2 rounded-lg focus:border-primary focus:outline-none placeholder:text-muted-foreground"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddSkill}
                                    className="bg-secondary hover:bg-secondary/80 text-secondary-foreground px-4 py-2 rounded-lg transition-colors"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {formData.skills.map((skill, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm border border-primary/30 flex items-center space-x-2"
                                    >
                                        <span>{skill}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveSkill(skill)}
                                            className="hover:text-destructive"
                                        >
                                            <X size={14} />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="flex space-x-4">
                            <button
                                type="submit"
                                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
                            >
                                <Save size={20} />
                                <span>Save Changes</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setEditing(false);
                                    setFormData({
                                        name: user.name,
                                        email: user.email,
                                        skills: user.skills || []
                                    });
                                }}
                                className="flex-1 bg-secondary hover:bg-secondary/80 text-secondary-foreground px-6 py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
                            >
                                <X size={20} />
                                <span>Cancel</span>
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Profile;
