import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function FeedbackOverlay({ show, isCorrect, correctAnswer, userAnswer }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-20 rounded-2xl"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className={`px-8 py-6 rounded-2xl shadow-2xl ${
              isCorrect 
                ? 'bg-gradient-to-br from-emerald-500 to-emerald-600' 
                : 'bg-gradient-to-br from-rose-500 to-rose-600'
            }`}
          >
            <div className="flex flex-col items-center gap-3 text-white">
              {isCorrect ? (
                <CheckCircle2 className="w-16 h-16" strokeWidth={1.5} />
              ) : (
                <XCircle className="w-16 h-16" strokeWidth={1.5} />
              )}
              <p className="text-2xl font-bold">
                {isCorrect ? 'Richtig!' : 'Falsch!'}
              </p>
              {!isCorrect && correctAnswer && (
                <p className="text-white/90 text-center">
                  Richtige Antwort: <span className="font-semibold">{correctAnswer}</span>
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}