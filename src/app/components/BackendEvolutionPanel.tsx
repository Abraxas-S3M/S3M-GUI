import { RefreshCw, Server } from 'lucide-react';
import { Line, LineChart, ResponsiveContainer } from 'recharts';
import { useConnectionStore } from '../connectionStore';
import { useAppStore } from '../store';
import type { SystemStatusData } from '../../services/api/types';

interface BackendEvolutionPanelProps {
  isOpen: boolean;
  data: SystemStatusData | null;
  isLoading: boolean;
  error: Error | null;
  endpointUnavailable: boolean;
  onRefresh: () => Promise<void>;
}

const capabilityLabelsAr: Record<string, string> = {
  live_briefing: 'الإحاطة الحية',
  bilingual_summary: 'ملخص ثنائي اللغة',
  training_metrics: 'مقاييس التدريب',
  scenario_ingest: 'استيعاب السيناريو',
};

const toDisplayCapability = (capability: string, language: 'EN' | 'AR'): string => {
  if (language === 'AR') {
    return capabilityLabelsAr[capability] ?? capability.replaceAll('_', ' ');
  }
  return capability.replaceAll('_', ' ').toUpperCase();
};

const formatUptime = (uptimeSeconds: number): string => {
  const days = Math.floor(uptimeSeconds / 86_400);
  const hours = Math.floor((uptimeSeconds % 86_400) / 3_600);
  const minutes = Math.floor((uptimeSeconds % 3_600) / 60);
  return `${days}d ${hours}h ${minutes}m`;
};

