import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, AppWindow } from 'lucide-react';
import { motion } from 'framer-motion';
import { ModeToggle } from '../components/mode-toggle';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(name, email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
            <div className="absolute top-4 right-4 z-10">
                <ModeToggle />
            </div>

            
             <div className="absolute inset-0 z-0">
                 <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-500/30 rounded-full mix-blend-multiply filter blur-[128px] animate-blob" />
                 <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/30 rounded-full mix-blend-multiply filter blur-[128px] animate-blob animation-delay-2000" />
                 <div className="absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] bg-pink-500/30 rounded-full mix-blend-multiply filter blur-[128px] animate-blob animation-delay-4000" />
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md z-10 p-6"
            >
                <div className="backdrop-blur-xl bg-card/60 border border-white/10 shadow-2xl rounded-2xl p-8">
                    <div className="flex flex-col items-center mb-6">
                        <div className="bg-primary/20 p-3 rounded-xl mb-2">
                             <AppWindow className="w-8 h-8 text-primary" />
                        </div>
                        <h1 className="text-2xl font-bold text-foreground">SmartTrack</h1>
                    </div>
                    
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-foreground mb-2">Create Account</h2>
                        <p className="text-muted-foreground text-sm">Join thousands of job seekers today</p>
                    </div>

                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="bg-destructive/10 border border-destructive/50 text-destructive p-3 rounded-lg mb-6 text-sm text-center"
                        >
                            {error}
                        </motion.div>
                    )}
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                            <input 
                                type="text" 
                                className="w-full bg-background/50 border border-border text-foreground px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-muted-foreground"
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                            <input 
                                type="email" 
                                className="w-full bg-background/50 border border-border text-foreground px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-muted-foreground"
                                placeholder="you@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Password</label>
                            <div className="relative">
                                <input 
                                    className="w-full bg-background/50 border border-border text-foreground px-4 py-2.5 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-muted-foreground"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required 
                                    type={showPassword ? "text" : "password"}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                        <button 
                            type="submit" 
                            className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground py-2.5 rounded-lg font-semibold shadow-lg shadow-primary/20 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                            Sign Up
                        </button>
                    </form>
                    <div className="mt-6 text-center text-sm">
                        <span className="text-muted-foreground">Already have an account? </span>
                        <Link to="/login" className="text-primary font-medium hover:underline">Login</Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
