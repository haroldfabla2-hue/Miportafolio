import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import LeadQualificationForm from './LeadQualificationForm';

interface ExitIntentModalProps {
  onClose?: () => void;
}

const ExitIntentModal: React.FC<ExitIntentModalProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours
    
    const handleMouseLeave = (e: MouseEvent) => {
      // clientY < 20 indicates mouse moving upwards near the URL/tab bar
      if (e.clientY >= 20) return;

      // Check cooldown in localStorage
      const dismissedAt = localStorage.getItem('exit_intent_dismissed_at');
      if (dismissedAt) {
        const timePassed = Date.now() - parseInt(dismissedAt);
        if (timePassed < COOLDOWN_MS) {
          return;
        }
      }

      setIsOpen(true);
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const handleDismiss = () => {
    setIsOpen(false);
    localStorage.setItem('exit_intent_dismissed_at', Date.now().toString());
    if (onClose) onClose();
  };

  const handleSuccess = () => {
    // Form submitted successfully, close modal with longer cooldown
    localStorage.setItem('exit_intent_dismissed_at', (Date.now() + 30 * 24 * 60 * 60 * 1000).toString()); // 30 days cooldown
    setTimeout(() => {
      setIsOpen(false);
      if (onClose) onClose();
    }, 3000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          {/* Overlay backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleDismiss}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(0,0,0,0.85)',
              backdropFilter: 'blur(8px)',
              cursor: 'pointer'
            }}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '650px',
              zIndex: 10001
            }}
          >
            {/* Header offer flag */}
            <div style={{
              position: 'absolute',
              top: '-15px',
              left: '40px',
              background: '#A3FF00',
              color: '#111',
              padding: '6px 18px',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              boxShadow: '0 4px 12px rgba(163,255,0,0.3)',
              zIndex: 10002
            }}>
              {t('exitIntent.title')}
            </div>

            {/* Close Button */}
            <button
              onClick={handleDismiss}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#aaa',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                zIndex: 10002
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#fff';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#aaa';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
              }}
            >
              <X size={18} />
            </button>

            {/* Qualification Form Embed */}
            <LeadQualificationForm onSuccess={handleSuccess} onCancel={handleDismiss} />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ExitIntentModal;
