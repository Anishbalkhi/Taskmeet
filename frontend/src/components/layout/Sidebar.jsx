import { Link, useLocation } from "react-router-dom";
import { Home, Users, Settings, Sparkles, Plus, Bell } from "lucide-react";
import { motion } from "framer-motion";
import { useNotifications } from "../../context/NotificationContext";

const Sidebar = () => {
    const location = useLocation();
    const { unreadCount } = useNotifications();

    const isActive = (path) => location.pathname.includes(path);

    const navItems = [
        { icon: Home, label: "Home", path: "/dashboard/home" },
        { icon: Users, label: "Team", path: "/dashboard/team" },
    ];

    return (
        <>

            <aside
                className="hidden md:flex w-16 flex-col items-center py-4 fixed left-0 top-0 h-full z-50"
                style={{
                    background: 'linear-gradient(to bottom, var(--bg-secondary), var(--bg-tertiary))',
                    borderRight: '1px solid var(--border-primary)'
                }}
            >


                <Link to="/dashboard" className="mb-8 group relative">
                    <motion.div
                        className="w-10 h-10 rounded-lg flex items-center justify-center shadow-lg"
                        style={{
                            background: 'var(--accent-primary)'
                        }}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <Sparkles className="w-5 h-5" style={{ color: 'var(--text-inverse)' }} />
                    </motion.div>


                    <div
                        className="absolute left-14 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl"
                        style={{
                            background: 'var(--accent-primary)',
                            color: 'var(--text-inverse)'
                        }}
                    >
                        MeetTask
                        <div
                            className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rotate-45"
                            style={{ background: 'var(--accent-primary)' }}
                        ></div>
                    </div>
                </Link>


                <nav className="flex flex-col gap-1 w-full items-center px-2 mb-4">
                    {navItems.map((item) => (
                        <Link
                            key={item.label}
                            to={item.path}
                            className="group relative w-full"
                        >
                            <motion.div
                                whileHover={{ scale: 1.08, x: 2 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center justify-center w-full h-10 rounded-lg transition-all relative overflow-hidden"
                                style={{
                                    background: isActive(item.path) ? 'var(--accent-primary)' : 'transparent',
                                    color: isActive(item.path) ? 'var(--text-inverse)' : 'var(--text-tertiary)',
                                    boxShadow: isActive(item.path) ? 'var(--shadow-md)' : 'none'
                                }}
                                onMouseEnter={(e) => {
                                    if (!isActive(item.path)) {
                                        e.currentTarget.style.background = 'var(--bg-hover)';
                                        e.currentTarget.style.color = 'var(--text-primary)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isActive(item.path)) {
                                        e.currentTarget.style.background = 'transparent';
                                        e.currentTarget.style.color = 'var(--text-tertiary)';
                                    }
                                }}
                            >
                                <item.icon className="w-5 h-5" />


                                {isActive(item.path) && (
                                    <motion.div
                                        layoutId="activeIndicator"
                                        className="absolute -left-2 w-1 h-6 rounded-r shadow-lg"
                                        style={{ background: 'var(--accent-primary)' }}
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                            </motion.div>


                            <div
                                className="absolute left-14 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl"
                                style={{
                                    background: 'var(--accent-primary)',
                                    color: 'var(--text-inverse)'
                                }}
                            >
                                {item.label}
                                <div
                                    className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rotate-45"
                                    style={{ background: 'var(--accent-primary)' }}
                                ></div>
                            </div>
                        </Link>
                    ))}
                </nav>


                <div className="w-8 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent mb-4"></div>


                <Link to="/dashboard/create-workspace" className="group relative w-full px-2">
                    <motion.button
                        whileHover={{ scale: 1.08, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full h-10 flex items-center justify-center rounded-lg transition-all shadow-lg hover:shadow-xl"
                        style={{
                            background: 'var(--accent-primary)',
                            color: 'var(--text-inverse)'
                        }}
                    >
                        <Plus className="w-5 h-5" />
                    </motion.button>


                    <div
                        className="absolute left-14 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl"
                        style={{
                            background: 'var(--accent-primary)',
                            color: 'var(--text-inverse)'
                        }}
                    >
                        Create
                        <div
                            className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rotate-45"
                            style={{ background: 'var(--accent-primary)' }}
                        ></div>
                    </div>
                </Link>


                {/* Notifications Bell */}
                <div className="mt-auto px-2 w-full mb-2">
                    <Link to="/dashboard/notifications" className="group relative w-full block">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-full h-10 flex items-center justify-center rounded-lg transition-all relative"
                            style={{
                                background: isActive('/dashboard/notifications') ? 'var(--accent-primary)' : 'transparent',
                                color: isActive('/dashboard/notifications') ? 'var(--text-inverse)' : 'var(--text-tertiary)'
                            }}
                            onMouseEnter={(e) => {
                                if (!isActive('/dashboard/notifications')) {
                                    e.currentTarget.style.background = 'var(--bg-tertiary)';
                                    e.currentTarget.style.color = 'var(--text-primary)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isActive('/dashboard/notifications')) {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.color = 'var(--text-tertiary)';
                                }
                            }}
                        >
                            <Bell className="w-5 h-5" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center" style={{ background: '#ef4444', color: '#fff' }}>
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </motion.div>
                        <div className="absolute left-14 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl" style={{ background: 'var(--accent-primary)', color: 'var(--text-inverse)' }}>
                            Notifications
                            <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rotate-45" style={{ background: 'var(--accent-primary)' }} />
                        </div>
                    </Link>
                </div>

                {/* Settings */}
                <div className="px-2 w-full">
                    <Link to="/dashboard/workspace" className="group relative w-full block">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-full h-10 flex items-center justify-center rounded-lg transition-all"
                            style={{
                                background: 'transparent',
                                color: 'var(--text-tertiary)'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'var(--bg-tertiary)';
                                e.currentTarget.style.color = 'var(--text-primary)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = 'var(--text-tertiary)';
                            }}
                        >
                            <Settings className="w-5 h-5" />


                            <div
                                className="absolute left-14 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl"
                                style={{
                                    background: 'var(--accent-primary)',
                                    color: 'var(--text-inverse)'
                                }}
                            >
                                Settings
                                <div
                                    className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rotate-45"
                                    style={{ background: 'var(--accent-primary)' }}
                                ></div>
                            </div>
                        </motion.button>
                    </Link>
                </div>

            </aside>


            <nav
                className="md:hidden fixed bottom-0 left-0 right-0 z-50 safe-area-inset-bottom"
                style={{
                    background: 'var(--bg-primary)',
                    borderTop: '1px solid var(--border-primary)'
                }}
            >
                <div className="flex items-center justify-around px-2 py-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.label}
                            to={item.path}
                            className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors relative"
                        >
                            <motion.div
                                whileTap={{ scale: 0.9 }}
                                style={{ color: isActive(item.path) ? 'var(--accent-primary)' : 'var(--text-tertiary)' }}
                            >
                                <item.icon className="w-6 h-6" />
                            </motion.div>
                            <span
                                className="text-xs font-medium"
                                style={{ color: isActive(item.path) ? 'var(--text-primary)' : 'var(--text-muted)' }}
                            >
                                {item.label}
                            </span>
                            {isActive(item.path) && (
                                <motion.div
                                    layoutId="activeMobileIndicator"
                                    className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 rounded-b"
                                    style={{ background: 'var(--accent-primary)' }}
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                        </Link>
                    ))}


                    <Link
                        to="/dashboard/create-workspace"
                        className="flex flex-col items-center gap-1 px-4 py-2"
                    >
                        <motion.div
                            whileTap={{ scale: 0.9 }}
                            className="w-6 h-6 rounded-full flex items-center justify-center"
                            style={{
                                background: 'var(--accent-primary)',
                                color: 'var(--text-inverse)'
                            }}
                        >
                            <Plus className="w-4 h-4" />
                        </motion.div>
                        <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Create</span>
                    </Link>


                    <Link
                        to="/dashboard/notifications"
                        className="flex flex-col items-center gap-1 px-4 py-2 relative"
                    >
                        <motion.div whileTap={{ scale: 0.9 }} className="relative">
                            <Bell className="w-6 h-6" style={{ color: isActive('/dashboard/notifications') ? 'var(--accent-primary)' : 'var(--text-tertiary)' }} />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center" style={{ background: '#ef4444', color: '#fff' }}>
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </motion.div>
                        <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Alerts</span>
                    </Link>

                    <Link
                        to="/dashboard/workspace"
                        className="flex flex-col items-center gap-1 px-4 py-2"
                    >
                        <Settings className="w-6 h-6" style={{ color: 'var(--text-tertiary)' }} />
                        <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Settings</span>
                    </Link>
                </div>
            </nav>
        </>
    );
};

export default Sidebar;
