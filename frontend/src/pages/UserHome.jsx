import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, List, Grid3x3, Filter, ChevronDown, Search, MoreHorizontal, Circle, Check, Trash2 } from "lucide-react";
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
        const assigneeId = task.assignedTo?.id || task.assignedTo?.id;
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
        { value: 'Todo', label: 'To Do', color: 'bg-gray-100 text-gray-700 border-gray-200' },
        { value: 'InProgress', label: 'In Progress', color: 'bg-blue-100 text-blue-700 border-blue-200' },
        { value: 'Completed', label: 'Completed', color: 'bg-green-100 text-green-700 border-green-200' },
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

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed': return 'bg-green-100 text-green-700 border-green-200';
            case 'inprogress':
            case 'in_progress': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'todo': return 'bg-gray-100 text-gray-700 border-gray-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'high': return 'text-red-600';
            case 'medium': return 'text-yellow-600';
            case 'low': return 'text-gray-400';
            default: return 'text-gray-400';
        }
    };

    return (
        <div className="min-h-screen" style={{ background: 'var(--bg-secondary)' }}>
            <div className="p-6">
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>My Tasks</h1>
                            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Track and manage your personal tasks</p>
                        </div>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                            style={{ background: 'var(--accent-primary)', color: 'var(--text-inverse)' }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--accent-hover)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--accent-primary)'}
                        >
                            <Plus className="w-4 h-4" />
                            Add Task
                        </button>
                    </div>

                    <div className="flex items-center justify-between rounded-lg p-3" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 rounded p-0.5" style={{ background: 'var(--bg-tertiary)' }}>
                                <button
                                    onClick={() => setViewMode("list")}
                                    className="p-1.5 rounded transition-colors"
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
                                    className="p-1.5 rounded transition-colors"
                                    style={{
                                        background: viewMode === "grid" ? 'var(--bg-primary)' : 'transparent',
                                        color: viewMode === "grid" ? 'var(--text-primary)' : 'var(--text-tertiary)',
                                        boxShadow: viewMode === "grid" ? 'var(--shadow-sm)' : 'none'
                                    }}
                                >
                                    <Grid3x3 className="w-4 h-4" />
                                </button>
                            </div>

                            <button className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center gap-2 transition-colors">
                                <Filter className="w-4 h-4" />
                                Filter
                            </button>

                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-200 rounded hover:bg-gray-50 focus:outline-none focus:border-gray-300 transition-colors"
                            >
                                <option value="all">All Status</option>
                                <option value="Todo">To Do</option>
                                <option value="InProgress">In Progress</option>
                                <option value="Completed">Completed</option>
                            </select>
                        </div>

                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search tasks..."
                                className="pl-9 pr-4 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded focus:outline-none focus:border-gray-300 focus:bg-white transition-all"
                            />
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-gray-900"></div>
                    </div>
                ) : filteredTasks.length === 0 ? (
                    <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
                        <p className="text-gray-500 mb-4">No tasks match the current filters</p>
                        <button
                            onClick={() => setFilterStatus("all")}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors inline-flex items-center gap-2"
                        >
                            Clear Filters
                        </button>
                    </div>
                ) : viewMode === "list" ? (
                    <div className="rounded-lg overflow-hidden" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>

                        <div className="grid grid-cols-12 gap-4 px-4 py-3 text-xs font-semibold uppercase" style={{ background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-primary)', color: 'var(--text-muted)' }}>
                            <div className="col-span-6">Task Name</div>
                            <div className="col-span-2">Status</div>
                            <div className="col-span-2">Priority</div>
                            <div className="col-span-1">Due Date</div>
                            <div className="col-span-1"></div>
                        </div>

                        <div>
                            {filteredTasks.map((task, index) => (
                                <motion.div
                                    key={task.id || index}
                                    className="grid grid-cols-12 gap-4 px-4 py-3 transition-colors group"
                                    style={{ borderBottom: '1px solid var(--border-primary)' }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <div className="col-span-6 flex items-center gap-3">
                                        <button className="text-gray-300 hover:text-gray-900 transition-colors">
                                            <Circle className="w-4 h-4" />
                                        </button>
                                        <span className="text-sm font-medium line-clamp-1" style={{ color: 'var(--text-primary)' }}>
                                            {task.title || task.name || "Untitled Task"}
                                        </span>
                                    </div>

                                    <div className="col-span-2 flex items-center relative">
                                        <button
                                            onClick={() => setStatusDropdownOpen(statusDropdownOpen === task.id ? null : task.id)}
                                            className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(task.status)} hover:opacity-80 transition-opacity flex items-center gap-1`}
                                        >
                                            {task.status || "To Do"}
                                            <ChevronDown className="w-3 h-3" />
                                        </button>

                                        <AnimatePresence>
                                            {statusDropdownOpen === task.id && (
                                                <motion.div
                                                    ref={dropdownRef}
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[140px]"
                                                >
                                                    {statusOptions.map((option) => (
                                                        <button
                                                            key={option.value}
                                                            onClick={() => handleStatusChange(task.id, option.value)}
                                                            className={`w-full px-3 py-2 text-left text-xs font-medium hover:bg-gray-50 flex items-center justify-between transition-colors first:rounded-t-lg last:rounded-b-lg ${task.status === option.value ? 'bg-gray-50' : ''
                                                                }`}
                                                        >
                                                            <span className={`px-2 py-0.5 rounded border ${option.color}`}>
                                                                {option.label}
                                                            </span>
                                                            {task.status === option.value && (
                                                                <Check className="w-3 h-3 text-gray-600" />
                                                            )}
                                                        </button>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    <div className="col-span-2 flex items-center">
                                        <span className={`text-sm font-medium ${getPriorityColor(task.priority)}`}>
                                            {task.priority || "—"}
                                        </span>
                                    </div>

                                    <div className="col-span-1 flex items-center">
                                        <span className="text-sm text-gray-500">
                                            {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "—"}
                                        </span>
                                    </div>

                                    <div className="col-span-1 flex items-center justify-end">
                                        <button
                                            onClick={() => handleDeleteTask(task.id)}
                                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-all"
                                            title="Delete task"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="w-full px-4 py-3 text-left text-sm text-gray-500 hover:bg-gray-50 transition-colors flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Add task
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredTasks.map((task, index) => (
                            <motion.div
                                key={task.id || index}
                                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all group"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-start gap-2 flex-1">
                                        <button className="text-gray-300 hover:text-gray-900 transition-colors mt-0.5">
                                            <Circle className="w-4 h-4" />
                                        </button>
                                        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 flex-1">
                                            {task.title || task.name || "Untitled Task"}
                                        </h3>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteTask(task.id)}
                                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-all"
                                        title="Delete task"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="flex flex-wrap items-center gap-2 relative">

                                    <button
                                        onClick={() => setStatusDropdownOpen(statusDropdownOpen === task.id ? null : task.id)}
                                        className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(task.status)} hover:opacity-80 transition-opacity flex items-center gap-1`}
                                    >
                                        {task.status || "To Do"}
                                        <ChevronDown className="w-3 h-3" />
                                    </button>

                                    <AnimatePresence>
                                        {statusDropdownOpen === task.id && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[140px]"
                                            >
                                                {statusOptions.map((option) => (
                                                    <button
                                                        key={option.value}
                                                        onClick={() => handleStatusChange(task.id, option.value)}
                                                        className={`w-full px-3 py-2 text-left text-xs font-medium hover:bg-gray-50 flex items-center justify-between transition-colors first:rounded-t-lg last:rounded-b-lg ${task.status === option.value ? 'bg-gray-50' : ''
                                                            }`}
                                                    >
                                                        <span className={`px-2 py-0.5 rounded border ${option.color}`}>
                                                            {option.label}
                                                        </span>
                                                        {task.status === option.value && (
                                                            <Check className="w-3 h-3 text-gray-600" />
                                                        )}
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {task.priority && (
                                        <span className={`text-xs font-medium ${getPriorityColor(task.priority)}`}>
                                            {task.priority}
                                        </span>
                                    )}

                                    {task.dueDate && (
                                        <span className="text-xs text-gray-500 ml-auto">
                                            {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </span>
                                    )}
                                </div>
                            </motion.div>
                        ))}

                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-white border border-gray-200 border-dashed rounded-lg p-4 hover:border-gray-400 hover:bg-gray-50 transition-all flex flex-col items-center justify-center min-h-[140px] text-gray-500 hover:text-gray-700"
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
