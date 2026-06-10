import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Users, Calendar, Flag, Search, Lock, AlertCircle, Plus } from "lucide-react";
import { useWorkspace } from "../../context/WorkspaceContext";
import { getWorkspaceMembers } from "../../api/workspaceApi";
import { useAuth } from "../../context/AuthContext";
import usePermission from "../../hooks/usePermission";
import { useRole, ROLE_CONFIG } from "../../context/RoleContext";

const MAX_DESC = 500;

const PRIORITY_OPTIONS = [
    { value: "High", label: "High", emoji: "🔴", bg: "bg-transparent text-red-400 border-red-900/80 hover:bg-red-950/30", activeBg: "bg-red-500 text-white border-red-500" },
    { value: "Medium", label: "Medium", emoji: "🟡", bg: "bg-transparent text-yellow-400 border-yellow-900/80 hover:bg-yellow-950/30", activeBg: "bg-[#FFC107] text-black border-[#FFC107] font-bold" },
    { value: "Low", label: "Low", emoji: "🟢", bg: "bg-transparent text-green-400 border-green-900/80 hover:bg-green-950/30", activeBg: "bg-green-600 text-white border-green-600" },
];

const STATUS_OPTIONS = [
    { value: "Todo", label: "To Do", bg: "bg-transparent text-slate-300 border-slate-700/80 hover:bg-slate-800/50", activeBg: "bg-slate-600 text-white border-slate-500" },
    { value: "InProgress", label: "In Progress", bg: "bg-transparent text-blue-400 border-blue-900/80 hover:bg-blue-950/30", activeBg: "bg-blue-600 text-white border-blue-500" },
    { value: "Completed", label: "Completed", bg: "bg-transparent text-[#CCFF00] border-[#CCFF00]/30 hover:bg-[#CCFF00]/10", activeBg: "bg-[#CCFF00] text-black border-[#CCFF00] font-bold" },
];

const EMPTY_FORM = {
    title: "",
    description: "",
    priority: "Medium",
    status: "Todo",
    dueDate: "",
    assignedTo: "",
};

