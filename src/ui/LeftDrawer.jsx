import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineXMark } from 'react-icons/hi2';

/**
 * Shared left slide-out drawer (Gmail-style).
 * Portaled to document.body so parent layout/transforms cannot break it.
 */
export default function LeftDrawer({
  open,
  onClose,
  children,
  title,
  logo,
  className = '',
  width = 300,
}) {
  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            className="left-drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-label="Close menu"
          />
          <motion.aside
            className={`left-drawer ${className}`.trim()}
            style={{ width: `min(${width}px, 85vw)` }}
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label={title || 'Navigation menu'}
          >
            {(logo || title) && (
              <div className="left-drawer-header">
                {logo || (title && <span className="left-drawer-title">{title}</span>)}
                <button type="button" className="left-drawer-close" onClick={onClose} aria-label="Close menu">
                  <HiOutlineXMark size={22} />
                </button>
              </div>
            )}
            {children}
          </motion.aside>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
