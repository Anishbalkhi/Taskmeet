import { useWorkspace } from "../../context/WorkspaceContext";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Search, ChevronDown, Plus, Check, Settings, User, LogOut, Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "../ThemeToggle";
import { useNotifications } from "../../context/NotificationContext";

/* Tiny role badge used inside the workspace dropdown */
const ROLE_META = {
    owner: { label: 'Owner', cls: 'bg-amber-100 text-amber-700' },
    admin: { label: 'Admin', cls: 'bg-amber-100 text-amber-700' },
    manager: { label: 'Manager', cls: 'bg-blue-100 text-blue-700' },
    member: { label: 'Member', cls: 'bg-gray-100 text-gray-600' },
};
function RolePill({ role }) {
    const m = ROLE_META[role] || ROLE_META.member;
    return (
        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${m.cls}`}>
            {m.label}
        </span>
    );
}

const Header = () => {
    const { currentWorkspace, workspaces, setCurrentWorkspace } = useWorkspace();
    const { user, logout } = useAuth();
    const { unreadCount } = useNotifications();
    const navigate = useNavigate();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isWsOpen, setIsWsOpen] = useState(false);
    const profileRef = useRef(null);
    const wsRef = useRef(null);

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClick = (e) => {
            if (profileRef.current && !profileRef.current.contains(e.target)) setIsProfileOpen(false);
            if (wsRef.current && !wsRef.current.contains(e.target)) setIsWsOpen(false);
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    const handleWsSwitch = (ws) => {
        setCurrentWorkspace(ws);
        setIsWsOpen(false);
    };

    const handleNewWorkspace = () => {
        setIsWsOpen(false);
        navigate("/dashboard/create-workspace");
    };

    return (
        <header
            className="h-14 flex items-center justify-between px-3 sm:px-6 sticky top-0 z-40"
            style={{
                background: 'var(--bg-primary)',
                borderBottom: '1px solid var(--border-primary)',
                boxShadow: 'var(--shadow-sm)'
            }}
        >
            {/* LEFT: Workspace selector + search */}
            <div className="flex items-center gap-3 flex-1 min-w-0">

                {/* Workspace dropdown */}
                <div className="relative shrink-0" ref={wsRef}>
                    <button
                        onClick={() => setIsWsOpen(!isWsOpen)}
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-colors text-sm font-medium"
                        style={{ color: 'var(--text-secondary)', background: 'transparent' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                        <div
                            className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0"
                            style={{ background: 'var(--accent-primary)', color: 'var(--text-inverse)' }}
                        >
                            {currentWorkspace ? currentWorkspace.name.substring(0, 1).toUpperCase() : "W"}
                        </div>
                        <span className="hidden sm:inline max-w-[120px] truncate">
                            {currentWorkspace?.name || "Select Workspace"}
                        </span>
                        {currentWorkspace?.role && (
                            <span className="hidden sm:inline">
                                <RolePill role={currentWorkspace.role} />
                            </span>
                        )}
                        <ChevronDown
                            className={`w-3.5 h-3.5 transition-transform shrink-0 ${isWsOpen ? 'rotate-180' : ''}`}
                            style={{ color: 'var(--text-tertiary)' }}
                        />
                    </button>

                    <AnimatePresence>
                        {isWsOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                                transition={{ duration: 0.15 }}
                                className="rounded-xl p-2 z-[9999]"
                                style={{
                                    position: 'fixed',
                                    top: '58px',
                                    left: '12px',
                                    width: '260px',
                                    background: 'var(--bg-elevated)',
                                    border: '1px solid var(--border-primary)',
                                    boxShadow: '0 20px 60px rgba(0,0,0,0.25), 0 4px 16px rgba(0,0,0,0.15)'
                                }}
                            >
                                <div className="text-[10px] font-bold px-3 py-1.5 uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                                    Workspaces
                                </div>
                                <div className="max-h-60 overflow-y-auto">
                                    {workspaces.map(ws => (
                                        <button
                                            key={ws.id}
                                            onClick={() => handleWsSwitch(ws)}
                                            className="w-full text-left px-3 py-2.5 rounded-lg text-sm flex items-center justify-between transition-colors group"
                                            style={{
                                                background: currentWorkspace?.id === ws.id ? 'var(--bg-hover)' : 'transparent',
                                                color: currentWorkspace?.id === ws.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                                            }}
                                            onMouseEnter={(e) => { if (currentWorkspace?.id !== ws.id) e.currentTarget.style.background = 'var(--bg-hover)'; }}
                                            onMouseLeave={(e) => { if (currentWorkspace?.id !== ws.id) e.currentTarget.style.background = 'transparent'; }}
                                        >
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <div
                                                    className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0"
                                                    style={{ background: 'var(--accent-primary)', color: 'var(--text-inverse)' }}
                                                >
                                                    {ws.name.substring(0, 1).toUpperCase()}
                                                </div>
                                                <span className="truncate font-medium">{ws.name}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 shrink-0 ml-2">
                                                <RolePill role={ws.role} />
                                                {currentWorkspace?.id === ws.id && (
                                                    <Check className="w-3.5 h-3.5" style={{ color: 'var(--accent-secondary)' }} />
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                                <div className="mt-1 pt-1" style={{ borderTop: '1px solid var(--border-primary)' }}>
                                    <button
                                        onClick={handleNewWorkspace}
                                        className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                                        style={{ color: 'var(--text-secondary)', background: 'transparent' }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <Plus className="w-4 h-4" /> New Workspace
                                    </button>
                                    <button
                                        onClick={() => { setIsWsOpen(false); navigate("/dashboard/workspace"); }}
                                        className="w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
                                        style={{ color: 'var(--text-secondary)', background: 'transparent' }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <Settings className="w-4 h-4" /> Workspace Settings
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Search bar — desktop only */}
                <div className="relative flex-1 max-w-sm hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full text-sm rounded-lg pl-9 pr-4 py-2 focus:outline-none transition-all"
                        style={{
                            background: 'var(--input-bg)',
                            border: '1px solid var(--input-border)',
                            color: 'var(--text-primary)'
                        }}
                        onFocus={(e) => {
                            e.currentTarget.style.borderColor = 'var(--border-hover)';
                            e.currentTarget.style.background = 'var(--bg-primary)';
                        }}
                        onBlur={(e) => {
                            e.currentTarget.style.borderColor = 'var(--input-border)';
                            e.currentTarget.style.background = 'var(--input-bg)';
                        }}
                    />
                </div>
            </div>

            {/* RIGHT: actions */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0 ml-2">

                <ThemeToggle />

                {/* Notification Bell */}
                <button
                    onClick={() => navigate('/dashboard/notifications')}
                    className="relative p-2 rounded-lg transition-colors"
                    style={{ background: 'transparent', color: 'var(--text-tertiary)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-tertiary)'; }}
                    title="Notifications"
                >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center" style={{ background: '#ef4444', color: '#fff' }}>
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </button>

                {/* Profile dropdown */}
                <div className="relative" ref={profileRef}>
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-2 p-1.5 rounded-lg transition-colors"
                        style={{ background: 'transparent' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                        <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold"
                            style={{
                                background: 'linear-gradient(135deg, #7c3aed, #3b82f6)',
                                color: '#fff'
                            }}
                        >
                            {(user?.name || user?.email || 'U').substring(0, 1).toUpperCase()}
                        </div>
                    </button>

                    <AnimatePresence>
                        {isProfileOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                                transition={{ duration: 0.15 }}
                                className="rounded-xl overflow-hidden z-[9999]"
                                style={{
                                    position: 'fixed',
                                    top: '58px',
                                    right: '12px',
                                    width: '240px',
                                    background: 'var(--bg-elevated)',
                                    border: '1px solid var(--border-primary)',
                                    boxShadow: '0 20px 60px rgba(0,0,0,0.25), 0 4px 16px rgba(0,0,0,0.15)'
                                }}
                            >
                                {/* User info */}
                                <div
                                    className="px-4 py-3 flex items-center gap-3"
                                    style={{ borderBottom: '1px solid var(--border-primary)' }}
                                >
                                    <div
                                        className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                                        style={{
                                            background: 'linear-gradient(135deg, #7c3aed, #3b82f6)',
                                            color: '#fff'
                                        }}
                                    >
                                        {(user?.name || user?.email || 'U').substring(0, 1).toUpperCase()}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                                            {user?.name || 'User'}
                                        </p>
                                        <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                                            {user?.email || ''}
                                        </p>
                                    </div>
                                </div>

                                {/* Role in workspace */}
                                {currentWorkspace && (
                                    <div className="px-4 py-2 flex items-center gap-2" style={{ borderBottom: '1px solid var(--border-primary)' }}>
                                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Role:</span>
                                        <RolePill role={currentWorkspace.role} />
                                    </div>
                                )}

                                {/* Menu items */}
                                <div className="p-1">
                                    <button
                                        onClick={() => { setIsProfileOpen(false); navigate("/dashboard/profile"); }}
                                        className="w-full text-left px-3 py-2.5 text-sm rounded-lg flex items-center gap-2.5 transition-colors"
                                        style={{ color: 'var(--text-secondary)', background: 'transparent' }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <User className="w-4 h-4 shrink-0" />
                                        <span>Profile & Settings</span>
                                    </button>
                                    <button
                                        onClick={() => { setIsProfileOpen(false); navigate("/dashboard/workspace"); }}
                                        className="w-full text-left px-3 py-2.5 text-sm rounded-lg flex items-center gap-2.5 transition-colors"
                                        style={{ color: 'var(--text-secondary)', background: 'transparent' }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <Settings className="w-4 h-4 shrink-0" />
                                        <span>Workspace</span>
                                    </button>
                                    <div className="my-1 mx-2 h-px" style={{ background: 'var(--border-primary)' }} />
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-3 py-2.5 text-sm rounded-lg flex items-center gap-2.5 transition-colors"
                                        style={{ color: '#ef4444', background: 'transparent' }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <LogOut className="w-4 h-4 shrink-0" />
                                        <span>Sign out</span>
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    );
};

export default Header;
