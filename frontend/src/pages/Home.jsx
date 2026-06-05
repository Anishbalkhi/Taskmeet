import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { CheckCircle, ArrowRight, Users, Calendar, Zap, Target } from "lucide-react";
import ThemeToggle from "../components/ThemeToggle";

const Home = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const features = [
    {
      icon: Target,
      title: "Task Management",
      description: "Organize and track your team's work with powerful task management tools."
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Work together seamlessly with real-time updates and team workspaces."
    },
    {
      icon: Calendar,
      title: "Smart Scheduling",
      description: "Plan and schedule tasks efficiently with intelligent calendar integration."
    },
    {
      icon: Zap,
      title: "Smart Notifications",
      description: "Stay on top of everything with real-time workspace invites and task assignment alerts."
    }
  ];

  const benefits = [
    "Unlimited tasks and projects",
    "Real-time collaboration",
    "AI-powered productivity",
    "Secure cloud storage",
    "Custom workflows",
    "Advanced reporting"
  ];

  return (
    <div className="min-h-screen bg-white">

      
      <motion.nav
        className="sticky top-0 z-50 backdrop-blur-md"
        style={{
          background: 'var(--bg-primary)cc',  
          borderBottom: '1px solid var(--border-primary)',
          boxShadow: 'var(--shadow-sm)'
        }}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-4">
          <div className="flex justify-between items-center">
            
            <Link to="/" className="flex items-center gap-3 group">
              <motion.div
                className="w-11 h-11 relative"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                
                <div
                  className="absolute inset-0 rounded-2xl shadow-2xl transition-all duration-500"
                  style={{
                    background: 'linear-gradient(to bottom right, var(--accent-primary), var(--text-primary))'
                  }}
                ></div>

                
                <div
                  className="absolute inset-0 rounded-2xl border-2 transition-all duration-500"
                  style={{ borderColor: 'var(--border-secondary)' }}
                ></div>

                
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 drop-shadow-lg"
                    style={{ color: 'var(--text-inverse)' }}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    
                    <circle cx="12" cy="12" r="10" strokeWidth="2" opacity="0.3" />
                    <path d="M9 12l2 2 4-4" />
                    <path d="M12 2v4M12 18v4M2 12h4M18 12h4" opacity="0.5" strokeWidth="1.5" />
                  </svg>
                </div>

                
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 blur-sm"></div>

                
                <div className="absolute -inset-1 bg-gradient-to-br from-gray-700/30 via-gray-600/20 to-gray-500/30 rounded-2xl blur-lg opacity-0 group-hover:opacity-70 transition-all duration-500 -z-10"></div>
              </motion.div>

              <div className="flex flex-col">
                <span className="text-xl font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
                  MeetTask
                </span>
                <span
                  className="text-[10px] -mt-0.5 hidden sm:block font-medium tracking-wide"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  Meet. Transcribe. Execute.
                </span>
              </div>
            </Link>

            
            <div className="hidden md:flex items-center gap-8">
              {['Features', 'Benefits', 'Pricing'].map((item, index) => (
                <motion.a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="font-medium transition-colors text-sm relative group"
                  style={{ color: 'var(--text-secondary)' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
                </motion.a>
              ))}

              
              <ThemeToggle />
            </div>

            
            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              {token ? (
                <>
                  <Link
                    to="/dashboard"
                    className="hidden sm:inline-block font-medium transition-colors text-sm px-4 py-2 rounded-lg"
                    style={{ color: 'var(--text-secondary)', background: 'transparent' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--text-primary)';
                      e.currentTarget.style.background = 'var(--bg-hover)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--text-secondary)';
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    Dashboard
                  </Link>
                  <motion.button
                    onClick={handleLogout}
                    className="px-5 py-2.5 rounded-lg font-medium transition-all text-sm shadow-lg hover:shadow-xl"
                    style={{ background: 'var(--accent-primary)', color: 'var(--text-inverse)' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--accent-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'var(--accent-primary)'}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Logout
                  </motion.button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="hidden sm:inline-block font-medium transition-colors text-sm px-4 py-2 rounded-lg"
                    style={{ color: 'var(--text-secondary)', background: 'transparent' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--text-primary)';
                      e.currentTarget.style.background = 'var(--bg-hover)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--text-secondary)';
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    Login
                  </Link>
                  <Link to="/register">
                    <motion.button
                      className="px-5 py-2.5 rounded-lg font-medium transition-all text-sm shadow-lg hover:shadow-xl flex items-center gap-2"
                      style={{
                        background: 'linear-gradient(to right, var(--accent-primary), var(--text-primary))',
                        color: 'var(--text-inverse)'
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Get Started
                      <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  </Link>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </motion.nav>

      
      <section className="relative pt-20 pb-32 px-6 overflow-hidden">
        
        <div className="bg-orbs-container">
          <div className="bg-orb bg-orb-1"></div>
          <div className="bg-orb bg-orb-2"></div>
          <div className="bg-orb bg-orb-3"></div>
          <div className="bg-orb bg-orb-4"></div>
        </div>

        
        <div className="absolute inset-0 pointer-events-none">
          
          <div className="floating-shape circle-1"></div>
          <div className="floating-shape circle-2"></div>
          <div className="floating-shape circle-3"></div>

          
          <div className="floating-square square-1"></div>
          <div className="floating-square square-2"></div>

          
          <div className="grid-pattern"></div>

          
          <div className="gradient-mesh"></div>

          
          <div className="scan-line"></div>
        </div>

        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="text-gradient block">The everything app</span>
              <span className="block" style={{ color: 'var(--text-primary)' }}>for work</span>
            </h1>
            <p className="text-xl mb-10 max-w-2xl mx-auto slide-up-stagger stagger-delay-2" style={{ color: 'var(--text-secondary)' }}>
              Plan, track, and manage any project with tasks, docs, goals, and more. All in one place.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap slide-up-stagger stagger-delay-3">
              <Link
                to="/register"
                className="px-8 py-4 rounded-lg font-semibold transition-all inline-flex items-center gap-2 text-base magnetic-hover glow-pulse"
                style={{ background: 'var(--accent-primary)', color: 'var(--text-inverse)' }}
              >
                Get Started - It's Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#features"
                className="px-8 py-4 rounded-lg font-semibold border-2 transition-all text-base tilt-hover"
                style={{
                  background: 'var(--bg-elevated)',
                  color: 'var(--text-primary)',
                  borderColor: 'var(--border-primary)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--border-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-primary)'}
              >
                See How It Works
              </a>
            </div>
            <p className="text-sm mt-6 slide-up-stagger stagger-delay-4" style={{ color: 'var(--text-muted)' }}>Free forever. No credit card required.</p>
          </motion.div>

          
          <motion.div
            className="mt-16 rounded-lg overflow-hidden shadow-2xl border border-gray-200"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            
            <div className="animated-dashboard aspect-video">
              <div className="dashboard-header">
                <div className="dashboard-dot dot-red"></div>
                <div className="dashboard-dot dot-yellow"></div>
                <div className="dashboard-dot dot-green"></div>
              </div>

              
              <div className="dashboard-card">
                <div className="card-header">
                  <div className="card-title"></div>
                  <div className="card-status status-progress"></div>
                </div>
                <div className="card-content"></div>
                <div className="card-content" style={{ width: '60%' }}></div>
              </div>

              <div className="dashboard-card">
                <div className="card-header">
                  <div className="card-title"></div>
                  <div className="card-status status-done"></div>
                </div>
                <div className="card-content"></div>
                <div className="card-content" style={{ width: '70%' }}></div>
              </div>

              <div className="dashboard-card">
                <div className="card-header">
                  <div className="card-title"></div>
                  <div className="card-status status-todo"></div>
                </div>
                <div className="card-content"></div>
                <div className="progress-bar">
                  <div className="progress-fill"></div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      
      <section id="features" className="py-20 px-6 bg-gray-50 relative overflow-hidden">
        
        <div className="absolute inset-0 mesh-gradient-animated opacity-60"></div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything you need to stay productive
            </h2>
            <p className="text-xl text-gray-600">
              Powerful features to help your team work faster and smarter
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-gray-900" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      
      <section id="benefits" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Built for teams of all sizes
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                From startups to enterprises, MeetTask scales with your needs and helps you achieve more together.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-gray-700 font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="team-illustration aspect-square">
              
              <svg className="connection-lines" viewBox="0 0 400 400">
                <path className="connection-line line-1" d="M 100 120 Q 200 150 300 300" />
                <path className="connection-line line-2" d="M 100 120 Q 200 200 200 200" />
                <path className="connection-line line-3" d="M 300 300 Q 250 250 200 200" />
              </svg>

              
              <div className="particle particle-1"></div>
              <div className="particle particle-2"></div>
              <div className="particle particle-3"></div>
              <div className="particle particle-4"></div>

              
              <div className="avatar-circle avatar-1">JD</div>
              <div className="avatar-circle avatar-2">AS</div>
              <div className="avatar-circle avatar-3">MK</div>
            </div>
          </div>
        </div>
      </section>

      
      <section id="pricing" className="py-20 px-6 bg-gray-50 relative overflow-hidden">
        
        <div className="absolute inset-0 mesh-gradient-animated opacity-60"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            Start for free. Upgrade when you need more.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-left">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
              <p className="text-gray-600 mb-6">Perfect for individuals and small teams</p>
              <div className="mb-6">
                <span className="text-5xl font-bold text-gray-900">$0</span>
                <span className="text-gray-600">/forever</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Unlimited tasks
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Up to 5 team members
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Basic features
                </li>
              </ul>
              <Link
                to="/register"
                className="block w-full bg-white text-gray-900 px-6 py-3 rounded-lg font-semibold border-2 border-gray-900 hover:bg-gray-50 transition-colors text-center"
              >
                Get Started Free
              </Link>
            </div>

            
            <div className="bg-gray-900 text-white rounded-lg p-8 text-left relative">
              <div className="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                POPULAR
              </div>
              <h3 className="text-2xl font-bold mb-2">Pro</h3>
              <p className="text-gray-300 mb-6">For growing teams and businesses</p>
              <div className="mb-6">
                <span className="text-5xl font-bold">$12</span>
                <span className="text-gray-300">/user/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  Everything in Free
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  Unlimited team members
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  AI-powered features
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  Priority support
                </li>
              </ul>
              <Link
                to="/register"
                className="block w-full bg-white text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-center"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Ready to get started?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of teams already using MeetTask
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-lg font-semibold hover:bg-gray-800 transition-colors text-lg"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      
      <footer className="border-t border-gray-200 py-12 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">MT</span>
                </div>
                <span className="text-lg font-bold text-gray-900">MeetTask</span>
              </div>
              <p className="text-gray-600 text-sm">
                The everything app for work
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 text-sm">Product</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="text-gray-600 hover:text-gray-900 text-sm">Features</a></li>
                <li><a href="#pricing" className="text-gray-600 hover:text-gray-900 text-sm">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 text-sm">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 hover:text-gray-900 text-sm">About</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900 text-sm">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 text-sm">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 hover:text-gray-900 text-sm">Privacy</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900 text-sm">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-8 text-center">
            <p className="text-gray-500 text-sm">
              © 2026 MeetTask. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
