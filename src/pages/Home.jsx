import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MousePointer2, Keyboard, MapPin, Globe2, Plus } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-100 rounded-full opacity-50 blur-3xl dark:bg-blue-900/40" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-100 rounded-full opacity-50 blur-3xl dark:bg-indigo-900/40" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 py-12 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-xl shadow-blue-500/30 mb-6">
            <Globe2 className="w-10 h-10 text-white" strokeWidth={1.5} />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-slate-100 mb-4">Geographie-Quiz</h1>
          <p className="text-lg text-slate-500 dark:text-slate-300 max-w-md mx-auto">
            Teste dein Wissen über Städte, Länder und Regionen auf interaktiven Karten.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid md:grid-cols-2 gap-6 mb-10"
        >
          <Link to={`${createPageUrl('Quiz')}?mode=click`} className="block group">
            <div className="h-full bg-white rounded-3xl p-8 shadow-xl shadow-blue-200/40 border border-slate-100 group-hover:-translate-y-1 transition-transform dark:bg-slate-900 dark:border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
                <MousePointer2 className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-3">Klick-Modus</h2>
              <p className="text-slate-500 dark:text-slate-300 mb-6">
                Klicke auf die richtige Position für den angezeigten Ort. Perfekt für visuelle Lerner.
              </p>
              <div className="flex items-center gap-2 text-blue-600 font-semibold">
                Jetzt spielen
              </div>
            </div>
          </Link>

          <Link to={`${createPageUrl('Quiz')}?mode=type`} className="block group">
            <div className="h-full bg-white rounded-3xl p-8 shadow-xl shadow-indigo-200/40 border border-slate-100 group-hover:-translate-y-1 transition-transform dark:bg-slate-900 dark:border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6">
                <Keyboard className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-3">Eingabe-Modus</h2>
              <p className="text-slate-500 dark:text-slate-300 mb-6">
                Gib den Namen des gesuchten Ortes ein. Ideal zum Vertiefen von Ortsnamen.
              </p>
              <div className="flex items-center gap-2 text-indigo-600 font-semibold">
                Jetzt spielen
              </div>
            </div>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white rounded-3xl p-8 shadow-xl shadow-emerald-200/40 border border-slate-100 dark:bg-slate-900 dark:border-slate-800"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Plus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Eigene Karten erstellen</h3>
                <p className="text-slate-500 dark:text-slate-300">
                  Lade eigene Karten hoch, setze Pins und erstelle individuelle Quizze.
                </p>
              </div>
            </div>
            <Button asChild className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 px-6 h-12">
              <Link to={createPageUrl('CreateQuiz')} className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Quiz erstellen
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

