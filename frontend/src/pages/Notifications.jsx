import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, CheckCheck, Clock, Users, ClipboardList, Check, X, Inbox } from "lucide-react";
import { useNotifications } from "../context/NotificationContext";
import { useWorkspace } from "../context/WorkspaceContext";
import { markAsRead, acceptInvite, declineInvite } from "../api/notificationApi";

const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
};

const NotificationItem = ({ notif, onRead, onAccept, onDecline }) => {
    const [actioning, setActioning] = useState(false);

    const handleAccept = async () => {
        setActioning(true);
        await onAccept(notif.id);
        setActioning(false);
    };

    const handleDecline = async () => {
        setActioning(true);
        await onDecline(notif.id);
        setActioning(false);
    };

    const isTaskNotif = notif.type === "task_assigned";
    const isInvite = notif.type === "workspace_invite";
    const isPending = notif.inviteStatus === "pending";
    const isAccepted = notif.inviteStatus === "accepted";
    const isDeclined = notif.inviteStatus === "declined";

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            onClick={() => !notif.read && onRead(notif.id)}
            className="relative flex gap-4 p-4 rounded-xl border transition-all cursor-pointer group"
            style={{
                background: notif.read ? "var(--bg-primary)" : "var(--bg-secondary)",
                borderColor: notif.read ? "var(--border-primary)" : "var(--accent-primary)",
                borderLeftWidth: notif.read ? "1px" : "3px",
            }}
        >
            {/* Icon */}
            <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{
                    background: isTaskNotif
                        ? "rgba(99,102,241,0.15)"
                        : isAccepted
                            ? "rgba(34,197,94,0.15)"
                            : isDeclined
                                ? "rgba(239,68,68,0.1)"
                                : "rgba(245,158,11,0.15)",
                }}
            >
                {isTaskNotif ? (
                    <ClipboardList className="w-5 h-5 text-indigo-500" />
                ) : isAccepted ? (
                    <Check className="w-5 h-5 text-green-500" />
                ) : isDeclined ? (
                    <X className="w-5 h-5 text-red-400" />
                ) : (
                    <Users className="w-5 h-5 text-amber-500" />
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <p className="text-sm leading-snug" style={{ color: "var(--text-primary)" }}>
                    {notif.message}
                </p>

                {/* Task chip */}
                {isTaskNotif && notif.task && (
                    <div
                        className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium"
                        style={{ background: "rgba(99,102,241,0.1)", color: "#818cf8" }}
                    >
                        <ClipboardList className="w-3 h-3" />
                        {notif.task.title}
                    </div>
                )}

                {/* Workspace invite actions */}
                {isInvite && isPending && !actioning && (
                    <div className="mt-3 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={handleAccept}
                            className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90 active:scale-95 flex items-center gap-1.5"
                            style={{ background: "var(--accent-primary)", color: "var(--text-inverse)" }}
                        >
                            <Check className="w-3.5 h-3.5" /> Accept
                        </button>
                        <button
                            onClick={handleDecline}
                            className="px-4 py-1.5 rounded-lg text-xs font-semibold border transition-all hover:opacity-80 active:scale-95"
                            style={{ borderColor: "var(--border-primary)", color: "var(--text-secondary)", background: "transparent" }}
                        >
                            Decline
                        </button>
                        {notif.inviteRole && (
                            <span className="text-xs ml-1" style={{ color: "var(--text-muted)" }}>
                                Role: <strong>{notif.inviteRole}</strong>
                            </span>
                        )}
                    </div>
                )}

                {/* Actioning spinner */}
                {isInvite && actioning && (
                    <div className="mt-3 flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "var(--accent-primary)", borderTopColor: "transparent" }} />
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>Processing...</span>
                    </div>
                )}

                {/* Settled invite status */}
                {isInvite && (isAccepted || isDeclined) && !actioning && (
                    <div
                        className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium"
                        style={{
                            background: isAccepted ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.08)",
                            color: isAccepted ? "#22c55e" : "#ef4444",
                        }}
                    >
                        {isAccepted ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        {isAccepted ? "Invitation accepted" : "Invitation declined"}
                    </div>
                )}

                <div className="mt-2 flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
                    <Clock className="w-3 h-3" />
                    <span className="text-xs">{timeAgo(notif.created_at)}</span>
                    {!notif.read && (
                        <span
                            className="ml-2 w-1.5 h-1.5 rounded-full inline-block"
                            style={{ background: "var(--accent-primary)" }}
                        />
                    )}
                </div>
            </div>
        </motion.div>
    );
};

