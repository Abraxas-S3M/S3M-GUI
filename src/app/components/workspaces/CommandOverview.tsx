import { useState } from 'react';
import { CommandCard } from '../CommandCard';
import { CornerBrackets } from '../CornerBrackets';
import { AlertCircle, Bot, Activity, Zap, Package, X, ChevronDown, ChevronRight, Inbox, Shield, CheckSquare, Clock, Users, FileText, MapPin } from 'lucide-react';

export function CommandOverview() {
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);
  const [expandedInbox, setExpandedInbox] = useState(false);
  const [expandedDirectives, setExpandedDirectives] = useState(false);
  const [expandedActionBoard, setExpandedActionBoard] = useState(false);

  const metrics = [
    { label: 'ACTIVE TRACKS', value: '7', color: '#38BDF8', sublabel: '2 unidentified' },
    { label: 'THREAT', value: 'HIGH', color: '#F97316', sublabel: '1 critical' },
    { label: 'AGENTS', value: '4/4', color: '#22C55E', sublabel: 'Operational' },
    { label: 'REVIEWS', value: '3', color: '#EAB308', sublabel: 'Pending' },
    { label: 'OPS TEMPO', value: 'HIGH', color: '#EF4444', sublabel: '↑ 30min' }
  ];

  const priorities = [
    { id: 'P1', title: 'Track 218 fast mover IFF failure', severity: 'CRITICAL', source: 'COP+SIGINT' },
    { id: 'P2', title: 'Approve engagement R001 UAV-02', severity: 'HIGH', risk: '82%' },
    { id: 'P3', title: 'Cross-domain cyber→UAV-04 misreport', severity: 'HIGH', source: 'AI correlation' },
    { id: 'P4', title: 'Route Bravo reroute Convoy-A', severity: 'MEDIUM', source: 'Logistics' }
  ];

  const inboxItems = {
    pendingApprovals: [
      { id: 'APR-301', title: 'Strike Authorization - Grid 7-F', authority: 'O-6', urgency: 'IMMEDIATE', time: '5m ago' },
      { id: 'APR-302', title: 'Asset Reallocation Request - Sector 4', authority: 'O-5', urgency: 'PRIORITY', time: '12m ago' },
      { id: 'APR-303', title: 'ROE Exception - Engagement Criteria', authority: 'O-6', urgency: 'ROUTINE', time: '24m ago' }
    ],
    crossDomainAlerts: [
      { id: 'CDA-147', title: 'Cyber activity correlates with UAV anomaly', domains: ['CYBER', 'AIR'], confidence: 92, time: '3m ago' },
      { id: 'CDA-148', title: 'SIGINT intercept matches ground movement', domains: ['SIGINT', 'GROUND'], confidence: 87, time: '8m ago' }
    ],
    escalations: [
      { id: 'ESC-089', title: 'Track 218 IFF failure - requires O-6 decision', level: 'O-6', reason: 'Rules of Engagement', time: '2m ago' },
      { id: 'ESC-090', title: 'Supply chain disruption - theater impact', level: 'O-5', reason: 'Resource Constraints', time: '15m ago' }
    ],
    shiftChanges: [
      { category: 'Intelligence', change: '3 new high-value targets identified in AO', priority: 'HIGH' },
      { category: 'Operations', change: 'Convoy-A delayed 2 hours, route updated', priority: 'MEDIUM' },
      { category: 'Logistics', change: 'Fuel reserves at 68%, resupply ETA 0600Z', priority: 'LOW' }
    ]
  };

  const operationalDirectives = {
    commandersIntent: 'Maintain defensive posture in Sector 7-8 while preparing for potential rapid transition to offensive operations. Prioritize force protection and ISR collection. Establish clear lines of communication with allied forces.',
    roeProfile: {
      name: 'ROE CHARLIE-3',
      status: 'ACTIVE',
      lastUpdate: '0400Z 03 APR 2026',
      keyProvisions: ['Positive ID required', 'Self-defense authorized', 'Collateral damage < 5%', 'HVT engagement requires approval']
    },
    theaterConstraints: [
      { type: 'AIRSPACE', constraint: 'No-fly zone: Grid 12-14, altitude < 10,000 ft', status: 'ACTIVE' },
      { type: 'TIMING', constraint: 'Limited night operations in Sector 9 (civilian population)', status: 'ACTIVE' },
      { type: 'POLITICAL', constraint: 'No border crossings without theater command approval', status: 'ACTIVE' }
    ],
    delegatedAuthorities: [
      { authority: 'Tactical fires < 500m from friendly forces', delegatedTo: 'Battalion CDR (O-5)', conditions: 'Must coordinate with adjacent units' },
      { authority: 'Emergency medevac authorization', delegatedTo: 'Company CDR (O-3)', conditions: 'Immediate threat to life' },
      { authority: 'ISR asset tasking (organic)', delegatedTo: 'S-2 (O-4)', conditions: 'Within assigned AO' }
    ],
    protectedAssets: [
      { id: 'PA-041', name: 'Medical Facility', location: 'Grid 8-J', radius: '500m', status: 'NO-STRIKE' },
      { id: 'PA-042', name: 'Cultural Site - Historical', location: 'Grid 11-K', radius: '300m', status: 'PROTECTED' },
      { id: 'PA-043', name: 'Allied Forward Operating Base', location: 'Grid 6-M', radius: '1km', status: 'DECONFLICT' }
    ]
  };

  const actionBoardItems = [
    {
      id: 'ACT-501',
      type: 'APPROVAL',
      title: 'Strike Authorization - Grid 7-F',
      requestor: 'TACP-04',
      description: 'Request immediate strike on concentration of enemy vehicles. Collateral estimate: minimal. Time-sensitive target.',
      priority: 'IMMEDIATE',
      legalNote: 'Within ROE parameters, positive ID confirmed',
      policyNote: 'Approved collateral damage threshold'
    },
    {
      id: 'ACT-502',
      type: 'DECISION',
      title: 'Asset Reallocation - ISR Support',
      requestor: 'Battalion S-2',
      description: 'Request reallocation of UAV-02 from Sector 4 to Sector 8 for emerging HVT surveillance.',
      priority: 'PRIORITY',
      legalNote: 'N/A',
      policyNote: 'May impact ongoing collection in Sector 4'
    },
    {
      id: 'ACT-503',
      type: 'ESCALATION',
      title: 'ROE Exception Request',
      requestor: 'Company Commander',
      description: 'Request authority to engage target within 400m of civilian structure. Target assessed as immediate threat.',
      priority: 'IMMEDIATE',
      legalNote: 'Requires O-6 approval per current ROE',
      policyNote: 'CDR legal advisor concurs with necessity'
    }
  ];

  const agents = [
    {
      id: 'AGT-001',
      name: 'UAV-RECON-04',
      type: 'Autonomous Operation',
      status: 'ACTIVE',
      function: 'Autonomous reconnaissance mission over Sector 8-B',
      location: '34.2°N, 45.7°E',
      uptime: '2h 34m',
      tasking: 'High-altitude surveillance sweep',
      data: 'Collecting thermal imaging and comms intercepts'
    },
    {
      id: 'AGT-002',
      name: 'SUPPLY-DELTA',
      type: 'Resource Procurement',
      status: 'ACTIVE',
      function: 'Procuring sustainment resources for forward operating bases',
      location: 'Supply Chain Network',
      uptime: '4h 12m',
      tasking: 'Coordinating fuel and munitions delivery',
      data: 'Processing 12 requisitions, 3 critical priority'
    },
    {
      id: 'AGT-003',
      name: 'SIM-ALPHA',
      type: 'Simulation',
      status: 'RUNNING',
      function: 'Running tactical simulation scenarios',
      location: 'Virtual Environment',
      uptime: '1h 08m',
      tasking: 'Multi-domain engagement analysis',
      data: '847 iterations complete, 94% confidence'
    },
    {
      id: 'AGT-004',
      name: 'CYBER-SENTINEL',
      type: 'Defensive Operations',
      status: 'STANDBY',
      function: 'Network defense and threat monitoring',
      location: 'Cyber Domain',
      uptime: '12h 45m',
      tasking: 'Continuous threat detection sweep',
      data: 'Monitoring 2,847 endpoints'
    }
  ];

  const getAgentIcon = (type: string) => {
    switch (type) {
      case 'Autonomous Operation': return Activity;
      case 'Resource Procurement': return Package;
      case 'Simulation': return Zap;
      case 'Defensive Operations': return Bot;
      default: return Bot;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return '#05DF72';
      case 'RUNNING': return '#00F0FF';
      case 'STANDBY': return '#FFB800';
      default: return '#666';
    }
  };

  const urgencyColors: any = {
    IMMEDIATE: '#FF3366',
    PRIORITY: '#FFB800',
    ROUTINE: '#38BDF8'
  };

  const priorityColors: any = {
    HIGH: '#FF3366',
    MEDIUM: '#FFB800',
    LOW: '#38BDF8'
  };

  return (
    <div className="p-4 space-y-4">
      {/* Metrics Row */}
      <div className="grid grid-cols-5 gap-3">
        {metrics.map((metric, i) => (
          <CommandCard key={i} accentColor={metric.color}>
            <div className="space-y-2">
              <div className="text-[10px] uppercase tracking-[0.08em] text-s3m-text-tertiary">
                {metric.label}
              </div>
              <div className="font-mono text-[18px] font-semibold" style={{ color: metric.color }}>
                {metric.value}
              </div>
              <div className="text-[10px] text-s3m-text-tertiary">
                {metric.sublabel}
              </div>
            </div>
          </CommandCard>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-2 gap-4">
        {/* Left Column: Attention Required */}
        <div className="relative bg-s3m-card border border-s3m-border-default rounded p-4">
          <CornerBrackets color="#EF4444" />

          <div className="mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-s3m-critical" />
            <span className="text-[10px] uppercase tracking-[0.08em] text-s3m-text-secondary font-semibold">
              ATTENTION REQUIRED
            </span>
          </div>

          <div className="space-y-3">
            {priorities.map((priority) => {
              const severityColors: any = {
                CRITICAL: '#EF4444',
                HIGH: '#F97316',
                MEDIUM: '#EAB308',
                LOW: '#38BDF8'
              };

              return (
                <div
                  key={priority.id}
                  className="border-l-2 pl-3 py-2 hover:bg-s3m-elevated transition-colors cursor-pointer"
                  style={{ borderLeftColor: severityColors[priority.severity] }}
                >
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] text-s3m-text-tertiary">
                        {priority.id}
                      </span>
                      <span
                        className="text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded"
                        style={{
                          color: severityColors[priority.severity],
                          backgroundColor: `${severityColors[priority.severity]}20`
                        }}
                      >
                        {priority.severity}
                      </span>
                    </div>
                    {priority.risk && (
                      <span className="font-mono text-[10px] text-s3m-critical">
                        Risk {priority.risk}
                      </span>
                    )}
                  </div>
                  <div className="text-[12px] text-s3m-text-primary mb-1">
                    {priority.title}
                  </div>
                  <div className="text-[10px] text-s3m-text-tertiary">
                    {priority.source || ''}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Commander Inbox */}
        <div className="relative bg-s3m-card border border-s3m-border-default rounded p-4">
          <CornerBrackets color="#00F0FF" />

          <button
            onClick={() => setExpandedInbox(!expandedInbox)}
            className="w-full mb-4 flex items-center gap-2 hover:bg-s3m-elevated transition-colors p-2 -m-2 rounded"
          >
            <Inbox className="w-4 h-4 text-cyber-cyan" />
            <span className="text-[10px] uppercase tracking-[0.08em] text-s3m-text-secondary font-semibold">
              COMMANDER INBOX
            </span>
            <div className="flex-1" />
            <span className="font-mono text-[10px] text-s3m-critical">
              {inboxItems.pendingApprovals.length + inboxItems.escalations.length} PENDING
            </span>
            {expandedInbox ? <ChevronDown className="w-4 h-4 text-cyber-cyan" /> : <ChevronRight className="w-4 h-4 text-cyber-cyan" />}
          </button>

          {expandedInbox && (
            <div className="space-y-4">
              {/* Pending Approvals */}
              <div>
                <div className="text-[9px] uppercase tracking-wider text-s3m-text-tertiary mb-2 flex items-center gap-2">
                  <CheckSquare className="w-3 h-3" />
                  PENDING APPROVALS
                </div>
                <div className="space-y-2">
                  {inboxItems.pendingApprovals.map((item) => (
                    <div key={item.id} className="bg-s3m-elevated rounded p-2 hover:border-cyber-cyan border border-transparent transition-all cursor-pointer">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-[9px] text-s3m-text-tertiary">{item.id}</span>
                        <span
                          className="text-[8px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded"
                          style={{
                            color: urgencyColors[item.urgency],
                            backgroundColor: `${urgencyColors[item.urgency]}20`
                          }}
                        >
                          {item.urgency}
                        </span>
                        <span className="text-[8px] text-s3m-text-tertiary">{item.authority}</span>
                      </div>
                      <div className="text-[10px] text-s3m-text-primary mb-1">{item.title}</div>
                      <div className="text-[9px] text-s3m-text-tertiary">{item.time}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cross-Domain Alerts */}
              <div>
                <div className="text-[9px] uppercase tracking-wider text-s3m-text-tertiary mb-2 flex items-center gap-2">
                  <AlertCircle className="w-3 h-3" />
                  CROSS-DOMAIN ALERTS
                </div>
                <div className="space-y-2">
                  {inboxItems.crossDomainAlerts.map((item) => (
                    <div key={item.id} className="bg-s3m-elevated rounded p-2 hover:border-cyber-cyan border border-transparent transition-all cursor-pointer">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-[9px] text-s3m-text-tertiary">{item.id}</span>
                        <span className="text-[8px] text-cyber-cyan font-mono">{item.confidence}%</span>
                      </div>
                      <div className="text-[10px] text-s3m-text-primary mb-1">{item.title}</div>
                      <div className="flex gap-1 mb-1">
                        {item.domains.map((domain, i) => (
                          <span key={i} className="text-[8px] uppercase px-1.5 py-0.5 rounded bg-cyber-cyan/20 text-cyber-cyan">
                            {domain}
                          </span>
                        ))}
                      </div>
                      <div className="text-[9px] text-s3m-text-tertiary">{item.time}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Escalations */}
              <div>
                <div className="text-[9px] uppercase tracking-wider text-s3m-text-tertiary mb-2 flex items-center gap-2">
                  <Users className="w-3 h-3" />
                  ESCALATIONS BY AUTHORITY
                </div>
                <div className="space-y-2">
                  {inboxItems.escalations.map((item) => (
                    <div key={item.id} className="bg-s3m-elevated rounded p-2 hover:border-cyber-cyan border border-transparent transition-all cursor-pointer">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-[9px] text-s3m-text-tertiary">{item.id}</span>
                        <span className="text-[8px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-s3m-critical/20 text-s3m-critical">
                          {item.level}
                        </span>
                      </div>
                      <div className="text-[10px] text-s3m-text-primary mb-1">{item.title}</div>
                      <div className="text-[9px] text-s3m-text-tertiary mb-1">{item.reason}</div>
                      <div className="text-[9px] text-s3m-text-tertiary">{item.time}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* What Changed Since Last Shift */}
              <div>
                <div className="text-[9px] uppercase tracking-wider text-s3m-text-tertiary mb-2 flex items-center gap-2">
                  <Clock className="w-3 h-3" />
                  SINCE LAST SHIFT
                </div>
                <div className="space-y-2">
                  {inboxItems.shiftChanges.map((item, i) => (
                    <div key={i} className="bg-s3m-elevated rounded p-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] uppercase text-cyber-cyan font-semibold">{item.category}</span>
                        <span
                          className="text-[8px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded"
                          style={{
                            color: priorityColors[item.priority],
                            backgroundColor: `${priorityColors[item.priority]}20`
                          }}
                        >
                          {item.priority}
                        </span>
                      </div>
                      <div className="text-[10px] text-s3m-text-primary">{item.change}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Operational Directives - Full Width Expandable */}
      <div className="relative bg-s3m-card border border-s3m-border-default rounded p-4">
        <CornerBrackets color="#8A5CFF" />

        <button
          onClick={() => setExpandedDirectives(!expandedDirectives)}
          className="w-full mb-4 flex items-center gap-2 hover:bg-s3m-elevated transition-colors p-2 -m-2 rounded"
        >
          <Shield className="w-4 h-4 text-cyber-purple" style={{ color: '#8A5CFF' }} />
          <span className="text-[10px] uppercase tracking-[0.08em] text-s3m-text-secondary font-semibold">
            OPERATIONAL DIRECTIVES
          </span>
          <div className="flex-1" />
          <span className="font-mono text-[10px]" style={{ color: '#8A5CFF' }}>
            {operationalDirectives.roeProfile.name}
          </span>
          {expandedDirectives ? <ChevronDown className="w-4 h-4" style={{ color: '#8A5CFF' }} /> : <ChevronRight className="w-4 h-4" style={{ color: '#8A5CFF' }} />}
        </button>

        {expandedDirectives && (
          <div className="grid grid-cols-2 gap-4">
            {/* Commander's Intent */}
            <div className="space-y-3">
              <div>
                <div className="text-[9px] uppercase tracking-wider text-s3m-text-tertiary mb-2 flex items-center gap-2">
                  <FileText className="w-3 h-3" />
                  COMMANDER'S INTENT
                </div>
                <div className="bg-s3m-elevated rounded p-3 text-[11px] text-s3m-text-primary leading-relaxed">
                  {operationalDirectives.commandersIntent}
                </div>
              </div>

              {/* ROE Profile */}
              <div>
                <div className="text-[9px] uppercase tracking-wider text-s3m-text-tertiary mb-2">
                  ACTIVE ROE PROFILE
                </div>
                <div className="bg-s3m-elevated rounded p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[12px] font-semibold text-cyber-cyan">{operationalDirectives.roeProfile.name}</span>
                    <span className="text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-cyber-green/20 text-cyber-green">
                      {operationalDirectives.roeProfile.status}
                    </span>
                  </div>
                  <div className="text-[9px] text-s3m-text-tertiary mb-2">Updated: {operationalDirectives.roeProfile.lastUpdate}</div>
                  <div className="space-y-1">
                    {operationalDirectives.roeProfile.keyProvisions.map((provision, i) => (
                      <div key={i} className="text-[10px] text-s3m-text-primary flex items-start gap-2">
                        <span className="text-cyber-cyan">•</span>
                        <span>{provision}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Theater Constraints */}
              <div>
                <div className="text-[9px] uppercase tracking-wider text-s3m-text-tertiary mb-2">
                  THEATER CONSTRAINTS
                </div>
                <div className="space-y-2">
                  {operationalDirectives.theaterConstraints.map((constraint, i) => (
                    <div key={i} className="bg-s3m-elevated rounded p-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-s3m-warning/20 text-s3m-warning">
                          {constraint.type}
                        </span>
                        <span className="text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-cyber-green/20 text-cyber-green">
                          {constraint.status}
                        </span>
                      </div>
                      <div className="text-[10px] text-s3m-text-primary">{constraint.constraint}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {/* Delegated Authorities */}
              <div>
                <div className="text-[9px] uppercase tracking-wider text-s3m-text-tertiary mb-2">
                  DELEGATED AUTHORITIES
                </div>
                <div className="space-y-2">
                  {operationalDirectives.delegatedAuthorities.map((auth, i) => (
                    <div key={i} className="bg-s3m-elevated rounded p-2">
                      <div className="text-[10px] font-semibold text-s3m-text-primary mb-1">{auth.authority}</div>
                      <div className="text-[9px] text-cyber-cyan mb-1">→ {auth.delegatedTo}</div>
                      <div className="text-[9px] text-s3m-text-tertiary">{auth.conditions}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Protected Assets / No-Strike */}
              <div>
                <div className="text-[9px] uppercase tracking-wider text-s3m-text-tertiary mb-2 flex items-center gap-2">
                  <MapPin className="w-3 h-3" />
                  NO-STRIKE / PROTECTED ASSETS
                </div>
                <div className="space-y-2">
                  {operationalDirectives.protectedAssets.map((asset) => (
                    <div key={asset.id} className="bg-s3m-elevated rounded p-2 border-l-2 border-s3m-critical">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-[9px] text-s3m-text-tertiary">{asset.id}</span>
                        <span
                          className="text-[8px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded"
                          style={{
                            color: '#FF3366',
                            backgroundColor: '#FF336620'
                          }}
                        >
                          {asset.status}
                        </span>
                      </div>
                      <div className="text-[10px] font-semibold text-s3m-text-primary mb-1">{asset.name}</div>
                      <div className="flex items-center gap-2 text-[9px] text-s3m-text-tertiary">
                        <span>{asset.location}</span>
                        <span>•</span>
                        <span>{asset.radius}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Board - Full Width Expandable */}
      <div className="relative bg-s3m-card border border-s3m-border-default rounded p-4">
        <CornerBrackets color="#05DF72" />

        <button
          onClick={() => setExpandedActionBoard(!expandedActionBoard)}
          className="w-full mb-4 flex items-center gap-2 hover:bg-s3m-elevated transition-colors p-2 -m-2 rounded"
        >
          <CheckSquare className="w-4 h-4 text-cyber-green" />
          <span className="text-[10px] uppercase tracking-[0.08em] text-s3m-text-secondary font-semibold">
            ACTION BOARD
          </span>
          <div className="flex-1" />
          <span className="font-mono text-[10px] text-cyber-green">
            {actionBoardItems.length} ACTIONS
          </span>
          {expandedActionBoard ? <ChevronDown className="w-4 h-4 text-cyber-green" /> : <ChevronRight className="w-4 h-4 text-cyber-green" />}
        </button>

        {expandedActionBoard && (
          <div className="space-y-3">
            {actionBoardItems.map((item) => (
              <div key={item.id} className="bg-s3m-elevated border border-s3m-border-default rounded p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-[10px] text-s3m-text-tertiary">{item.id}</span>
                      <span className="text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-cyber-cyan/20 text-cyber-cyan">
                        {item.type}
                      </span>
                      <span
                        className="text-[8px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded"
                        style={{
                          color: urgencyColors[item.priority],
                          backgroundColor: `${urgencyColors[item.priority]}20`
                        }}
                      >
                        {item.priority}
                      </span>
                    </div>
                    <div className="text-[13px] font-semibold text-s3m-text-primary mb-2">{item.title}</div>
                    <div className="text-[10px] text-s3m-text-tertiary mb-1">Requestor: {item.requestor}</div>
                    <div className="text-[11px] text-s3m-text-primary leading-relaxed mb-3">{item.description}</div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="bg-s3m-card rounded p-2">
                        <div className="text-[8px] uppercase tracking-wider text-s3m-text-tertiary mb-1">LEGAL NOTE</div>
                        <div className="text-[10px] text-s3m-text-primary">{item.legalNote}</div>
                      </div>
                      <div className="bg-s3m-card rounded p-2">
                        <div className="text-[8px] uppercase tracking-wider text-s3m-text-tertiary mb-1">POLICY NOTE</div>
                        <div className="text-[10px] text-s3m-text-primary">{item.policyNote}</div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button className="px-3 py-1.5 rounded bg-cyber-green/20 text-cyber-green hover:bg-cyber-green/30 text-[10px] uppercase tracking-wider font-semibold transition-colors">
                        APPROVE
                      </button>
                      <button className="px-3 py-1.5 rounded bg-s3m-critical/20 text-s3m-critical hover:bg-s3m-critical/30 text-[10px] uppercase tracking-wider font-semibold transition-colors">
                        REJECT
                      </button>
                      <button className="px-3 py-1.5 rounded bg-s3m-warning/20 text-s3m-warning hover:bg-s3m-warning/30 text-[10px] uppercase tracking-wider font-semibold transition-colors">
                        DEFER
                      </button>
                      <button className="px-3 py-1.5 rounded bg-cyber-cyan/20 text-cyber-cyan hover:bg-cyber-cyan/30 text-[10px] uppercase tracking-wider font-semibold transition-colors">
                        ASSIGN TO STAFF
                      </button>
                      <button className="px-3 py-1.5 rounded bg-cyber-purple/20 hover:bg-cyber-purple/30 text-[10px] uppercase tracking-wider font-semibold transition-colors" style={{ color: '#8A5CFF' }}>
                        ISSUE FRAGO
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Agent Panel */}
      <div className="relative bg-s3m-card border border-s3m-border-default rounded p-4">
        <CornerBrackets color="#05DF72" />

        <div className="mb-4 flex items-center gap-2">
          <Bot className="w-4 h-4 text-s3m-success" />
          <span className="text-[10px] uppercase tracking-[0.08em] text-s3m-text-secondary font-semibold">
            AUTONOMOUS AGENTS
          </span>
          <div className="flex-1" />
          <span className="font-mono text-[10px] text-s3m-success">
            {agents.filter(a => a.status !== 'STANDBY').length}/{agents.length} ACTIVE
          </span>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {agents.map((agent) => {
            const Icon = getAgentIcon(agent.type);
            const statusColor = getStatusColor(agent.status);

            return (
              <div
                key={agent.id}
                onDoubleClick={() => setExpandedAgent(agent.id)}
                className="relative bg-s3m-elevated border border-s3m-border-default rounded p-3 cursor-pointer hover:border-cyber-cyan transition-all duration-300"
                style={{ borderColor: expandedAgent === agent.id ? statusColor : undefined }}
              >
                <div className="flex items-start gap-2 mb-2">
                  <Icon className="w-4 h-4 flex-shrink-0" style={{ color: statusColor }} />
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-[10px] text-s3m-text-tertiary mb-1">
                      {agent.id}
                    </div>
                    <div className="text-[11px] font-semibold text-s3m-text-primary truncate">
                      {agent.name}
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div
                    className="text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded inline-block"
                    style={{
                      color: statusColor,
                      backgroundColor: `${statusColor}20`
                    }}
                  >
                    {agent.status}
                  </div>
                  <div className="text-[10px] text-s3m-text-tertiary">
                    {agent.type}
                  </div>
                  <div className="text-[10px] text-s3m-text-tertiary font-mono">
                    ↑ {agent.uptime}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Agent Expanded View */}
      {expandedAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="w-[90%] max-w-5xl h-[85%] bg-s3m-surface border border-cyber-cyan rounded-lg overflow-hidden flex flex-col"
            style={{ boxShadow: '0 0 40px rgba(0, 240, 255, 0.4)' }}
          >
            {(() => {
              const agent = agents.find(a => a.id === expandedAgent);
              if (!agent) return null;

              const Icon = getAgentIcon(agent.type);
              const statusColor = getStatusColor(agent.status);

              return (
                <>
                  {/* Header */}
                  <div className="p-6 border-b border-s3m-border-default flex items-center gap-4">
                    <Icon className="w-6 h-6" style={{ color: statusColor }} />
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-mono text-[12px] text-s3m-text-tertiary">
                          {agent.id}
                        </span>
                        <span
                          className="text-[10px] uppercase tracking-wider font-semibold px-2 py-1 rounded"
                          style={{
                            color: statusColor,
                            backgroundColor: `${statusColor}20`
                          }}
                        >
                          {agent.status}
                        </span>
                      </div>
                      <div className="text-[18px] font-bold text-cyber-cyan font-display tracking-wider">
                        {agent.name}
                      </div>
                      <div className="text-[12px] text-s3m-text-secondary">
                        {agent.type}
                      </div>
                    </div>
                    <button
                      onClick={() => setExpandedAgent(null)}
                      className="w-8 h-8 rounded flex items-center justify-center hover:bg-s3m-elevated transition-colors"
                    >
                      <X className="w-5 h-5 text-s3m-text-tertiary" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-2 gap-6">
                      {/* Current Activity */}
                      <div className="space-y-4">
                        <div className="relative bg-s3m-card border border-s3m-border-default rounded p-4">
                          <CornerBrackets color={statusColor} />
                          <div className="mb-3">
                            <span className="text-[10px] uppercase tracking-[0.08em] text-s3m-text-tertiary font-semibold">
                              CURRENT FUNCTION
                            </span>
                          </div>
                          <div className="text-[13px] text-s3m-text-primary leading-relaxed">
                            {agent.function}
                          </div>
                        </div>

                        <div className="relative bg-s3m-card border border-s3m-border-default rounded p-4">
                          <div className="space-y-3">
                            <div>
                              <div className="text-[10px] uppercase tracking-[0.08em] text-s3m-text-tertiary mb-1">
                                LOCATION
                              </div>
                              <div className="text-[12px] text-s3m-text-primary font-mono">
                                {agent.location}
                              </div>
                            </div>
                            <div>
                              <div className="text-[10px] uppercase tracking-[0.08em] text-s3m-text-tertiary mb-1">
                                UPTIME
                              </div>
                              <div className="text-[12px] text-s3m-text-primary font-mono">
                                {agent.uptime}
                              </div>
                            </div>
                            <div>
                              <div className="text-[10px] uppercase tracking-[0.08em] text-s3m-text-tertiary mb-1">
                                CURRENT TASKING
                              </div>
                              <div className="text-[12px] text-s3m-text-primary">
                                {agent.tasking}
                              </div>
                            </div>
                            <div>
                              <div className="text-[10px] uppercase tracking-[0.08em] text-s3m-text-tertiary mb-1">
                                DATA COLLECTION
                              </div>
                              <div className="text-[12px] text-s3m-text-primary">
                                {agent.data}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Program Agent */}
                      <div className="relative bg-s3m-card border border-cyber-cyan rounded p-4">
                        <CornerBrackets color="#00F0FF" />
                        <div className="mb-4">
                          <span className="text-[11px] uppercase tracking-[0.08em] text-cyber-cyan font-semibold">
                            PROGRAM AGENT ACTIVITY
                          </span>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="text-[10px] uppercase tracking-[0.08em] text-s3m-text-tertiary mb-2 block">
                              MISSION TYPE
                            </label>
                            <select className="w-full bg-s3m-elevated border border-s3m-border-default rounded px-3 py-2 text-[12px] text-s3m-text-primary focus:border-cyber-cyan focus:outline-none">
                              <option>Autonomous Operation</option>
                              <option>Resource Procurement</option>
                              <option>Simulation</option>
                              <option>Defensive Operations</option>
                              <option>Reconnaissance</option>
                              <option>Strike Mission</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-[10px] uppercase tracking-[0.08em] text-s3m-text-tertiary mb-2 block">
                              TARGET LOCATION
                            </label>
                            <input
                              type="text"
                              placeholder="Enter coordinates or designation"
                              className="w-full bg-s3m-elevated border border-s3m-border-default rounded px-3 py-2 text-[12px] text-s3m-text-primary placeholder:text-s3m-text-tertiary focus:border-cyber-cyan focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] uppercase tracking-[0.08em] text-s3m-text-tertiary mb-2 block">
                              PRIORITY LEVEL
                            </label>
                            <select className="w-full bg-s3m-elevated border border-s3m-border-default rounded px-3 py-2 text-[12px] text-s3m-text-primary focus:border-cyber-cyan focus:outline-none">
                              <option>ROUTINE</option>
                              <option>PRIORITY</option>
                              <option>IMMEDIATE</option>
                              <option>FLASH</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-[10px] uppercase tracking-[0.08em] text-s3m-text-tertiary mb-2 block">
                              MISSION PARAMETERS
                            </label>
                            <textarea
                              rows={4}
                              placeholder="Enter detailed mission parameters and objectives..."
                              className="w-full bg-s3m-elevated border border-s3m-border-default rounded px-3 py-2 text-[12px] text-s3m-text-primary placeholder:text-s3m-text-tertiary focus:border-cyber-cyan focus:outline-none resize-none"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] uppercase tracking-[0.08em] text-s3m-text-tertiary mb-2 block">
                              DURATION
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                              <input
                                type="number"
                                placeholder="HH"
                                className="bg-s3m-elevated border border-s3m-border-default rounded px-3 py-2 text-[12px] text-s3m-text-primary placeholder:text-s3m-text-tertiary focus:border-cyber-cyan focus:outline-none text-center"
                              />
                              <input
                                type="number"
                                placeholder="MM"
                                className="bg-s3m-elevated border border-s3m-border-default rounded px-3 py-2 text-[12px] text-s3m-text-primary placeholder:text-s3m-text-tertiary focus:border-cyber-cyan focus:outline-none text-center"
                              />
                              <input
                                type="number"
                                placeholder="SS"
                                className="bg-s3m-elevated border border-s3m-border-default rounded px-3 py-2 text-[12px] text-s3m-text-primary placeholder:text-s3m-text-tertiary focus:border-cyber-cyan focus:outline-none text-center"
                              />
                            </div>
                          </div>

                          <div className="flex gap-2 pt-2">
                            <button className="flex-1 bg-cyber-cyan hover:bg-cyber-cyan/80 text-cyber-deep font-semibold py-2.5 px-4 rounded text-[11px] uppercase tracking-wider transition-colors">
                              DEPLOY MISSION
                            </button>
                            <button className="flex-1 bg-s3m-elevated hover:bg-s3m-card text-s3m-text-secondary font-semibold py-2.5 px-4 rounded text-[11px] uppercase tracking-wider transition-colors border border-s3m-border-default">
                              SAVE DRAFT
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
