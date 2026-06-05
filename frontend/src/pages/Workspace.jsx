import { useState, useEffect } from "react";
import { Link2, Copy, Users, X, Check, Settings as SettingsIcon, Mail, UserPlus, Crown, Shield, User, Loader2, AlertCircle, CheckCircle2, ChevronDown } from "lucide-react";
import { useWorkspace } from "../context/WorkspaceContext";
import { getWorkspaceMembers, inviteMember, removeMember } from "../api/workspaceApi";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import usePermission from "../hooks/usePermission";

/* ── Role badge helper ─────────────────────────────────────── */
const ROLE_STYLES = {
    owner: { label: "Owner", icon: Crown, bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200" },
    admin: { label: "Admin", icon: Shield, bg: "bg-indigo-100", text: "text-indigo-700", border: "border-indigo-200" },
    manager: { label: "Manager", icon: Shield, bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200" },
    member: { label: "Member", icon: User, bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-200" },
};

function RoleBadge({ role }) {
    const cfg = ROLE_STYLES[role] || ROLE_STYLES.member;
    const Icon = cfg.icon;
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
            <Icon className="w-3 h-3" />
            {cfg.label}
        </span>
    );
}

/* ── Toast component ─────────────────────────────────────────── */
function Toast({ type, message, onClose }) {
    useEffect(() => {
        const t = setTimeout(onClose, 4000);
        return () => clearTimeout(t);
    }, [onClose]);

    const isSuccess = type === "success";
    return (
        <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.95 }}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border ${isSuccess
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-red-50 border-red-200 text-red-800"
                } max-w-md`}
        >
            {isSuccess
                ? <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                : <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            }
            <p className="text-sm font-medium flex-1">{message}</p>
            <button onClick={onClose} className="ml-2 text-current opacity-50 hover:opacity-100">
                <X className="w-4 h-4" />
            </button>
        </motion.div>
    );
}

/* ── Main component ─────────────────────────────────────────── */
const WorkspaceSettings = () => {
    const { currentWorkspace } = useWorkspace();
    const canManage = usePermission("removeUser");   // only ADMIN
    const [members, setMembers] = useState([]);
    const [loadingMembers, setLoadingMembers] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState("members");
    const navigate = useNavigate();

    // Invite form state
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState("member");
    const [inviteLoading, setInviteLoading] = useState(false);
    const [removingId, setRemovingId] = useState(null);

    // Notifications
    const [toast, setToast] = useState(null);
    const showToast = (type, message) => setToast({ type, message });

    useEffect(() => {
        if (currentWorkspace) fetchMembers();
    }, [currentWorkspace]);

    const fetchMembers = async () => {
        try {
            setLoadingMembers(true);
            const res = await getWorkspaceMembers(currentWorkspace.id);
            setMembers(res.data.data || []);
        } catch {
            showToast("error", "Failed to load members");
        } finally {
            setLoadingMembers(false);
        }
    };

    const handleInvite = async (e) => {
        e.preventDefault();
        if (!inviteEmail.trim()) return;
        try {
            setInviteLoading(true);
            const res = await inviteMember(currentWorkspace.id, inviteEmail.trim(), inviteRole);
            showToast("success", res.data.message || "Invitation sent successfully!");
            setInviteEmail("");
            setInviteRole("member");
            // Re-fetch members list to stay in sync
            await fetchMembers();
        } catch (err) {
            showToast("error", err.response?.data?.message || "Failed to invite member");
        } finally {
            setInviteLoading(false);
        }
    };

    const handleRemoveMember = async (memberId, memberName) => {
        if (!window.confirm(`Remove ${memberName} from this workspace?`)) return;
        setRemovingId(memberId);
        try {
            await removeMember(currentWorkspace.id, memberId);
            setMembers(prev => prev.filter(m => m.id !== memberId));
            showToast("success", `${memberName} has been removed`);
        } catch (err) {
            showToast("error", err.response?.data?.message || "Failed to remove member");
        } finally {
            setRemovingId(null);
        }
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.origin + "/login");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDeleteWorkspace = async () => {
        if (!showDeleteConfirm) { setShowDeleteConfirm(true); return; }
        alert("Workspace deleted! (coming soon)");
        navigate("/dashboard");
    };

    if (!currentWorkspace) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center bg-white border border-gray-200 rounded-lg p-12 shadow-sm">
                    <SettingsIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Select a workspace first.</p>
                </div>
            </div>
        );
    }

    const tabs = [
        { id: "members", label: "Members", icon: Users },
        { id: "invite", label: "Invite", icon: UserPlus },
        { id: "general", label: "Settings", icon: SettingsIcon },
    ];

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Toast */}
            <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
                <AnimatePresence>
                    {toast && (
                        <Toast
                            key={toast.message}
                            type={toast.type}
                            message={toast.message}
                            onClose={() => setToast(null)}
                        />
                    )}
                </AnimatePresence>
            </div>

            <div className="max-w-4xl mx-auto p-6">

                <motion.div className="mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">{currentWorkspace.name}</h1>
                    <p className="text-gray-500 text-sm">Workspace settings & team management</p>
                </motion.div>

                {/* Tabs */}
                <div className="border-b border-gray-200 mb-8">
                    <div className="flex gap-6">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`pb-4 px-1 border-b-2 font-medium transition-colors flex items-center gap-2 text-sm ${activeTab === tab.id
                                    ? "border-gray-900 text-gray-900"
                                    : "border-transparent text-gray-500 hover:text-gray-900"
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {/* ─── MEMBERS TAB ─── */}
                    {activeTab === "members" && (
                        <motion.div
                            key="members"
                            initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}
                        >
                            <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
                                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
                                        <p className="text-sm text-gray-500 mt-0.5">{members.length} {members.length === 1 ? "member" : "members"}</p>
                                    </div>
                                    {canManage && (
                                        <button
                                            onClick={() => setActiveTab("invite")}
                                            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                                        >
                                            <UserPlus className="w-4 h-4" />
                                            Invite
                                        </button>
                                    )}
                                </div>

                                {loadingMembers ? (
                                    <div className="flex items-center justify-center py-16">
                                        <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                                    </div>
                                ) : members.length === 0 ? (
                                    <div className="text-center py-16 px-6">
                                        <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500 font-medium">No members yet</p>
                                        <p className="text-sm text-gray-400 mt-1">Invite team members to collaborate</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-50">
                                        {members.map((member, i) => {
                                            const initial = (member.name || member.email || "?")[0].toUpperCase();
                                            const isOwner = member.role === "owner";
                                            return (
                                                <motion.div
                                                    key={member.id || i}
                                                    className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors group"
                                                    initial={{ opacity: 0, y: 8 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: i * 0.04 }}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white font-semibold text-sm">
                                                            {initial}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900">{member.name || member.email}</p>
                                                            <p className="text-xs text-gray-500">{member.email}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <RoleBadge role={member.role} />
                                                        {canManage && !isOwner && (
                                                            <button
                                                                onClick={() => handleRemoveMember(member.id, member.name || member.email)}
                                                                disabled={removingId === member.id}
                                                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50"
                                                                title="Remove member"
                                                            >
                                                                {removingId === member.id
                                                                    ? <Loader2 className="w-4 h-4 animate-spin" />
                                                                    : <X className="w-4 h-4" />
                                                                }
                                                            </button>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* ─── INVITE TAB ─── */}
                    {activeTab === "invite" && (
                        <motion.div
                            key="invite"
                            initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}
                            className="space-y-6"
                        >
                            {/* Invite by email form */}
                            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                        <Mail className="w-5 h-5 text-gray-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900">Invite by Email</h2>
                                        <p className="text-sm text-gray-500">Add a registered MeetTask user to this workspace</p>
                                    </div>
                                </div>

                                <form onSubmit={handleInvite} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                                        <input
                                            type="email"
                                            required
                                            value={inviteEmail}
                                            onChange={e => setInviteEmail(e.target.value)}
                                            placeholder="colleague@company.com"
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
                                        <div className="relative">
                                            <select
                                                value={inviteRole}
                                                onChange={e => setInviteRole(e.target.value)}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all appearance-none pr-10 cursor-pointer"
                                            >
                                                <option value="member">Member — can view and accept tasks</option>
                                                <option value="manager">Manager — can create & assign tasks</option>
                                                <option value="admin">Admin — full workspace access</option>
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1.5">
                                            {inviteRole === "member" && "Members can view tasks and update status of their own tasks."}
                                            {inviteRole === "manager" && "Managers can create, assign, and manage tasks in this workspace."}
                                            {inviteRole === "admin" && "Admins have full control including inviting and removing members."}
                                        </p>
                                    </div>

                                    <div className="pt-1">
                                        <button
                                            type="submit"
                                            disabled={inviteLoading || !inviteEmail.trim()}
                                            className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {inviteLoading ? (
                                                <><Loader2 className="w-4 h-4 animate-spin" />Inviting...</>
                                            ) : (
                                                <><UserPlus className="w-4 h-4" />Send Invite</>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Share invite link */}
                            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                        <Link2 className="w-5 h-5 text-gray-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Share Login Link</h3>
                                        <p className="text-sm text-gray-500">Copy the app link to share with your team</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                    <input
                                        type="text"
                                        readOnly
                                        value={window.location.origin + "/login"}
                                        onClick={e => e.target.select()}
                                        className="flex-1 bg-transparent text-gray-700 font-mono text-sm focus:outline-none min-w-0 truncate"
                                    />
                                    <button
                                        onClick={handleCopyLink}
                                        className="flex items-center gap-2 px-4 py-1.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors whitespace-nowrap flex-shrink-0"
                                    >
                                        {copied
                                            ? <><Check className="w-4 h-4" />Copied!</>
                                            : <><Copy className="w-4 h-4" />Copy</>
                                        }
                                    </button>
                                </div>
                                <p className="text-xs text-gray-400 mt-2">
                                    The person must register with the same email you invite them with.
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {/* ─── GENERAL / SETTINGS TAB ─── */}
                    {activeTab === "general" && (
                        <motion.div
                            key="general"
                            initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}
                            className="space-y-6"
                        >
                            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-6">Workspace Information</h2>
                                <form onSubmit={e => { e.preventDefault(); showToast("success", "Saved!"); }} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Workspace Name</label>
                                        <input
                                            type="text"
                                            defaultValue={currentWorkspace.name}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Workspace ID</label>
                                        <input
                                            type="text"
                                            value={currentWorkspace.id}
                                            readOnly
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 font-mono text-sm cursor-not-allowed"
                                        />
                                    </div>
                                    <div className="flex justify-end pt-2">
                                        <button type="submit" className="px-6 py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors">
                                            Save Changes
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {canManage && (
                                <div className="bg-white border border-red-200 rounded-xl shadow-sm p-6">
                                    <h2 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h2>
                                    <div className="bg-red-50 border border-red-100 rounded-lg p-4 flex items-start justify-between gap-4">
                                        <div>
                                            <p className="font-medium text-gray-900">Delete Workspace</p>
                                            <p className="text-sm text-gray-600 mt-0.5">Permanently removes all tasks and data. Cannot be undone.</p>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            {showDeleteConfirm && (
                                                <button onClick={() => setShowDeleteConfirm(false)} className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                                    Cancel
                                                </button>
                                            )}
                                            <button
                                                onClick={handleDeleteWorkspace}
                                                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${showDeleteConfirm
                                                    ? "bg-red-600 text-white hover:bg-red-700"
                                                    : "bg-white text-red-600 border border-red-300 hover:bg-red-50"
                                                    }`}
                                            >
                                                {showDeleteConfirm ? "Confirm Delete" : "Delete Workspace"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default WorkspaceSettings;
