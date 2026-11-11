import React, { useState } from 'react';
import { 
  Sparkles, 
  HelpCircle, 
  CheckCircle2, 
  ArrowRight, 
  Loader2, 
  Award, 
  Brain, 
  RotateCcw,
  Zap,
  Puzzle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { LifeDilemma, PuzzlePiece } from '../types/puzzle';
import { DOMAINS } from '../data/puzzleData';

interface DilemmaSimulatorProps {
  dilemmas: LifeDilemma[];
  onRewardGranted: (xp: number, pieceRewardId?: string) => void;
  unlockedPieceIds: string[];
}

export const DilemmaSimulator: React.FC<DilemmaSimulatorProps> = ({
  dilemmas,
  onRewardGranted,
  unlockedPieceIds,
}) => {
  const [selectedDilemmaIndex, setSelectedDilemmaIndex] = useState(0);
  const [chosenOptionId, setChosenOptionId] = useState<string | null>(null);
  const [customAnswer, setCustomAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiEvaluation, setAiEvaluation] = useState<string | null>(null);
  const [earnedReward, setEarnedReward] = useState<{ xp: number; pieceId?: string } | null>(null);

  const currentDilemma = dilemmas[selectedDilemmaIndex] || dilemmas[0];
  const domainMeta = DOMAINS[currentDilemma.domain];

  const handleSelectOption = async (option: typeof currentDilemma.choices[0]) => {
    setChosenOptionId(option.id);
    setIsSubmitting(true);
    setAiEvaluation(null);

    try {
      const response = await fetch('/api/ai/guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'dilemma_choice',
          prompt: option.text,
          context: {
            scenarioTitle: currentDilemma.title,
            scenarioText: currentDilemma.context,
            domain: currentDilemma.domain,
            chosenPhilosophy: option.philosophy,
            consequence: option.consequence,
          },
        }),
      });

      const data = await response.json();
      setAiEvaluation(data.text || option.consequence);
      setEarnedReward({ xp: option.xpGained, pieceId: option.puzzlePieceRewardId });
      onRewardGranted(option.xpGained, option.puzzlePieceRewardId);

      // Trigger Confetti
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.7 },
      });
    } catch {
      setAiEvaluation(option.consequence);
      setEarnedReward({ xp: option.xpGained, pieceId: option.puzzlePieceRewardId });
      onRewardGranted(option.xpGained, option.puzzlePieceRewardId);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customAnswer.trim()) return;

    setChosenOptionId('custom');
    setIsSubmitting(true);
    setAiEvaluation(null);

    try {
      const response = await fetch('/api/ai/guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'dilemma_choice',
          prompt: customAnswer,
          context: {
            scenarioTitle: currentDilemma.title,
            scenarioText: currentDilemma.context,
            domain: currentDilemma.domain,
            isCustom: true,
          },
        }),
      });

      const data = await response.json();
      setAiEvaluation(data.text || 'Insightful response! Thinking outside the given options reveals high creative agency.');
      setEarnedReward({ xp: 120 });
      onRewardGranted(120);

      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch {
      setAiEvaluation('Great creative solution! Reflecting authentically builds self-trust.');
      setEarnedReward({ xp: 120 });
      onRewardGranted(120);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextDilemma = () => {
    setChosenOptionId(null);
    setAiEvaluation(null);
    setEarnedReward(null);
    setCustomAnswer('');
    setSelectedDilemmaIndex((prev) => (prev + 1) % dilemmas.length);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Dilemma Simulator</span>
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-1">
            Choices Shape Your Life Puzzle
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Test your ethics, emotional maturity, and decision frameworks in realistic branch scenarios.
          </p>
        </div>

        {/* Dilemma Selector */}
        <div className="flex items-center gap-2">
          {dilemmas.map((d, index) => (
            <button
              key={d.id}
              type="button"
              onClick={() => {
                setSelectedDilemmaIndex(index);
                setChosenOptionId(null);
                setAiEvaluation(null);
                setEarnedReward(null);
                setCustomAnswer('');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedDilemmaIndex === index
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              Scenario {index + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Dilemma Card */}
      <div className="p-6 sm:p-8 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-md space-y-6">
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${domainMeta.lightBg}`}>
            {domainMeta.name}
          </span>
          <span className="text-xs font-semibold text-zinc-400">
            Dilemma #{selectedDilemmaIndex + 1}
          </span>
        </div>

        <div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
            {currentDilemma.title}
          </h3>
          <p className="mt-3 text-sm sm:text-base text-zinc-700 dark:text-zinc-300 leading-relaxed bg-zinc-50 dark:bg-zinc-800/40 p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-700/60">
            {currentDilemma.context}
          </p>
        </div>

        {/* Choices Options */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Select Your Action:
          </h4>
          <div className="grid grid-cols-1 gap-3">
            {currentDilemma.choices.map((choice) => {
              const isSelected = chosenOptionId === choice.id;

              return (
                <button
                  key={choice.id}
                  type="button"
                  onClick={() => handleSelectOption(choice)}
                  disabled={isSubmitting || !!aiEvaluation}
                  className={`w-full p-4 rounded-xl border text-left transition-all flex items-start justify-between gap-4 ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20'
                      : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 bg-white dark:bg-zinc-900/50'
                  } ${isSubmitting ? 'opacity-70 cursor-wait' : ''}`}
                >
                  <div className="space-y-1 min-w-0">
                    <p className="font-semibold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
                      {choice.text}
                    </p>
                    <span className="inline-block text-xs text-zinc-500 dark:text-zinc-400 italic">
                      Approach: {choice.philosophy}
                    </span>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded">
                      +{choice.xpGained} XP
                    </span>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Answer Alternative */}
        {!aiEvaluation && (
          <form onSubmit={handleCustomSubmit} className="pt-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
              Or write your own custom approach:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customAnswer}
                onChange={(e) => setCustomAnswer(e.target.value)}
                placeholder="What would you realistically say or do here?"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={!customAnswer.trim() || isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold text-xs uppercase tracking-wider hover:opacity-90 disabled:opacity-50 transition-opacity shrink-0"
              >
                Submit Custom
              </button>
            </div>
          </form>
        )}

        {/* Loading Spinner */}
        {isSubmitting && (
          <div className="p-6 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 flex items-center justify-center gap-3 text-indigo-700 dark:text-indigo-300">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm font-semibold">Aria (AI Guide) is analyzing the ripple effects of your choice...</span>
          </div>
        )}

        {/* AI Life Guide Wisdom Feedback Card */}
        {aiEvaluation && (
          <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50 via-purple-50 to-white dark:from-indigo-950/40 dark:via-purple-950/30 dark:to-zinc-900 border border-indigo-200 dark:border-indigo-800/60 space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-600 text-white shadow-xs">
                <Brain className="w-3.5 h-3.5" />
                <span>AI Life Guide Analysis</span>
              </span>

              {earnedReward && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/50 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" />
                    +{earnedReward.xp} XP Earned
                  </span>
                  {earnedReward.pieceId && (
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/50 px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Puzzle className="w-3.5 h-3.5" />
                      Puzzle Piece Unlocked!
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 whitespace-pre-line leading-relaxed font-sans">
              {aiEvaluation}
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-indigo-100 dark:border-indigo-900/50">
              <button
                type="button"
                onClick={() => {
                  setChosenOptionId(null);
                  setAiEvaluation(null);
                  setEarnedReward(null);
                  setCustomAnswer('');
                }}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Try Different Option</span>
              </button>

              <button
                type="button"
                onClick={handleNextDilemma}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-colors"
              >
                <span>Next Scenario</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
