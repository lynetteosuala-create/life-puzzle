import React, { useState } from 'react';
import { 
  Brain, 
  HeartHandshake, 
  Target, 
  Coins, 
  BookOpen, 
  Sprout, 
  Sparkles, 
  CheckCircle2, 
  Lock, 
  Puzzle, 
  ChevronRight, 
  Award, 
  Zap, 
  Info,
  Maximize2,
  Filter
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { LifeDomain, PuzzlePiece, UserProgress } from '../types/puzzle';
import { DOMAINS } from '../data/puzzleData';

interface PuzzleBoardProps {
  pieces: PuzzlePiece[];
  userProgress: UserProgress;
  onPlacePiece: (pieceId: string) => void;
  onUnlockWithGems: (pieceId: string, gemCost: number) => void;
  onSelectPieceWisdom: (piece: PuzzlePiece) => void;
}

export const PuzzleBoard: React.FC<PuzzleBoardProps> = ({
  pieces,
  userProgress,
  onPlacePiece,
  onUnlockWithGems,
  onSelectPieceWisdom,
}) => {
  const [selectedDomain, setSelectedDomain] = useState<LifeDomain | 'all'>('all');
  const [activePieceDetail, setActivePieceDetail] = useState<PuzzlePiece | null>(
    pieces.find(p => p.placedOnBoard) || pieces[0]
  );

  const getDomainIcon = (domain: LifeDomain) => {
    switch (domain) {
      case 'mind': return <Brain className="w-4 h-4" />;
      case 'relationships': return <HeartHandshake className="w-4 h-4" />;
      case 'goals': return <Target className="w-4 h-4" />;
      case 'money': return <Coins className="w-4 h-4" />;
      case 'learning': return <BookOpen className="w-4 h-4" />;
      case 'growth': return <Sprout className="w-4 h-4" />;
      case 'happiness': return <Sparkles className="w-4 h-4" />;
    }
  };

  const handleSnapPiece = (piece: PuzzlePiece, e: React.MouseEvent) => {
    e.stopPropagation();
    onPlacePiece(piece.id);
    setActivePieceDetail(piece);

    // Confetti celebration
    try {
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { x, y },
        colors: [DOMAINS[piece.domain].color, '#f59e0b', '#10b981', '#6366f1'],
      });
    } catch {
      // ignore
    }
  };

  const filteredPieces = selectedDomain === 'all' 
    ? pieces 
    : pieces.filter(p => p.domain === selectedDomain);

  const placedCount = pieces.filter(p => p.placedOnBoard).length;
  const unlockedCount = pieces.filter(p => p.unlocked).length;
  const totalCount = pieces.length;
  const completionPercentage = Math.round((placedCount / totalCount) * 100);

  return (
    <div className="space-y-6">
      {/* Board Banner & Overall Progress */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900 via-purple-900 to-zinc-900 text-white p-6 sm:p-8 shadow-xl border border-indigo-500/20">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-md text-indigo-200 border border-white/10">
              <Puzzle className="w-3.5 h-3.5 text-indigo-300" />
              <span>Interactive Life Canvas</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Build a Better Life, One Piece at a Time.
            </h2>
            <p className="text-sm text-indigo-200/90 leading-relaxed">
              Your Life Puzzle is an interconnected mosaic of seven vital domains. Complete micro-quests, make wise choices, and snap pieces into place to expand your holistic life mastery.
            </p>
          </div>

          {/* Completion Ring Card */}
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 shrink-0">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-white/20"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-amber-400 transition-all duration-1000 ease-out"
                  strokeDasharray={`${completionPercentage}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute font-extrabold text-sm">{completionPercentage}%</div>
            </div>
            <div>
              <div className="text-xs uppercase font-bold tracking-wider text-indigo-200">Mosaic Slotted</div>
              <div className="text-xl font-black">{placedCount} / {totalCount} <span className="text-xs font-normal text-indigo-300">pieces</span></div>
              <div className="text-[11px] text-amber-300 font-medium">{unlockedCount - placedCount} waiting to be slotted</div>
            </div>
          </div>
        </div>
      </div>

      {/* Domain Navigation Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          type="button"
          onClick={() => setSelectedDomain('all')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shadow-xs ${
            selectedDomain === 'all'
              ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-md'
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          <span>All 7 Domains ({pieces.length})</span>
        </button>

        {Object.values(DOMAINS).map((dm) => {
          const domainPieces = pieces.filter(p => p.domain === dm.id);
          const domainPlaced = domainPieces.filter(p => p.placedOnBoard).length;
          const isSelected = selectedDomain === dm.id;

          return (
            <button
              key={dm.id}
              type="button"
              onClick={() => setSelectedDomain(dm.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap border ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-50/80 text-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-200 shadow-sm'
                  : 'border-transparent bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/80 dark:hover:bg-zinc-700/60'
              }`}
            >
              <span style={{ color: dm.color }}>{getDomainIcon(dm.id)}</span>
              <span>{dm.name}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isSelected ? 'bg-indigo-200 dark:bg-indigo-800 text-indigo-900 dark:text-indigo-100' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400'}`}>
                {domainPlaced}/{domainPieces.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Grid: Puzzle Canvas + Detail Inspection Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Puzzle Pieces Visual Board (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-4 sm:p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Puzzle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Life Puzzle Mosaic Grid</span>
              </h3>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                Click any piece to inspect or slot into board
              </span>
            </div>

            {/* Pieces Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {filteredPieces.map((piece) => {
                const domainMeta = DOMAINS[piece.domain];
                const isSelected = activePieceDetail?.id === piece.id;

                return (
                  <div
                    key={piece.id}
                    onClick={() => {
                      setActivePieceDetail(piece);
                      onSelectPieceWisdom(piece);
                    }}
                    role="button"
                    tabIndex={0}
                    className={`relative p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer overflow-hidden group flex flex-col justify-between min-h-[160px] ${
                      isSelected
                        ? 'ring-2 ring-indigo-500 shadow-md'
                        : 'hover:shadow-md'
                    } ${
                      piece.placedOnBoard
                        ? 'bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-800/90 border-zinc-200 dark:border-zinc-700'
                        : piece.unlocked
                        ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-300 dark:border-amber-700/60 border-dashed animate-pulse'
                        : 'bg-zinc-100/60 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800 opacity-75'
                    }`}
                  >
                    {/* Top status & Domain Indicator */}
                    <div className="flex items-center justify-between gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold ${domainMeta.lightBg}`}>
                        {getDomainIcon(piece.domain)}
                        <span>{domainMeta.name}</span>
                      </span>

                      {piece.placedOnBoard ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Slotted</span>
                        </span>
                      ) : piece.unlocked ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/60 px-1.5 py-0.5 rounded">
                          <Zap className="w-3 h-3" />
                          <span>Ready!</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-500 bg-zinc-200/70 dark:bg-zinc-700/60 px-1.5 py-0.5 rounded">
                          <Lock className="w-3 h-3" />
                          <span>Locked</span>
                        </span>
                      )}
                    </div>

                    {/* Piece Title & Skill */}
                    <div className="my-2.5">
                      <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {piece.title}
                      </h4>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
                        {piece.skillName}
                      </div>
                      <p className="text-[11px] text-zinc-600 dark:text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                        {piece.summary}
                      </p>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between text-xs">
                      <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                        +{piece.xpValue} XP
                      </span>

                      {piece.placedOnBoard ? (
                        <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                          Inspect <ChevronRight className="w-3 h-3" />
                        </span>
                      ) : piece.unlocked ? (
                        <button
                          type="button"
                          onClick={(e) => handleSnapPiece(piece, e)}
                          className="px-2.5 py-1 rounded-md bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] shadow-sm flex items-center gap-1 transition-transform active:scale-95"
                        >
                          <Puzzle className="w-3 h-3" />
                          <span>Snap In</span>
                        </button>
                      ) : (
                        piece.gemCost && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (userProgress.gems >= (piece.gemCost || 0)) {
                                onUnlockWithGems(piece.id, piece.gemCost || 0);
                              }
                            }}
                            disabled={userProgress.gems < (piece.gemCost || 0)}
                            className="px-2 py-0.5 rounded bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-[10px] font-semibold text-zinc-800 dark:text-zinc-200 disabled:opacity-50"
                          >
                            💎 {piece.gemCost} gems
                          </button>
                        )
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected Piece Deep Wisdom Inspection Drawer (1 Col) */}
        <div className="space-y-4">
          {activePieceDetail ? (
            <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm sticky top-20 space-y-4">
              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${DOMAINS[activePieceDetail.domain].lightBg}`}>
                  {getDomainIcon(activePieceDetail.domain)}
                  <span>{DOMAINS[activePieceDetail.domain].name} Domain</span>
                </span>
                <span className="text-xs font-semibold text-zinc-400">
                  Tier {activePieceDetail.tier} Mastery
                </span>
              </div>

              <div>
                <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100">
                  {activePieceDetail.title}
                </h3>
                <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">
                  Skill: {activePieceDetail.skillName}
                </p>
              </div>

              {/* Status Notice */}
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-between text-xs">
                <span className="font-medium text-zinc-600 dark:text-zinc-400">Board Status:</span>
                {activePieceDetail.placedOnBoard ? (
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Slotted into Life Canvas
                  </span>
                ) : activePieceDetail.unlocked ? (
                  <button
                    type="button"
                    onClick={(e) => handleSnapPiece(activePieceDetail, e)}
                    className="font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                  >
                    <Puzzle className="w-3.5 h-3.5" />
                    Click here to slot into mosaic!
                  </button>
                ) : (
                  <span className="font-bold text-zinc-400 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5" />
                    Locked (Earn in Quests / Dilemmas)
                  </span>
                )}
              </div>

              {/* Deep Wisdom Text */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" />
                  <span>The Core Life Lesson</span>
                </h4>
                <div className="p-3.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed font-sans">
                  {activePieceDetail.fullWisdom}
                </div>
              </div>

              {/* Practical Micro-Action Step */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>Interactive Action Prompt</span>
                </h4>
                <div className="p-3.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/50 text-xs text-amber-900 dark:text-amber-200 font-medium leading-relaxed">
                  {activePieceDetail.actionPrompt}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-zinc-400">
                <span>Value: {activePieceDetail.xpValue} XP</span>
                {activePieceDetail.dateUnlocked && (
                  <span>Unlocked: {activePieceDetail.dateUnlocked}</span>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-zinc-400 text-sm">
              Select any piece to inspect its wisdom.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
