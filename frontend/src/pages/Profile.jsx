import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useRole } from "../context/RoleContext";
import { motion, AnimatePresence } from "framer-motion";
import axiosClient from "../api/axiosClient";
import {
    User, Mail, Lock, Save, Camera, Bell, Shield,
    Phone, MapPin, Globe, Briefcase, CheckCircle,
    Eye, EyeOff, AlertCircle
} from "lucide-react";

/* ── Avatar ──────────────────────────────────────────── */
const Avatar = ({ name, size = 80 }) => {
    const initials = (name || "?")
        .split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
    return (
        <div
            style={{
                width: size, height: size, fontSize: size * 0.36,
                background: "linear-gradient(135deg, #7c3aed, #3b82f6)",
                color: "#fff",
                flexShrink: 0,
            }}
            className="rounded-full flex items-center justify-center font-bold shadow-lg"
        >
            {initials}
        </div>
    );
};

/* ── Field wrapper ───────────────────────────────────── */
const Field = ({ label, icon: Icon, hint, children }) => (
    <div className="space-y-1.5">
        <label className="block text-xs font-semibold uppercase tracking-wider"
            style={{ color: "var(--text-muted)" }}>
            {label}
        </label>
        <div className="relative">
            {Icon && (
                <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                    style={{ color: "var(--text-muted)" }} />
            )}
            {children}
        </div>
        {hint && <p className="text-xs" style={{ color: "var(--text-muted)" }}>{hint}</p>}
    </div>
);

/* shared input class */
const inp = (hasIcon = true) =>
    `w-full ${hasIcon ? "pl-9" : "px-4"} pr-4 py-2.5 text-sm rounded-lg outline-none transition-all`;

/* ── Toast ───────────────────────────────────────────── */
const Toast = ({ type, message, onClose }) => {
    useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 p-4 rounded-xl mb-5 text-sm font-medium"
            style={{
                background: type === "success" ? "rgba(204,255,0,0.08)" : "rgba(239,68,68,0.08)",
                border: `1px solid ${type === "success" ? "rgba(204,255,0,0.25)" : "rgba(239,68,68,0.35)"}`,
                color: type === "success" ? "var(--accent-secondary)" : "#f87171",
            }}
        >
            {type === "success"
                ? <CheckCircle className="w-5 h-5 flex-shrink-0" />
                : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
            {message}
        </motion.div>
    );
};

/* ── Primary button ──────────────────────────────────── */
const PrimaryBtn = ({ children, disabled, type = "submit", onClick }) => (
    <button
        type={type} disabled={disabled} onClick={onClick}
        className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg transition-all disabled:opacity-50 magnetic-hover"
        style={{ background: "var(--accent-primary)", color: "var(--text-inverse)" }}
        onMouseEnter={(e) => !disabled && (e.currentTarget.style.background = "var(--accent-hover)")}
        onMouseLeave={(e) => !disabled && (e.currentTarget.style.background = "var(--accent-primary)")}
    >
        {children}
    </button>
);

