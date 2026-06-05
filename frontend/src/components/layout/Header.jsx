import { useWorkspace } from "../../context/WorkspaceContext";
import { useState } from "react";
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
            className="h-14 flex items-center justify-between px-6 sticky top-0 z-40"
            style={{
                background: 'var(--bg-primary)',
                borderBottom: '1px solid var(--border-primary)',
                boxShadow: 'var(--shadow-sm)'
            }}
        >


            <div className="flex items-center gap-4 flex-1">

                <div className="relative">
                    <button
                        onClick={() => setIsWsOpen(!isWsOpen)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded transition-colors text-sm font-medium"
                        style={{ color: 'var(--text-secondary)', background: 'transparent' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                        <div
                            className="w-5 h-5 rounded flex items-center justify-center text-xs font-bold"
                            style={{ background: 'var(--accent-primary)', color: 'var(--text-inverse)' }}
                        >
                            {currentWorkspace ? currentWorkspace.name.substring(0, 1).toUpperCase() : "W"}
                        </div>
                        <span className="hidden sm:inline">{currentWorkspace?.name || "Select Workspace"}</span>
                        {currentWorkspace?.role && (
                            <RolePill role={currentWorkspace.role} />
                        )}
                        <ChevronDown
                            className={`w-4 h-4 transition-transform ${isWsOpen ? 'rotate-180' : ''}`}
                            style={{ color: 'var(--text-tertiary)' }}
                        />
                    </button>


                    <AnimatePresence>
                        {isWsOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.15 }}
                                className="absolute left-0 top-10 rounded-lg p-2 w-64 z-50"
                                style={{
                                    background: 'var(--bg-elevated)',
                                    border: '1px solid var(--border-primary)',
                                    boxShadow: 'var(--shadow-lg)'
                                }}
                            >
                                <div className="text-xs font-semibold px-3 py-2" style={{ color: 'var(--text-muted)' }}>
                                    WORKSPACES
                                </div>
                                <div className="max-h-64 overflow-y-auto">
                                    {workspaces.map(ws => (
                                        <button
                                            key={ws.id}
                                            onClick={() => handleWsSwitch(ws)}
                                            className="w-full text-left px-3 py-2 rounded text-sm flex items-center justify-between transition-colors group"
                                            style={{
                                                background: currentWorkspace?.id === ws.id ? 'var(--bg-hover)' : 'transparent',
                                                color: currentWorkspace?.id === ws.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                                                fontWeight: currentWorkspace?.id === ws.id ? '500' : '400'
                                            }}
                                            onMouseEnter={(e) => { if (currentWorkspace?.id !== ws.id) e.currentTarget.style.background = 'var(--bg-hover)'; }}
                                            onMouseLeave={(e) => { if (currentWorkspace?.id !== ws.id) e.currentTarget.style.background = 'transparent'; }}
                                        >
                                            <div className="flex items-center gap-2 min-w-0">
                                                <div
                                                    className="w-5 h-5 rounded flex items-center justify-center text-xs font-bold flex-shrink-0"
                                                    style={{ background: 'var(--accent-primary)', color: 'var(--text-inverse)' }}
                                                >
                                                    {ws.name.substring(0, 1).toUpperCase()}
                                                </div>
                                                <span className="truncate">{ws.name}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                                                <RolePill role={ws.role} />
                                                {currentWorkspace?.id === ws.id && (
                                                    <Check className="w-3.5 h-3.5" style={{ color: 'var(--text-primary)' }} />
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                                <div className="mt-2 pt-2" style={{ borderTop: '1px solid var(--border-primary)' }}>
                                    <button
                                        onClick={handleNewWorkspace}
                                        className="w-full text-left px-3 py-2 rounded text-sm font-medium flex items-center gap-2 transition-colors"
                                        style={{ color: 'var(--text-secondary)', background: 'transparent' }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <Plus className="w-4 h-4" /> New Workspace
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsWsOpen(false);
                                            navigate("/dashboard/workspace");
                                        }}
                                        className="w-full text-left px-3 py-2 rounded text-sm flex items-center gap-2 transition-colors"
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


                <div className="relative flex-1 max-w-md hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full text-sm rounded pl-9 pr-4 py-2 focus:outline-none transition-all"
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


            <div className="flex items-center gap-2">

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


                <div className="relative">
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-2 px-2 py-1.5 rounded transition-colors"
                        style={{ background: 'transparent' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                        <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium"
                            style={{
                                background: 'var(--accent-primary)',
                                color: 'var(--text-inverse)'
                            }}
                        >
                            <User className="w-4 h-4" />
                        </div>
                    </button>

                    <AnimatePresence>
                        {isProfileOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.15 }}
                                className="absolute right-0 top-10 w-56 rounded-lg overflow-hidden z-50"
                                style={{
                                    background: 'var(--bg-elevated)',
                                    border: '1px solid var(--border-primary)',
                                    boxShadow: 'var(--shadow-lg)'
                                }}
                            >
                                <div
                                    className="px-4 py-3"
                                    style={{ borderBottom: '1px solid var(--border-primary)' }}
                                >
                                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                                        {user?.name || 'User'}
                                    </p>
                                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                        {user?.email || ''}
                                    </p>
                                    {currentWorkspace && (
                                        <div className="mt-1.5 flex items-center gap-1.5">
                                            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>In this workspace:</span>
                                            <RolePill role={currentWorkspace.role} />
                                        </div>
                                    )}
                                </div>
                                <div className="p-1">
                                    <button
                                        onClick={() => {
                                            setIsProfileOpen(false);
                                            navigate("/dashboard/profile");
                                        }}
                                        className="w-full text-left px-3 py-2 text-sm rounded flex items-center gap-2 transition-colors"
                                        style={{ color: 'var(--text-secondary)', background: 'transparent' }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <User className="w-4 h-4" /> Profile
                                    </button>
                                    <button
                                        className="w-full text-left px-3 py-2 text-sm rounded flex items-center gap-2 transition-colors"
                                        style={{ color: 'var(--text-secondary)', background: 'transparent' }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <Settings className="w-4 h-4" /> Settings
                                    </button>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-3 py-2 text-sm rounded flex items-center gap-2 transition-colors"
                                        style={{ color: '#ef4444', background: 'transparent' }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <LogOut className="w-4 h-4" /> Logout
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
