import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';

export default function MapDisplay({ 
  imageBase64, 
  mode, 
  currentPin, 
  onMapClick, 
  clickPosition,
  showCorrectPosition,
  disabled 
}) {
  const containerRef = useRef(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleClick = (e) => {
    if (disabled || mode !== 'click') return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    onMapClick(x, y);
  };

  return (
    <div 
      ref={containerRef}
      className={`relative w-full aspect-[4/3] bg-slate-100 rounded-2xl overflow-hidden shadow-inner ${
        mode === 'click' && !disabled ? 'cursor-crosshair' : ''
      }`}
      onClick={handleClick}
    >
      {imageBase64 && (
        <img
          src={imageBase64.startsWith('data:') ? imageBase64 : `data:image/png;base64,${imageBase64}`}
          alt="Karte"
          className="w-full h-full object-contain"
          onLoad={() => setImageLoaded(true)}
          draggable={false}
        />
      )}

      {!imageBase64 && (
        <div className="absolute inset-0 flex items-center justify-center text-slate-400">
          <p>Keine Karte verfügbar</p>
        </div>
      )}

      {/* Pin for Type Mode */}
      {mode === 'type' && currentPin && imageLoaded && (
        <motion.div
          initial={{ scale: 0, y: -20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: "spring", damping: 15 }}
          className="absolute z-10"
          style={{
            left: `${currentPin.x}%`,
            top: `${currentPin.y}%`,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <MapPin className="w-10 h-10 text-rose-500 drop-shadow-lg" fill="currentColor" strokeWidth={1.5} />
        </motion.div>
      )}

      {/* User Click Position */}
      {mode === 'click' && clickPosition && imageLoaded && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute z-10"
          style={{
            left: `${clickPosition.x}%`,
            top: `${clickPosition.y}%`,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <div className="w-6 h-6 rounded-full bg-blue-500 border-4 border-white shadow-lg" />
        </motion.div>
      )}

      {/* Correct Position (shown after answer in click mode) */}
      {mode === 'click' && showCorrectPosition && currentPin && imageLoaded && (
        <motion.div
          initial={{ scale: 0, y: -20 }}
          animate={{ scale: 1, y: 0 }}
          className="absolute z-10"
          style={{
            left: `${currentPin.x}%`,
            top: `${currentPin.y}%`,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <MapPin className="w-10 h-10 text-emerald-500 drop-shadow-lg" fill="currentColor" strokeWidth={1.5} />
        </motion.div>
      )}
    </div>
  );
}