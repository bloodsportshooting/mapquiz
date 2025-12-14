import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { createPageUrl, isPointInPolygon } from '@/utils';
import { mapStore } from '@/api/mapStore';
import { Home, RotateCcw, ChevronDown, MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import GameStats from '@/components/quiz/GameStats';
import MapDisplay from '@/components/quiz/MapDisplay';
import FeedbackOverlay from '@/components/quiz/FeedbackOverlay';
import ResultsModal from '@/components/quiz/ResultsModal';

export default function Quiz() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const mode = urlParams.get('mode') || 'click';

  const [selectedMapId, setSelectedMapId] = useState(null);
  const [currentPinIndex, setCurrentPinIndex] = useState(0);
  const [shuffledPins, setShuffledPins] = useState([]);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(false);
  const [clickPosition, setClickPosition] = useState(null);
  const [showCorrectPosition, setShowCorrectPosition] = useState(false);
  const [userInput, setUserInput] = useState('');

  const inputRef = useRef(null);
  const feedbackTimeoutRef = useRef(null);

  const { data: maps = [], isLoading } = useQuery({
    queryKey: ['maps'],
    queryFn: () => mapStore.list(),
  });

  useEffect(() => {
    if (maps.length > 0 && !selectedMapId) {
      setSelectedMapId(maps[0].id);
    }
  }, [maps, selectedMapId]);

  const currentMap = maps.find((m) => m.id === selectedMapId);
  const currentPin = shuffledPins[currentPinIndex];
  const totalPins = shuffledPins.length;

  const clearFeedbackTimeout = useCallback(() => {
    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
      feedbackTimeoutRef.current = null;
    }
  }, []);

  const startGame = useCallback(() => {
    if (!currentMap?.pins?.length) return;

    clearFeedbackTimeout();

    const shuffled = [...currentMap.pins].sort(() => Math.random() - 0.5);
    setShuffledPins(shuffled);
    setCurrentPinIndex(0);
    setScore(0);
    setTime(0);
    setGameStarted(true);
    setGameEnded(false);
    setIsRunning(false);
    setClickPosition(null);
    setShowCorrectPosition(false);
    setUserInput('');
    setShowFeedback(false);
  }, [clearFeedbackTimeout, currentMap]);

  useEffect(() => {
    if (currentMap?.pins?.length) {
      startGame();
    }
  }, [currentMap, startGame]);

  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setTime((t) => t + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  useEffect(() => {
    if (mode === 'type' && gameStarted && !showFeedback && inputRef.current) {
      inputRef.current.focus();
    }
  }, [mode, gameStarted, showFeedback, currentPinIndex]);

  const resetGame = useCallback(() => {
    startGame();
  }, [startGame]);

  const handleMapClick = (x, y) => {
    if (!gameStarted || showFeedback || mode !== 'click' || !currentPin) return;

    if (!isRunning) {
      setIsRunning(true);
    }

    setClickPosition({ x, y });

    const isArea = currentPin.type === 'area' && Array.isArray(currentPin.vertices);
    const isInsideArea = isArea ? isPointInPolygon({ x, y }, currentPin.vertices) : false;
    const distance = !isArea ? Math.sqrt(Math.pow(x - currentPin.x, 2) + Math.pow(y - currentPin.y, 2)) : null;
    const isCorrect = isArea ? isInsideArea : distance <= 5;

    setLastAnswerCorrect(isCorrect);
    if (isCorrect) setScore((s) => s + 1);
    setShowCorrectPosition(true);
    setShowFeedback(true);

    clearFeedbackTimeout();
    feedbackTimeoutRef.current = setTimeout(() => {
      feedbackTimeoutRef.current = null;
      advanceToNext();
    }, 750);
  };

  const handleTypeSubmit = (e) => {
    e.preventDefault();
    if (!gameStarted || showFeedback || mode !== 'type') return;

    if (!isRunning) {
      setIsRunning(true);
    }

    const normalizedInput = userInput.trim().toLowerCase();
    const normalizedAnswer = currentPin.name.toLowerCase();

    const isCorrect =
      normalizedInput === normalizedAnswer ||
      (normalizedAnswer.includes(normalizedInput) && normalizedInput.length >= 3);

    setLastAnswerCorrect(isCorrect);
    if (isCorrect) setScore((s) => s + 1);
    setShowFeedback(true);

    clearFeedbackTimeout();
    feedbackTimeoutRef.current = setTimeout(() => {
      feedbackTimeoutRef.current = null;
      advanceToNext();
    }, 750);
  };

  const advanceToNext = useCallback(() => {
    setShowFeedback(false);
    setClickPosition(null);
    setShowCorrectPosition(false);
    setUserInput('');

    if (currentPinIndex + 1 >= totalPins) {
      setIsRunning(false);
      setGameEnded(true);
    } else {
      setCurrentPinIndex((i) => i + 1);
    }
  }, [currentPinIndex, totalPins]);

  useEffect(() => {
    return () => {
      clearFeedbackTimeout();
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-100 rounded-full opacity-30 blur-3xl dark:bg-blue-900/30" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-100 rounded-full opacity-30 blur-3xl dark:bg-indigo-900/30" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 py-6 md:py-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(createPageUrl('Home'))}
              className="rounded-xl hover:bg-slate-100"
            >
              <Home className="w-5 h-5" />
            </Button>

            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                {mode === 'click' ? 'Klick-Modus' : 'Eingabe-Modus'}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-300">
                {mode === 'click' ? 'Klicke auf die richtige Position' : 'Gib den Namen des Ortes ein'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {maps.length > 1 && (
              <div className="relative">
                <select
                  value={selectedMapId || ''}
                  onChange={(e) => {
                    setSelectedMapId(e.target.value);
                  }}
                  className="w-48 rounded-xl border border-slate-200 bg-white h-10 px-3 pr-10 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 appearance-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                >
                  {maps.map((map) => (
                    <option key={map.id} value={map.id}>
                      {map.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            )}

            <Button
              variant="outline"
              onClick={resetGame}
              className="rounded-xl"
              disabled={!gameStarted}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Zurücksetzen
            </Button>
          </div>
        </div>

        {gameStarted && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-4 shadow-lg shadow-slate-200/50 border border-slate-100 mb-6 dark:bg-slate-900 dark:border-slate-800 dark:shadow-slate-900/50"
          >
            <GameStats time={time} correct={score} total={currentPinIndex + (showFeedback ? 1 : 0)} />
          </motion.div>
        )}

        <div className="bg-white rounded-3xl p-4 md:p-6 shadow-xl shadow-slate-200/50 border border-slate-100 dark:bg-slate-900 dark:border-slate-800 dark:shadow-slate-900/50">
          {gameStarted && currentPin && (
            <motion.div
              key={currentPinIndex}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4"
            >
              {mode === 'click' ? (
                <div className="flex items-center justify-center gap-3 py-4">
                  <MapPin className="w-6 h-6 text-rose-500" />
                  <span className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100">{currentPin.name}</span>
                  <span className="text-slate-400 dark:text-slate-300 text-sm">({currentPinIndex + 1}/{totalPins})</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3 py-2">
                  <span className="text-slate-400 dark:text-slate-300 text-sm">Frage {currentPinIndex + 1} von {totalPins}</span>
                </div>
              )}
            </motion.div>
          )}

          <div className="relative">
            <MapDisplay
              imageBase64={currentMap?.imageBase64}
              mode={mode}
              currentPin={currentPin}
              onMapClick={handleMapClick}
              clickPosition={clickPosition}
              showCorrectPosition={showCorrectPosition}
              disabled={showFeedback || !currentPin}
            />

            <FeedbackOverlay
              show={showFeedback}
              isCorrect={lastAnswerCorrect}
              correctAnswer={mode === 'type' ? currentPin?.name : null}
            />
          </div>

          {mode === 'type' && gameStarted && !gameEnded && (
            <motion.form
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleTypeSubmit}
              className="mt-6 flex gap-3"
            >
              <Input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Name des Ortes eingeben..."
                disabled={showFeedback}
                className="flex-1 h-14 rounded-xl text-lg px-5"
                autoComplete="off"
              />
              <Button
                type="submit"
                disabled={showFeedback || !userInput.trim()}
                className="h-14 px-8 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                Prüfen
              </Button>
            </motion.form>
          )}
        </div>
      </div>

      <ResultsModal
        show={gameEnded}
        time={time}
        correct={score}
        total={totalPins}
        onRestart={startGame}
        onHome={() => navigate(createPageUrl('Home'))}
      />
    </div>
  );
}

