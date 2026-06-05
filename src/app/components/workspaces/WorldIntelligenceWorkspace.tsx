import { AlertTriangle, Globe2, RadioTower } from 'lucide-react';
import { S3M_API_BASE_URL } from '../../../services/api/config';

const WORLD_INTELLIGENCE_RUNTIME_URL = S3M_API_BASE_URL
  ? `${S3M_API_BASE_URL}/world-intelligence/runtime/`
  : undefined;

export function WorldIntelligenceWorkspace() {
  if (!WORLD_INTELLIGENCE_RUNTIME_URL) {
    return (
      <div className="h-full p-6 bg-s3m-base">
        <div
          className="h-full rounded-2xl border border-cyber-glass-border bg-cyber-deep/40 p-6"
          style={{
            boxShadow: 'inset 0 0 30px rgba(0, 240, 255, 0.05)',
            backdropFilter: 'blur(12px)'
          }}
        >
          <div className="flex h-full items-center justify-center">
            <div
              className="max-w-xl rounded-xl p-6 text-center"
              style={{
                background: 'rgba(10, 10, 18, 0.88)',
                border: '1px solid rgba(255, 184, 0, 0.35)',
                boxShadow: '0 0 24px rgba(255, 184, 0, 0.12)'
              }}
            >
              <AlertTriangle className="mx-auto mb-4 h-10 w-10 text-s3m-warning" />
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-[0.24em] text-s3m-text-primary">
                World Intelligence Unavailable
              </h2>
              <p className="text-sm leading-6 text-s3m-text-secondary">
                Configure VITE_S3M_API_URL to load the S3M Core World Intelligence runtime.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full p-4 bg-s3m-base">
      <div
        className="flex h-full flex-col overflow-hidden rounded-2xl border border-cyber-glass-border bg-cyber-deep/50"
        style={{
          boxShadow: 'inset 0 0 30px rgba(0, 240, 255, 0.06), 0 0 26px rgba(0, 240, 255, 0.12)',
          backdropFilter: 'blur(12px)'
        }}
      >
        <div
          className="flex items-center justify-between border-b border-cyber-glass-border px-5 py-3"
          style={{ background: 'rgba(0, 240, 255, 0.04)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-lg"
              style={{
                border: '1px solid rgba(0, 240, 255, 0.45)',
                boxShadow: '0 0 18px rgba(0, 240, 255, 0.22)'
              }}
            >
              <Globe2 className="h-5 w-5 text-cyber-cyan" />
            </div>
            <div>
              <h1 className="text-[13px] font-semibold uppercase tracking-[0.24em] text-cyber-cyan">
                World Intelligence
              </h1>
              <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-cyber-text-tertiary">
                S3M Core Runtime
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-s3m-success">
            <RadioTower className="h-4 w-4" />
            Runtime Link
          </div>
        </div>

        <iframe
          title="World Intelligence"
          src={WORLD_INTELLIGENCE_RUNTIME_URL}
          className="min-h-0 flex-1 border-0 bg-cyber-void"
          referrerPolicy="no-referrer"
        />
      </div>
    </div>
  );
}
