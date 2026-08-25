import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, CircleNotch } from '@phosphor-icons/react';
import { cn } from '../utils/cn';

export function ReceiptPrinter({ stage, screenTitle, screenSubtitle, children }) {
  const printerStyle = {
    width: '100%',
    maxWidth: '360px',
    margin: '0 auto',
    backgroundColor: '#1c1c1e',
    border: '1px solid #2c2c2e',
    borderRadius: '20px',
    padding: '24px',
    color: '#aeaeae',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    boxSizing: 'border-box'
  };

  const screenStyle = {
    backgroundColor: '#000000',
    border: '1px solid #2c2c2e',
    borderRadius: '12px',
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.6)',
    boxSizing: 'border-box'
  };

  const screenTextStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  };

  const statusLabelStyle = {
    fontSize: '9px',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: '#8e8e93',
    fontFamily: 'monospace'
  };

  const statusValueStyle = {
    fontSize: '13px',
    fontWeight: '600',
    color: '#e5e5ea',
    fontFamily: 'monospace'
  };

  const slotStyle = {
    position: 'relative',
    backgroundColor: '#09090b',
    borderTop: '1px solid #2c2c2e',
    borderBottom: '1px solid #2c2c2e',
    borderRadius: '8px',
    padding: '4px',
    overflow: 'hidden',
    height: '350px',
    display: 'flex',
    alignItems: 'flex-end',
    boxSizing: 'border-box'
  };

  const cutterShadowStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '8px',
    background: 'linear-gradient(to bottom, #09090b, transparent)',
    zIndex: 10
  };

  const cutterBarStyle = {
    position: 'absolute',
    top: 0,
    left: '16px',
    right: '16px',
    height: '2px',
    backgroundColor: '#2c2c2e',
    zIndex: 20
  };

  const paperContainerStyle = {
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    height: '100%'
  };

  const displayTitle = screenTitle || (
    stage === 'processing' ? 'Processing Booking...' :
    stage === 'printing' ? 'Printing Receipt...' :
    'Transaction Complete'
  );

  return (
    <div style={printerStyle}>
      {/* LED Status Bar / Screen Display */}
      <div style={screenStyle}>
        <div style={screenTextStyle}>
          <span style={statusLabelStyle}>Terminal Status</span>
          <span style={statusValueStyle}>{displayTitle}</span>
          {screenSubtitle && (
            <span style={{ fontSize: '10px', color: '#ffc107', fontFamily: 'monospace', marginTop: '2px' }}>
              {screenSubtitle}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {(stage === 'processing' || stage === 'printing') && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <CircleNotch size={22} color="#ffc107" weight="bold" />
            </motion.div>
          )}
          {stage === 'complete' && (
            <CheckCircle size={26} color="#34c759" weight="fill" />
          )}
        </div>
      </div>

      {/* Printer Slot & Feed Mechanical Simulator */}
      <div style={slotStyle}>
        <div style={cutterShadowStyle} />
        <div style={cutterBarStyle} />

        {/* Paper Feeding Mechanism container */}
        <div style={paperContainerStyle}>
          <AnimatePresence>
            {stage !== 'processing' && (
              <motion.div
                initial="hidden"
                animate="printing"
                exit="hidden"
                variants={{
                  hidden: { y: '-100%', opacity: 0 },
                  printing: {
                    y: ['-85%', '-65%', '-45%', '-25%', '0%'],
                    opacity: 1,
                    transition: {
                      duration: 2.2,
                      ease: 'linear',
                      times: [0, 0.25, 0.5, 0.75, 1]
                    }
                  }
                }}
                style={{ width: '100%' }}
              >
                {children}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// Subcomponent: ReceiptPrinter.Paper
ReceiptPrinter.Paper = function ReceiptPaper({ children, className }) {
  const paperStyle = {
    backgroundColor: '#ffffff',
    color: '#1c1c1e',
    fontFamily: 'monospace',
    fontSize: '11px',
    lineHeight: '1.4',
    padding: '24px 20px 20px 20px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
    borderLeft: '1px solid #e5e5ea',
    borderRight: '1px solid #e5e5ea',
    borderRadius: '2px',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    minHeight: '230px',
    boxSizing: 'border-box'
  };

  const serratedStyle = {
    position: 'absolute',
    top: '-4px',
    left: 0,
    right: 0,
    display: 'flex',
    overflow: 'hidden',
    height: '8px',
    userSelect: 'none',
    pointerEvents: 'none'
  };

  return (
    <div className={className} style={paperStyle}>
      {/* Decorative Receipt Serrated Tear Top Line */}
      <div style={serratedStyle}>
        {Array.from({ length: 30 }).map((_, idx) => (
          <span key={idx} style={{ color: '#e5e5ea', fontSize: '9px', lineHeight: '1', marginTop: '-3px', marginRight: '2px' }}>^</span>
        ))}
      </div>
      {children}
    </div>
  );
};
