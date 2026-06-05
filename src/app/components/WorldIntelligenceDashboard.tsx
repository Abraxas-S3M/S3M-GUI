import { useState } from 'react';
import { ArrowLeft, AlertTriangle, Globe2, RadioTower } from 'lucide-react';
import { useNavigate } from 'react-router';
import { S3M_API_BASE_URL } from '../../services/api/config';
import { useConnectionStore } from '../connectionStore';
import { useAppStore } from '../store';

const WORLD_INTELLIGENCE_RUNTIME_URL = S3M_API_BASE_URL
  ? `${S3M_API_BASE_URL}/world-intelligence/runtime/`
  : undefined;

export function WorldIntelligenceDashboard() {
  const navigate = useNavigate();
  const { currentTime, setDashboardMode } = useAppStore();
  const apiStatus = useConnectionStore((state) => state.apiStatus);
  const [isRuntimeLoading, setIsRuntimeLoading] = useState(Boolean(WORLD_INTELLIGENCE_RUNTIME_URL));
  const [hasRuntimeError, setHasRuntimeError] = useState(false);

  const runtimeUnavailable = !WORLD_INTELLIGENCE_RUNTIME_URL || hasRuntimeError;

  const returnToS3M = () => {
    setDashboardMode('s3m');
    navigate('/dashboard');
  };

  const statusTone =
    apiStatus === 'healthy'
      ? 'text-s3m-success'
      : apiStatus === 'degraded'
        ? 'text-s3m-warning'
        : apiStatus === 'unavailable'
          ? 'text-destructive'
          : 'text-cyber-text-tertiary';

  return (
    <div className="h-screen w-screen overflow-hidden bg-s3m-base text-s3m-text-primary">
      <div className="flex h-full flex-col">
        <div
          className="flex h-16 items-center gap-4 border-b border-cyber-glass-border bg-cyber-deep/55 px-6"
          style={{ backdropFilter: 'blur(15px)' }}
        >
          <div
            className="font-display text-[22px] font-bold tracking-[0.15em] text-cyber-cyan"
            style={{ textShadow: '0 0 20px rgba(0, 240, 255, 0.8)' }}
          >
            ABRAXAS S3M
          </div>

          <button
            type="button"
            aria-pressed="true"
            className="px-3 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-[0.18em] text-cyber-void"
            style={{
              background: '#00F0FF',
              border: '1px solid rgba(0, 240, 255, 0.85)',
              boxShadow: '0 0 22px rgba(0, 240, 255, 0.65)'
            }}
            title="World Intelligence active"
          >
            WORLD INTELLIGENCE
          </button>

          <div className="flex-1" />

          <div
            className={`hidden items-center gap-2 rounded-lg px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] sm:flex ${statusTone}`}
            style={{ border: '1px solid rgba(0, 240, 255, 0.22)' }}
          >
            <RadioTower className="h-3.5 w-3.5" />
            S3M Core Runtime
          </div>

          <div className="font-mono text-[16px] font-semibold tracking-wider text-cyber-cyan" style={{ textShadow: '0 0 16px rgba(0, 240, 255, 0.6)' }}>
            {currentTime}
          </div>

          <button
            type="button"
            onClick={returnToS3M}
            className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-cyber-text-tertiary transition-all duration-300 hover:text-cyber-cyan"
            style={{
              border: '1px solid rgba(0, 240, 255, 0.28)',
              background: 'rgba(0, 240, 255, 0.04)'
            }}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Return to S3M Dashboard
          </button>
        </div>

        <div className="min-h-0 flex-1 bg-cyber-void">
          <div
            className="relative h-full overflow-hidden border-t border-cyber-glass-border"
            style={{
              boxShadow: 'inset 0 0 40px rgba(0, 240, 255, 0.08)'
            }}
          >
            {runtimeUnavailable ? (
              <div className="flex h-full items-center justify-center bg-s3m-base p-6">
                <div
                  className="max-w-2xl rounded-2xl p-8 text-center"
                  style={{
                    background: 'rgba(10, 10, 18, 0.92)',
                    border: '1px solid rgba(255, 184, 0, 0.35)',
                    boxShadow: '0 0 28px rgba(255, 184, 0, 0.14)'
                  }}
                >
                  <AlertTriangle className="mx-auto mb-4 h-10 w-10 text-s3m-warning" />
                  <h1 className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-s3m-text-primary">
                    World Intelligence
                  </h1>
                  <p className="text-sm leading-6 text-s3m-text-secondary">
                    World Intelligence is temporarily unavailable. Backend fallback remains active if configured.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {isRuntimeLoading && (
                  <div
                    className="absolute inset-0 z-10 flex items-center justify-center bg-s3m-base/92"
                    style={{ backdropFilter: 'blur(10px)' }}
                  >
                    <div
                      className="flex items-center gap-3 rounded-xl px-5 py-4"
                      style={{
                        border: '1px solid rgba(0, 240, 255, 0.32)',
                        background: 'rgba(0, 240, 255, 0.06)',
                        boxShadow: '0 0 24px rgba(0, 240, 255, 0.16)'
                      }}
                    >
                      <Globe2 className="h-5 w-5 text-cyber-cyan" />
                      <span className="text-[12px] font-semibold uppercase tracking-[0.2em] text-cyber-cyan">
                        World Intelligence runtime loading...
                      </span>
                    </div>
                  </div>
                )}

                <iframe
                  title="World Intelligence"
                  src={WORLD_INTELLIGENCE_RUNTIME_URL}
                  className="h-full w-full border-0 bg-cyber-void"
                  referrerPolicy="no-referrer"
                  onLoad={() => setIsRuntimeLoading(false)}
                  onError={() => {
                    setIsRuntimeLoading(false);
                    setHasRuntimeError(true);
                  }}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
