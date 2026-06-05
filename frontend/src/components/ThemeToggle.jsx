import { Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { motion } from "framer-motion";

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === "dark";

    return (
        <motion.button
            onClick={toggleTheme}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-200"
            style={{
                background: isDark ? 'var(--bg-hover)' : 'var(--bg-tertiary)',
                color: 'var(--text-primary)'
            }}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle theme"
        >
            
            <div className="relative w-5 h-5">
                
                <motion.div
                    initial={false}
                    animate={{
                        scale: isDark ? 0 : 1,
                        rotate: isDark ? 180 : 0,
                        opacity: isDark ? 0 : 1,
                    }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="absolute inset-0 flex items-center justify-center"
                >
                    <Sun className="w-5 h-5" />
                </motion.div>

                
                <motion.div
                    initial={false}
                    animate={{
                        scale: isDark ? 1 : 0,
                        rotate: isDark ? 0 : -180,
                        opacity: isDark ? 1 : 0,
                    }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="absolute inset-0 flex items-center justify-center"
                >
                    <Moon className="w-5 h-5" />
                </motion.div>
            </div>

            
            <motion.div
                className="absolute inset-0 rounded-lg"
                initial={{ scale: 1, opacity: 0.5 }}
                whileTap={{ scale: 1.5, opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{
                    background: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                }}
            />
        </motion.button>
    );
};

export default ThemeToggle;
