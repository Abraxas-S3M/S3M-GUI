import { CommandCard } from '../CommandCard';
import { CornerBrackets } from '../CornerBrackets';
import { ConfidenceBadge } from '../ConfidenceBadge';
import { ProgressBar } from '../ProgressBar';
import { useAppStore } from '../../store';
import { CheckCircle2, XCircle, Eye, Clock, AlertCircle, Sparkles, History, GitBranch, TrendingUp, TrendingDown, DollarSign, Timer, Shield, FileText, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

type QueueFilter = 'pending' | 'auto-approved' | 'human-approved' | 'vetoed' | 'stale';
type ExplainView = 'why' | 'replay' | 'alternatives';

export function DecisionsWorkspace() {
  const { decisions, updateDecisionStatus } = useAppStore();
  const [queueFilter, setQueueFilter] = useState<QueueFilter>('pending');
  const [selectedDecision, setSelectedDecision] = useState<string | null>(null);
  const [explainView, setExplainView] = useState<ExplainView>('why');
  const [expandedSections, setExpandedSections] = useState({
    evidence: true,
    dissenting: false,
    doctrine: true,
    upside: true
  });

  const severityColors: any = {
    CRITICAL: '#EF4444',
    HIGH: '#F97316',
    MEDIUM: '#EAB308',
    LOW: '#38BDF8'
  };

  const getSeverity = (risk: number): 'operational' | 'caution' | 'critical' => {
    if (risk >= 70) return 'critical';
    if (risk >= 50) return 'caution';
    return 'operational';
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const queueCounts = {
    pending: decisions.filter(d => d.status === 'pending').length,
    'auto-approved': 12,
    'human-approved': 47,
    vetoed: 8,
    stale: 3
  };

  const queueConfigs = {
    pending: { icon: Clock, color: '#FFB800', label: 'Pending' },
    'auto-approved': { icon: Sparkles, color: '#05DF72', label: 'Auto-Approved' },
    'human-approved': { icon: CheckCircle2, color: '#38BDF8', label: 'Human-Approved' },
    vetoed: { icon: XCircle, color: '#EF4444', label: 'Vetoed' },
    stale: { icon: AlertCircle, color: '#6B7C95', label: 'Stale' }
  };

  const evidenceInputs = [
    { source: 'COP Radar Tracking', weight: 0.32, reliability: 'HIGH', freshness: '12s' },
    { source: 'SIGINT Intercept', weight: 0.28, reliability: 'HIGH', freshness: '1m 3s' },
    { source: 'Cyber Node 12 Correlation', weight: 0.18, reliability: 'MEDIUM', freshness: '2m 45s' },
    { source: 'Falcon-7 Historical Patterns', weight: 0.12, reliability: 'MEDIUM', freshness: '4h 12m' },
    { source: 'Coalition Intel Feed', weight: 0.10, reliability: 'LOW', freshness: '18h' }
  ];

  const dissentingViews = [
    { model: 'Llama-3-Guardian', confidence: 42, reasoning: 'Insufficient positive ID. ROE requires visual confirmation before engagement.', weight: 'HIGH' },
    { model: 'Claude-Tactical-2', confidence: 38, reasoning: 'Track behavior consistent with civilian flight deviation. Recommend shadow and hail.', weight: 'MEDIUM' }
  ];

  const alternatives = [
    {
      id: 'COA-A',
      name: 'Immediate Engagement',
      riskDelta: 82,
      resourceCost: 'HIGH',
      timeToEffect: '45s',
      confidenceSpread: 74,
      upside: 'Eliminates immediate threat',
      downside: 'Possible civilian casualty'
    },
    {
      id: 'COA-B',
      name: 'Shadow & Intercept',
      riskDelta: 45,
      resourceCost: 'MEDIUM',
      timeToEffect: '3m 15s',
      confidenceSpread: 68,
      upside: 'Positive ID before action',
      downside: 'May lose tactical advantage'
    },
    {
      id: 'COA-C',
      name: 'Coalition Handoff',
      riskDelta: 58,
      resourceCost: 'LOW',
      timeToEffect: '8m 30s',
      confidenceSpread: 52,
      upside: 'Shared responsibility',
      downside: 'Delayed response window'
    }
  ];

  const filteredDecisions = decisions.filter(d => {
    if (queueFilter === 'pending') return d.status === 'pending';
    if (queueFilter === 'auto-approved') return d.status === 'approved' && d.confidence >= 85;
    if (queueFilter === 'human-approved') return d.status === 'approved' && d.confidence < 85;
    if (queueFilter === 'vetoed') return d.status === 'rejected';
    if (queueFilter === 'stale') return false; // Mock: no stale decisions in current data
    return true;
  });

  return (
    <div className="p-4 h-full flex flex-col gap-4">
      {/* Decision Queue Filter */}
      <div className="relative bg-s3m-card border border-s3m-border-default rounded p-3">
        <CornerBrackets color="#00F0FF" />
        <div className="flex items-center gap-2">
          {(Object.keys(queueConfigs) as QueueFilter[]).map((queue) => {
            const config = queueConfigs[queue];
            const Icon = config.icon;
            const isActive = queueFilter === queue;

            return (
              <button
                key={queue}
                onClick={() => setQueueFilter(queue)}
                className={`flex items-center gap-2 px-3 py-2 rounded transition-all ${
                  isActive
                    ? 'bg-s3m-elevated border-2'
                    : 'bg-s3m-elevated/50 border border-s3m-border-default hover:border-s3m-cyan/40'
                }`}
                style={isActive ? { borderColor: config.color } : {}}
              >
                <Icon
                  className="w-4 h-4"
                  style={{ color: isActive ? config.color : '#6B7C95' }}
                />
                <span
                  className={`text-base font-semibold uppercase tracking-wider ${
                    isActive ? 'text-s3m-text-primary' : 'text-s3m-text-tertiary'
                  }`}
                >
                  {config.label}
                </span>
                <span
                  className="font-mono text-xs px-1.5 py-0.5 rounded"
                  style={{
                    color: config.color,
                    backgroundColor: `${config.color}20`
                  }}
                >
                  {queueCounts[queue]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Decision Cards */}
        <div className="flex-[1.1] space-y-4 overflow-y-auto">
          {filteredDecisions.map((decision) => (
            <div
              key={decision.id}
              className={`relative bg-s3m-card border-2 rounded p-4 cursor-pointer transition-all ${
                selectedDecision === decision.id ? 'ring-2 ring-s3m-cyan' : ''
              }`}
              style={{ borderColor: severityColors[decision.severity] + '40' }}
              onClick={() => setSelectedDecision(decision.id)}
            >
              <CornerBrackets color={severityColors[decision.severity]} />

              {/* Header */}
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-semibold text-s3m-text-primary">
                    {decision.id}
                  </span>
                  <span
                    className="text-base uppercase tracking-wider font-semibold px-2 py-0.5 rounded"
                    style={{
                      color: severityColors[decision.severity],
                      backgroundColor: `${severityColors[decision.severity]}20`
                    }}
                  >
                    {decision.severity}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-base text-s3m-text-tertiary uppercase tracking-wider mb-0.5">
                      RISK
                    </div>
                    <div className="font-mono text-base font-semibold" style={{ color: severityColors[decision.severity] }}>
                      {decision.risk}%
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-base text-s3m-text-tertiary uppercase tracking-wider mb-0.5">
                      CONF
                    </div>
                    <ConfidenceBadge value={decision.confidence} />
                  </div>
                </div>
              </div>

              {/* Title */}
              <div className="text-lg font-semibold text-s3m-text-primary mb-2">
                {decision.title}
              </div>

              {/* Description */}
              <div className="text-sm text-s3m-text-secondary mb-3">
                {decision.description}
              </div>

              {/* Confidence Bar */}
              <div className="mb-4">
                <div className="text-xs text-s3m-text-tertiary uppercase tracking-wider mb-2">
                  Confidence Assessment
                </div>
                <ProgressBar value={decision.confidence} severity={decision.confidence >= 80 ? 'operational' : decision.confidence >= 60 ? 'caution' : 'critical'} />
              </div>

              {/* Why Box */}
              <div className="border-l-2 border-s3m-blue bg-s3m-blue/5 p-3 mb-4 rounded">
                <div className="text-base text-s3m-blue uppercase tracking-wider font-semibold mb-1">
                  WHY NOW
                </div>
                <div className="text-base text-s3m-text-secondary leading-relaxed">
                  Track velocity and trajectory indicate imminent threat window. IFF failure prevents positive identification. Coalition rules of engagement require decision within 4-minute window.
                </div>
              </div>

              {/* Actions */}
              {queueFilter === 'pending' && (
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateDecisionStatus(decision.id, 'approved');
                    }}
                    className="flex-1 bg-s3m-operational/20 border border-s3m-operational hover:bg-s3m-operational/30 text-s3m-operational rounded px-3 py-2 text-base font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    APPROVE
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateDecisionStatus(decision.id, 'rejected');
                    }}
                    className="flex-1 bg-s3m-critical/20 border border-s3m-critical hover:bg-s3m-critical/30 text-s3m-critical rounded px-3 py-2 text-base font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    REJECT
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDecision(decision.id);
                    }}
                    className="bg-s3m-elevated border border-s3m-border-default hover:border-s3m-cyan text-s3m-text-secondary hover:text-s3m-cyan rounded px-3 py-2 text-base font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    DETAILS
                  </button>
                </div>
              )}
            </div>
          ))}

          {filteredDecisions.length === 0 && (
            <div className="text-center py-12">
              <div className="text-base text-s3m-text-tertiary">No {queueFilter} decisions</div>
            </div>
          )}
        </div>

        {/* Enhanced Explainability Drawer */}
        <div className="flex-[0.9] bg-s3m-card border-2 border-s3m-purple/40 rounded p-4 flex flex-col gap-4 overflow-hidden">
          <CornerBrackets color="#8B5CF6" />

          {/* View Selector */}
          <div className="border-b border-s3m-border-default pb-3">
            <h3 className="text-base font-semibold text-s3m-text-primary mb-3">Decision Intelligence</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setExplainView('why')}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded text-xs font-semibold uppercase tracking-wider transition-all ${
                  explainView === 'why'
                    ? 'bg-s3m-purple/30 border-2 border-s3m-purple text-s3m-text-primary'
                    : 'bg-s3m-elevated border border-s3m-border-default text-s3m-text-tertiary hover:border-s3m-purple/40'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Why This
              </button>
              <button
                onClick={() => setExplainView('replay')}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded text-xs font-semibold uppercase tracking-wider transition-all ${
                  explainView === 'replay'
                    ? 'bg-s3m-purple/30 border-2 border-s3m-purple text-s3m-text-primary'
                    : 'bg-s3m-elevated border border-s3m-border-default text-s3m-text-tertiary hover:border-s3m-purple/40'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                Replay
              </button>
              <button
                onClick={() => setExplainView('alternatives')}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded text-xs font-semibold uppercase tracking-wider transition-all ${
                  explainView === 'alternatives'
                    ? 'bg-s3m-purple/30 border-2 border-s3m-purple text-s3m-text-primary'
                    : 'bg-s3m-elevated border border-s3m-border-default text-s3m-text-tertiary hover:border-s3m-purple/40'
                }`}
              >
                <GitBranch className="w-3.5 h-3.5" />
                COAs
              </button>
            </div>
          </div>

          {/* View Content */}
          <div className="flex-1 overflow-y-auto space-y-4">
            {explainView === 'why' && (
              <>
                {/* Evidence Inputs */}
                <div>
                  <button
                    onClick={() => toggleSection('evidence')}
                    className="w-full flex items-center justify-between mb-2 hover:bg-s3m-elevated/50 p-2 rounded transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {expandedSections.evidence ? <ChevronDown className="w-4 h-4 text-s3m-cyan" /> : <ChevronRight className="w-4 h-4 text-s3m-cyan" />}
                      <span className="text-xs text-s3m-text-tertiary uppercase tracking-wider font-semibold">
                        EVIDENCE INPUTS
                      </span>
                    </div>
                  </button>
                  {expandedSections.evidence && (
                    <div className="space-y-2 ml-6">
                      {evidenceInputs.map((input, i) => (
                        <div key={i} className="bg-s3m-elevated rounded p-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-s3m-text-secondary">{input.source}</span>
                            <span className="text-base font-mono text-s3m-cyan">{(input.weight * 100).toFixed(0)}%</span>
                          </div>
                          <div className="flex items-center gap-2 text-base">
                            <span className="text-s3m-text-tertiary">Reliability:</span>
                            <span
                              className="px-1.5 py-0.5 rounded"
                              style={{
                                color: input.reliability === 'HIGH' ? '#05DF72' : input.reliability === 'MEDIUM' ? '#FFB800' : '#EF4444',
                                backgroundColor: input.reliability === 'HIGH' ? '#05DF7220' : input.reliability === 'MEDIUM' ? '#FFB80020' : '#EF444420'
                              }}
                            >
                              {input.reliability}
                            </span>
                            <span className="text-s3m-text-tertiary ml-auto">Fresh: {input.freshness}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Confidence Score */}
                <div className="bg-s3m-elevated rounded p-3">
                  <div className="text-xs text-s3m-text-tertiary uppercase tracking-wider font-semibold mb-2">
                    CONFIDENCE SCORE
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-base text-s3m-text-secondary">Consensus Model</span>
                    <span className="font-mono text-base text-s3m-operational">74%</span>
                  </div>
                  <div className="text-xs text-s3m-text-tertiary mb-2">
                    Phi-3 Tactical (79%) + Grok Reasoning (68%) weighted ensemble
                  </div>
                  <ProgressBar value={74} severity="operational" />
                </div>

                {/* Dissenting Views */}
                <div>
                  <button
                    onClick={() => toggleSection('dissenting')}
                    className="w-full flex items-center justify-between mb-2 hover:bg-s3m-elevated/50 p-2 rounded transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {expandedSections.dissenting ? <ChevronDown className="w-4 h-4 text-s3m-yellow" /> : <ChevronRight className="w-4 h-4 text-s3m-yellow" />}
                      <span className="text-xs text-s3m-text-tertiary uppercase tracking-wider font-semibold">
                        DISSENTING MODEL VIEWS
                      </span>
                      <span className="text-base px-1.5 py-0.5 rounded bg-s3m-yellow/20 text-s3m-yellow">
                        {dissentingViews.length}
                      </span>
                    </div>
                  </button>
                  {expandedSections.dissenting && (
                    <div className="space-y-2 ml-6">
                      {dissentingViews.map((view, i) => (
                        <div key={i} className="bg-s3m-elevated border-l-2 border-s3m-yellow rounded p-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-s3m-text-primary">{view.model}</span>
                            <span className="font-mono text-xs text-s3m-yellow">{view.confidence}%</span>
                          </div>
                          <div className="text-xs text-s3m-text-secondary leading-relaxed">
                            {view.reasoning}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Doctrine/Policy Checks */}
                <div>
                  <button
                    onClick={() => toggleSection('doctrine')}
                    className="w-full flex items-center justify-between mb-2 hover:bg-s3m-elevated/50 p-2 rounded transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {expandedSections.doctrine ? <ChevronDown className="w-4 h-4 text-s3m-operational" /> : <ChevronRight className="w-4 h-4 text-s3m-operational" />}
                      <span className="text-xs text-s3m-text-tertiary uppercase tracking-wider font-semibold">
                        DOCTRINE / POLICY CHECKS
                      </span>
                    </div>
                  </button>
                  {expandedSections.doctrine && (
                    <div className="space-y-1.5 ml-6">
                      {[
                        { check: 'Coalition ROE CHARLIE-3', status: 'PASS', note: 'Engagement authorized in defended airspace' },
                        { check: 'IFF Verification Protocol', status: 'FAIL', note: 'No response after 3 attempts' },
                        { check: 'Civilian Deconfliction', status: 'PASS', note: 'No commercial traffic in sector' },
                        { check: 'Authority Level Check', status: 'PASS', note: 'O-6 approval required and present' }
                      ].map((item, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs">
                          {item.status === 'PASS' ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-s3m-operational flex-shrink-0 mt-0.5" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-s3m-critical flex-shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <div className="text-s3m-text-primary font-semibold">{item.check}</div>
                            <div className="text-s3m-text-tertiary">{item.note}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Expected Upside/Downside */}
                <div>
                  <button
                    onClick={() => toggleSection('upside')}
                    className="w-full flex items-center justify-between mb-2 hover:bg-s3m-elevated/50 p-2 rounded transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {expandedSections.upside ? <ChevronDown className="w-4 h-4 text-s3m-purple" /> : <ChevronRight className="w-4 h-4 text-s3m-purple" />}
                      <span className="text-xs text-s3m-text-tertiary uppercase tracking-wider font-semibold">
                        EXPECTED UPSIDE / DOWNSIDE
                      </span>
                    </div>
                  </button>
                  {expandedSections.upside && (
                    <div className="space-y-2 ml-6">
                      <div className="bg-s3m-operational/10 border-l-2 border-s3m-operational rounded p-2">
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingUp className="w-3.5 h-3.5 text-s3m-operational" />
                          <span className="text-base uppercase tracking-wider text-s3m-operational font-semibold">UPSIDE</span>
                        </div>
                        <ul className="space-y-1 text-xs text-s3m-text-secondary">
                          <li>• Neutralizes immediate threat to coalition airspace</li>
                          <li>• Prevents potential attack on defended assets</li>
                          <li>• Demonstrates robust defense posture</li>
                        </ul>
                      </div>
                      <div className="bg-s3m-critical/10 border-l-2 border-s3m-critical rounded p-2">
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingDown className="w-3.5 h-3.5 text-s3m-critical" />
                          <span className="text-base uppercase tracking-wider text-s3m-critical font-semibold">DOWNSIDE</span>
                        </div>
                        <ul className="space-y-1 text-xs text-s3m-text-secondary">
                          <li>• Possible civilian casualty if IFF malfunction</li>
                          <li>• Political fallout from premature engagement</li>
                          <li>• Resource expenditure on false positive</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {explainView === 'replay' && (
              <>
                <div className="bg-s3m-elevated rounded p-3">
                  <div className="text-xs text-s3m-text-tertiary uppercase tracking-wider font-semibold mb-2">
                    DECISION MOMENT
                  </div>
                  <div className="text-base text-s3m-text-secondary mb-2">
                    14:42:18Z - Decision presented to operator
                  </div>
                  <div className="font-mono text-xs text-s3m-cyan">
                    T-218 | 34.2°N, 45.7°E | 420 kts | 15K ft | IFF: NO RESP
                  </div>
                </div>

                <div>
                  <div className="text-xs text-s3m-text-tertiary uppercase tracking-wider font-semibold mb-2">
                    WHAT MODEL KNEW AT THAT MOMENT
                  </div>
                  <div className="space-y-1.5">
                    {[
                      { time: '14:42:05', event: 'Track velocity increased 15% over 30 seconds', confidence: 89 },
                      { time: '14:41:48', event: 'IFF interrogation timeout (3rd attempt)', confidence: 94 },
                      { time: '14:41:20', event: 'Trajectory intercept with defended airspace in 4m', confidence: 96 },
                      { time: '14:40:55', event: 'SIGINT detected encrypted burst transmission', confidence: 72 }
                    ].map((item, i) => (
                      <div key={i} className="bg-s3m-elevated rounded p-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono text-base text-s3m-text-tertiary">{item.time}</span>
                          <span className="font-mono text-base text-s3m-cyan">{item.confidence}%</span>
                        </div>
                        <div className="text-xs text-s3m-text-secondary">{item.event}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-s3m-text-tertiary uppercase tracking-wider font-semibold mb-2">
                    WHAT CHANGED AFTER
                  </div>
                  <div className="space-y-1.5">
                    <div className="bg-s3m-operational/10 border-l-2 border-s3m-operational rounded p-2">
                      <div className="font-mono text-base text-s3m-operational mb-1">14:43:42 (+1m 24s)</div>
                      <div className="text-xs text-s3m-text-secondary">
                        Track initiated descent and course change away from defended zone
                      </div>
                    </div>
                    <div className="bg-s3m-operational/10 border-l-2 border-s3m-operational rounded p-2">
                      <div className="font-mono text-base text-s3m-operational mb-1">14:44:18 (+2m 0s)</div>
                      <div className="text-xs text-s3m-text-secondary">
                        IFF response received - civilian charter with avionics failure
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-s3m-yellow/10 border border-s3m-yellow/40 rounded p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-s3m-yellow" />
                    <span className="text-xs uppercase tracking-wider font-semibold text-s3m-yellow">
                      OPERATOR OVERRIDE REASONING
                    </span>
                  </div>
                  <div className="text-base text-s3m-text-secondary leading-relaxed mb-2">
                    Operator chose to shadow and intercept rather than immediate engagement based on track behavior showing signs of navigation confusion rather than hostile intent.
                  </div>
                  <div className="text-xs text-s3m-text-tertiary">
                    Override authority: CDR J. Martinez (O-5) | Logged: 14:42:31Z
                  </div>
                </div>

                <div>
                  <div className="text-xs text-s3m-text-tertiary uppercase tracking-wider font-semibold mb-2">
                    OUTCOME ASSESSMENT
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-s3m-elevated rounded p-2">
                      <div className="text-base text-s3m-text-tertiary mb-1">Decision Accuracy</div>
                      <div className="font-mono text-s3m-operational">CORRECT</div>
                    </div>
                    <div className="bg-s3m-elevated rounded p-2">
                      <div className="text-base text-s3m-text-tertiary mb-1">Civilian Lives</div>
                      <div className="font-mono text-s3m-operational">SAVED (27)</div>
                    </div>
                    <div className="bg-s3m-elevated rounded p-2">
                      <div className="text-base text-s3m-text-tertiary mb-1">Response Time</div>
                      <div className="font-mono text-s3m-text-secondary">13s</div>
                    </div>
                    <div className="bg-s3m-elevated rounded p-2">
                      <div className="text-base text-s3m-text-tertiary mb-1">Resource Cost</div>
                      <div className="font-mono text-s3m-text-secondary">LOW</div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {explainView === 'alternatives' && (
              <>
                <div className="text-base text-s3m-text-secondary mb-2">
                  Compare alternative courses of action with risk assessment, resource requirements, and timeline projections.
                </div>

                {alternatives.map((coa) => (
                  <div key={coa.id} className="bg-s3m-elevated border border-s3m-border-default rounded p-3">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="text-base font-semibold text-s3m-text-primary">{coa.name}</div>
                        <div className="font-mono text-base text-s3m-text-tertiary">{coa.id}</div>
                      </div>
                      <div className="font-mono text-base" style={{
                        color: coa.riskDelta >= 70 ? '#EF4444' : coa.riskDelta >= 50 ? '#FFB800' : '#05DF72'
                      }}>
                        {coa.riskDelta}%
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-3.5 h-3.5 text-s3m-text-tertiary" />
                        <div>
                          <div className="text-base text-s3m-text-tertiary">Resource Cost</div>
                          <div className="text-xs font-semibold text-s3m-text-secondary">{coa.resourceCost}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Timer className="w-3.5 h-3.5 text-s3m-text-tertiary" />
                        <div>
                          <div className="text-base text-s3m-text-tertiary">Time to Effect</div>
                          <div className="text-xs font-semibold text-s3m-text-secondary">{coa.timeToEffect}</div>
                        </div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="text-base text-s3m-text-tertiary mb-1">Confidence Spread</div>
                      <ProgressBar value={coa.confidenceSpread} severity={coa.confidenceSpread >= 70 ? 'operational' : coa.confidenceSpread >= 50 ? 'caution' : 'critical'} />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <TrendingUp className="w-3 h-3 text-s3m-operational flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="text-base uppercase tracking-wider text-s3m-operational font-semibold">Upside</div>
                          <div className="text-xs text-s3m-text-secondary">{coa.upside}</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <TrendingDown className="w-3 h-3 text-s3m-critical flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="text-base uppercase tracking-wider text-s3m-critical font-semibold">Downside</div>
                          <div className="text-xs text-s3m-text-secondary">{coa.downside}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="bg-s3m-blue/10 border border-s3m-blue/40 rounded p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-s3m-blue" />
                    <span className="text-xs uppercase tracking-wider font-semibold text-s3m-blue">
                      RECOMMENDATION
                    </span>
                  </div>
                  <div className="text-base text-s3m-text-secondary leading-relaxed">
                    Based on current intelligence and ROE constraints, <span className="font-semibold text-s3m-text-primary">COA-B (Shadow & Intercept)</span> provides optimal balance of risk mitigation and positive identification while maintaining tactical flexibility.
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
