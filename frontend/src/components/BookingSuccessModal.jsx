import React, { useState, useEffect } from 'react';
import { ReceiptPrinter } from './ReceiptPrinter';

export function BookingSuccessModal({ isOpen, onClose, reservationData }) {
  const [stage, setStage] = useState('processing');

  useEffect(() => {
    if (!isOpen) {
      setStage('processing');
      return;
    }

    setStage('processing');

    const printTimeout = setTimeout(() => {
      setStage('printing');
    }, 1000);

    const completeTimeout = setTimeout(() => {
      setStage('complete');
    }, 3200);

    return () => {
      clearTimeout(printTimeout);
      clearTimeout(completeTimeout);
    };
  }, [isOpen]);

  if (!isOpen || !reservationData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-neutral-950 border border-neutral-800 rounded-3xl p-6 shadow-2xl relative flex flex-col gap-4">
        <h3 className="text-lg font-serif text-warning text-center font-bold tracking-wider">Booking Successful</h3>
        
        <ReceiptPrinter stage={stage}>
          <ReceiptPrinter.Paper>
            <div className="text-center border-b border-dashed border-neutral-300 pb-3 flex flex-col gap-1">
              <h4 className="font-bold text-sm tracking-wider font-sans">FLAVORS & FORK</h4>
              <p className="text-[10px] text-neutral-500 font-sans">Gourmet Dining Experience</p>
            </div>

            <div className="flex flex-col gap-2 py-3 border-b border-dashed border-neutral-300 text-[11px]">
              <div className="flex justify-between">
                <span className="text-neutral-500">GUEST NAME:</span>
                <span className="font-semibold text-right">{reservationData.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">DATE:</span>
                <span className="font-semibold text-right">{reservationData.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">TIME SLOT:</span>
                <span className="font-semibold text-right">{reservationData.timeSlot}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">TABLE ASSIGNED:</span>
                <span className="font-semibold text-right">Table #{reservationData.tableId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">GUEST COUNT:</span>
                <span className="font-semibold text-right">{reservationData.guestCount} Guests</span>
              </div>
            </div>

            <div className="text-center pt-2">
              <p className="text-[10px] text-neutral-500 font-sans">Thank you for booking with us!</p>
              <p className="text-[9px] text-neutral-400 mt-1 font-sans">Please present this receipt upon arrival.</p>
            </div>

            {stage === 'complete' && (
              <button
                type="button"
                onClick={onClose}
                className="w-full mt-4 py-2 bg-neutral-900 text-white font-semibold rounded hover:bg-neutral-800 transition-colors shadow font-sans text-xs"
              >
                Done
              </button>
            )}
          </ReceiptPrinter.Paper>
        </ReceiptPrinter>
      </div>
    </div>
  );
}
