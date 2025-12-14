import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MousePointer2, Keyboard, MapPin, Globe2, Plus } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-100 rounded-full opacity-50 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-100 rounded-full opacity-50 blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 py-12 md:py-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-xl shadow-blue-500/30 mb-6">
            <Globe2 className="w-10 h-10 text-white" strokeWidth={1.5} />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
            Geographie-Quiz
          </h1>
          <p className="text-lg text-slate-500 max-w-md mx-auto">
            Teste dein Wissen über Städte, Länder und Regionen auf interaktiven Karten.
          </p>
        </motion.div>

        {/* Game Mode Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto"
        >
          {/* Click Mode */}
          <Link to={createPageUrl('Quiz') + '?mode=click'}>
            <motion.div
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              className="group relative bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden cursor-pointer"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-100 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 opacity-60 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-shadow">
                  <MousePointer2 className="w-8 h-8 text-white" strokeWidth={1.5} />
                </div>
                
                <h2 className="text-2xl font-bold text-slate-800 mb-3">
                  Klick-Modus
                </h2>
                
                <p className="text-slate-500 leading-relaxed">
                  Ein Ortsname wird angezeigt. Klicke auf die richtige Position auf der Karte.
                </p>

                <div className="mt-6 flex items-center text-blue-600 font-medium">
                  <span>Spielen</span>
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </motion.div>
          </Link>

          {/* Type Mode */}
          <Link to={createPageUrl('Quiz') + '?mode=type'}>
            <motion.div
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              className="group relative bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden cursor-pointer"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-indigo-100 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 opacity-60 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-shadow">
                  <Keyboard className="w-8 h-8 text-white" strokeWidth={1.5} />
                </div>
                
                <h2 className="text-2xl font-bold text-slate-800 mb-3">
                  Eingabe-Modus
                </h2>
                
                <p className="text-slate-500 leading-relaxed">
                  Ein Pin wird auf der Karte angezeigt. Gib den Namen des Ortes ein.
                </p>

                <div className="mt-6 flex items-center text-indigo-600 font-medium">
                  <span>Spielen</span>
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </motion.div>
          </Link>
        </motion.div>

        {/* Create Quiz Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 text-center"
        >
          <Link to={createPageUrl('CreateQuiz')}>
            <Button
              variant="outline"
              className="rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50 px-6 h-12"
            >
              <Plus className="w-4 h-4 mr-2" />
              Eigenes Quiz erstellen
            </Button>
          </Link>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <div className="flex items-center justify-center gap-2 text-slate-400">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">Lerne die Welt kennen</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}