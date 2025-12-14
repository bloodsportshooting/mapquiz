import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Clock, Target, RotateCcw, Home, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ResultsModal({ show, time, correct, total, onRestart, onHome }) {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

  const getGrade = () => {
    if (percentage >= 90) return { text: 'Ausgezeichnet!', color: 'text-emerald-500', stars: 3 };
    if (percentage >= 70) return { text: 'Sehr gut!', color: 'text-blue-500', stars: 2 };
    if (percentage >= 50) return { text: 'Gut gemacht!', color: 'text-amber-500', stars: 1 };
    return { text: 'Weiter üben!', color: 'text-slate-500', stars: 0 };
  };

  const grade = getGrade();

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden dark:bg-slate-900"
          >
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 px-8 py-10 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', damping: 15 }}
              >
                <Trophy className="w-20 h-20 mx-auto text-amber-400 mb-4" strokeWidth={1.5} />
              </motion.div>
              <h2 className="text-3xl font-bold text-white mb-2">Quiz beendet!</h2>
              <p className={`text-xl font-medium ${grade.color}`}>{grade.text}</p>
              <div className="flex justify-center gap-1 mt-3">
                {[1, 2, 3].map((star) => (
                  <Star
                    key={star}
                    className={`w-8 h-8 ${
                      star <= grade.stars ? 'text-amber-400 fill-amber-400' : 'text-slate-600'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="px-8 py-8">
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="text-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-800">
                  <Clock className="w-6 h-6 mx-auto text-slate-400 mb-2" />
                  <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{formatTime(time)}</p>
                  <p className="text-xs text-slate-400 uppercase tracking-wide">Zeit</p>
                </div>
                <div className="text-center p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30">
                  <Target className="w-6 h-6 mx-auto text-emerald-500 mb-2" />
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-300">
                    {correct}/{total}
                  </p>
                  <p className="text-xs text-slate-400 uppercase tracking-wide">Richtig</p>
                </div>
                <div className="text-center p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/30">
                  <div className="w-6 h-6 mx-auto text-blue-500 mb-2 font-bold text-lg">%</div>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-300">{percentage}%</p>
                  <p className="text-xs text-slate-400 uppercase tracking-wide">Quote</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 h-14 rounded-xl border-2 text-slate-600 hover:bg-slate-50"
                  onClick={onHome}
                >
                  <Home className="w-5 h-5 mr-2" />
                  Startseite
                </Button>
                <Button
                  className="flex-1 h-14 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25"
                  onClick={onRestart}
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Nochmal spielen
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

