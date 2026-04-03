import { CommandCard } from '../CommandCard';
import { StatusIndicator } from '../StatusIndicator';
import { CheckCircle2, Circle, Target, Users, Clock, Wrench, GitBranch, Shield, Package, Cloud, Radio, Mountain, Globe, AlertTriangle, TrendingUp, Timer, DollarSign, Activity, ChevronDown, ChevronRight, Lock, Sparkles, Lightbulb } from 'lucide-react';
import { useState } from 'react';

export function PlanningWorkspace() {
  const [expandedCOA, setExpandedCOA] = useState<string | null>('COA-2');
  const [expandedConstraint, setExpandedConstraint] = useState<string | null>(null);
  const [expandedReplan, setExpandedReplan] = useState(false);
  const [selectedMission, setSelectedMission] = useState<string>('hostile-track');
  const [expandedSuggestions, setExpandedSuggestions] = useState(true);

  const phases = [
    { name: 'ISR Sweep', status: 'COMPLETE', color: '#22C55E', icon: CheckCircle2 },
    { name: 'Establish Track', status: 'ACTIVE', color: '#38BDF8', icon: Circle },
    { name: 'ROE Escalation', status: 'PENDING', color: '#607590', icon: Circle },
    { name: 'Secure Corridor', status: 'PENDING', color: '#607590', icon: Circle },
    { name: 'Coalition Handoff', status: 'PENDING', color: '#607590', icon: Circle }
  ];

  const coas = [
    {
      id: 'COA-1',
      name: 'Direct Engagement',
      risk: 'HIGH',
      recommended: false,
      color: '#EF4444',
      desc: 'Immediate weapons release on hostile track',
      objectives: ['Neutralize T-218', 'Secure Sector 7-B airspace'],
      assets: ['2x F-16', '1x AWACS', 'SAM Battery Alpha'],
      timeWindow: '4m 30s',
      support: ['Medevac standby', 'Coalition deconfliction'],
      branch: 'If IFF response → Abort to COA-2',
      sequel: 'Establish CAP over sector',
      speed: 92,
      survivability: 68,
      logisticsCost: 78,
      politicalSensitivity: 85
    },
    {
      id: 'COA-2',
      name: 'Shadow and Report',
      risk: 'LOW',
      recommended: true,
      color: '#22C55E',
      desc: 'Monitor track and coordinate coalition response',
      objectives: ['Maintain visual contact', 'Gather intelligence', 'Prepare intercept'],
      assets: ['1x F-16', '1x AWACS', 'Datalink Node 8'],
      timeWindow: '12m 15s',
      support: ['Coalition coordination', 'SIGINT support'],
      branch: 'If hostile action → Execute COA-1',
      sequel: 'Coalition handoff at border',
      speed: 58,
      survivability: 88,
      logisticsCost: 34,
      politicalSensitivity: 22
    },
    {
      id: 'COA-3',
      name: 'Coalition Handoff',
      risk: 'MEDIUM',
      recommended: false,
      color: '#EAB308',
      desc: 'Transfer authority to regional partner',
      objectives: ['Coordinate transfer', 'Maintain situational awareness'],
      assets: ['1x AWACS', 'Liaison Officer'],
      timeWindow: '8m 45s',
      support: ['Diplomatic clearance', 'Partner nation assets'],
      branch: 'If partner unavailable → Execute COA-2',
      sequel: 'Monitor partner response',
      speed: 42,
      survivability: 72,
      logisticsCost: 18,
      politicalSensitivity: 65
    }
  ];

  const constraints = [
    {
      id: 'roe',
      name: 'ROE',
      icon: Shield,
      color: '#EF4444',
      items: [
        { label: 'Engagement Authority', value: 'O-6 Required', status: 'ACTIVE' },
        { label: 'IFF Verification', value: '3 Attempts Mandatory', status: 'ENFORCED' },
        { label: 'Civilian Deconfliction', value: 'Required', status: 'ACTIVE' }
      ]
    },
    {
      id: 'logistics',
      name: 'Logistics',
      icon: Package,
      color: '#EAB308',
      items: [
        { label: 'Fuel State', value: '14h 32m remaining', status: 'CAUTION' },
        { label: 'Munitions', value: '78% available', status: 'OPERATIONAL' },
        { label: 'Maintenance', value: '3 aircraft down', status: 'DEGRADED' }
      ]
    },
    {
      id: 'weather',
      name: 'Weather',
      icon: Cloud,
      color: '#38BDF8',
      items: [
        { label: 'Visibility', value: '10+ km', status: 'OPTIMAL' },
        { label: 'Ceiling', value: '8000 ft', status: 'OPERATIONAL' },
        { label: 'Winds', value: '15 kts', status: 'OPTIMAL' }
      ]
    },
    {
      id: 'comms',
      name: 'Comms',
      icon: Radio,
      color: '#8B5CF6',
      items: [
        { label: 'SATCOM', value: 'Latency spikes', status: 'DEGRADED' },
        { label: 'Datalink', value: 'Operational', status: 'OPERATIONAL' },
        { label: 'Coalition Link', value: 'Active', status: 'OPERATIONAL' }
      ]
    },
    {
      id: 'terrain',
      name: 'Terrain',
      icon: Mountain,
      color: '#22C55E',
      items: [
        { label: 'Elevation', value: 'Low threat', status: 'FAVORABLE' },
        { label: 'Radar Coverage', value: 'Good', status: 'OPERATIONAL' },
        { label: 'Alternate LZs', value: '4 available', status: 'OPERATIONAL' }
      ]
    },
    {
      id: 'coalition',
      name: 'Coalition Limitations',
      icon: Globe,
      color: '#EF4444',
      items: [
        { label: 'Airspace Restrictions', value: 'Sector 5 no-fly', status: 'RESTRICTED' },
        { label: 'Partner Availability', value: 'Response time 8m', status: 'CAUTION' },
        { label: 'Political Sensitivity', value: 'High', status: 'CAUTION' }
      ]
    }
  ];

  const replanTriggers = [
    { condition: 'Track velocity > 500 kts', action: 'Auto-escalate to COA-1', locked: false },
    { condition: 'IFF positive response', action: 'Auto-abort to monitoring', locked: false },
    { condition: 'Fuel < 10h remaining', action: 'Activate reserve convoy', locked: true },
    { condition: 'Coalition objection', action: 'Defer to diplomatic channel', locked: true }
  ];

  const alternateRoutes = [
    { id: 'Route Delta', status: 'STANDBY', time: '+2h 15m', risk: 'MEDIUM' },
    { id: 'Route Echo', status: 'READY', time: '+45m', risk: 'HIGH' },
    { id: 'Route Foxtrot', status: 'RESTRICTED', time: '+3h 30m', risk: 'LOW' }
  ];

  const bestCOAByMetric = [
    { metric: 'Speed', coa: 'COA-1', value: 92, color: '#EF4444', icon: Timer },
    { metric: 'Survivability', coa: 'COA-2', value: 88, color: '#22C55E', icon: Shield },
    { metric: 'Logistics Cost', coa: 'COA-3', value: 18, color: '#22C55E', icon: DollarSign },
    { metric: 'Political Sensitivity', coa: 'COA-2', value: 22, color: '#22C55E', icon: Globe }
  ];

  const missions = [
    { id: 'hostile-track', name: 'Hostile Track T-218', priority: 'CRITICAL', category: 'Air Defense' },
    { id: 'convoy-escort', name: 'Convoy Escort Bravo-4', priority: 'HIGH', category: 'Ground Security' },
    { id: 'sector-patrol', name: 'Sector 7-B Patrol', priority: 'ROUTINE', category: 'ISR' },
    { id: 'coalition-handoff', name: 'Coalition Transition', priority: 'MEDIUM', category: 'Diplomatic' }
  ];

  const aiSuggestions = [
    {
      type: 'optimization',
      title: 'Alternate Asset Allocation',
      description: 'Consider reallocating F-16 from CAP patrol to direct engagement - improves response time by 2m 15s',
      confidence: 87,
      impact: 'HIGH',
      color: '#38BDF8'
    },
    {
      type: 'risk',
      title: 'Weather Window Closing',
      description: 'Optimal weather window closes in 45m - recommend accelerating COA decision timeline',
      confidence: 92,
      impact: 'CRITICAL',
      color: '#EF4444'
    },
    {
      type: 'coordination',
      title: 'Coalition Asset Availability',
      description: 'Partner nation AWACS available in 8m - could reduce own asset commitment by 40%',
      confidence: 78,
      impact: 'MEDIUM',
      color: '#22C55E'
    },
    {
      type: 'intelligence',
      title: 'Pattern Recognition Match',
      description: 'Track T-218 behavior matches 3 previous benign civilian flights on this route',
      confidence: 65,
      impact: 'HIGH',
      color: '#8B5CF6'
    }
  ];

  const currentMission = missions.find(m => m.id === selectedMission);

  return (
    <div className="p-4 h-full flex flex-col gap-4">
      {/* Mission Selector */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-s3m-text-tertiary uppercase tracking-wider font-semibold">
            PLANNING FOR:
          </span>
          <select
            value={selectedMission}
            onChange={(e) => setSelectedMission(e.target.value)}
            className="bg-s3m-elevated border border-s3m-border-default rounded px-3 py-1.5 text-[11px] font-semibold text-s3m-text-primary cursor-pointer focus:outline-none focus:border-s3m-cyan transition-colors"
          >
            {missions.map(mission => (
              <option key={mission.id} value={mission.id}>
                {mission.name} • {mission.priority} • {mission.category}
              </option>
            ))}
          </select>
        </div>
        {currentMission && (
          <div className="flex items-center gap-2">
            <span
              className="text-[9px] uppercase tracking-wider font-semibold px-2 py-1 rounded"
              style={{
                color: currentMission.priority === 'CRITICAL' ? '#EF4444' : currentMission.priority === 'HIGH' ? '#EAB308' : currentMission.priority === 'MEDIUM' ? '#38BDF8' : '#22C55E',
                backgroundColor: currentMission.priority === 'CRITICAL' ? '#EF444420' : currentMission.priority === 'HIGH' ? '#EAB30820' : currentMission.priority === 'MEDIUM' ? '#38BDF820' : '#22C55E20'
              }}
            >
              {currentMission.priority}
            </span>
          </div>
        )}
      </div>

      {/* Top Row - Decision Support */}
      <div className="grid grid-cols-4 gap-3">
        {bestCOAByMetric.map((item) => {
          const Icon = item.icon;
          return (
            <CommandCard key={item.metric}>
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4" style={{ color: item.color }} />
                <span className="text-[9px] text-s3m-text-tertiary uppercase tracking-wider font-semibold">
                  BEST BY {item.metric.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-semibold text-s3m-text-primary">{item.coa}</span>
                <span className="font-mono text-[14px] font-bold" style={{ color: item.color }}>
                  {item.value}
                </span>
              </div>
            </CommandCard>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-3 gap-4 min-h-0">
        {/* Left Column - COA Builder */}
        <div className="overflow-y-auto">
          <CommandCard accentColor="#38BDF8" title="COA BUILDER" indicator>
            <div className="space-y-2">
              {coas.map((coa) => {
                const isExpanded = expandedCOA === coa.id;

                return (
                  <div
                    key={coa.id}
                    className={`border-2 rounded transition-all ${
                      coa.recommended
                        ? 'border-s3m-operational bg-s3m-operational/5'
                        : 'border-s3m-border-default'
                    }`}
                  >
                    <button
                      onClick={() => setExpandedCOA(isExpanded ? null : coa.id)}
                      className="w-full p-3 hover:bg-s3m-elevated/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4" style={{ color: coa.color }} />
                          ) : (
                            <ChevronRight className="w-4 h-4" style={{ color: coa.color }} />
                          )}
                          <span className="font-mono text-[11px] text-s3m-text-tertiary">
                            {coa.id}
                          </span>
                          <span className="text-[12px] font-semibold text-s3m-text-primary">
                            {coa.name}
                          </span>
                        </div>
                        <span
                          className="text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded"
                          style={{
                            color: coa.color,
                            backgroundColor: `${coa.color}20`
                          }}
                        >
                          {coa.risk} RISK
                        </span>
                      </div>
                      <div className="text-[10px] text-s3m-text-tertiary text-left">
                        {coa.desc}
                      </div>
                      {coa.recommended && (
                        <div className="flex items-center gap-1 text-s3m-operational mt-2">
                          <CheckCircle2 className="w-3 h-3" />
                          <span className="text-[9px] uppercase tracking-wider font-semibold">
                            RECOMMENDED
                          </span>
                        </div>
                      )}
                    </button>

                    {isExpanded && (
                      <div className="px-3 pb-3 space-y-3 border-t border-s3m-border-default pt-3">
                        {/* Objectives */}
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Target className="w-3.5 h-3.5 text-s3m-cyan" />
                            <span className="text-[9px] text-s3m-text-tertiary uppercase tracking-wider font-semibold">
                              OBJECTIVES
                            </span>
                          </div>
                          <ul className="space-y-1">
                            {coa.objectives.map((obj, i) => (
                              <li key={i} className="text-[10px] text-s3m-text-secondary flex items-start gap-2">
                                <span className="text-s3m-cyan">•</span>
                                <span>{obj}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Assets */}
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Users className="w-3.5 h-3.5 text-s3m-purple" />
                            <span className="text-[9px] text-s3m-text-tertiary uppercase tracking-wider font-semibold">
                              ASSETS
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {coa.assets.map((asset, i) => (
                              <span
                                key={i}
                                className="text-[9px] px-2 py-1 rounded bg-s3m-elevated text-s3m-text-secondary"
                              >
                                {asset}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Time Window */}
                        <div className="bg-s3m-elevated rounded p-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Clock className="w-3.5 h-3.5 text-s3m-yellow" />
                              <span className="text-[9px] text-s3m-text-tertiary uppercase tracking-wider font-semibold">
                                TIME WINDOW
                              </span>
                            </div>
                            <span className="font-mono text-[11px] text-s3m-text-primary font-semibold">
                              {coa.timeWindow}
                            </span>
                          </div>
                        </div>

                        {/* Support Requirements */}
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Wrench className="w-3.5 h-3.5 text-s3m-operational" />
                            <span className="text-[9px] text-s3m-text-tertiary uppercase tracking-wider font-semibold">
                              SUPPORT REQUIREMENTS
                            </span>
                          </div>
                          <ul className="space-y-1">
                            {coa.support.map((supp, i) => (
                              <li key={i} className="text-[10px] text-s3m-text-secondary flex items-start gap-2">
                                <span className="text-s3m-operational">•</span>
                                <span>{supp}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Branch / Sequel Plans */}
                        <div className="space-y-2">
                          <div className="bg-s3m-blue/10 border-l-2 border-s3m-blue rounded p-2">
                            <div className="flex items-center gap-2 mb-1">
                              <GitBranch className="w-3 h-3 text-s3m-blue" />
                              <span className="text-[9px] text-s3m-blue uppercase tracking-wider font-semibold">
                                BRANCH PLAN
                              </span>
                            </div>
                            <div className="text-[10px] text-s3m-text-secondary">{coa.branch}</div>
                          </div>
                          <div className="bg-s3m-purple/10 border-l-2 border-s3m-purple rounded p-2">
                            <div className="flex items-center gap-2 mb-1">
                              <Activity className="w-3 h-3 text-s3m-purple" />
                              <span className="text-[9px] text-s3m-purple uppercase tracking-wider font-semibold">
                                SEQUEL PLAN
                              </span>
                            </div>
                            <div className="text-[10px] text-s3m-text-secondary">{coa.sequel}</div>
                          </div>
                        </div>

                        {/* Performance Metrics */}
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-s3m-elevated rounded p-2">
                            <div className="text-[9px] text-s3m-text-tertiary mb-1">Speed</div>
                            <div className="font-mono text-[11px] font-semibold" style={{ color: coa.speed >= 80 ? '#22C55E' : coa.speed >= 50 ? '#EAB308' : '#EF4444' }}>
                              {coa.speed}
                            </div>
                          </div>
                          <div className="bg-s3m-elevated rounded p-2">
                            <div className="text-[9px] text-s3m-text-tertiary mb-1">Survivability</div>
                            <div className="font-mono text-[11px] font-semibold" style={{ color: coa.survivability >= 80 ? '#22C55E' : coa.survivability >= 50 ? '#EAB308' : '#EF4444' }}>
                              {coa.survivability}
                            </div>
                          </div>
                          <div className="bg-s3m-elevated rounded p-2">
                            <div className="text-[9px] text-s3m-text-tertiary mb-1">Logistics Cost</div>
                            <div className="font-mono text-[11px] font-semibold" style={{ color: coa.logisticsCost <= 40 ? '#22C55E' : coa.logisticsCost <= 70 ? '#EAB308' : '#EF4444' }}>
                              {coa.logisticsCost}
                            </div>
                          </div>
                          <div className="bg-s3m-elevated rounded p-2">
                            <div className="text-[9px] text-s3m-text-tertiary mb-1">Political Risk</div>
                            <div className="font-mono text-[11px] font-semibold" style={{ color: coa.politicalSensitivity <= 40 ? '#22C55E' : coa.politicalSensitivity <= 70 ? '#EAB308' : '#EF4444' }}>
                              {coa.politicalSensitivity}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CommandCard>
        </div>

        {/* Center Column - Constraint Board */}
        <div className="overflow-y-auto">
          <CommandCard accentColor="#F97316" title="CONSTRAINT BOARD" indicator>
            <div className="space-y-2">
              {constraints.map((constraint) => {
                const Icon = constraint.icon;
                const isExpanded = expandedConstraint === constraint.id;

                return (
                  <div key={constraint.id} className="bg-s3m-elevated rounded">
                    <button
                      onClick={() => setExpandedConstraint(isExpanded ? null : constraint.id)}
                      className="w-full flex items-center justify-between p-2.5 hover:bg-s3m-elevated-hover transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" style={{ color: constraint.color }} />
                        ) : (
                          <ChevronRight className="w-4 h-4" style={{ color: constraint.color }} />
                        )}
                        <Icon className="w-4 h-4" style={{ color: constraint.color }} />
                        <span className="text-[11px] font-semibold text-s3m-text-primary">
                          {constraint.name}
                        </span>
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-2.5 pb-2.5 space-y-1.5">
                        {constraint.items.map((item, i) => (
                          <div key={i} className="bg-s3m-card rounded p-2">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] text-s3m-text-secondary">{item.label}</span>
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-s3m-elevated text-s3m-text-tertiary font-semibold uppercase tracking-wider">
                                {item.status}
                              </span>
                            </div>
                            <div className="text-[10px] font-mono text-s3m-text-primary">
                              {item.value}
                            </div>
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

        {/* Right Column - Replanning Panel */}
        <div className="space-y-4 overflow-y-auto">
          <CommandCard accentColor="#8B5CF6" title="REPLANNING PANEL" indicator>
            {/* Trigger Conditions */}
            <div className="mb-4">
              <button
                onClick={() => setExpandedReplan(!expandedReplan)}
                className="w-full flex items-center justify-between mb-2 hover:bg-s3m-elevated/50 p-2 rounded transition-colors"
              >
                <div className="flex items-center gap-2">
                  {expandedReplan ? (
                    <ChevronDown className="w-4 h-4 text-s3m-purple" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-s3m-purple" />
                  )}
                  <AlertTriangle className="w-4 h-4 text-s3m-purple" />
                  <span className="text-[10px] text-s3m-text-tertiary uppercase tracking-wider font-semibold">
                    AUTO-REPLAN TRIGGERS
                  </span>
                </div>
              </button>
              {expandedReplan && (
                <div className="space-y-1.5">
                  {replanTriggers.map((trigger, i) => (
                    <div key={i} className="bg-s3m-elevated rounded p-2">
                      <div className="flex items-start justify-between mb-1">
                        <span className="text-[10px] text-s3m-text-primary flex-1">
                          {trigger.condition}
                        </span>
                        {trigger.locked && (
                          <Lock className="w-3 h-3 text-s3m-yellow ml-2" />
                        )}
                      </div>
                      <div className="text-[9px] text-s3m-text-tertiary">
                        → {trigger.action}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Alternate Routes */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <GitBranch className="w-4 h-4 text-s3m-cyan" />
                <span className="text-[10px] text-s3m-text-tertiary uppercase tracking-wider font-semibold">
                  ALTERNATE ROUTES
                </span>
              </div>
              <div className="space-y-1.5">
                {alternateRoutes.map((route) => (
                  <div key={route.id} className="bg-s3m-elevated rounded p-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-semibold text-s3m-text-primary">
                        {route.id}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-s3m-card text-s3m-text-tertiary font-semibold uppercase tracking-wider">
                        {route.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[9px]">
                      <span className="text-s3m-text-tertiary">Time: {route.time}</span>
                      <span
                        className="px-1.5 py-0.5 rounded"
                        style={{
                          color: route.risk === 'LOW' ? '#22C55E' : route.risk === 'MEDIUM' ? '#EAB308' : '#EF4444',
                          backgroundColor: route.risk === 'LOW' ? '#22C55E20' : route.risk === 'MEDIUM' ? '#EAB30820' : '#EF444420'
                        }}
                      >
                        {route.risk} RISK
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reserve Activation */}
            <div className="bg-s3m-yellow/10 border border-s3m-yellow/40 rounded p-3">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-s3m-yellow" />
                <span className="text-[10px] uppercase tracking-wider font-semibold text-s3m-yellow">
                  RESERVE ACTIVATION
                </span>
              </div>
              <div className="space-y-1.5 text-[10px] text-s3m-text-secondary">
                <div className="flex items-center justify-between">
                  <span>QRF Alpha</span>
                  <span className="text-s3m-operational">READY</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Backup Convoy</span>
                  <span className="text-s3m-yellow">STANDBY</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Medical Support</span>
                  <span className="text-s3m-operational">ACTIVE</span>
                </div>
              </div>
            </div>
          </CommandCard>

          {/* Mission Plan Timeline */}
          <CommandCard title="MISSION TIMELINE">
            <div className="space-y-3">
              {phases.map((phase, i) => {
                const Icon = phase.icon;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className="relative flex items-center justify-center">
                      <Icon className="w-4 h-4" style={{ color: phase.color }} />
                      {i < phases.length - 1 && (
                        <div
                          className="absolute top-full left-1/2 w-0.5 h-6 -translate-x-1/2"
                          style={{ backgroundColor: phases[i + 1].color + '40' }}
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-s3m-text-primary">{phase.name}</span>
                        <span
                          className="text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded"
                          style={{
                            color: phase.color,
                            backgroundColor: `${phase.color}20`
                          }}
                        >
                          {phase.status}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CommandCard>
        </div>
      </div>

      {/* Bottom Panel - S3M Suggestions */}
      <div className="bg-s3m-card border border-s3m-border-default rounded-lg p-2">
        <button
          onClick={() => setExpandedSuggestions(!expandedSuggestions)}
          className="w-full flex items-center gap-2 mb-2 hover:bg-s3m-elevated/30 p-1 rounded transition-colors"
        >
          {expandedSuggestions ? (
            <ChevronDown className="w-3 h-3 text-s3m-cyan" />
          ) : (
            <ChevronRight className="w-3 h-3 text-s3m-cyan" />
          )}
          <Sparkles className="w-3 h-3 text-s3m-cyan" />
          <span className="text-[9px] text-s3m-text-tertiary uppercase tracking-wider font-semibold">
            S3M PLANNING SUGGESTIONS
          </span>
          <span className="text-[8px] text-s3m-text-tertiary ml-auto">
            LAST UPDATED: {new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}
          </span>
        </button>

        {expandedSuggestions && (
          <div className="grid grid-cols-4 gap-2">
          {aiSuggestions.map((suggestion, i) => (
            <div
              key={i}
              className="bg-s3m-elevated border border-s3m-border-default rounded p-2 hover:border-s3m-cyan/50 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <Lightbulb className="w-3 h-3" style={{ color: suggestion.color }} />
                  <span
                    className="text-[8px] uppercase tracking-wider font-semibold px-1 py-0.5 rounded"
                    style={{
                      color: suggestion.color,
                      backgroundColor: `${suggestion.color}20`
                    }}
                  >
                    {suggestion.type}
                  </span>
                </div>
                <span
                  className="text-[8px] uppercase tracking-wider font-semibold px-1 py-0.5 rounded"
                  style={{
                    color: suggestion.impact === 'CRITICAL' ? '#EF4444' : suggestion.impact === 'HIGH' ? '#EAB308' : '#38BDF8',
                    backgroundColor: suggestion.impact === 'CRITICAL' ? '#EF444420' : suggestion.impact === 'HIGH' ? '#EAB30820' : '#38BDF820'
                  }}
                >
                  {suggestion.impact}
                </span>
              </div>

              <div className="text-[10px] font-semibold text-s3m-text-primary mb-1.5">
                {suggestion.title}
              </div>

              <div className="text-[9px] text-s3m-text-tertiary mb-2 leading-snug">
                {suggestion.description}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[8px] text-s3m-text-tertiary">
                  Confidence
                </span>
                <div className="flex items-center gap-1.5">
                  <div className="w-12 h-1 bg-s3m-card rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${suggestion.confidence}%`,
                        backgroundColor: suggestion.confidence >= 80 ? '#22C55E' : suggestion.confidence >= 60 ? '#EAB308' : '#EF4444'
                      }}
                    />
                  </div>
                  <span
                    className="font-mono text-[9px] font-semibold"
                    style={{
                      color: suggestion.confidence >= 80 ? '#22C55E' : suggestion.confidence >= 60 ? '#EAB308' : '#EF4444'
                    }}
                  >
                    {suggestion.confidence}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>
    </div>
  );
}