/* ════════════════════════════════════════════════════════ */
/*  MAIN COMPONENT                                          */
/* ════════════════════════════════════════════════════════ */
const Profile = () => {
    const { user, updateUser } = useAuth();
    const { roleConfig } = useRole();

    const [profile, setProfile] = useState({
        name: user?.name || "",
        email: user?.email || "",
        bio: user?.bio || "",
        roleName: user?.roleName || "",
        phone: user?.phone || "",
        location: user?.location || "",
        website: user?.website || "",
    });

    /* re-seed if user context updates (fresh /me fetch) */
    useEffect(() => {
        if (user) {
            setProfile({
                name: user.name || "",
                email: user.email || "",
                bio: user.bio || "",
                roleName: user.roleName || "",
                phone: user.phone || "",
                location: user.location || "",
                website: user.website || "",
            });
        }
    }, [user?.id]);

    const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });
    const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false });

    const [notifications, setNotifications] = useState({
        emailNotifications: true, taskUpdates: true, weeklyDigest: false, mentions: true,
    });

    useEffect(() => {
        try {
            const s = localStorage.getItem("user_notifications");
            if (s) setNotifications(JSON.parse(s));
        } catch { /* ignore */ }
    }, []);

    const [activeTab, setActiveTab] = useState("profile");
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const showToast = (type, text) => setToast({ type, text });

    /* ── handlers ── */
    const handleProfileSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axiosClient.put("/auth/me", {
                name: profile.name,
                bio: profile.bio,
                roleName: profile.roleName,
                phone: profile.phone,
                location: profile.location,
                website: profile.website,
            });
            updateUser(res.data.user);
            showToast("success", "Profile saved successfully!");
        } catch (err) {
            showToast("error", err.response?.data?.message || "Failed to save profile.");
        } finally { setLoading(false); }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwords.next !== passwords.confirm) { showToast("error", "New passwords do not match."); return; }
        if (passwords.next.length < 8) { showToast("error", "Password must be at least 8 characters."); return; }
        setLoading(true);
        try {
            await axiosClient.post("/auth/change-password", {
                currentPassword: passwords.current,
                newPassword: passwords.next,
            });
            setPasswords({ current: "", next: "", confirm: "" });
            showToast("success", "Password updated successfully!");
        } catch (err) {
            showToast("error", err.response?.data?.message || "Failed to update password.");
        } finally { setLoading(false); }
    };

    const handleNotifSave = () => {
        localStorage.setItem("user_notifications", JSON.stringify(notifications));
        showToast("success", "Notification preferences saved!");
    };

    const tabs = [
        { id: "profile", label: "Profile", icon: User },
        { id: "security", label: "Security", icon: Shield },
        { id: "notifications", label: "Notifications", icon: Bell },
    ];

    const notifLabels = {
        emailNotifications: { title: "Email Notifications", desc: "Get notified via email for important updates" },
        taskUpdates: { title: "Task Updates", desc: "Receive updates when tasks are created or modified" },
        weeklyDigest: { title: "Weekly Digest", desc: "A summary of your week every Monday morning" },
        mentions: { title: "Mentions & Comments", desc: "Notify when someone mentions or replies to you" },
    };

    /* shared input inline style */
    const inputStyle = {
        background: "var(--input-bg)",
        border: "1px solid var(--input-border)",
        color: "var(--text-primary)",
    };

    return (
        <div className="min-h-screen p-4 sm:p-6 pb-24 md:pb-6"
            style={{ background: "var(--bg-secondary)" }}>
            <div className="max-w-3xl mx-auto">

                {/* ── page header ── */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                        Account Settings
                    </h1>
                    <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                        Manage your profile, security &amp; notification preferences
                    </p>
                </div>

                {/* ── toast ── */}
                <AnimatePresence>
                    {toast && <Toast key={toast.text} type={toast.type} message={toast.text} onClose={() => setToast(null)} />}
                </AnimatePresence>

                {/* ── main card ── */}
                <div className="rounded-2xl overflow-hidden"
                    style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>

                    {/* tab bar */}
                    <div style={{ borderBottom: "1px solid var(--border-primary)" }}>
                        <div className="flex overflow-x-auto">
                            {tabs.map((tab) => {
                                const active = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className="flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-all"
                                        style={{
                                            color: active ? "var(--accent-secondary)" : "var(--text-muted)",
                                            borderBottom: active ? "2px solid var(--accent-secondary)" : "2px solid transparent",
                                            background: active ? "rgba(204,255,0,0.04)" : "transparent",
                                        }}
                                    >
                                        <tab.icon className="w-4 h-4" />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="p-6">
                        <AnimatePresence mode="wait">

                            {/* ══ PROFILE TAB ══ */}
                            {activeTab === "profile" && (
                                <motion.form key="profile"
                                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}
                                    onSubmit={handleProfileSave} className="space-y-7"
                                >
                                    {/* avatar strip */}
                                    <div className="flex items-center gap-5 p-4 rounded-xl"
                                        style={{ background: "var(--bg-hover)", border: "1px solid var(--border-primary)" }}>
                                        <div className="relative">
                                            <Avatar name={profile.name} size={72} />
                                            <button type="button" title="Change avatar (coming soon)"
                                                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center transition-all"
                                                style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-primary)" }}>
                                                <Camera className="w-3 h-3" style={{ color: "var(--text-secondary)" }} />
                                            </button>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                                                {profile.name || "Your Name"}
                                            </p>
                                            <p className="text-sm truncate" style={{ color: "var(--text-muted)" }}>
                                                {profile.email}
                                            </p>
                                            {profile.roleName && (
                                                <span className="inline-flex items-center gap-1 mt-1.5 text-xs font-semibold px-2 py-0.5 rounded-full"
                                                    style={{ background: "rgba(204,255,0,0.12)", color: "var(--accent-secondary)" }}>
                                                    <Briefcase className="w-3 h-3" />
                                                    {profile.roleName}
                                                </span>
                                            )}
                                        </div>
                                        {/* RBAC role badge */}
                                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                            {roleConfig && (
                                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
                                                    style={{ background: roleConfig.color, color: roleConfig.textColor }}>
                                                    {roleConfig.emoji} {roleConfig.label}
                                                </span>
                                            )}
                                            {user?.isEmailVerified && (
                                                <div className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
                                                    style={{ background: "rgba(204,255,0,0.1)", color: "var(--accent-secondary)" }}>
                                                    <CheckCircle className="w-3.5 h-3.5" />
                                                    Verified
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* fields grid */}
                                    <div className="grid sm:grid-cols-2 gap-5">
                                        <Field label="Full Name" icon={User}>
                                            <input type="text" value={profile.name} required
                                                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                                className={inp()} style={inputStyle} placeholder="Jane Doe" />
                                        </Field>

                                        <Field label="Email Address" icon={Mail}>
                                            <input type="email" value={profile.email} readOnly
                                                className={inp()} title="Email cannot be changed here"
                                                style={{ ...inputStyle, cursor: "not-allowed", opacity: 0.6 }} />
                                        </Field>

                                        <Field label="Role / Job Title" icon={Briefcase}>
                                            <input type="text" value={profile.roleName}
                                                onChange={(e) => setProfile({ ...profile, roleName: e.target.value })}
                                                className={inp()} style={inputStyle} placeholder="e.g. Frontend Developer" />
                                        </Field>

                                        <Field label="Phone Number" icon={Phone}>
                                            <input type="tel" value={profile.phone}
                                                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                                className={inp()} style={inputStyle} placeholder="+91 98765 43210" />
                                        </Field>

                                        <Field label="Location" icon={MapPin}>
                                            <input type="text" value={profile.location}
                                                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                                                className={inp()} style={inputStyle} placeholder="Mumbai, India" />
                                        </Field>

                                        <Field label="Website / Portfolio" icon={Globe}>
                                            <input type="url" value={profile.website}
                                                onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                                                className={inp()} style={inputStyle} placeholder="https://yoursite.com" />
                                        </Field>
                                    </div>

                                    {/* bio */}
                                    <Field label={`Bio (${profile.bio.length}/300)`}>
                                        <textarea value={profile.bio} rows={4} maxLength={300}
                                            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                            className="w-full px-4 py-2.5 text-sm rounded-lg outline-none transition-all resize-none"
                                            style={inputStyle}
                                            placeholder="Tell your team a bit about yourself…" />
                                    </Field>

                                    <div className="flex justify-end">
                                        <PrimaryBtn disabled={loading}>
                                            <Save className="w-4 h-4" />
                                            {loading ? "Saving…" : "Save Profile"}
                                        </PrimaryBtn>
                                    </div>
                                </motion.form>
                            )}

                            {/* ══ SECURITY TAB ══ */}
                            {activeTab === "security" && (
                                <motion.div key="security"
                                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>

                                    {/* status card */}
                                    <div className="flex items-center gap-3 p-4 rounded-xl mb-6"
                                        style={{ background: "rgba(204,255,0,0.06)", border: "1px solid rgba(204,255,0,0.2)" }}>
                                        <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: "var(--accent-secondary)" }} />
                                        <div>
                                            <p className="text-sm font-semibold" style={{ color: "var(--accent-secondary)" }}>
                                                {user?.isEmailVerified ? "Email verified" : "Email not verified"}
                                            </p>
                                            <p className="text-xs" style={{ color: "var(--text-muted)" }}>{profile.email}</p>
                                        </div>
                                    </div>

                                    <form onSubmit={handlePasswordChange} className="space-y-5">
                                        <h3 className="font-semibold text-sm uppercase tracking-wider"
                                            style={{ color: "var(--text-secondary)" }}>Change Password</h3>

                                        {[
                                            { key: "current", label: "Current Password" },
                                            { key: "next", label: "New Password", hint: "Minimum 8 characters" },
                                            { key: "confirm", label: "Confirm New Password" },
                                        ].map(({ key, label, hint }) => (
                                            <Field key={key} label={label} icon={Lock} hint={hint}>
                                                <input type={showPw[key] ? "text" : "password"} value={passwords[key]} required
                                                    onChange={(e) => setPasswords({ ...passwords, [key]: e.target.value })}
                                                    className={`${inp()} pr-10`} style={inputStyle} />
                                                <button type="button" tabIndex={-1}
                                                    onClick={() => setShowPw((s) => ({ ...s, [key]: !s[key] }))}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                                                    style={{ color: "var(--text-muted)" }}>
                                                    {showPw[key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </Field>
                                        ))}

                                        <div className="flex justify-end pt-2">
                                            <PrimaryBtn disabled={loading}>
                                                <Lock className="w-4 h-4" />
                                                {loading ? "Updating…" : "Update Password"}
                                            </PrimaryBtn>
                                        </div>
                                    </form>
                                </motion.div>
                            )}

                            {/* ══ NOTIFICATIONS TAB ══ */}
                            {activeTab === "notifications" && (
                                <motion.div key="notifications"
                                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}
                                    className="space-y-6">

                                    <h3 className="font-semibold text-sm uppercase tracking-wider"
                                        style={{ color: "var(--text-secondary)" }}>Notification Preferences</h3>

                                    <div style={{ borderTop: "1px solid var(--border-primary)" }}>
                                        {Object.entries(notifLabels).map(([key, { title, desc }]) => {
                                            const on = notifications[key];
                                            return (
                                                <div key={key}
                                                    className="flex items-center justify-between py-4"
                                                    style={{ borderBottom: "1px solid var(--border-primary)" }}>
                                                    <div>
                                                        <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{title}</p>
                                                        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{desc}</p>
                                                    </div>
                                                    <button type="button"
                                                        onClick={() => setNotifications((n) => ({ ...n, [key]: !n[key] }))}
                                                        className="relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-all"
                                                        style={{ background: on ? "var(--accent-secondary)" : "var(--bg-active)" }}>
                                                        <span
                                                            className="inline-block h-4 w-4 rounded-full transition-transform"
                                                            style={{
                                                                background: on ? "#111" : "var(--text-muted)",
                                                                transform: on ? "translateX(24px)" : "translateX(4px)",
                                                            }}
                                                        />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="flex justify-end pt-2">
                                        <PrimaryBtn type="button" onClick={handleNotifSave} disabled={loading}>
                                            <Save className="w-4 h-4" />
                                            Save Preferences
                                        </PrimaryBtn>
                                    </div>
                                </motion.div>
                            )}

                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