const formatSince = (timestamp: string, language: 'EN' | 'AR'): string => {
  const parsed = Date.parse(timestamp);
  if (Number.isNaN(parsed)) {
    return language === 'AR' ? 'غير متاح' : 'Unavailable';
  }

  const diffMs = Date.now() - parsed;
  if (diffMs <= 0) {
    return language === 'AR' ? 'الآن' : 'just now';
  }

  const totalMinutes = Math.floor(diffMs / 60_000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  if (language === 'AR') {
    return `${days > 0 ? `${days}ي ` : ''}${hours}س ${minutes}د`;
  }
  return `${days > 0 ? `${days}d ` : ''}${hours}h ${minutes}m ago`;
};

const trainerStatusStyles: Record<SystemStatusData['trainer_status'], { color: string; pulse: boolean }> = {
  idle: { color: '#7c8596', pulse: false },
  training: { color: '#05DF72', pulse: true },
  evaluating: { color: '#00B8DB', pulse: true },
};

export function BackendEvolutionPanel({
  isOpen,
  data,
  isLoading,
  error,
  endpointUnavailable,
  onRefresh,
}: BackendEvolutionPanelProps) {
  const language = useAppStore((state) => state.language);
  const storeCapabilities = useConnectionStore((state) => state.capabilities);

  if (!isOpen) {
    return null;
  }

  const labels = language === 'AR'
    ? {
        title: 'تطور الواجهة الخلفية',
        statusUnavailable: 'نقطة نهاية حالة الواجهة الخلفية غير متاحة',
        activeTrack: 'المسار النشط',
        apiHealth: 'صحة الواجهة البرمجية',
        uptime: 'زمن التشغيل',
        trainer: 'حالة المدرب',
        checkpoint: 'نقطة الحفظ',
        sinceCheckpoint: 'منذ آخر نقطة حفظ',
        evalScore: 'آخر درجة تقييم',
        evalTrend: 'اتجاه التقييم',
        metricsUnavailable: 'مقاييس التدريب غير متاحة حالياً',
        scenarioPack: 'آخر حزمة سيناريو',
        scenarioUnavailable: 'استيعاب السيناريو معطل',
        lastError: 'آخر خطأ',
        noErrors: 'لا توجد أخطاء',
        capabilities: 'القدرات',
        refresh: 'تحديث',
      }
    : {
        title: 'Backend Evolution',
        statusUnavailable: 'Backend status endpoint not available',
        activeTrack: 'Active Track',
        apiHealth: 'API Health',
        uptime: 'API Uptime',
        trainer: 'Trainer Status',
        checkpoint: 'Active Checkpoint',
        sinceCheckpoint: 'Since Last Checkpoint',
        evalScore: 'Last Eval Score',
        evalTrend: 'Eval Trend',
        metricsUnavailable: 'Training metrics are currently unavailable',
        scenarioPack: 'Last Scenario Pack',
        scenarioUnavailable: 'Scenario ingest disabled',
        lastError: 'Last Error',
        noErrors: 'No errors reported',
        capabilities: 'Capabilities',
        refresh: 'Refresh',
      };

  const capabilities = data?.capabilities ?? storeCapabilities;
  const evalTrend = (data?.eval_trend ?? []).map((value, index) => ({ index, value }));
  const trainerStatus = data?.trainer_status ?? 'idle';
  const trainerStyle = trainerStatusStyles[trainerStatus];
  const hasTrainingMetrics = Boolean(capabilities.training_metrics);
  const hasScenarioIngest = Boolean(capabilities.scenario_ingest);

  return (
    <aside className="w-[340px] bg-cyber-deep/45 border-l border-cyber-glass-border flex flex-col" style={{ backdropFilter: 'blur(14px)' }}>
      <div className="p-4 border-b border-cyber-glass-border flex items-center gap-2">
        <Server className="w-4 h-4 text-cyber-cyan" />
        <h3 className="text-[12px] uppercase tracking-[0.14em] font-semibold text-cyber-cyan">{labels.title}</h3>
        <div className="flex-1" />
        <button
          onClick={() => void onRefresh()}
          className="px-2 py-1 rounded text-[10px] uppercase tracking-wider border border-cyber-cyan/30 text-cyber-cyan hover:bg-cyber-cyan/10 transition-colors flex items-center gap-1"
        >
          <RefreshCw className="w-3 h-3" />
          {labels.refresh}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 text-[12px]">
        {endpointUnavailable && (
          <div className="rounded-lg border border-cyber-glass-border bg-cyber-deep/50 p-3 text-cyber-text-secondary">
            {labels.statusUnavailable}
          </div>
        )}

        {!endpointUnavailable && error && (
          <div className="rounded-lg border border-red-500/30 bg-red-950/25 p-3 text-red-200">
            {error.message}
          </div>
        )}

        {!endpointUnavailable && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <div className="glass-panel rounded-lg p-3">
                <div className="text-cyber-text-tertiary text-[10px] uppercase tracking-wider">{labels.activeTrack}</div>
                <div className="mt-1 text-cyber-text-primary font-mono">{data?.active_track ?? '--'}</div>
                <div className="mt-2 text-cyber-text-tertiary text-[10px] uppercase tracking-wider">{labels.apiHealth}</div>
                <div className="mt-1 text-cyber-text-primary uppercase tracking-wider">{data?.api_status ?? '--'}</div>
              </div>
              <div className="glass-panel rounded-lg p-3">
                <div className="text-cyber-text-tertiary text-[10px] uppercase tracking-wider">{labels.uptime}</div>
                <div className="mt-1 text-cyber-text-primary font-mono">
                  {data ? formatUptime(data.uptime_seconds) : '--'}
                </div>
              </div>
            </div>

            <div className="glass-panel rounded-lg p-3">
              <div className="text-cyber-text-tertiary text-[10px] uppercase tracking-wider mb-2">{labels.trainer}</div>
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${trainerStyle.pulse ? 'animate-pulse' : ''}`}
                  style={{ backgroundColor: trainerStyle.color, boxShadow: `0 0 12px ${trainerStyle.color}` }}
                />
                <span className="text-cyber-text-primary uppercase tracking-wider">{trainerStatus}</span>
              </div>
            </div>

            <div className="glass-panel rounded-lg p-3 space-y-2">
              <div>
                <div className="text-cyber-text-tertiary text-[10px] uppercase tracking-wider">{labels.checkpoint}</div>
                <div className="mt-1 text-cyber-text-primary font-mono break-all">{data?.promoted_checkpoint ?? '--'}</div>
              </div>
              <div className="pt-2 border-t border-cyber-glass-border/50">
                <div className="text-cyber-text-tertiary text-[10px] uppercase tracking-wider">{labels.sinceCheckpoint}</div>
                <div className="mt-1 text-cyber-text-primary">{data ? formatSince(data.last_checkpoint_at, language) : '--'}</div>
              </div>
            </div>

            <div className="glass-panel rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-cyber-text-tertiary text-[10px] uppercase tracking-wider">{labels.evalScore}</div>
                <div className="text-cyber-cyan font-mono">{typeof data?.last_eval_score === 'number' ? data.last_eval_score.toFixed(3) : '--'}</div>
              </div>
              <div className="text-cyber-text-tertiary text-[10px] uppercase tracking-wider">{labels.evalTrend}</div>
              {hasTrainingMetrics ? (
                <div className="h-20">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={evalTrend}>
                      <Line type="monotone" dataKey="value" dot={false} stroke="#00F0FF" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-cyber-text-tertiary">{labels.metricsUnavailable}</div>
              )}
            </div>

            <div className="glass-panel rounded-lg p-3">
              <div className="text-cyber-text-tertiary text-[10px] uppercase tracking-wider">{labels.scenarioPack}</div>
              <div className="mt-1 text-cyber-text-primary">
                {hasScenarioIngest ? (data?.last_scenario_pack ?? '--') : labels.scenarioUnavailable}
              </div>
            </div>

            <div className="rounded-lg border border-red-500/20 bg-red-950/25 p-3">
              <div className="text-[10px] uppercase tracking-wider text-red-300">{labels.lastError}</div>
              <div className="mt-1 text-red-200">{data?.last_error ?? labels.noErrors}</div>
            </div>

            <div className="glass-panel rounded-lg p-3">
              <div className="text-cyber-text-tertiary text-[10px] uppercase tracking-wider mb-2">{labels.capabilities}</div>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(capabilities).map(([key, enabled]) => (
                  <span
                    key={key}
                    className={`px-2 py-1 rounded text-[10px] border ${
                      enabled
                        ? 'text-cyber-green border-cyber-green/40 bg-cyber-green/10'
                        : 'text-cyber-text-tertiary border-cyber-glass-border bg-cyber-deep/40'
                    }`}
                  >
                    {toDisplayCapability(key, language)}
                  </span>
                ))}
              </div>
            </div>

            {isLoading && <div className="text-cyber-text-tertiary">{language === 'AR' ? 'جارٍ التحديث...' : 'Refreshing status...'}</div>}
          </>
        )}
      </div>
    </aside>
  );
}
