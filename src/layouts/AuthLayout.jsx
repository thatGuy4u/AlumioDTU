import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';

const orbColors = [
  'rgba(245, 200, 66, 0.06)',  // gold
  'rgba(0, 212, 200, 0.05)',   // teal
  'rgba(124, 77, 255, 0.04)',  // purple
  'rgba(245, 200, 66, 0.05)',  // gold
  'rgba(0, 212, 200, 0.04)',   // teal
  'rgba(255, 255, 255, 0.03)', // white
];

export default function AuthLayout() {
  return (
    <div className="auth-layout">
      {/* Animated Background */}
      <div className="auth-bg">
        <div className="auth-bg-gradient" />
        <div className="auth-bg-grid" />
        {/* Floating orbs — gold/teal to match app branding */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="auth-orb"
            style={{
              width: 80 + i * 40,
              height: 80 + i * 40,
              left: `${10 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
              background: `radial-gradient(circle, ${orbColors[i]} 0%, transparent 70%)`,
            }}
            animate={{
              y: [0, -20, 0],
              x: [0, 10, 0],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.5,
            }}
          />
        ))}
      </div>

      {/* Auth Content */}
      <motion.div
        className="auth-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <Outlet />
      </motion.div>
    </div>
  );
}
