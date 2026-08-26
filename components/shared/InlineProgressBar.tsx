'use client';

import { useTranslations } from 'next-intl';

interface InlineProgressBarProps {
  /** When false the bar is fully hidden. */
  active: boolean;
  /** Override the absolute positioning when used inside a non-relative parent. */
  className?: string;
}

/**
 * 2px tall indeterminate progress bar used to signal background fetches in
 * already-rendered views (e.g. PatientProfile refreshing on top of cached
 * data). Pure CSS, no framer-motion / no extra deps.
 *
 * The bar uses absolute positioning by default so it can sit at the top of
 * a card or section without affecting layout. Wrap the section in a
 * `relative` container to anchor it correctly.
 */
export function InlineProgressBar({ active, className = '' }: InlineProgressBarProps) {
  const tCommon = useTranslations('common');
  if (!active) return null;
  return (
    <div
      role="progressbar"
      aria-busy="true"
      aria-label={tCommon('fetchingFresh')}
      className={`pointer-events-none absolute inset-x-0 top-0 z-10 h-0.5 overflow-hidden bg-medical-primary/10 ${className}`}
    >
      <div className="ip-bar h-full w-1/3 bg-medical-primary" />
      <style jsx>{`
        .ip-bar {
          animation: ip-slide 1.4s ease-in-out infinite;
        }
        @keyframes ip-slide {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(150%);
          }
          100% {
            transform: translateX(350%);
          }
        }
      `}</style>
    </div>
  );
}
