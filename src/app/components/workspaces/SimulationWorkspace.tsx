import { useState } from 'react';
import { CommandCard } from '../CommandCard';
import { Play, FileText, ChevronDown, ChevronRight, Library, Target, GitCompare, BarChart3, Radio, Zap, MapPin, Shield } from 'lucide-react';

export function SimulationWorkspace() {
  const [expandedScenarioLibrary, setExpandedScenarioLibrary] = useState(true);
  const [expandedMissionRehearsal, setExpandedMissionRehearsal] = useState(false);
  const [expandedHumanAI, setExpandedHumanAI] = useState(false);
  const [expandedAAR, setExpandedAAR] = useState(true);

  const scenarios = [
    { id: 'SIM-001', name: 'Convoy Ambush Response', status: 'COMPLETE', date: '2026-03-28' },
    { id: 'SIM-002', name: 'Air Defense Coordination', status: 'COMPLETE', date: '2026-03-30' },
    { id: 'SIM-003', name: 'Multi-Domain Strike', status: 'COMPLETE', date: '2026-04-01' }
  ];

  const scenarioLibrary = [
    {
      category: 'Baseline Doctrinal',
      templates: [
        { name: 'Movement to Contact', terrain: 'Open', forces: 'Battalion+', duration: '6-8hrs' },
        { name: 'Deliberate Attack', terrain: 'Urban', forces: 'Company+', duration: '4-6hrs' },
        { name: 'Hasty Defense', terrain: 'Mixed', forces: 'Company', duration: '3-5hrs' }
      ]
    },
    {
      category: 'Terrain-Specific',
      templates: [
        { name: 'Mountain Warfare', terrain: 'Alpine', forces: 'Platoon+', duration: '8-12hrs' },
        { name: 'Urban Operations', terrain: 'Dense Urban', forces: 'Squad+', duration: '4-8hrs' },
        { name: 'Desert Maneuver', terrain: 'Arid', forces: 'Battalion', duration: '10-14hrs' }
      ]
    },
    {
      category: 'Coalition Exercise',
      templates: [
        { name: 'Multinational Strike', terrain: 'Any', forces: '3+ Nations', duration: '12-24hrs' },
        { name: 'Joint Task Force', terrain: 'Littoral', forces: 'Brigade+', duration: '24-48hrs' }
      ]
    },
    {
      category: 'Cyber-Contested',
      templates: [
        { name: 'Degraded Networks', terrain: 'Any', forces: 'Company+', duration: '4-8hrs' },
        { name: 'GPS Denial', terrain: 'Any', forces: 'Battalion', duration: '6-10hrs' },
        { name: 'Full Spectrum Denied', terrain: 'Any', forces: 'Company+', duration: '6-12hrs' }
      ]
    }
  ];

  const missionRehearsalScenarios = [
    { name: 'Current Plan', status: 'Ready', degradation: 'None', confidence: 92 },
    { name: 'Degraded Comms', status: 'Ready', degradation: 'Voice only, no data', confidence: 67 },
    { name: 'GPS Loss', status: 'Ready', degradation: 'Dead reckoning, terrain nav', confidence: 54 },
    { name: 'Asset Loss', status: 'Ready', degradation: '2x UH-60, 1x ISR', confidence: 48 }
  ];

  const humanAIComparison = {
    humanCOA: {
      name: 'Human-Planned',
      successRate: 78,
      casualties: 12,
      timeToComplete: '4h 32m',
      resourceUtilization: 84,
      objectives: { primary: 'Achieved', secondary: 'Partial', tertiary: 'Not Achieved' }
    },
    aiCOA: {
      name: 'AI-Planned',
      successRate: 91,
      casualties: 4,
      timeToComplete: '3h 47m',
      resourceUtilization: 96,
      objectives: { primary: 'Achieved', secondary: 'Achieved', tertiary: 'Achieved' }
    },
    blendedCOA: {
      name: 'Blended',
      successRate: 94,
      casualties: 3,
      timeToComplete: '3h 52m',
      resourceUtilization: 92,
      objectives: { primary: 'Achieved', secondary: 'Achieved', tertiary: 'Achieved' }
    }
  };

  const aarData = {
    keyDecisionPoints: [
      { time: '00:14', decision: 'Route selection (north vs south)', actor: 'Human Commander', outcome: 'Optimal', impact: 'High' },
      { time: '01:23', decision: 'Asset reallocation to Sector 3', actor: 'AI Recommendation', outcome: 'Suboptimal', impact: 'Medium' },
      { time: '02:08', decision: 'Engage with indirect fire', actor: 'Blended (AI suggest, Human approve)', outcome: 'Optimal', impact: 'Critical' },
      { time: '03:41', decision: 'Extract vs consolidate', actor: 'Human Commander', outcome: 'Optimal', impact: 'High' }
    ],
    avoidableLosses: [
      { asset: 'UH-60 (Tail #823)', reason: 'Premature insertion', preventable: 'Yes', recommendation: 'AI flagged 2m prior' },
      { asset: '2x Infantry (1st Platoon)', reason: 'Exposed movement', preventable: 'Yes', recommendation: 'Route alternative available' }
    ],
    missedDetections: [
      { target: 'OPFOR reinforcements', time: '01:47', impact: 'Medium', reason: 'ISR gap in sector 4' },
      { target: 'Ambush position', time: '02:14', impact: 'High', reason: 'Pattern recognition failure' }
    ],
    timeToDecision: {
      avgHuman: '3m 24s',
      avgAI: '0m 08s',
      avgBlended: '1m 42s',
      criticalDecisions: 4,
      optimalDecisions: 3
    },
    recommendationQuality: {
      aiRecommendations: 18,
      accepted: 14,
      rejected: 4,
      correctAcceptance: 13,
      correctRejection: 3,
      accuracy: 89
    }
  };

  const findings = [
    'Response time to initial contact: 47 seconds (target: 60s)',
    'Coalition coordination delay: 2m 18s (acceptable)',
    'Asset repositioning completed 3 minutes ahead of schedule',
    'Communications maintained throughout engagement',
    'No friendly fire incidents'
  ];

  const lessons = [
    'Ground-air coordination protocols effective under pressure',
    'ISR asset saturation during peak engagement requires prioritization',
    'Coalition frequency management needs rehearsal'
  ];

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return '#22C55E';
    if (confidence >= 60) return '#EAB308';
    return '#EF4444';
  };

  const getOutcomeColor = (outcome: string) => {
    if (outcome === 'Optimal') return '#22C55E';
    if (outcome === 'Suboptimal') return '#EAB308';
    return '#EF4444';
  };

  return (
    <div className="p-4 h-full space-y-4 overflow-y-auto">
      {/* Top Row - Original Panels */}
      <div className="grid grid-cols-2 gap-4">
        {/* Scenario Authoring */}
        <CommandCard accentColor="#38BDF8" title="SCENARIO AUTHORING" indicator>
          <div className="bg-s3m-elevated border border-s3m-border-default rounded p-6 mb-4 text-center">
            <Play className="w-12 h-12 text-s3m-text-tertiary mx-auto mb-3" />
            <div className="text-[12px] text-s3m-text-tertiary mb-4">
              No active scenario
            </div>
            <button className="bg-s3m-cyan text-s3m-base px-4 py-2 rounded text-[11px] font-semibold uppercase tracking-wider hover:bg-s3m-cyan/90 transition-colors">
              NEW SCENARIO
            </button>
          </div>

          <div>
            <div className="text-[10px] text-s3m-text-tertiary uppercase tracking-wider mb-3">
              RECENT SCENARIOS
            </div>
            <div className="space-y-2">
              {scenarios.map((scenario, i) => (
                <div
                  key={i}
                  className="border border-s3m-border-default rounded p-3 hover:border-s3m-border-emphasis hover:bg-s3m-elevated transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-1">
                    <span className="font-mono text-[11px] text-s3m-text-tertiary">
                      {scenario.id}
                    </span>
                    <span className="text-[9px] uppercase tracking-wider text-s3m-operational">
                      {scenario.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-s3m-text-primary mb-1">
                    {scenario.name}
                  </div>
                  <div className="text-[9px] text-s3m-text-tertiary">
                    {scenario.date}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CommandCard>

        {/* After Action Review */}
        <CommandCard accentColor="#22C55E" title="AFTER ACTION REVIEW" indicator>
          <div className="mb-4 pb-4 border-b border-s3m-border-default">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="font-mono text-[12px] text-s3m-text-tertiary mb-1">SIM-003</div>
                <div className="text-[13px] font-semibold text-s3m-text-primary mb-1">
                  Multi-Domain Strike
                </div>
                <div className="text-[10px] text-s3m-text-tertiary">2026-04-01</div>
              </div>
              <div className="text-right">
                <div className="text-[9px] text-s3m-text-tertiary uppercase tracking-wider mb-1">
                  OUTCOME
                </div>
                <div className="text-[12px] font-semibold text-s3m-operational">
                  MISSION SUCCESS
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-3">
              <div className="bg-s3m-elevated rounded p-2">
                <div className="text-[9px] text-s3m-text-tertiary uppercase mb-0.5">Duration</div>
                <div className="font-mono text-[11px] text-s3m-text-secondary">2h 14m</div>
              </div>
              <div className="bg-s3m-elevated rounded p-2">
                <div className="text-[9px] text-s3m-text-tertiary uppercase mb-0.5">Blue KIA</div>
                <div className="font-mono text-[11px] text-s3m-operational">0</div>
              </div>
              <div className="bg-s3m-elevated rounded p-2">
                <div className="text-[9px] text-s3m-text-tertiary uppercase mb-0.5">OPFOR</div>
                <div className="font-mono text-[11px] text-s3m-text-secondary">2/3</div>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <div className="text-[10px] text-s3m-text-tertiary uppercase tracking-wider mb-2 flex items-center gap-1">
              <FileText className="w-3 h-3" />
              KEY FINDINGS
            </div>
            <div className="space-y-1.5">
              {findings.map((finding, i) => (
                <div key={i} className="flex gap-2 text-[10px] text-s3m-text-secondary">
                  <span className="text-s3m-cyan">→</span>
                  <span>{finding}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[10px] text-s3m-text-tertiary uppercase tracking-wider mb-2 flex items-center gap-1">
              <FileText className="w-3 h-3" />
              LESSONS LEARNED
            </div>
            <div className="space-y-2">
              {lessons.map((lesson, i) => (
                <div key={i} className="border-l-2 border-s3m-caution bg-s3m-caution/5 pl-3 py-2 rounded">
                  <div className="flex gap-2 text-[10px] text-s3m-text-secondary">
                    <span className="text-s3m-caution">⚠</span>
                    <span>{lesson}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CommandCard>
      </div>

      {/* Scenario Library Section */}
      <div className="bg-s3m-card border border-s3m-border-default rounded-lg p-3">
        <button
          onClick={() => setExpandedScenarioLibrary(!expandedScenarioLibrary)}
          className="w-full flex items-center gap-2 mb-3 hover:bg-s3m-elevated/30 p-1 rounded transition-colors"
        >
          {expandedScenarioLibrary ? (
            <ChevronDown className="w-4 h-4 text-s3m-cyan" />
          ) : (
            <ChevronRight className="w-4 h-4 text-s3m-cyan" />
          )}
          <Library className="w-4 h-4 text-s3m-cyan" />
          <span className="text-[11px] text-s3m-text-tertiary uppercase tracking-wider font-semibold">
            SCENARIO LIBRARY
          </span>
        </button>

        {expandedScenarioLibrary && (
          <div className="grid grid-cols-2 gap-3">
            {scenarioLibrary.map((category) => (
              <div key={category.category} className="bg-s3m-elevated border border-s3m-border-default rounded-lg p-3">
                <div className="flex items-center gap-2 mb-3">
                  {category.category === 'Baseline Doctrinal' && <Target className="w-3 h-3 text-s3m-cyan" />}
                  {category.category === 'Terrain-Specific' && <MapPin className="w-3 h-3 text-s3m-cyan" />}
                  {category.category === 'Coalition Exercise' && <Shield className="w-3 h-3 text-s3m-cyan" />}
                  {category.category === 'Cyber-Contested' && <Zap className="w-3 h-3 text-s3m-cyan" />}
                  <span className="text-[10px] text-s3m-text-primary font-semibold uppercase">
                    {category.category}
                  </span>
                </div>
                <div className="space-y-2">
                  {category.templates.map((template, idx) => (
                    <div
                      key={idx}
                      className="bg-s3m-card border border-s3m-border-default rounded p-2 hover:border-s3m-cyan/40 transition-colors cursor-pointer"
                    >
                      <div className="text-[10px] text-s3m-text-primary font-semibold mb-1">
                        {template.name}
                      </div>
                      <div className="grid grid-cols-3 gap-1 text-[8px]">
                        <div>
                          <span className="text-s3m-text-tertiary">Terrain:</span>
                          <span className="text-s3m-text-primary ml-1">{template.terrain}</span>
                        </div>
                        <div>
                          <span className="text-s3m-text-tertiary">Forces:</span>
                          <span className="text-s3m-text-primary ml-1">{template.forces}</span>
                        </div>
                        <div>
                          <span className="text-s3m-text-tertiary">Duration:</span>
                          <span className="text-s3m-text-primary ml-1">{template.duration}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mission Rehearsal Section */}
      <div className="bg-s3m-card border border-s3m-border-default rounded-lg p-3">
        <button
          onClick={() => setExpandedMissionRehearsal(!expandedMissionRehearsal)}
          className="w-full flex items-center gap-2 mb-3 hover:bg-s3m-elevated/30 p-1 rounded transition-colors"
        >
          {expandedMissionRehearsal ? (
            <ChevronDown className="w-4 h-4 text-s3m-cyan" />
          ) : (
            <ChevronRight className="w-4 h-4 text-s3m-cyan" />
          )}
          <Play className="w-4 h-4 text-s3m-cyan" />
          <span className="text-[11px] text-s3m-text-tertiary uppercase tracking-wider font-semibold">
            MISSION REHEARSAL
          </span>
        </button>

        {expandedMissionRehearsal && (
          <div className="grid grid-cols-4 gap-3">
            {missionRehearsalScenarios.map((scenario) => (
              <div
                key={scenario.name}
                className="bg-s3m-elevated border border-s3m-border-default rounded-lg p-3 hover:border-s3m-cyan/40 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[11px] text-s3m-text-primary font-semibold">
                    {scenario.name}
                  </div>
                  <span className="text-[8px] uppercase tracking-wider text-s3m-green px-1.5 py-0.5 rounded" style={{ background: '#22C55E20', border: '1px solid #22C55E40' }}>
                    {scenario.status}
                  </span>
                </div>
                <div className="bg-s3m-card rounded p-2 mb-2">
                  <div className="text-[8px] text-s3m-text-tertiary uppercase mb-1">Degradation</div>
                  <div className="text-[9px] text-s3m-text-primary">{scenario.degradation}</div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[8px] text-s3m-text-tertiary uppercase">Confidence</span>
                  <span className="text-[11px] font-mono font-semibold" style={{ color: getConfidenceColor(scenario.confidence) }}>
                    {scenario.confidence}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Human vs AI Comparison Section */}
      <div className="bg-s3m-card border border-s3m-border-default rounded-lg p-3">
        <button
          onClick={() => setExpandedHumanAI(!expandedHumanAI)}
          className="w-full flex items-center gap-2 mb-3 hover:bg-s3m-elevated/30 p-1 rounded transition-colors"
        >
          {expandedHumanAI ? (
            <ChevronDown className="w-4 h-4 text-s3m-cyan" />
          ) : (
            <ChevronRight className="w-4 h-4 text-s3m-cyan" />
          )}
          <GitCompare className="w-4 h-4 text-s3m-cyan" />
          <span className="text-[11px] text-s3m-text-tertiary uppercase tracking-wider font-semibold">
            HUMAN VS AI COMPARISON
          </span>
        </button>

        {expandedHumanAI && (
          <div className="grid grid-cols-3 gap-3">
            {[humanAIComparison.humanCOA, humanAIComparison.aiCOA, humanAIComparison.blendedCOA].map((coa) => (
              <div key={coa.name} className="bg-s3m-elevated border border-s3m-border-default rounded-lg p-3">
                <div className="text-[11px] text-s3m-text-primary font-semibold mb-3 text-center">
                  {coa.name}
                </div>

                <div className="space-y-2 mb-3">
                  <div className="flex items-center justify-between bg-s3m-card rounded p-1.5">
                    <span className="text-[9px] text-s3m-text-tertiary uppercase">Success Rate</span>
                    <span className="text-[11px] font-mono font-semibold text-s3m-green">{coa.successRate}%</span>
                  </div>
                  <div className="flex items-center justify-between bg-s3m-card rounded p-1.5">
                    <span className="text-[9px] text-s3m-text-tertiary uppercase">Casualties</span>
                    <span className="text-[11px] font-mono font-semibold text-s3m-text-primary">{coa.casualties}</span>
                  </div>
                  <div className="flex items-center justify-between bg-s3m-card rounded p-1.5">
                    <span className="text-[9px] text-s3m-text-tertiary uppercase">Time</span>
                    <span className="text-[11px] font-mono font-semibold text-s3m-text-primary">{coa.timeToComplete}</span>
                  </div>
                  <div className="flex items-center justify-between bg-s3m-card rounded p-1.5">
                    <span className="text-[9px] text-s3m-text-tertiary uppercase">Resources</span>
                    <span className="text-[11px] font-mono font-semibold text-s3m-cyan">{coa.resourceUtilization}%</span>
                  </div>
                </div>

                <div className="bg-s3m-card rounded p-2">
                  <div className="text-[8px] text-s3m-text-tertiary uppercase mb-1">Objectives</div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[9px]">
                      <span className="text-s3m-text-tertiary">Primary:</span>
                      <span style={{ color: coa.objectives.primary === 'Achieved' ? '#22C55E' : '#EF4444' }}>
                        {coa.objectives.primary}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[9px]">
                      <span className="text-s3m-text-tertiary">Secondary:</span>
                      <span style={{ color: coa.objectives.secondary === 'Achieved' ? '#22C55E' : coa.objectives.secondary === 'Partial' ? '#EAB308' : '#EF4444' }}>
                        {coa.objectives.secondary}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[9px]">
                      <span className="text-s3m-text-tertiary">Tertiary:</span>
                      <span style={{ color: coa.objectives.tertiary === 'Achieved' ? '#22C55E' : '#EF4444' }}>
                        {coa.objectives.tertiary}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AAR Panel Section */}
      <div className="bg-s3m-card border border-s3m-border-default rounded-lg p-3">
        <button
          onClick={() => setExpandedAAR(!expandedAAR)}
          className="w-full flex items-center gap-2 mb-3 hover:bg-s3m-elevated/30 p-1 rounded transition-colors"
        >
          {expandedAAR ? (
            <ChevronDown className="w-4 h-4 text-s3m-cyan" />
          ) : (
            <ChevronRight className="w-4 h-4 text-s3m-cyan" />
          )}
          <BarChart3 className="w-4 h-4 text-s3m-cyan" />
          <span className="text-[11px] text-s3m-text-tertiary uppercase tracking-wider font-semibold">
            AAR ANALYTICS
          </span>
        </button>

        {expandedAAR && (
          <div className="space-y-3">
            {/* Key Decision Points */}
            <div>
              <div className="text-[10px] text-s3m-text-tertiary uppercase tracking-wider font-semibold mb-2">
                Key Decision Points
              </div>
              <div className="space-y-2">
                {aarData.keyDecisionPoints.map((decision, idx) => (
                  <div key={idx} className="bg-s3m-elevated border border-s3m-border-default rounded-lg p-2">
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-s3m-text-tertiary">{decision.time}</span>
                        <span className="text-[10px] text-s3m-text-primary">{decision.decision}</span>
                      </div>
                      <span
                        className="text-[8px] uppercase font-semibold px-1.5 py-0.5 rounded"
                        style={{
                          color: getOutcomeColor(decision.outcome),
                          background: `${getOutcomeColor(decision.outcome)}20`,
                          border: `1px solid ${getOutcomeColor(decision.outcome)}40`
                        }}
                      >
                        {decision.outcome}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[9px]">
                      <span className="text-s3m-text-tertiary">{decision.actor}</span>
                      <span className="text-s3m-cyan">Impact: {decision.impact}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Avoidable Losses */}
              <div>
                <div className="text-[10px] text-s3m-text-tertiary uppercase tracking-wider font-semibold mb-2">
                  Avoidable Losses
                </div>
                <div className="space-y-2">
                  {aarData.avoidableLosses.map((loss, idx) => (
                    <div key={idx} className="bg-s3m-elevated border border-s3m-border-default rounded-lg p-2">
                      <div className="text-[10px] text-s3m-text-primary font-semibold mb-1">{loss.asset}</div>
                      <div className="text-[9px] text-s3m-text-tertiary mb-1">Reason: {loss.reason}</div>
                      <div className="flex items-center justify-between text-[8px]">
                        <span style={{ color: loss.preventable === 'Yes' ? '#EF4444' : '#22C55E' }}>
                          Preventable: {loss.preventable}
                        </span>
                      </div>
                      <div className="text-[8px] text-s3m-cyan mt-1">{loss.recommendation}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Missed Detections */}
              <div>
                <div className="text-[10px] text-s3m-text-tertiary uppercase tracking-wider font-semibold mb-2">
                  Missed Detections
                </div>
                <div className="space-y-2">
                  {aarData.missedDetections.map((detection, idx) => (
                    <div key={idx} className="bg-s3m-elevated border border-s3m-border-default rounded-lg p-2">
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-[10px] text-s3m-text-primary font-semibold">{detection.target}</div>
                        <span className="font-mono text-[9px] text-s3m-text-tertiary">{detection.time}</span>
                      </div>
                      <div className="text-[9px] text-s3m-text-tertiary mb-1">{detection.reason}</div>
                      <span
                        className="text-[8px] uppercase font-semibold"
                        style={{ color: detection.impact === 'High' ? '#EF4444' : '#EAB308' }}
                      >
                        Impact: {detection.impact}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Time to Decision */}
              <div className="bg-s3m-elevated border border-s3m-border-default rounded-lg p-3">
                <div className="text-[10px] text-s3m-text-tertiary uppercase tracking-wider font-semibold mb-2">
                  Time to Decision
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between bg-s3m-card rounded p-1.5">
                    <span className="text-[9px] text-s3m-text-tertiary uppercase">Human Avg</span>
                    <span className="text-[11px] font-mono font-semibold text-s3m-text-primary">{aarData.timeToDecision.avgHuman}</span>
                  </div>
                  <div className="flex items-center justify-between bg-s3m-card rounded p-1.5">
                    <span className="text-[9px] text-s3m-text-tertiary uppercase">AI Avg</span>
                    <span className="text-[11px] font-mono font-semibold text-s3m-cyan">{aarData.timeToDecision.avgAI}</span>
                  </div>
                  <div className="flex items-center justify-between bg-s3m-card rounded p-1.5">
                    <span className="text-[9px] text-s3m-text-tertiary uppercase">Blended Avg</span>
                    <span className="text-[11px] font-mono font-semibold text-s3m-green">{aarData.timeToDecision.avgBlended}</span>
                  </div>
                  <div className="flex items-center justify-between bg-s3m-card rounded p-1.5">
                    <span className="text-[9px] text-s3m-text-tertiary uppercase">Optimal Rate</span>
                    <span className="text-[11px] font-mono font-semibold text-s3m-green">
                      {aarData.timeToDecision.optimalDecisions}/{aarData.timeToDecision.criticalDecisions}
                    </span>
                  </div>
                </div>
              </div>

              {/* Recommendation Quality */}
              <div className="bg-s3m-elevated border border-s3m-border-default rounded-lg p-3">
                <div className="text-[10px] text-s3m-text-tertiary uppercase tracking-wider font-semibold mb-2">
                  Recommendation Quality
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between bg-s3m-card rounded p-1.5">
                    <span className="text-[9px] text-s3m-text-tertiary uppercase">Total</span>
                    <span className="text-[11px] font-mono font-semibold text-s3m-text-primary">{aarData.recommendationQuality.aiRecommendations}</span>
                  </div>
                  <div className="flex items-center justify-between bg-s3m-card rounded p-1.5">
                    <span className="text-[9px] text-s3m-text-tertiary uppercase">Accepted</span>
                    <span className="text-[11px] font-mono font-semibold text-s3m-green">{aarData.recommendationQuality.accepted}</span>
                  </div>
                  <div className="flex items-center justify-between bg-s3m-card rounded p-1.5">
                    <span className="text-[9px] text-s3m-text-tertiary uppercase">Rejected</span>
                    <span className="text-[11px] font-mono font-semibold text-s3m-text-primary">{aarData.recommendationQuality.rejected}</span>
                  </div>
                  <div className="flex items-center justify-between bg-s3m-card rounded p-1.5">
                    <span className="text-[9px] text-s3m-text-tertiary uppercase">Accuracy</span>
                    <span className="text-[11px] font-mono font-semibold text-s3m-cyan">{aarData.recommendationQuality.accuracy}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
