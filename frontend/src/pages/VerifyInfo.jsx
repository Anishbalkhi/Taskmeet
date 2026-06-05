import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import AnimatedBackground from "../components/common/AnimatedBackground";
import ThemeToggle from "../components/ThemeToggle";

const VerifyInfo = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 relative overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
      <AnimatedBackground />

      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md relative z-10">

        <motion.div
          className="rounded-lg p-8"
          style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
            boxShadow: 'var(--shadow-lg)'
          }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 bounce-in">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              Check your email
            </h1>
            <p className="mb-8 text-reveal-delay-1" style={{ color: 'var(--text-secondary)' }}>
              We've sent you a verification link. Please check your inbox and click the link to verify your account.
            </p>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-2">
                <strong className="text-gray-900">Note:</strong> The verification link will expire in 24 hours.
              </p>
              <p className="text-sm text-gray-600">
                If you don't see the email, check your spam folder.
              </p>
            </div>

            <div className="mt-6">
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Already verified?{" "}
                <button
                  onClick={() => navigate("/login")}
                  className="font-semibold transition-colors"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Sign in
                </button>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default VerifyInfo;
