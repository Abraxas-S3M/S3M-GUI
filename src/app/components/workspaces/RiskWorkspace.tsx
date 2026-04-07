import { CommandCard } from '../CommandCard';
import { RingGauge } from '../RingGauge';
import { ProgressBar } from '../ProgressBar';
import { TrendingUp, TrendingDown, Users, Zap, Package, AlertTriangle, Shield, Clock, Wrench, Truck, Globe, Radio, Megaphone, TrendingUp as Escalation, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useAppStore } from '../../store';
import { useWorkspaceSyncPolling } from '../../../services/hooks/useWorkspaceSyncPolling';

export function RiskWorkspace() {
  const syncRiskMetrics = useAppStore((state) => state.syncRiskMetrics);
  useWorkspaceSyncPolling(syncRiskMetrics);

  const [expandedCategory, setExpandedCategory] = useState<string | null>('mission');
  const [selectedRiskView, setSelectedRiskView] = useState<'mission' | 'cyber' | 'supply' | 'political' | 'all'>('all');

  const domains = [
    { name: 'MISSION', value: 68, change: 14, color: '#EF4444', severity: 'critical' as const },
    { name: 'CYBER', value: 52, change: 18, color: '#8B5CF6', severity: 'caution' as const },
    { name: 'SUPPLY', value: 61, change: 9, color: '#EAB308', severity: 'critical' as const },
    { name: 'POLITICAL', value: 44, change: 6, color: '#38BDF8', severity: 'caution' as const },
    { name: 'KINETIC', value: 35, change: -4, color: '#22C55E', severity: 'operational' as const }
  ];

  const missionRisks = [
    { label: 'Casualty Risk', value: 72, severity: 'critical' as const, color: '#EF4444', trend: 8, detail: 'Sector 7-B high-threat environment, SAM coverage' },
    { label: 'Fratricide Risk', value: 34, severity: 'operational' as const, color: '#22C55E', trend: -2, detail: 'IFF systems operational, blue force tracker active' },
    { label: 'Mission Failure Probability', value: 58, severity: 'caution' as const, color: '#EAB308', trend: 12, detail: 'Weather degradation, asset availability at 72%' },
    { label: 'Escalation Probability', value: 65, severity: 'critical' as const, color: '#EF4444', trend: 15, detail: 'Regional tensions elevated, counterparty unpredictable' },
    { label: 'Logistics Fragility', value: 71, severity: 'critical' as const, color: '#EF4444', trend: 9, detail: 'Route Bravo compromised, alternate routes contested' }
  ];

  const cyberRisks = [
    { label: 'Compromise Propagation', value: 48, severity: 'caution' as const, color: '#8B5CF6', trend: 22, detail: 'Node 12 lateral movement detected, containment active' },
    { label: 'Data Trust Score', value: 82, severity: 'operational' as const, color: '#22C55E', trend: 0, detail: 'Multi-source validation, integrity checks passing' },
    { label: 'Degraded-Mode Trigger', value: 56, severity: 'caution' as const, color: '#EAB308', trend: 18, detail: 'SATCOM latency spikes, backup comms standing by' }
  ];

  const supplyRisks = [
    { label: 'Stockout Horizon', value: '14h 32m', severity: 'critical' as const, color: '#EF4444', detail: 'Class III (fuel) critical at current consumption', numeric: 61 },
    { label: 'Maintenance Bottlenecks', value: 'High', severity: 'caution' as const, color: '#EAB308', detail: '7 priority repairs queued, 3 mechanics available', numeric: 68 },
    { label: 'Convoy Disruption Probability', value: 67, severity: 'critical' as const, color: '#EF4444', trend: 11, detail: 'Route Bravo bridge out, Route Charlie under threat' }
  ];

  const politicalRisks = [
    { label: 'Coalition Sensitivity', value: 55, severity: 'caution' as const, color: '#EAB308', trend: 8, detail: 'Partner nation concerns over civilian exposure' },
    { label: 'Airspace/Diplomatic Restrictions', value: 42, severity: 'caution' as const, color: '#EAB308', trend: 3, detail: 'No-fly zones expanded in Sector 5, coordination lag' },
    { label: 'Media Exposure Risk', value: 78, severity: 'critical' as const, color: '#EF4444', trend: 14, detail: 'High-profile op, journalist presence confirmed in AO' },
    { label: 'Escalation Ladder', value: 'Level 4/7', severity: 'caution' as const, color: '#EAB308', detail: 'Deterrence posture active, counterparty signaling', numeric: 57 }
  ];

  const riskCategories = [
    {
      id: 'mission',
      name: 'Mission Risk',
      icon: Users,
      color: '#EF4444',
      risks: missionRisks,
      composite: 68
    },
    {
      id: 'cyber',
      name: 'Cyber Risk',
      icon: Zap,
      color: '#8B5CF6',
      risks: cyberRisks,
      composite: 52
    },
    {
      id: 'supply',
      name: 'Supply Risk',
      icon: Package,
      color: '#EAB308',
      risks: supplyRisks,
      composite: 61
    },
    {
      id: 'political',
      name: 'Political/Strategic Risk',
      icon: Globe,
      color: '#38BDF8',
      risks: politicalRisks,
      composite: 44
    }
  ];

  const drivers = [
    { title: 'Track 218 hostile contact', domain: 'KINETIC', impact: 72, color: '#EF4444', desc: 'Fast mover with IFF failure, approach vector toward friendly assets' },
    { title: 'Route Bravo bridge out', domain: 'LOGISTICS', impact: 58, color: '#EAB308', desc: 'Primary supply route compromised, convoy reroute required' },
    { title: 'Port scan Node 12', domain: 'CYBER', impact: 45, color: '#8B5CF6', desc: 'Coordinated reconnaissance on SATCOM infrastructure' },
    { title: 'SIGINT backlog unprocessed', domain: 'INTEL', impact: 38, color: '#38BDF8', desc: '4-hour delay in threat intelligence processing' }
  ];

  const forecast = [
    { label: 'NOW', value: 47, color: '#EF4444' },
    { label: '+1H', value: 55, color: '#EF4444' },
    { label: '+6H', value: 62, color: '#EF4444' },
    { label: '+24H', value: 42, color: '#EAB308' }
  ];

  const scenarios = [
    { name: 'Engage + Reroute', delta: -31, result: 16, severity: 'operational' as const },
    { name: 'Shadow + Hold', delta: 0, result: 55, severity: 'caution' as const },
    { name: 'No Action', delta: 15, result: 62, severity: 'critical' as const }
  ];

  return (
    <div className="p-4 h-full flex flex-col gap-4">
      {/* Risk Category Selector - Top Left */}
      <div className="flex items-center gap-4">
        <div className="relative bg-s3m-card border border-s3m-border-default rounded px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="text-base text-s3m-text-tertiary uppercase tracking-wider font-semibold">
              EVALUATING:
            </span>
            <select
              value={selectedRiskView}
              onChange={(e) => setSelectedRiskView(e.target.value as any)}
              className="bg-s3m-elevated border border-s3m-border-default rounded px-2 py-1 text-base font-semibold text-s3m-text-primary cursor-pointer focus:outline-none focus:border-s3m-cyan transition-colors"
            >
              <option value="all">All Risk Domains</option>
              <option value="mission">Mission Risk</option>
              <option value="cyber">Cyber Risk</option>
              <option value="supply">Supply Risk</option>
              <option value="political">Political/Strategic Risk</option>
            </select>
          </div>
        </div>
      </div>

      {/* Top Row - Domain Overview */}
      <div className={`grid gap-4 ${selectedRiskView === 'all' ? 'grid-cols-5' : 'grid-cols-1'}`}>
        {domains
          .filter(domain => selectedRiskView === 'all' || domain.name.toLowerCase() === selectedRiskView)
          .map((domain) => (
          <CommandCard key={domain.name}>
            <div className="text-center">
              <div className="text-xs uppercase tracking-wider text-s3m-text-tertiary font-semibold mb-2">
                {domain.name}
              </div>
              <div className="font-mono text-2xl font-bold mb-1" style={{ color: domain.color }}>
                {domain.value}
              </div>
              <div className="flex items-center justify-center gap-1 mb-2">
                {domain.change > 0 ? (
                  <TrendingUp className="w-3 h-3" style={{ color: domain.color }} />
                ) : (
                  <TrendingDown className="w-3 h-3 text-s3m-operational" />
                )}
                <span className="font-mono text-xs" style={{ color: domain.change > 0 ? domain.color : '#22C55E' }}>
                  {domain.change > 0 ? '+' : ''}{domain.change}%
                </span>
              </div>
              <ProgressBar value={domain.value} severity={domain.severity} />
            </div>
          </CommandCard>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-3 gap-4 min-h-0">
        {/* Left Column - Composite Risk */}
        <div className="space-y-4">
          <CommandCard accentColor="#EF4444" title="COMPOSITE RISK" indicator>
            <div className="flex justify-center py-4">
              <RingGauge value={58} severity="caution" />
            </div>
            <div className="border-t border-s3m-border-default pt-3 mt-3">
              <div className="text-base text-s3m-text-tertiary uppercase tracking-wider mb-2">
                TOP CONTRIBUTORS
              </div>
              <div className="space-y-1.5">
                {[
                  { label: 'Media Exposure Risk', value: 78, color: '#EF4444' },
                  { label: 'Casualty Risk', value: 72, color: '#EF4444' },
                  { label: 'Logistics Fragility', value: 71, color: '#EF4444' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="text-s3m-text-secondary">{item.label}</span>
                    <span className="font-mono font-semibold" style={{ color: item.color }}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CommandCard>

          <CommandCard accentColor="#8B5CF6">
            <div className="border-l-2 border-s3m-purple bg-s3m-purple/5 p-3 rounded">
              <div className="text-base text-s3m-purple uppercase tracking-wider font-semibold mb-2">
                CROSS-DOMAIN CORRELATION
              </div>
              <div className="text-base text-s3m-text-secondary leading-relaxed">
                Media exposure → Political sensitivity → Coalition restrictions → Mission failure probability chain
              </div>
            </div>
          </CommandCard>
        </div>

        {/* Center Column - Risk Category Details */}
        <div className="overflow-y-auto">
          <CommandCard accentColor="#F97316" title="RISK BREAKDOWN" indicator>
            <div className="space-y-2">
              {riskCategories
                .filter(category => selectedRiskView === 'all' || category.id === selectedRiskView)
                .map((category) => {
                const Icon = category.icon;
                const isExpanded = expandedCategory === category.id;

                return (
                  <div key={category.id} className="bg-s3m-elevated rounded">
                    <button
                      onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                      className="w-full flex items-center justify-between p-3 hover:bg-s3m-elevated-hover transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" style={{ color: category.color }} />
                        ) : (
                          <ChevronRight className="w-4 h-4" style={{ color: category.color }} />
                        )}
                        <Icon className="w-4 h-4" style={{ color: category.color }} />
                        <span className="text-base font-semibold text-s3m-text-primary">
                          {category.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-base font-bold" style={{ color: category.color }}>
                          {category.composite}
                        </span>
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-3 pb-3 space-y-2">
                        {category.risks.map((risk: any, i: number) => (
                          <div key={i} className="bg-s3m-card rounded p-2.5 border-l-2" style={{ borderLeftColor: risk.color }}>
                            <div className="flex items-start justify-between mb-2">
                              <span className="text-xs font-semibold text-s3m-text-primary">
                                {risk.label}
                              </span>
                              <div className="text-right">
                                {typeof risk.value === 'number' ? (
                                  <div className="flex items-center gap-1">
                                    <span className="font-mono text-sm font-bold" style={{ color: risk.color }}>
                                      {risk.value}
                                    </span>
                                    {risk.trend !== undefined && (
                                      <div className="flex items-center">
                                        {risk.trend > 0 ? (
                                          <TrendingUp className="w-3 h-3" style={{ color: risk.color }} />
                                        ) : (
                                          <TrendingDown className="w-3 h-3 text-s3m-operational" />
                                        )}
                                        <span className="font-mono text-base" style={{ color: risk.trend > 0 ? risk.color : '#22C55E' }}>
                                          {risk.trend > 0 ? '+' : ''}{risk.trend}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <span className="font-mono text-base font-bold" style={{ color: risk.color }}>
                                    {risk.value}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-xs text-s3m-text-tertiary leading-relaxed mb-2">
                              {risk.detail}
                            </div>
                            {risk.numeric !== undefined && (
                              <ProgressBar value={risk.numeric} severity={risk.severity} />
                            )}
                            {typeof risk.value === 'number' && (
                              <ProgressBar value={risk.value} severity={risk.severity} />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CommandCard>
        </div>

        {/* Right Column - Predictive Elements */}
        <div className="space-y-4 overflow-y-auto">
          <CommandCard accentColor="#38BDF8" title="PREDICTIVE FORECAST" indicator>
            <div className="space-y-3 mb-4">
              {[
                { label: 'NOW', value: 58, color: '#EAB308' },
                { label: '+1H', value: 66, color: '#EF4444' },
                { label: '+6H', value: 74, color: '#EF4444' },
                { label: '+24H', value: 52, color: '#EAB308' }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs uppercase tracking-wider text-s3m-text-tertiary font-semibold w-12">
                    {item.label}
                  </span>
                  <div className="flex-1">
                    <div className="h-6 rounded bg-s3m-elevated overflow-hidden relative">
                      <div
                        className="h-full transition-all"
                        style={{
                          width: `${item.value}%`,
                          backgroundColor: item.color
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-end pr-2">
                        <span className="font-mono text-base text-s3m-text-primary font-semibold">
                          {item.value}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <div className="border-l-2 border-s3m-critical bg-s3m-critical/5 p-2.5 rounded">
                <div className="text-base text-s3m-critical uppercase tracking-wider font-semibold mb-1">
                  CRITICAL ALERT
                </div>
                <div className="text-xs text-s3m-text-secondary">
                  Fuel stockout in 14h 32m at current consumption
                </div>
              </div>
              <div className="border-l-2 border-s3m-yellow bg-s3m-yellow/5 p-2.5 rounded">
                <div className="text-base text-s3m-yellow uppercase tracking-wider font-semibold mb-1">
                  ESCALATION WARNING
                </div>
                <div className="text-xs text-s3m-text-secondary">
                  Media exposure likely to trigger coalition review
                </div>
              </div>
            </div>
          </CommandCard>

          <CommandCard title="SCENARIO PROJECTIONS">
            <div className="space-y-2">
              {[
                { name: 'Defer + Resupply', delta: -28, result: 30, severity: 'operational' as const },
                { name: 'Execute Current Plan', delta: 0, result: 58, severity: 'caution' as const },
                { name: 'Accelerate Timeline', delta: 22, result: 80, severity: 'critical' as const }
              ].map((scenario, i) => (
                <div
                  key={i}
                  className={`border rounded p-2.5 transition-colors ${
                    scenario.severity === 'operational'
                      ? 'border-s3m-operational/40 bg-s3m-operational/5'
                      : 'border-s3m-border-default hover:border-s3m-border-emphasis'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-base text-s3m-text-primary">
                      {scenario.name}
                    </span>
                    {scenario.severity === 'operational' && (
                      <span className="text-base text-s3m-operational uppercase tracking-wider font-semibold">
                        RECOMMENDED
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1">
                      <span className="text-s3m-text-tertiary">Delta:</span>
                      <span
                        className="font-mono"
                        style={{
                          color: scenario.delta < 0 ? '#22C55E' : scenario.delta === 0 ? '#EAB308' : '#EF4444'
                        }}
                      >
                        {scenario.delta > 0 ? '+' : ''}{scenario.delta}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-s3m-text-tertiary">Result:</span>
                      <span
                        className="font-mono font-semibold"
                        style={{
                          color: scenario.result < 40 ? '#22C55E' : scenario.result < 60 ? '#EAB308' : '#EF4444'
                        }}
                      >
                        {scenario.result}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CommandCard>

          <CommandCard>
            <div className="space-y-2">
              <div className="text-xs text-s3m-text-tertiary uppercase tracking-wider font-semibold mb-2">
                MITIGATION ACTIONS
              </div>
              {[
                { action: 'Expedite fuel convoy via Route Delta', impact: -18, target: 'Supply Risk' },
                { action: 'Media blackout coordination', impact: -32, target: 'Political Risk' },
                { action: 'Deploy reserve QRF to Sector 7-B', impact: -14, target: 'Mission Risk' }
              ].map((item, i) => (
                <div key={i} className="bg-s3m-elevated rounded p-2 hover:bg-s3m-elevated-hover transition-colors cursor-pointer">
                  <div className="flex items-start justify-between mb-1">
                    <span className="text-xs text-s3m-text-secondary flex-1">
                      {item.action}
                    </span>
                    <span className="font-mono text-xs text-s3m-operational ml-2">
                      {item.impact}
                    </span>
                  </div>
                  <div className="text-base text-s3m-text-tertiary">
                    Target: {item.target}
                  </div>
                </div>
              ))}
            </div>
          </CommandCard>
        </div>
      </div>
    </div>
  );
}