const CreateTaskModal = ({ isOpen, onClose, onSubmit, loading = false }) => {
    const { currentWorkspace } = useWorkspace();
    const { user } = useAuth();
    const canAssign = usePermission("assignTask");   // admins and managers
    const { roleConfig } = useRole();

    const [formData, setFormData] = useState(EMPTY_FORM);
    const [assigneeSearch, setAssigneeSearch] = useState("");
    const [showDescription, setShowDescription] = useState(false);
    const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
    const [teamMembers, setTeamMembers] = useState([]);
    const [loadingMembers, setLoadingMembers] = useState(false);
    const [titleError, setTitleError] = useState(false);

    const titleRef = useRef(null);

    useEffect(() => {
        if (isOpen && currentWorkspace) fetchTeamMembers();
        if (isOpen) setTimeout(() => titleRef.current?.focus(), 80);
    }, [isOpen, currentWorkspace]);

    // Reset on close
    useEffect(() => {
        if (!isOpen) {
            setFormData(EMPTY_FORM);
            setAssigneeSearch("");
            setShowDescription(false);
            setTitleError(false);
        }
    }, [isOpen]);

    const fetchTeamMembers = async () => {
        try {
            setLoadingMembers(true);
            const res = await getWorkspaceMembers(currentWorkspace.id);
            const members = res.data.data || [];
            const formatted = members.map(m => ({
                id: m.id || m._id,
                name: m.name || m.email,
                email: m.email,
                role: m.role,
                isCurrentUser: m.email === user?.email,
            }));
            formatted.sort((a, b) => b.isCurrentUser - a.isCurrentUser);
            setTeamMembers(formatted);
        } catch {
            setTeamMembers([]);
        } finally {
            setLoadingMembers(false);
        }
    };

    const filteredMembers = teamMembers.filter(m =>
        m.name.toLowerCase().includes(assigneeSearch.toLowerCase()) ||
        m.email.toLowerCase().includes(assigneeSearch.toLowerCase())
    );
    const selectedMember = teamMembers.find(m => m.id === formData.assignedTo);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "description" && value.length > MAX_DESC) return;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePriority = (value) =>
        setFormData(prev => ({ ...prev, priority: value }));

    const handleSelectAssignee = (member) => {
        setFormData(prev => ({ ...prev, assignedTo: member.id }));
        setAssigneeSearch("");
        setShowAssigneeDropdown(false);
    };
    const handleClearAssignee = () =>
        setFormData(prev => ({ ...prev, assignedTo: "" }));

    const handleSubmit = (e) => {
        if (e) e.preventDefault();
        if (!formData.title.trim()) { setTitleError(true); titleRef.current?.focus(); return; }
        onSubmit({
            ...formData,
            assignedTo: formData.assignedTo || null,
            estimatedTime: formData.estimatedTime ? Number(formData.estimatedTime) : null,
        });
    };

    // Ctrl+Enter global shortcut
    useEffect(() => {
        const handler = (e) => {
            if (isOpen && e.ctrlKey && e.key === "Enter") handleSubmit();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [isOpen, formData]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                    />

                    {/* Modal container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 12 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 12 }}
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        onClick={onClose}
                    >
                        <div
                            onClick={e => e.stopPropagation()}
                            className="bg-[#18191c] border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col"
                        >
                            {/* Header */}
                            <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-[#CCFF00]/15 flex items-center justify-center">
                                        <Flag className="w-4 h-4 text-[#CCFF00]" />
                                    </div>
                                    <h2 className="text-base font-semibold text-white">Create Task</h2>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-gray-500 hidden sm:block">Ctrl+Enter to submit</span>
                                    <button
                                        onClick={onClose}
                                        className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Scrollable body */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-5">
                                <form onSubmit={handleSubmit} className="space-y-5">

                                    {/* ── Title ── */}
                                    <div>
                                        <input
                                            ref={titleRef}
                                            type="text"
                                            name="title"
                                            value={formData.title}
                                            onChange={e => { handleChange(e); setTitleError(false); }}
                                            required
                                            placeholder="Task name…"
                                            autoComplete="off"
                                            className={`w-full text-xl font-semibold text-white placeholder-gray-600 focus:outline-none bg-transparent appearance-none border-b pb-2 transition-colors ${titleError ? "border-red-500" : "border-transparent hover:border-white/20 focus:border-[#CCFF00]/60"}`}
                                        />
                                        <AnimatePresence>
                                            {titleError && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -4 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0 }}
                                                    className="flex items-center gap-1.5 mt-1.5 text-red-400 text-xs"
                                                >
                                                    <AlertCircle className="w-3.5 h-3.5" />
                                                    Task name is required
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* ── Description ── */}
                                    {!showDescription ? (
                                        <button
                                            type="button"
                                            onClick={() => setShowDescription(true)}
                                            className="flex items-center gap-2 text-gray-500 hover:text-gray-300 transition-colors text-sm group"
                                        >
                                            <span className="p-1 rounded-md bg-white/5 group-hover:bg-white/10 transition-colors">📄</span>
                                            Add description
                                        </button>
                                    ) : (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            className="relative"
                                        >
                                            <textarea
                                                name="description"
                                                value={formData.description}
                                                onChange={handleChange}
                                                rows={3}
                                                placeholder="Add a description…"
                                                className="w-full px-3 py-2.5 text-sm text-gray-300 placeholder-gray-600 focus:outline-none bg-white/5 rounded-lg border border-white/10 focus:border-[#CCFF00]/40 resize-none transition-colors"
                                            />
                                            <span className={`absolute bottom-2 right-3 text-[11px] font-mono ${formData.description.length >= MAX_DESC ? "text-red-400" : "text-gray-600"}`}>
                                                {formData.description.length}/{MAX_DESC}
                                            </span>
                                        </motion.div>
                                    )}

                                    {/* ── Divider label ── */}
                                    <p className="text-[11px] uppercase tracking-widest text-gray-600 font-semibold">Details</p>

                                    <div className="space-y-4">

                                        {/* ── Status chips ── */}
                                        <div className="flex flex-col xs:flex-row items-start xs:items-center gap-2 xs:gap-4">
                                            <label className="w-full xs:w-28 sm:w-32 text-sm font-medium shrink-0" style={{ color: 'var(--text-muted)' }}>Status</label>
                                            <div className="flex gap-2 flex-wrap">
                                                {STATUS_OPTIONS.map(opt => {
                                                    const active = formData.status === opt.value;
                                                    return (
                                                        <button
                                                            key={opt.value}
                                                            type="button"
                                                            onClick={() => setFormData(prev => ({ ...prev, status: opt.value }))}
                                                            className={`px-4 py-1.5 rounded-lg border text-xs font-semibold transition-all duration-150 ${active ? opt.activeBg + " shadow-md scale-105" : opt.bg + " hover:scale-105"}`}
                                                        >
                                                            {opt.label}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* ── Priority chips ── */}
                                        <div className="flex flex-col xs:flex-row items-start xs:items-center gap-2 xs:gap-4">
                                            <label className="w-full xs:w-28 sm:w-32 text-sm font-medium shrink-0 flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                                                <Flag className="w-3.5 h-3.5" /> Priority
                                            </label>
                                            <div className="flex gap-2 flex-wrap">
                                                {PRIORITY_OPTIONS.map(opt => {
                                                    const active = formData.priority === opt.value;
                                                    return (
                                                        <button
                                                            key={opt.value}
                                                            type="button"
                                                            onClick={() => handlePriority(opt.value)}
                                                            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg border text-xs font-semibold transition-all duration-150 ${active ? opt.activeBg + " shadow-md scale-105" : opt.bg + " hover:scale-105"}`}
                                                        >
                                                            <span>{opt.emoji}</span>
                                                            {opt.label}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* ── Due Date ── */}
                                        <div className="flex flex-col xs:flex-row items-start xs:items-center gap-2 xs:gap-4">
                                            <label className="w-full xs:w-28 sm:w-32 text-sm font-medium shrink-0 flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                                                <Calendar className="w-3.5 h-3.5" /> Due date
                                            </label>
                                            <input
                                                type="date"
                                                name="dueDate"
                                                value={formData.dueDate}
                                                onChange={handleChange}
                                                className="flex-1 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-[#CCFF00]/40 transition-colors cursor-pointer"
                                                style={{ colorScheme: "dark" }}
                                            />
                                        </div>

                                        {/* ── Assignee ── */}
                                        {canAssign ? (
                                            <div className="flex flex-col xs:flex-row items-start gap-2 xs:gap-4">
                                                <label className="w-full xs:w-28 sm:w-32 text-sm font-medium shrink-0 flex items-center gap-1.5 xs:pt-2" style={{ color: 'var(--text-muted)' }}>
                                                    <Users className="w-3.5 h-3.5" /> Assignee
                                                </label>
                                                <div className="flex-1 relative w-full">
                                                    {selectedMember ? (
                                                        <div className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg">
                                                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold ${selectedMember.isCurrentUser ? "bg-[#CCFF00] text-black" : "bg-indigo-500"}`}>
                                                                {selectedMember.isCurrentUser ? "ME" : selectedMember.name.substring(0, 2).toUpperCase()}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium text-gray-200 truncate">{selectedMember.name}</p>
                                                                <p className="text-xs text-gray-500 truncate">{selectedMember.email} · {selectedMember.role}</p>
                                                            </div>
                                                            <button type="button" onClick={handleClearAssignee} className="text-gray-500 hover:text-red-400 transition-colors">
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="relative">
                                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                                            <input
                                                                type="text"
                                                                value={assigneeSearch}
                                                                onChange={e => { setAssigneeSearch(e.target.value); setShowAssigneeDropdown(true); }}
                                                                onFocus={() => setShowAssigneeDropdown(true)}
                                                                onBlur={() => setTimeout(() => setShowAssigneeDropdown(false), 200)}
                                                                placeholder={loadingMembers ? "Loading members…" : "Search workspace members…"}
                                                                disabled={loadingMembers}
                                                                className="w-full pl-9 pr-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-[#CCFF00]/40 transition-colors disabled:opacity-50"
                                                            />
                                                            <AnimatePresence>
                                                                {showAssigneeDropdown && (
                                                                    <motion.div
                                                                        initial={{ opacity: 0, y: -6 }}
                                                                        animate={{ opacity: 1, y: 0 }}
                                                                        exit={{ opacity: 0, y: -6 }}
                                                                        className="absolute top-full left-0 right-0 mt-1 bg-[#1e1f23] border border-white/10 rounded-xl shadow-2xl z-20 max-h-52 overflow-y-auto"
                                                                    >
                                                                        {filteredMembers.length > 0 ? filteredMembers.map(member => (
                                                                            <button
                                                                                key={member.id}
                                                                                type="button"
                                                                                onMouseDown={() => handleSelectAssignee(member)}
                                                                                className="w-full px-3 py-2.5 text-left hover:bg-white/5 transition-colors flex items-center gap-3"
                                                                            >
                                                                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${member.isCurrentUser ? "bg-[#CCFF00] text-black" : "bg-indigo-500 text-white"}`}>
                                                                                    {member.isCurrentUser ? "ME" : member.name.substring(0, 2).toUpperCase()}
                                                                                </div>
                                                                                <div className="flex-1 min-w-0">
                                                                                    <p className="text-sm font-medium text-gray-200 truncate">{member.name}</p>
                                                                                    <p className="text-xs text-gray-500 truncate">{member.email} · <span className="capitalize">{member.role}</span></p>
                                                                                </div>
                                                                            </button>
                                                                        )) : (
                                                                            <div className="px-3 py-4 text-center text-sm text-gray-500">
                                                                                {assigneeSearch ? `No members match "${assigneeSearch}"` : "No members in this workspace"}
                                                                            </div>
                                                                        )}
                                                                    </motion.div>
                                                                )}
                                                            </AnimatePresence>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-4">
                                                <label className="w-32 text-sm font-medium text-gray-500 shrink-0 flex items-center gap-1.5">
                                                    <Lock className="w-3.5 h-3.5" /> Assignee
                                                </label>
                                                <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                                                    <span className="text-xs text-gray-500">Only <strong className="text-gray-400">Admins</strong> and <strong className="text-gray-400">Managers</strong> can assign tasks</span>
                                                    {roleConfig && (
                                                        <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: roleConfig.color, color: roleConfig.textColor }}>
                                                            {roleConfig.emoji} {roleConfig.label}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </form>
                            </div>

                            {/* Footer */}
                            <div className="border-t border-white/10 px-6 py-4 flex items-center justify-end bg-white/[0.02] shrink-0">
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="px-5 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/10 rounded-lg font-medium transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        className="px-6 py-2 bg-[#CCFF00] text-black rounded-lg font-semibold text-sm hover:bg-[#b8e600] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-[#CCFF00]/20"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                                Creating…
                                            </>
                                        ) : (
                                            <>
                                                <Plus className="w-4 h-4" />
                                                Create Task
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default CreateTaskModal;
