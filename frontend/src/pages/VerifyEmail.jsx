import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import AnimatedBackground from "../components/common/AnimatedBackground";
import ThemeToggle from "../components/ThemeToggle";
import { verifyEmailApi } from "../api/authApi";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token");

      if (!token) {
        setStatus("error");
        setError("No verification token provided. Please check your email link.");
        return;
      }

      try {
        await verifyEmailApi(token);
        setStatus("success");

        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } catch (err) {
        setStatus("error");
        setError(
          err.response?.data?.message ||
          "Verification failed. The link may be expired or invalid."
        );
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

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
            {/* Verifying State */}
            {status === "verifying" && (
              <>
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
                <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                  Verifying your email
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Please wait while we verify your email address...
                </p>
              </>
            )}

            {/* Success State */}
            {status === "success" && (
              <>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 bounce-in">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                  Email verified!
                </h1>
                <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
                  Your email has been successfully verified. Redirecting to login...
                </p>

                <Link
                  to="/login"
                  className="inline-flex items-center justify-center px-6 py-2.5 rounded font-medium transition-all text-sm magnetic-hover"
                  style={{ background: 'var(--accent-primary)', color: 'var(--text-inverse)' }}
                >
                  Go to Login
                </Link>
              </>
            )}

            {/* Error State */}
            {status === "error" && (
              <>
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 shake">
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
                <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                  Verification failed
                </h1>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>

                <div className="space-y-3">
                  <Link
                    to="/register"
                    className="block w-full px-6 py-2.5 rounded font-medium transition-all text-sm magnetic-hover"
                    style={{ background: 'var(--accent-primary)', color: 'var(--text-inverse)' }}
                  >
                    Register Again
                  </Link>
                  <Link
                    to="/login"
                    className="block w-full px-6 py-2.5 rounded font-medium transition-all text-sm"
                    style={{
                      background: 'transparent',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--card-border)'
                    }}
                  >
                    Back to Login
                  </Link>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default VerifyEmail;
