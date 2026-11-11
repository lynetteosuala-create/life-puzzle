import React, { useState } from 'react';
import { ExternalLink, ShieldCheck, ShieldAlert, AlertTriangle, X, Globe, Lock } from 'lucide-react';
import { LinkPreviewMetadata } from '../types/puzzle';

interface LinkPreviewCardProps {
  preview: LinkPreviewMetadata;
  compact?: boolean;
  onOpenWarning?: (preview: LinkPreviewMetadata) => void;
  onRemove?: () => void;
  className?: string;
}

export const LinkPreviewCard: React.FC<LinkPreviewCardProps> = ({
  preview,
  compact = false,
  onOpenWarning,
  onRemove,
  className = '',
}) => {
  const [imageFailed, setImageFailed] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (preview.isSuspicious || preview.riskLevel === 'danger' || preview.riskLevel === 'caution') {
      if (onOpenWarning) {
        onOpenWarning(preview);
        return;
      }
    }

    // Direct open if safe
    window.open(preview.url, '_blank', 'noopener,noreferrer');
  };

  const isDanger = preview.riskLevel === 'danger';
  const isCaution = preview.riskLevel === 'caution';
  const isSafe = preview.riskLevel === 'safe' && !preview.isSuspicious;

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick(e as any);
        }
      }}
      className={`group relative text-left w-full overflow-hidden rounded-xl border transition-all duration-200 cursor-pointer ${
        isDanger
          ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900/60 hover:border-rose-400 hover:shadow-md hover:shadow-rose-500/5'
          : isCaution
          ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-300 dark:border-amber-900/60 hover:border-amber-400 hover:shadow-md hover:shadow-amber-500/5'
          : 'bg-zinc-50/80 dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-800 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-md'
      } ${className}`}
    >
      {/* Remove Button if preview in composer */}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute top-2 right-2 z-10 p-1 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm transition-colors"
          title="Remove preview"
          aria-label="Remove link preview"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Security Status Tag Banner */}
      <div className="px-3 py-1.5 border-b border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between text-[11px] font-medium">
        <div className="flex items-center gap-1.5 truncate text-zinc-600 dark:text-zinc-400">
          {preview.favicon ? (
            <img
              src={preview.favicon}
              alt=""
              className="w-3.5 h-3.5 rounded shrink-0 object-contain"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <Globe className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
          )}
          <span className="font-semibold text-zinc-700 dark:text-zinc-300 truncate">
            {preview.siteName || preview.domain}
          </span>
          <span className="text-zinc-400">•</span>
          <span className="text-zinc-400 truncate max-w-[140px] sm:max-w-[200px]">{preview.domain}</span>
        </div>

        {/* Security Indicator Badge */}
        <div className="shrink-0 flex items-center gap-1">
          {isDanger && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500 text-white">
              <ShieldAlert className="w-3 h-3" />
              <span>Suspicious Link</span>
            </span>
          )}
          {isCaution && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-white">
              <AlertTriangle className="w-3 h-3" />
              <span>Unverified / HTTP</span>
            </span>
          )}
          {isSafe && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50">
              <ShieldCheck className="w-3 h-3" />
              <span>Verified Safe</span>
            </span>
          )}
        </div>
      </div>

      {/* Main Body */}
      <div className={`flex ${compact ? 'flex-col sm:flex-row' : 'flex-col sm:flex-row'}`}>
        {/* Thumbnail Image */}
        {preview.image && !imageFailed ? (
          <div className={`${compact ? 'sm:w-28 h-24' : 'sm:w-44 h-32 sm:h-auto'} relative bg-zinc-200 dark:bg-zinc-800 shrink-0 overflow-hidden`}>
            <img
              src={preview.image}
              alt={preview.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => setImageFailed(true)}
              loading="lazy"
            />
            {preview.isSecure && (
              <span className="absolute bottom-1 left-1 p-0.5 rounded bg-black/60 text-white backdrop-blur-xs text-[9px] flex items-center gap-0.5 px-1">
                <Lock className="w-2.5 h-2.5" />
                <span>SSL</span>
              </span>
            )}
          </div>
        ) : null}

        {/* Text Details */}
        <div className="p-3 sm:p-3.5 flex flex-col justify-between flex-1 min-w-0">
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 leading-snug">
              {preview.title}
            </h4>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
              {preview.description}
            </p>
          </div>

          <div className="mt-2.5 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 pt-1 border-t border-zinc-200/50 dark:border-zinc-800/50">
            <span className="truncate text-zinc-400 max-w-[180px] sm:max-w-[260px]">
              {preview.url.replace(/^https?:\/\//, '')}
            </span>
            <span className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-medium group-hover:translate-x-0.5 transition-transform">
              <span>Visit</span>
              <ExternalLink className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
