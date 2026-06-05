import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, List, Grid3x3, Filter, Search, MoreHorizontal, Circle, Users as UsersIcon, ChevronDown, Check, Lock, Trash2 } from "lucide-react";
import { useWorkspace } from "../context/WorkspaceContext";
import { createTask, updateTaskStatus, deleteTask } from "../api/taskApi";
import CreateTaskModal from "../components/tasks/CreateTaskModal";
import { useRole } from "../context/RoleContext";
import usePermission from "../hooks/usePermission";


const TeamHome = () => {
    const { currentWorkspace, tasks, taskLoading, refreshTasks } = useWorkspace();
    const canAddTask = usePermission("createTask");   // ADMIN, MANAGER, MEMBER can all create tasks
    const { roleConfig } = useRole();
    const [createLoading, setCreateLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState("list");
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterAssignee, setFilterAssignee] = useState("all");
    const [statusDropdownOpen, setStatusDropdownOpen] = useState(null);
    const dropdownRef = useRef(null);

    // Real tasks from context only — no mock data
    const allTasks = tasks || [];


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
        // Only update real DB tasks (demo IDs start with 'team-demo-')
        try {
            await updateTaskStatus(taskId, newStatus);
            await refreshTasks();
        } catch (err) {
            console.error("Failed to update task status", err);
        } finally {
            setStatusDropdownOpen(null);
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (!window.confirm('Delete this task?')) return;
        // optimistic removal
        refreshTasks();
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

    const filteredTasks = allTasks.filter((task) => {
        const statusMatch = filterStatus === "all" || task.status?.toLowerCase() === filterStatus.toLowerCase();
        const assigneeMatch = filterAssignee === "all" || task.assignedTo?.id === filterAssignee;
        return statusMatch && assigneeMatch;
    });

    // Build unique list of assignees from tasks
    const assignees = allTasks.reduce((acc, task) => {
        const user = task.assignedTo;
        if (user && user.id && !acc.find((a) => a.id === user.id)) {
            acc.push(user);
        }
        return acc;
    }, []);

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
        <div className="min-h-screen bg-gray-50">
            <div className="p-6">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <UsersIcon className="w-6 h-6" />
                                Team Tasks
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">
                                Collaborate on tasks in {currentWorkspace?.name || "this workspace"}
                            </p>
                        </div>
                        {canAddTask ? (
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Add Task
                            </button>
                        ) : (
                            <div
                                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-dashed border-gray-300 text-gray-400"
                                title="Only Admins and Managers can create assigned tasks"
                            >
                                <Lock className="w-4 h-4" />
                                <span>Add Task</span>
                                <span className="text-xs px-2 py-0.5 rounded-full font-medium ml-1"
                                    style={{ background: roleConfig?.color, color: roleConfig?.textColor }}>
                                    {roleConfig?.emoji} {roleConfig?.label}
                                </span>
                            </div>
                        )}
                    </div>


                    <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center gap-2">

                            <div className="flex items-center gap-1 bg-gray-100 rounded p-0.5">
                                <button
                                    onClick={() => setViewMode("list")}
                                    className={`p-1.5 rounded transition-colors ${viewMode === "list" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
                                        }`}
                                >
                                    <List className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode("grid")}
                                    className={`p-1.5 rounded transition-colors ${viewMode === "grid" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
                                        }`}
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
                                <option value="todo">To Do</option>
                                <option value="inprogress">In Progress</option>
                                <option value="completed">Completed</option>
                            </select>


                            {assignees.length > 0 && (
                                <select
                                    value={filterAssignee}
                                    onChange={(e) => setFilterAssignee(e.target.value)}
                                    className="px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-200 rounded hover:bg-gray-50 focus:outline-none focus:border-gray-300 transition-colors"
                                >
                                    <option value="all">All Members</option>
                                    {assignees.map((assignee) => (
                                        <option key={assignee.id} value={assignee.id}>
                                            {assignee.name || assignee.email}
                                        </option>
                                    ))}
                                </select>
                            )}
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


                {taskLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-gray-900"></div>
                    </div>
                ) : filteredTasks.length === 0 ? (
                    <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
                        <p className="text-gray-500 mb-4">
                            {allTasks.length === 0
                                ? "No tasks yet in this workspace"
                                : "No tasks match the current filters"}
                        </p>
                        {allTasks.length > 0 && (
                            <button
                                onClick={() => { setFilterStatus("all"); setFilterAssignee("all"); }}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors inline-flex items-center gap-2"
                            >
                                Clear Filters
                            </button>
                        )}
                        {canAddTask && allTasks.length === 0 && (
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="mt-3 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors inline-flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" /> Create first task
                            </button>
                        )}
                    </div>
                ) : viewMode === "list" ? (

                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">

                        <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase">
                            <div className="col-span-5">Task Name</div>
                            <div className="col-span-2">Assignee</div>
                            <div className="col-span-2">Status</div>
                            <div className="col-span-1">Priority</div>
                            <div className="col-span-1">Due Date</div>
                            <div className="col-span-1"></div>
                        </div>


                        <div>
                            {filteredTasks.map((task, index) => (
                                <motion.div
                                    key={task.id || index}
                                    className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors group"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >

                                    <div className="col-span-5 flex items-center gap-3">
                                        <button className="text-gray-300 hover:text-gray-900 transition-colors">
                                            <Circle className="w-4 h-4" />
                                        </button>
                                        <span className="text-sm text-gray-900 font-medium line-clamp-1">
                                            {task.title || task.name || "Untitled Task"}
                                        </span>
                                    </div>


                                        <div className="col-span-2 flex items-center">
                                            {(() => {
                                                const user = task.assignedTo;
                                                if (!user || !user.id) return <span className="text-sm text-gray-400">—</span>;
                                                return (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-gray-900 flex items-center justify-center text-white text-xs font-medium">
                                                            {user.email?.[0]?.toUpperCase() || user.name?.[0]?.toUpperCase() || "?"}
                                                        </div>
                                                        <span className="text-sm text-gray-700 truncate">
                                                            {user.name || user.email}
                                                        </span>
                                                    </div>
                                                );
                                            })()}
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


                                    <div className="col-span-1 flex items-center">
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
                                        {canAddTask && (
                                            <button
                                                onClick={() => handleDeleteTask(task.id)}
                                                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-all"
                                                title="Delete task"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Add task row (admin/host only) */}
                        {canAddTask && (
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="w-full px-4 py-3 text-left text-sm text-gray-500 hover:bg-gray-50 transition-colors flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Add task
                            </button>
                        )}
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
                                    <button className="p-1 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded opacity-0 group-hover:opacity-100 transition-all">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </button>
                                </div>


                                <div className="mb-3">
                                    {(() => {
                                        const user = task.assignedTo;
                                        if (!user || !user.id) return <span className="text-xs text-gray-400">No assignee</span>;
                                        return (
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-full bg-gray-900 flex items-center justify-center text-white text-xs font-medium">
                                                    {user.email?.[0]?.toUpperCase() || user.name?.[0]?.toUpperCase() || "?"}
                                                </div>
                                                <span className="text-xs text-gray-700 truncate">
                                                    {user.name || user.email}
                                                </span>
                                            </div>
                                        );
                                    })()}
                                </div>


                                <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-100 relative">

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

                        {/* Add task card (admin/host only) */}
                        {canAddTask && (
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="bg-white border border-gray-200 border-dashed rounded-lg p-4 hover:border-gray-400 hover:bg-gray-50 transition-all flex flex-col items-center justify-center min-h-[180px] text-gray-500 hover:text-gray-700"
                            >
                                <Plus className="w-6 h-6 mb-2" />
                                <span className="text-sm font-medium">Add task</span>
                            </button>
                        )}
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

export default TeamHome;
