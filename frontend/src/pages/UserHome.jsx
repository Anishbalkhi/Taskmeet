import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, List, Grid3x3, Filter, ChevronDown, Search, Circle, Check, Trash2 } from "lucide-react";
import { useWorkspace } from "../context/WorkspaceContext";
import { createTask, updateTaskStatus, deleteTask } from "../api/taskApi";
import { useAuth } from "../context/AuthContext";
import CreateTaskModal from "../components/tasks/CreateTaskModal";



const UserHome = () => {
    const { currentWorkspace, tasks: workspaceTasks, loading: workspaceLoading, taskLoading, refreshTasks } = useWorkspace();
    const { user } = useAuth();
    const [createLoading, setCreateLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState("list");
    const [filterStatus, setFilterStatus] = useState("all");
    const [statusDropdownOpen, setStatusDropdownOpen] = useState(null);
    const dropdownRef = useRef(null);

    // Only tasks from current workspace that are assigned to the current user
    const myUserId = user?.id || user?._id;
    const userTasks = (workspaceTasks || []).filter(task => {
        const assigneeId = task.assignedTo?.id || task.assignedTo?._id;
        return assigneeId && String(assigneeId) === String(myUserId);
    });

    const loading = workspaceLoading || taskLoading;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setStatusDropdownOpen(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleStatusChange = async (taskId, newStatus) => {
        setStatusDropdownOpen(null);
        try {
            await updateTaskStatus(taskId, newStatus);
            await refreshTasks();
        } catch (err) {
            console.error('Failed to update status', err);
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (!window.confirm('Delete this task?')) return;
        try {
            await deleteTask(taskId);
            await refreshTasks();
        } catch (err) {
            console.error('Failed to delete task', err);
        }
    };

    const statusOptions = [
        { value: 'Todo', label: 'To Do' },
        { value: 'InProgress', label: 'In Progress' },
        { value: 'Completed', label: 'Completed' },
    ];

    const handleCreateTask = async (taskData) => {
        if (!currentWorkspace) {
            alert("Please select a workspace first");
            return;
        }

        try {
            setCreateLoading(true);
            await createTask(currentWorkspace.id, taskData);
            await refreshTasks();
            setIsModalOpen(false);
        } catch (error) {
            console.error("Failed to create task:", error);
            alert(error.response?.data?.message || "Failed to create task");
        } finally {
            setCreateLoading(false);
        }
    };

    const filteredTasks = filterStatus === "all"
        ? userTasks
        : userTasks.filter(task => task.status === filterStatus);

    const getStatusStyle = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed': return { background: 'rgba(34,197,94,0.1)', color: '#16a34a', border: '1px solid rgba(34,197,94,0.3)' };
            case 'inprogress':
            case 'in_progress': return { background: 'rgba(59,130,246,0.1)', color: '#2563eb', border: '1px solid rgba(59,130,246,0.3)' };
            default: return { background: 'var(--bg-hover)', color: 'var(--text-secondary)', border: '1px solid var(--border-primary)' };
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'high': return '#ef4444';
            case 'medium': return '#d97706';
            case 'low': return 'var(--text-muted)';
            default: return 'var(--text-muted)';
        }
    };

    const getPriorityDot = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'high': return '#ef4444';
            case 'medium': return '#f59e0b';
            case 'low': return '#6b7280';
            default: return '#6b7280';
        }
    };

    return (
        <div className="min-h-screen" style={{ background: 'var(--bg-secondary)' }}>
            <div className="p-4 sm:p-6">
                {/* Page Header */}
                <div className="mb-5">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>My Tasks</h1>
                            <p className="text-xs sm:text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Track and manage your personal tasks</p>
                        </div>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 sm:gap-2 shrink-0"
                            style={{ background: 'var(--accent-primary)', color: 'var(--text-inverse)' }}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.85'}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                        >
                            <Plus className="w-4 h-4" />
                            <span className="hidden xs:inline">Add Task</span>
                            <span className="xs:hidden">Add</span>
                        </button>
                    </div>

                    {/* Toolbar - wraps nicely on mobile */}
                    <div
                        className="rounded-lg p-2.5 sm:p-3 flex flex-wrap items-center gap-2"
                        style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}
                    >
                        {/* View mode toggle */}
                        <div className="flex items-center gap-0.5 rounded-md p-0.5" style={{ background: 'var(--bg-tertiary)' }}>
                            <button
                                onClick={() => setViewMode("list")}
                                className="p-1.5 rounded transition-all"
                                style={{
                                    background: viewMode === "list" ? 'var(--bg-primary)' : 'transparent',
                                    color: viewMode === "list" ? 'var(--text-primary)' : 'var(--text-tertiary)',
                                    boxShadow: viewMode === "list" ? 'var(--shadow-sm)' : 'none'
                                }}
                            >
                                <List className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode("grid")}
                                className="p-1.5 rounded transition-all"
                                style={{
                                    background: viewMode === "grid" ? 'var(--bg-primary)' : 'transparent',
                                    color: viewMode === "grid" ? 'var(--text-primary)' : 'var(--text-tertiary)',
                                    boxShadow: viewMode === "grid" ? 'var(--shadow-sm)' : 'none'
                                }}
                            >
                                <Grid3x3 className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Status filter */}
                        <div className="relative">
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="pl-3 pr-7 py-1.5 text-sm rounded-lg appearance-none cursor-pointer focus:outline-none transition-colors"
                                style={{
                                    background: 'var(--bg-tertiary)',
                                    border: '1px solid var(--border-primary)',
                                    color: 'var(--text-secondary)'
                                }}
                            >
                                <option value="all">All Status</option>
                                <option value="Todo">To Do</option>
                                <option value="InProgress">In Progress</option>
                                <option value="Completed">Completed</option>
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: 'var(--text-tertiary)' }} />
                        </div>

                        {/* Search - grows to fill remaining space */}
                        <div className="relative flex-1 min-w-[120px]">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--text-tertiary)' }} />
                            <input
                                type="text"
                                placeholder="Search tasks..."
                                className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg focus:outline-none transition-all"
                                style={{
                                    background: 'var(--bg-tertiary)',
                                    border: '1px solid var(--border-primary)',
                                    color: 'var(--text-primary)'
                                }}
                                onFocus={(e) => e.currentTarget.style.borderColor = 'var(--border-hover)'}
                                onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border-primary)'}
                            />
                        </div>
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div
                            className="animate-spin rounded-full h-8 w-8 border-2"
                            style={{ borderColor: 'var(--border-primary)', borderTopColor: 'var(--accent-primary)' }}
                        />
                    </div>
                ) : filteredTasks.length === 0 ? (
                    <div className="rounded-xl p-10 sm:p-14 text-center" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
                        <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: 'var(--bg-hover)' }}>
                            <Filter className="w-6 h-6" style={{ color: 'var(--text-muted)' }} />
                        </div>
                        <p className="font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>No tasks found</p>
                        <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>
                            {filterStatus !== 'all' ? 'No tasks match the current filter' : 'Create your first task to get started'}
                        </p>
                        <div className="flex items-center justify-center gap-3 flex-wrap">
                            {filterStatus !== 'all' && (
                                <button
                                    onClick={() => setFilterStatus("all")}
                                    className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                    style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}
                                >
                                    Clear Filter
                                </button>
                            )}
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
                                style={{ background: 'var(--accent-primary)', color: 'var(--text-inverse)' }}
                            >
                                <Plus className="w-4 h-4" /> New Task
                            </button>
                        </div>
                    </div>
                ) : viewMode === "list" ? (
                    <div className="rounded-xl overflow-hidden" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
                        {/* Table header — hidden on very small screens */}
                        <div
                            className="hidden sm:grid grid-cols-12 gap-3 px-4 py-3 text-xs font-semibold uppercase tracking-wide"
                            style={{ background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-primary)', color: 'var(--text-muted)' }}
                        >
                            <div className="col-span-6">Task Name</div>
                            <div className="col-span-2">Status</div>
                            <div className="col-span-2">Priority</div>
                            <div className="col-span-1">Due</div>
                            <div className="col-span-1" />
                        </div>

                        <div ref={dropdownRef}>
                            {filteredTasks.map((task, index) => (
                                <motion.div
                                    key={task.id || index}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.04 }}
                                    style={{ borderBottom: '1px solid var(--border-primary)' }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    className="group transition-colors"
                                >
                                    {/* Desktop row */}
                                    <div className="hidden sm:grid grid-cols-12 gap-3 px-4 py-3 items-center">
                                        <div className="col-span-6 flex items-center gap-3 min-w-0">
                                            <Circle className="w-4 h-4 shrink-0" style={{ color: 'var(--text-muted)' }} />
                                            <span className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                                                {task.title || task.name || "Untitled Task"}
                                            </span>
                                        </div>

                                        <div className="col-span-2 flex items-center relative">
                                            <button
                                                onClick={() => setStatusDropdownOpen(statusDropdownOpen === task.id ? null : task.id)}
                                                className="px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-opacity hover:opacity-80"
                                                style={getStatusStyle(task.status)}
                                            >
                                                {task.status || "Todo"} <ChevronDown className="w-3 h-3" />
                                            </button>
                                            <AnimatePresence>
                                                {statusDropdownOpen === task.id && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: -8 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -8 }}
                                                        className="absolute top-full left-0 mt-1 rounded-lg z-50 overflow-hidden min-w-[140px]"
                                                        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-primary)', boxShadow: 'var(--shadow-lg)' }}
                                                    >
                                                        {statusOptions.map(opt => (
                                                            <button
                                                                key={opt.value}
                                                                onClick={() => handleStatusChange(task.id, opt.value)}
                                                                className="w-full px-3 py-2 text-left text-xs font-medium flex items-center justify-between transition-colors"
                                                                style={{
                                                                    color: 'var(--text-secondary)',
                                                                    background: task.status === opt.value ? 'var(--bg-hover)' : 'transparent'
                                                                }}
                                                                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                                                                onMouseLeave={(e) => e.currentTarget.style.background = task.status === opt.value ? 'var(--bg-hover)' : 'transparent'}
                                                            >
                                                                <span style={getStatusStyle(opt.value)} className="px-2 py-0.5 rounded text-xs font-semibold">
                                                                    {opt.label}
                                                                </span>
                                                                {task.status === opt.value && <Check className="w-3 h-3" style={{ color: 'var(--text-primary)' }} />}
                                                            </button>
                                                        ))}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        <div className="col-span-2 flex items-center gap-2">
                                            {task.priority && (
                                                <>
                                                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: getPriorityDot(task.priority) }} />
                                                    <span className="text-xs font-medium" style={{ color: getPriorityColor(task.priority) }}>
                                                        {task.priority}
                                                    </span>
                                                </>
                                            )}
                                        </div>

                                        <div className="col-span-1 flex items-center">
                                            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                                {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "—"}
                                            </span>
                                        </div>

                                        <div className="col-span-1 flex items-center justify-end">
                                            <button
                                                onClick={() => handleDeleteTask(task.id)}
                                                className="p-1 rounded opacity-0 group-hover:opacity-100 transition-all"
                                                style={{ color: 'var(--text-muted)' }}
                                                onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
                                                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
                                                title="Delete task"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Mobile row */}
                                    <div className="sm:hidden px-4 py-3">
                                        <div className="flex items-start gap-3">
                                            <Circle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--text-muted)' }} />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                                                    {task.title || task.name || "Untitled Task"}
                                                </p>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="px-2 py-0.5 rounded-md text-xs font-semibold" style={getStatusStyle(task.status)}>
                                                        {task.status || "Todo"}
                                                    </span>
                                                    {task.priority && (
                                                        <div className="flex items-center gap-1">
                                                            <div className="w-1.5 h-1.5 rounded-full" style={{ background: getPriorityDot(task.priority) }} />
                                                            <span className="text-xs" style={{ color: getPriorityColor(task.priority) }}>{task.priority}</span>
                                                        </div>
                                                    )}
                                                    {task.dueDate && (
                                                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                                            {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteTask(task.id)}
                                                className="p-1 rounded shrink-0"
                                                style={{ color: 'var(--text-muted)' }}
                                                onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
                                                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="w-full px-4 py-3 text-left text-sm flex items-center gap-2 transition-colors"
                            style={{ color: 'var(--text-muted)' }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                        >
                            <Plus className="w-4 h-4" />
                            Add task
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredTasks.map((task, index) => (
                            <motion.div
                                key={task.id || index}
                                className="rounded-xl p-4 transition-all group"
                                style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
                                initial={{ opacity: 0, scale: 0.97 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                                onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-lg)'}
                                onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-start gap-2 flex-1 min-w-0">
                                        <Circle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--text-muted)' }} />
                                        <h3 className="text-sm font-medium line-clamp-2 flex-1" style={{ color: 'var(--text-primary)' }}>
                                            {task.title || task.name || "Untitled Task"}
                                        </h3>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteTask(task.id)}
                                        className="p-1 rounded opacity-0 group-hover:opacity-100 transition-all shrink-0 ml-2"
                                        style={{ color: 'var(--text-muted)' }}
                                        onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="flex flex-wrap items-center gap-2 pt-3" style={{ borderTop: '1px solid var(--border-primary)' }}>
                                    <span className="px-2.5 py-1 rounded-md text-xs font-semibold" style={getStatusStyle(task.status)}>
                                        {task.status || "Todo"}
                                    </span>
                                    {task.priority && (
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-2 h-2 rounded-full" style={{ background: getPriorityDot(task.priority) }} />
                                            <span className="text-xs font-medium" style={{ color: getPriorityColor(task.priority) }}>{task.priority}</span>
                                        </div>
                                    )}
                                    {task.dueDate && (
                                        <span className="text-xs ml-auto" style={{ color: 'var(--text-muted)' }}>
                                            {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </span>
                                    )}
                                </div>
                            </motion.div>
                        ))}

                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="rounded-xl p-4 flex flex-col items-center justify-center min-h-[140px] transition-all"
                            style={{
                                background: 'transparent',
                                border: '2px dashed var(--border-secondary)',
                                color: 'var(--text-muted)'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'var(--bg-hover)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-secondary)'; e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
                        >
                            <Plus className="w-6 h-6 mb-2" />
                            <span className="text-sm font-medium">Add task</span>
                        </button>
                    </div>
                )}
            </div>

            <CreateTaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreateTask}
                loading={createLoading}
            />
        </div>
    );
};

export default UserHome;
