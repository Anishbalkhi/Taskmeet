import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useRole } from "../context/RoleContext";
import { motion, AnimatePresence } from "framer-motion";
import axiosClient from "../api/axiosClient";
import {
    User, Mail, Lock, Save, Camera, Bell, Shield,
    Phone, MapPin, Globe, Briefcase, CheckCircle,
    Eye, EyeOff, AlertCircle, ChevronRight
} from "lucide-react";

/* ── Avatar ──────────────────────────────────────────── */
const Avatar = ({ name, size = 80 }) => {
    const initials = (name || "?")
        .split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
    return (
        <div
            style={{
                width: size, height: size, fontSize: size * 0.38,
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

/* ── Input component ─────────────────────────────────── */
const Input = ({ icon: Icon, value, onChange, type = "text", placeholder, readOnly, className = "", rightEl, ...rest }) => (
    <div className="relative">
        {Icon && (
            <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                style={{ color: "var(--text-muted)" }} />
        )}
        <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            readOnly={readOnly}
            className={`w-full ${Icon ? "pl-9" : "pl-4"} ${rightEl ? "pr-10" : "pr-4"} py-2.5 text-sm rounded-xl outline-none transition-all ${className}`}
            style={{
                background: readOnly ? "var(--bg-tertiary)" : "var(--input-bg)",
                border: "1px solid var(--input-border)",
                color: "var(--text-primary)",
                cursor: readOnly ? "not-allowed" : "auto",
                opacity: readOnly ? 0.7 : 1,
            }}
            onFocus={(e) => { if (!readOnly) e.currentTarget.style.borderColor = "var(--border-hover)"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "var(--input-border)"; }}
            {...rest}
        />
        {rightEl && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightEl}</div>
        )}
    </div>
);

/* ── Field wrapper ───────────────────────────────────── */
const Field = ({ label, hint, children }) => (
    <div className="space-y-1.5">
        <label className="block text-xs font-semibold uppercase tracking-wider"
            style={{ color: "var(--text-muted)" }}>
            {label}
        </label>
        {children}
        {hint && <p className="text-xs" style={{ color: "var(--text-muted)" }}>{hint}</p>}
    </div>
);

/* ── Toast ───────────────────────────────────────────── */
const Toast = ({ type, message, onClose }) => {
    useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
    return (
        <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.97 }}
            className="flex items-center gap-3 p-4 rounded-xl mb-5 text-sm font-medium"
            style={{
                background: type === "success" ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
                border: `1px solid ${type === "success" ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.3)"}`,
                color: type === "success" ? "#16a34a" : "#ef4444",
            }}
        >
            {type === "success"
                ? <CheckCircle className="w-4 h-4 shrink-0" />
                : <AlertCircle className="w-4 h-4 shrink-0" />}
            {message}
        </motion.div>
    );
};

