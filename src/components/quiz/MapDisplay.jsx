import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { getPolygonCentroid } from '@/utils';

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
  const imageRef = useRef(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  const getImageBox = () => {
    const container = containerRef.current;
    if (!container) return null;

    const rect = container.getBoundingClientRect();
    const cw = rect.width;
    const ch = rect.height;

    const img = imageRef.current;
    if (!img || !imageLoaded || !img.naturalWidth || !img.naturalHeight) {
      return { left: 0, top: 0, width: cw, height: ch };
    }

    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const containerRatio = cw / ch;
    const imageRatio = iw / ih;

    let renderW = cw;
    let renderH = ch;
    if (imageRatio > containerRatio) {
      renderW = cw;
      renderH = cw / imageRatio;
    } else {
      renderH = ch;
      renderW = ch * imageRatio;
    }

    const left = (cw - renderW) / 2;
    const top = (ch - renderH) / 2;

    return { left, top, width: renderW, height: renderH, containerLeft: rect.left, containerTop: rect.top };
  };

  const imageBox = getImageBox();

  const toAbsolutePosition = (point) => {
    if (!imageBox || !point) return null;
    const left = imageBox.left + (imageBox.width * (point.x || 0)) / 100;
    const top = imageBox.top + (imageBox.height * (point.y || 0)) / 100;
    return { left, top };
  };

  const renderAreaOverlay = (pin, style, options = {}) => {
    if (!imageBox || !pin?.vertices?.length) return null;
    const showLabel = options.showLabel ?? false;

    const points = pin.vertices
      .map((vertex) => `${(imageBox.width * vertex.x) / 100},${(imageBox.height * vertex.y) / 100}`)
      .join(' ');

    if (!points) return null;

    const center = showLabel ? getPolygonCentroid(pin.vertices) : null;
    const centerPos = center ? toAbsolutePosition(center) : null;

    return (
      <>
        <svg
          className="absolute z-10 pointer-events-none"
          style={{
            left: `${imageBox.left}px`,
            top: `${imageBox.top}px`,
            width: `${imageBox.width}px`,
            height: `${imageBox.height}px`
          }}
        >
          <polygon
            points={points}
            fill={style.fill}
            stroke={style.stroke}
            strokeWidth={2}
            fillOpacity={style.fillOpacity ?? 0.18}
            strokeOpacity={style.strokeOpacity ?? 0.9}
          />
        </svg>
        {centerPos && (
          <div
            className={`absolute z-20 px-2 py-1 text-xs text-white rounded shadow ${style.labelClassName || ''}`}
            style={{
              left: `${centerPos.left}px`,
              top: `${centerPos.top}px`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            {pin.name}
          </div>
        )}
      </>
    );
  };

  const handleClick = (e) => {
    if (disabled || mode !== 'click') return;

    const currentBox = getImageBox();
    if (!currentBox) return;

    const offsetX = e.clientX - currentBox.containerLeft - currentBox.left;
    const offsetY = e.clientY - currentBox.containerTop - currentBox.top;
    const x = Math.max(0, Math.min(100, (offsetX / currentBox.width) * 100));
    const y = Math.max(0, Math.min(100, (offsetY / currentBox.height) * 100));

    onMapClick(x, y);
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full aspect-[4/3] bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden shadow-inner ${
        mode === 'click' && !disabled ? 'cursor-crosshair' : ''
      }`}
      onClick={handleClick}
    >
      {imageBase64 && (
        <img
          ref={imageRef}
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

      {mode === 'type' && currentPin && imageLoaded && (
        currentPin.type === 'area'
          ? renderAreaOverlay(currentPin, {
              fill: 'rgb(244 63 94 / 0.18)',
              stroke: '#f43f5e',
              labelClassName: 'bg-rose-500'
            })
          : (() => {
              const pos = toAbsolutePosition(currentPin);
              if (!pos) return null;
              return (
                <motion.div
                  initial={{ scale: 0, y: -20 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ type: 'spring', damping: 15 }}
                  className="absolute z-10"
                  style={{
                    left: `${pos.left}px`,
                    top: `${pos.top}px`,
                    transform: 'translate(-50%, -100%)'
                  }}
                >
                  <MapPin className="w-10 h-10 text-rose-500 drop-shadow-lg" fill="currentColor" strokeWidth={1.5} />
                </motion.div>
              );
            })()
      )}

      {mode === 'click' && clickPosition && imageLoaded && (() => {
        const pos = toAbsolutePosition(clickPosition);
        if (!pos) return null;
        return (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute z-10"
            style={{
              left: `${pos.left}px`,
              top: `${pos.top}px`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className="w-6 h-6 rounded-full bg-blue-500 border-4 border-white shadow-lg" />
          </motion.div>
        );
      })()}

      {mode === 'click' && showCorrectPosition && currentPin && imageLoaded && (
        currentPin.type === 'area'
          ? renderAreaOverlay(
              currentPin,
              {
                fill: 'rgb(16 185 129 / 0.18)',
                stroke: '#10b981',
                labelClassName: 'bg-emerald-600'
              },
              { showLabel: true }
            )
          : (() => {
              const pos = toAbsolutePosition(currentPin);
              if (!pos) return null;
              return (
                <motion.div
                  initial={{ scale: 0, y: -20 }}
                  animate={{ scale: 1, y: 0 }}
                  className="absolute z-10"
                  style={{
                    left: `${pos.left}px`,
                    top: `${pos.top}px`,
                    transform: 'translate(-50%, -100%)'
                  }}
                >
                  <MapPin className="w-10 h-10 text-emerald-500 drop-shadow-lg" fill="currentColor" strokeWidth={1.5} />
                </motion.div>
              );
            })()
      )}
    </div>
  );
}

