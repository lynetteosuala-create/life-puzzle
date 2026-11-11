import React from 'react';
import { AlertTriangle, ShieldAlert, ExternalLink, ArrowLeft, Lock, Globe } from 'lucide-react';
import { LinkPreviewMetadata } from '../types/puzzle';

interface SuspiciousLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  preview: LinkPreviewMetadata | null;
  onProceed: (url: string) => void;
}

export const SuspiciousLinkModal: React.FC<SuspiciousLinkModalProps> = ({
  isOpen,
  onClose,
  preview,
  onProceed,
}) => {
  if (!isOpen || !preview) return null;

  const isDanger = preview.riskLevel === 'danger';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden transform transition-all"
        role="dialog"
        aria-modal="true"
        aria-labelledby="safety-modal-title"
      >
        {/* Header Banner */}
        <div className={`p-6 ${isDanger ? 'bg-rose-500/10 border-b border-rose-500/20' : 'bg-amber-500/10 border-b border-amber-500/20'} flex items-start gap-4`}>
          <div className={`p-3 rounded-xl shrink-0 ${isDanger ? 'bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'}`}>
            {isDanger ? <ShieldAlert className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
          </div>
          <div>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${isDanger ? 'bg-rose-500 text-white' : 'bg-amber-500 text-white'}`}>
              Security Notice
            </span>
            <h3 id="safety-modal-title" className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-1">
              {isDanger ? 'Potential High-Risk Link Detected' : 'Caution Advised Before Leaving Life Puzzle'}
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
              Our automated link inspection flagged potential safety concerns with this external destination.
            </p>
          </div>
        </div>

        {/* Content Details */}
        <div className="p-6 space-y-4">
          <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200 dark:border-zinc-700/60 font-mono text-xs break-all text-zinc-700 dark:text-zinc-300 flex items-start gap-2.5">
            <Globe className="w-4 h-4 shrink-0 text-zinc-400 mt-0.5" />
            <span>{preview.url}</span>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Why this was flagged:
            </h4>
            <div className={`p-3 rounded-lg text-sm ${isDanger ? 'bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50' : 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50'}`}>
              <p className="font-medium text-xs sm:text-sm">
                {preview.warningReason || 'The website may contain unverified certificates, deceptive prompts, or unencrypted data transmission.'}
              </p>
            </div>
          </div>

          <div className="text-xs text-zinc-500 dark:text-zinc-400 space-y-1">
            <p className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              Never enter passwords, private seeds, or credit card info on unfamiliar websites.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 sm:p-6 bg-zinc-50 dark:bg-zinc-800/40 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm text-zinc-700 dark:text-zinc-200 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700/70 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Stay Safe & Go Back
          </button>

          <button
            type="button"
            onClick={() => {
              onProceed(preview.url);
              onClose();
            }}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm text-white transition-all shadow-md ${isDanger ? 'bg-rose-600 hover:bg-rose-700' : 'bg-amber-600 hover:bg-amber-700'}`}
          >
            <span>Proceed Anyway</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