/* ── Primary button ──────────────────────────────────── */
const PrimaryBtn = ({ children, disabled, type = "submit", onClick }) => (
    <button
        type={type} disabled={disabled} onClick={onClick}
        className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl transition-all disabled:opacity-50"
        style={{ background: "var(--accent-primary)", color: "var(--text-inverse)" }}
        onMouseEnter={(e) => !disabled && (e.currentTarget.style.opacity = "0.85")}
        onMouseLeave={(e) => !disabled && (e.currentTarget.style.opacity = "1")}
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
        { id: "notifications", label: "Alerts", icon: Bell },
    ];

    const notifLabels = {
        emailNotifications: { title: "Email Notifications", desc: "Get notified via email for important updates" },
        taskUpdates: { title: "Task Updates", desc: "Receive updates when tasks are created or modified" },
        weeklyDigest: { title: "Weekly Digest", desc: "A summary of your week every Monday morning" },
        mentions: { title: "Mentions & Comments", desc: "Notify when someone mentions or replies to you" },
    };

    return (
        <div className="min-h-screen p-4 sm:p-6 pb-24 md:pb-6"
            style={{ background: "var(--bg-secondary)" }}>
            <div className="max-w-2xl mx-auto">

                {/* ── Hero card with avatar ── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="rounded-2xl overflow-hidden mb-4"
                    style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}
                >
                    {/* Banner gradient */}
                    <div
                        className="h-24 sm:h-32"
                        style={{ background: "linear-gradient(135deg, #7c3aed22, #3b82f622, #0ea5e922)" }}
                    />

                    <div className="px-5 sm:px-6 pb-5 -mt-10 sm:-mt-12">
                        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                            {/* Avatar with edit button */}
                            <div className="relative w-fit">
                                <div
                                    className="rounded-full p-1"
                                    style={{ background: "var(--card-bg)", border: "3px solid var(--card-bg)" }}
                                >
                                    <Avatar name={profile.name} size={72} />
                                </div>
                                <button
                                    type="button"
                                    title="Change avatar (coming soon)"
                                    className="absolute bottom-1 right-1 w-6 h-6 rounded-full flex items-center justify-center transition-all"
                                    style={{ background: "var(--bg-elevated)", border: "1.5px solid var(--border-primary)" }}
                                >
                                    <Camera className="w-3 h-3" style={{ color: "var(--text-secondary)" }} />
                                </button>
                            </div>

                            {/* Role badges */}
                            <div className="flex flex-wrap items-center gap-2 pb-1">
                                {roleConfig && (
                                    <span
                                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
                                        style={{ background: roleConfig.color, color: roleConfig.textColor }}
                                    >
                                        {roleConfig.emoji} {roleConfig.label}
                                    </span>
                                )}
                                {user?.isEmailVerified && (
                                    <div
                                        className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full"
                                        style={{ background: "rgba(34,197,94,0.12)", color: "#16a34a" }}
                                    >
                                        <CheckCircle className="w-3.5 h-3.5" />
                                        Verified
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-3">
                            <h2 className="text-lg sm:text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                                {profile.name || "Your Name"}
                            </h2>
                            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                                {profile.email}
                                {profile.roleName && (
                                    <span className="ml-2">· {profile.roleName}</span>
                                )}
                            </p>
                            {profile.bio && (
                                <p className="text-sm mt-1.5 line-clamp-2" style={{ color: "var(--text-secondary)" }}>
                                    {profile.bio}
                                </p>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* ── Toast ── */}
                <AnimatePresence>
                    {toast && <Toast key={toast.text} type={toast.type} message={toast.text} onClose={() => setToast(null)} />}
                </AnimatePresence>

                {/* ── Tab card ── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.08 }}
                    className="rounded-2xl overflow-hidden"
                    style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}
                >
                    {/* Tab bar */}
                    <div className="flex overflow-x-auto" style={{ borderBottom: "1px solid var(--border-primary)" }}>
                        {tabs.map((tab) => {
                            const active = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className="flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap transition-all relative"
                                    style={{
                                        color: active ? "var(--text-primary)" : "var(--text-muted)",
                                        background: "transparent",
                                    }}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    {tab.label}
                                    {active && (
                                        <motion.div
                                            layoutId="tabIndicator"
                                            className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t"
                                            style={{ background: "var(--accent-primary)" }}
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    <div className="p-5 sm:p-6">
                        <AnimatePresence mode="wait">

                            {/* ══ PROFILE TAB ══ */}
                            {activeTab === "profile" && (
                                <motion.form key="profile"
                                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}
                                    onSubmit={handleProfileSave} className="space-y-5"
                                >
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <Field label="Full Name">
                                            <Input
                                                icon={User}
                                                value={profile.name}
                                                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                                placeholder="Jane Doe"
                                                required
                                            />
                                        </Field>

                                        <Field label="Email Address">
                                            <Input
                                                icon={Mail}
                                                value={profile.email}
                                                type="email"
                                                readOnly
                                                placeholder="you@example.com"
                                            />
                                        </Field>

                                        <Field label="Role / Job Title">
                                            <Input
                                                icon={Briefcase}
                                                value={profile.roleName}
                                                onChange={(e) => setProfile({ ...profile, roleName: e.target.value })}
                                                placeholder="e.g. Frontend Developer"
                                            />
                                        </Field>

                                        <Field label="Phone Number">
                                            <Input
                                                icon={Phone}
                                                value={profile.phone}
                                                type="tel"
                                                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                                placeholder="+91 98765 43210"
                                            />
                                        </Field>

                                        <Field label="Location">
                                            <Input
                                                icon={MapPin}
                                                value={profile.location}
                                                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                                                placeholder="Mumbai, India"
                                            />
                                        </Field>

                                        <Field label="Website / Portfolio">
                                            <Input
                                                icon={Globe}
                                                value={profile.website}
                                                type="url"
                                                onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                                                placeholder="https://yoursite.com"
                                            />
                                        </Field>
                                    </div>

                                    <Field label={`Bio (${profile.bio.length}/300)`}>
                                        <textarea
                                            value={profile.bio}
                                            rows={3}
                                            maxLength={300}
                                            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                            placeholder="Tell your team a bit about yourself…"
                                            className="w-full px-4 py-2.5 text-sm rounded-xl outline-none transition-all resize-none"
                                            style={{
                                                background: "var(--input-bg)",
                                                border: "1px solid var(--input-border)",
                                                color: "var(--text-primary)"
                                            }}
                                            onFocus={(e) => e.currentTarget.style.borderColor = "var(--border-hover)"}
                                            onBlur={(e) => e.currentTarget.style.borderColor = "var(--input-border)"}
                                        />
                                    </Field>

                                    <div className="flex justify-end pt-1">
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
                                    exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>

                                    {/* Email status */}
                                    <div
                                        className="flex items-center gap-3 p-4 rounded-xl mb-5"
                                        style={{
                                            background: user?.isEmailVerified
                                                ? "rgba(34,197,94,0.07)"
                                                : "rgba(239,68,68,0.07)",
                                            border: `1px solid ${user?.isEmailVerified ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)"}`
                                        }}
                                    >
                                        <CheckCircle className="w-5 h-5 shrink-0" style={{ color: user?.isEmailVerified ? "#16a34a" : "#ef4444" }} />
                                        <div>
                                            <p className="text-sm font-semibold" style={{ color: user?.isEmailVerified ? "#16a34a" : "#ef4444" }}>
                                                {user?.isEmailVerified ? "Email verified" : "Email not verified"}
                                            </p>
                                            <p className="text-xs" style={{ color: "var(--text-muted)" }}>{profile.email}</p>
                                        </div>
                                    </div>

                                    <form onSubmit={handlePasswordChange} className="space-y-4">
                                        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
                                            Change Password
                                        </p>

                                        {[
                                            { key: "current", label: "Current Password" },
                                            { key: "next", label: "New Password", hint: "Minimum 8 characters" },
                                            { key: "confirm", label: "Confirm New Password" },
                                        ].map(({ key, label, hint }) => (
                                            <Field key={key} label={label} hint={hint}>
                                                <Input
                                                    icon={Lock}
                                                    type={showPw[key] ? "text" : "password"}
                                                    value={passwords[key]}
                                                    onChange={(e) => setPasswords({ ...passwords, [key]: e.target.value })}
                                                    required
                                                    rightEl={
                                                        <button
                                                            type="button"
                                                            tabIndex={-1}
                                                            onClick={() => setShowPw(s => ({ ...s, [key]: !s[key] }))}
                                                            style={{ color: "var(--text-muted)" }}
                                                            className="transition-colors"
                                                            onMouseEnter={(e) => e.currentTarget.style.color = "var(--text-primary)"}
                                                            onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}
                                                        >
                                                            {showPw[key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                        </button>
                                                    }
                                                />
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
                                    exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}
                                    className="space-y-1"
                                >
                                    <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "var(--text-muted)" }}>
                                        Notification Preferences
                                    </p>

                                    {Object.entries(notifLabels).map(([key, { title, desc }]) => {
                                        const on = notifications[key];
                                        return (
                                            <div
                                                key={key}
                                                className="flex items-center justify-between py-3.5 px-1"
                                                style={{ borderBottom: "1px solid var(--border-primary)" }}
                                            >
                                                <div className="flex-1 min-w-0 pr-4">
                                                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{title}</p>
                                                    <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{desc}</p>
                                                </div>
                                                {/* Toggle switch */}
                                                <button
                                                    type="button"
                                                    onClick={() => setNotifications(n => ({ ...n, [key]: !n[key] }))}
                                                    className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-all"
                                                    style={{ background: on ? "var(--accent-primary)" : "var(--bg-active)" }}
                                                >
                                                    <span
                                                        className="inline-block h-4 w-4 rounded-full transition-transform"
                                                        style={{
                                                            background: on ? "var(--text-inverse)" : "var(--text-muted)",
                                                            transform: on ? "translateX(24px)" : "translateX(4px)",
                                                        }}
                                                    />
                                                </button>
                                            </div>
                                        );
                                    })}

                                    <div className="flex justify-end pt-4">
                                        <PrimaryBtn type="button" onClick={handleNotifSave} disabled={loading}>
                                            <Save className="w-4 h-4" />
                                            Save Preferences
                                        </PrimaryBtn>
                                    </div>
                                </motion.div>
                            )}

                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Profile;
