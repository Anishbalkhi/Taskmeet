import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createWorkspace } from "../api/workspaceApi";
import { useWorkspace } from "../context/WorkspaceContext";
import { motion } from "framer-motion";
import { ArrowRight, Copy, Check, Link as LinkIcon, ArrowLeft } from "lucide-react";
import AnimatedBackground from "../components/common/AnimatedBackground";

const CreateWorkspace = () => {
    const [step, setStep] = useState(1);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [emails, setEmails] = useState("");
    const [loading, setLoading] = useState(false);
    const [inviteLink, setInviteLink] = useState("");
    const [copied, setCopied] = useState(false);
    const navigate = useNavigate();
    const { addWorkspaceObj } = useWorkspace();

    const handleNext = () => {
        if (step === 1 && name.trim()) {
            setStep(2);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const res = await createWorkspace({ name, description });
            const workspace = res.data;
            addWorkspaceObj(workspace);

            // Update invite link with real workspace ID
            if (workspace.id) {
                setInviteLink(`${window.location.origin}/login?workspace=${workspace.id}`);
            }

            // TODO: send email invites when backend endpoint is implemented
            if (emails.trim()) {
                // invite sending is not yet implemented
            }

            setTimeout(() => {
                navigate("/dashboard");
            }, 500);

        } catch (error) {
            console.error("Failed to create workspace", error);
            alert(error.response?.data?.message || "Failed to create workspace");
        } finally {
            setLoading(false);
        }
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(inviteLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSkip = () => {
        handleSubmit();
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-12 relative overflow-hidden">
            
            <AnimatedBackground />

            <motion.div
                className="w-full max-w-2xl relative z-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                
                <p className="text-gray-500 text-sm mb-6">Step {step} of 2</p>

                {step === 1 ? (
                    
                    <>
                        <motion.h1
                            className="text-5xl font-bold text-gray-900 mb-8 leading-tight"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1 }}
                        >
                            What's the name of your<br />company or team?
                        </motion.h1>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <label className="block text-gray-900 font-medium mb-3">
                                Workspace Name
                            </label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-4 bg-white border-2 border-gray-300 rounded-lg text-gray-900 text-lg focus:outline-none focus:border-gray-900 transition-colors placeholder-gray-400"
                                placeholder="e.g. Acme Marketing"
                                autoFocus
                                onKeyPress={(e) => e.key === 'Enter' && handleNext()}
                            />

                            <p className="text-gray-600 text-sm mt-4">
                                This will be the name of your Workspace in MeetTask
                            </p>
                        </motion.div>

                        <motion.div
                            className="flex items-center gap-4 mt-12"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            <button
                                onClick={handleNext}
                                disabled={!name.trim()}
                                className="px-8 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                Next
                                <ArrowRight className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => navigate("/dashboard")}
                                className="px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                Skip for now
                            </button>
                        </motion.div>
                    </>
                ) : (
                    
                    <>
                        <motion.h1
                            className="text-5xl font-bold text-gray-900 mb-8 leading-tight"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            Who else is on the<br />{name} team?
                        </motion.h1>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="mb-6"
                        >
                            <label className="block text-gray-900 font-medium mb-3">
                                Add colleagues by email
                            </label>
                            <textarea
                                value={emails}
                                onChange={(e) => setEmails(e.target.value)}
                                className="w-full px-4 py-4 bg-white border-2 border-gray-300 rounded-lg text-gray-900 resize-none focus:outline-none focus:border-gray-900 transition-colors placeholder-gray-400"
                                rows="5"
                                placeholder="Example: ellis@gmail.com, maria@gmail.com"
                            ></textarea>
                            <p className="text-gray-600 text-sm mt-3">
                                Keep in mind that invitations expire in 30 days. You can always extend that deadline.
                            </p>
                        </motion.div>

                        
                        <motion.div
                            className="bg-gray-100 border border-gray-300 rounded-lg p-4 mb-8"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <LinkIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />
                                    <span className="text-gray-700 text-sm font-mono truncate">{inviteLink}</span>
                                </div>
                                <button
                                    onClick={handleCopyLink}
                                    className="px-4 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm flex items-center gap-2 whitespace-nowrap flex-shrink-0"
                                >
                                    {copied ? (
                                        <>
                                            <Check className="w-4 h-4" />
                                            Copied
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-4 h-4" />
                                            Copy invitation link
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>

                        <motion.div
                            className="flex items-center gap-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="px-8 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Creating...
                                    </>
                                ) : (
                                    "Finish"
                                )}
                            </button>
                            <button
                                onClick={handleSkip}
                                disabled={loading}
                                className="px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                Skip this step
                            </button>
                            <button
                                onClick={() => setStep(1)}
                                disabled={loading}
                                className="ml-auto px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back
                            </button>
                        </motion.div>
                    </>
                )}
            </motion.div>
        </div>
    );
};

export default CreateWorkspace;
