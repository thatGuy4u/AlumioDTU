import { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import './App.css';

import CinematicIntro from './components/CinematicIntro';
import ThreeBackground from './components/ThreeBackground';
import DashboardBackground from './components/DashboardBackground';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';
import AuthModal from './components/AuthModal';

function App() {
  const [introComplete, setIntroComplete] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState('login');

  const handleIntroComplete = useCallback(() => {
    setIntroComplete(true);
  }, []);

  const handleOpenModal = useCallback((tab) => {
    setModalTab(tab);
    setModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
  }, []);

  const handleLogin = useCallback((name) => {
    setModalOpen(false);
    setUserName(name);
    setIsLoggedIn(true);
  }, []);

  const handleLogout = useCallback(() => {
    setIsLoggedIn(false);
    setUserName('');
  }, []);

  return (
    <>
      {/* Cinematic Intro */}
      <AnimatePresence>
        {!introComplete && (
          <CinematicIntro onComplete={handleIntroComplete} />
        )}
      </AnimatePresence>

      {/* Three.js Backgrounds (always mounted for performance) */}
      <ThreeBackground visible={!isLoggedIn} />
      <DashboardBackground visible={isLoggedIn} />

      {/* Main Content — fades in after intro */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: introComplete ? 1 : 0 }}
        transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        style={{ position: 'relative', zIndex: 1 }}
      >
        {/* Navbar */}
        <Navbar
          isLoggedIn={isLoggedIn}
          userName={userName}
          onOpenModal={handleOpenModal}
          onLogout={handleLogout}
        />

        {/* Landing Content */}
        {!isLoggedIn && (
          <motion.div
            id="landing-content"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Hero onOpenModal={handleOpenModal} />
            <Features />
            <HowItWorks />
            <Testimonials />
            <Footer />
          </motion.div>
        )}

        {/* Dashboard */}
        {isLoggedIn && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Dashboard userName={userName} />
          </motion.div>
        )}

        {/* Auth Modal */}
        <AuthModal
          isOpen={modalOpen}
          initialTab={modalTab}
          onClose={handleCloseModal}
          onLogin={handleLogin}
        />
      </motion.div>
    </>
  );
}

export default App;
