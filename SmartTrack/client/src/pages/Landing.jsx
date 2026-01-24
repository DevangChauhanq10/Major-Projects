import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Layout, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Landing = () => {
    return (
        <div className="min-h-screen bg-background text-foreground overflow-hidden">
            {/* Navbar */}
            <nav className="border-b border-border/40 backdrop-blur-md fixed top-0 w-full z-50">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <div className="bg-primary/20 p-2 rounded-lg">
                            <Layout className="w-6 h-6 text-primary" />
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                            SmartTrack
                        </span>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Link to="/login">
                            <Button variant="ghost" className="hidden sm:inline-flex">Sign In</Button>
                        </Link>
                        <Link to="/register">
                            <Button className="shadow-lg shadow-primary/20">Get Started</Button>
                        </Link>
                    </div>
                </div>
            </nav>

            
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6">
                <div className="absolute inset-0 -z-10 overflow-hidden">
                    <div className="absolute -top-1/2 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] rounded-full bg-primary/5 blur-3xl opacity-50" />
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-secondary/10 blur-3xl opacity-30" />
                </div>
                
                <div className="container mx-auto text-center max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >

                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
                            Master Your Job Search <br />
                            <span className="text-primary">With Confidence</span>
                        </h1>
                        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                            Stop using spreadsheets. Organize your applications, track interviews, and analyze your progress with a platform designed for success.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link to="/register">
                                <Button size="lg" className="h-12 px-8 text-lg shadow-xl shadow-primary/20 hover:scale-105 transition-transform">
                                    Start Tracking Now <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            </Link>
                            <Link to="/login">
                                <Button size="lg" variant="outline" className="h-12 px-8 text-lg hover:bg-secondary/50">
                                    Existing User?
                                </Button>
                            </Link>
                        </div>
                    </motion.div>

                    {/* Stats/Social Proof (Mock) */}
                    <motion.div 
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="mt-16 pt-8 border-t border-border/50 grid grid-cols-2 md:grid-cols-4 gap-8"
                    >
                        {[
                            { label: 'Active Users', value: '200+' },
                            { label: 'Applications Tracked', value: '1k+' },
                            { label: 'Interviews Scheduled', value: '200+' },
                            { label: 'Offers Received', value: '60+' },
                        ].map((stat, index) => (
                            <div key={index} className="space-y-1">
                                <h4 className="text-3xl font-bold text-foreground">{stat.value}</h4>
                                <p className="text-sm text-muted-foreground">{stat.label}</p>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 lg:py-32 bg-secondary/5">
                <div className="container mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need to Succeed</h2>
                        <p className="text-muted-foreground text-lg">
                            Streamline your workflow with powerful tools built specifically for job seekers.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <Layout className="w-10 h-10 text-blue-500" />,
                                title: "Centralized Dashboard",
                                description: "View all your applications in one place. Sort, filter, and manage statuses with ease."
                            },
                            {
                                icon: <Zap className="w-10 h-10 text-yellow-500" />,
                                title: "Smart Analytics",
                                description: "Visualize your progress with dynamic charts. Understand your conversion rates and improve."
                            },
                            {
                                icon: <Shield className="w-10 h-10 text-green-500" />,
                                title: "Secure & Private",
                                description: "Your data is safe and secured."
                            }
                        ].map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-card p-8 rounded-2xl border border-border/50 hover:border-primary/30 transition-colors shadow-sm hover:shadow-lg"
                            >
                                <div className="mb-6 bg-background w-16 h-16 rounded-xl flex items-center justify-center border border-border shadow-sm">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    {feature.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

             {/* Footer */}
             <footer className="py-12 border-t border-border/40 bg-background">
                <div className="container mx-auto px-6 text-center">
                    <p className="text-muted-foreground mb-4">
                        &copy; {new Date().getFullYear()} SmartTrack. All rights reserved.
                    </p>
                    <div className="flex justify-center space-x-6">
                        <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy Policy</a>
                        <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Terms of Service</a>
                        <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Contact Support</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