const Notifications = () => {
    const { notifications, loading, unreadCount, fetchNotifications, markAllRead, setNotifications, setUnreadCount } = useNotifications();
    const { fetchWorkspaces } = useWorkspace();
    const [filter, setFilter] = useState("all");

    const filtered = notifications.filter((n) => {
        if (filter === "unread") return !n.read;
        if (filter === "tasks") return n.type === "task_assigned";
        if (filter === "invites") return n.type === "workspace_invite";
        return true;
    });

    const handleRead = async (id) => {
        await markAsRead(id);
        setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
        setUnreadCount((c) => Math.max(0, c - 1));
    };

    const handleAccept = async (id) => {
        try {
            await acceptInvite(id);
            setNotifications((prev) =>
                prev.map((n) => n.id === id ? { ...n, inviteStatus: "accepted", read: true } : n)
            );
            setUnreadCount((c) => Math.max(0, c - 1));
            // Refresh workspaces so new workspace appears in sidebar
            if (fetchWorkspaces) fetchWorkspaces();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to accept invitation");
        }
    };

    const handleDecline = async (id) => {
        try {
            await declineInvite(id);
            setNotifications((prev) =>
                prev.map((n) => n.id === id ? { ...n, inviteStatus: "declined", read: true } : n)
            );
            setUnreadCount((c) => Math.max(0, c - 1));
        } catch (err) {
            alert(err.response?.data?.message || "Failed to decline invitation");
        }
    };

    const filters = [
        { key: "all", label: "All" },
        { key: "unread", label: `Unread ${unreadCount > 0 ? `(${unreadCount})` : ""}` },
        { key: "tasks", label: "Tasks" },
        { key: "invites", label: "Invitations" },
    ];

    return (
        <div className="min-h-screen p-6" style={{ background: "var(--bg-secondary)" }}>
            <div className="max-w-2xl mx-auto">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: "var(--accent-primary)" }}
                        >
                            <Bell className="w-5 h-5" style={{ color: "var(--text-inverse)" }} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                                Notifications
                            </h1>
                            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                                {unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={fetchNotifications}
                            className="p-2 rounded-lg text-xs transition-colors"
                            style={{ background: "var(--bg-primary)", border: "1px solid var(--border-primary)", color: "var(--text-secondary)" }}
                            title="Refresh"
                        >
                            ↻
                        </button>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllRead}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors"
                                style={{ background: "var(--bg-primary)", border: "1px solid var(--border-primary)", color: "var(--text-secondary)" }}
                            >
                                <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                            </button>
                        )}
                    </div>
                </div>

                {/* Filter tabs */}
                <div
                    className="flex gap-1 p-1 rounded-xl mb-5"
                    style={{ background: "var(--bg-primary)", border: "1px solid var(--border-primary)" }}
                >
                    {filters.map((f) => (
                        <button
                            key={f.key}
                            onClick={() => setFilter(f.key)}
                            className="flex-1 py-1.5 rounded-lg text-xs font-medium transition-all"
                            style={{
                                background: filter === f.key ? "var(--accent-primary)" : "transparent",
                                color: filter === f.key ? "var(--text-inverse)" : "var(--text-secondary)",
                            }}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* List */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div
                            className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                            style={{ borderColor: "var(--accent-primary)", borderTopColor: "transparent" }}
                        />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div
                            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                            style={{ background: "var(--bg-primary)", border: "1px solid var(--border-primary)" }}
                        >
                            <Inbox className="w-8 h-8" style={{ color: "var(--text-muted)" }} />
                        </div>
                        <p className="font-medium mb-1" style={{ color: "var(--text-primary)" }}>
                            {filter === "unread" ? "No unread notifications" : "Nothing here yet"}
                        </p>
                        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                            Task assignments and workspace invitations will appear here.
                        </p>
                    </div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        <div className="flex flex-col gap-3">
                            {filtered.map((notif) => (
                                <NotificationItem
                                    key={notif.id}
                                    notif={notif}
                                    onRead={handleRead}
                                    onAccept={handleAccept}
                                    onDecline={handleDecline}
                                />
                            ))}
                        </div>
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
};

export default Notifications;
