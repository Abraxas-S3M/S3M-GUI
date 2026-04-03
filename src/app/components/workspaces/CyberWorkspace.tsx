import { useState } from 'react';
import { CommandCard } from '../CommandCard';
import { StatusIndicator } from '../StatusIndicator';
import { ConfidenceBadge } from '../ConfidenceBadge';
import { ProgressBar } from '../ProgressBar';
import { ChevronDown, ChevronRight, Shield, ShieldAlert, Lock, Activity, AlertTriangle, Radio, GitBranch, Zap, Cloud } from 'lucide-react';

export function CyberWorkspace() {
  const [expandedSOC, setExpandedSOC] = useState(true);
  const [expandedModelSec, setExpandedModelSec] = useState(true);
  const [expandedTrust, setExpandedTrust] = useState(false);
  const [expandedResilience, setExpandedResilience] = useState(false);
  const [expandedAttackOptions, setExpandedAttackOptions] = useState(false);

  // SOC Summary Data
  const activeIncidents = [
    { id: 'INC-2847', type: 'Port Scan', target: 'Node 12', severity: 'CRITICAL', dwellTime: '14m', blastRadius: 'High (23 assets)', fpRate: 4, status: 'active' },
    { id: 'INC-2846', type: 'Failed Auth', target: 'IAM Gateway', severity: 'HIGH', dwellTime: '2h 12m', blastRadius: 'Medium (8 assets)', fpRate: 12, status: 'investigating' },
    { id: 'INC-2841', type: 'Data Exfil Attempt', target: 'Storage Node 7', severity: 'CRITICAL', dwellTime: '47m', blastRadius: 'Critical (89 assets)', fpRate: 2, status: 'active' }
  ];

  const socSummaryMetrics = {
    totalIncidents: 3,
    avgDwellTime: '1h 4m',
    falsePositiveRate: 6,
    highestBlastRadius: 89
  };

  // Model Security Data
  const modelSecurity = [
    {
      modelName: 'S3M-Core-v4.2.1',
      version: '4.2.1',
      integrity: 'VERIFIED',
      lastAttestation: '2m ago',
      driftScore: 2.1,
      anomalyCount: 0,
      suspiciousPrompts: []
    },
    {
      modelName: 'S3M-Planning-v2.8.0',
      version: '2.8.0',
      integrity: 'VERIFIED',
      lastAttestation: '8m ago',
      driftScore: 4.8,
      anomalyCount: 2,
      suspiciousPrompts: [
        { time: '14:32', prompt: 'Attempt to extract training data', risk: 'HIGH' },
        { time: '14:18', prompt: 'Jailbreak attempt detected', risk: 'MEDIUM' }
      ]
    },
    {
      modelName: 'S3M-Cyber-v3.1.4',
      version: '3.1.4',
      integrity: 'DRIFT DETECTED',
      lastAttestation: '23m ago',
      driftScore: 12.4,
      anomalyCount: 7,
      suspiciousPrompts: [
        { time: '14:29', prompt: 'Prompt injection attempt', risk: 'CRITICAL' }
      ]
    }
  ];

  // Trust Fabric Data
  const trustScores = [
    {
      category: 'Identity Trust',
      score: 87,
      color: '#22C55E',
      breakdown: [
        { factor: 'MFA Active', score: 98, status: 'operational' },
        { factor: 'Role Assignment', score: 92, status: 'operational' },
        { factor: 'Session Validity', score: 84, status: 'caution' },
        { factor: 'Privilege Escalation Risk', score: 74, status: 'caution' }
      ]
    },
    {
      category: 'Device Trust',
      score: 76,
      color: '#EAB308',
      breakdown: [
        { factor: 'Endpoint Security', score: 81, status: 'operational' },
        { factor: 'Patch Currency', score: 68, status: 'caution' },
        { factor: 'Config Compliance', score: 79, status: 'operational' },
        { factor: 'Known Device', score: 76, status: 'caution' }
      ]
    },
    {
      category: 'Source Trust',
      score: 91,
      color: '#22C55E',
      breakdown: [
        { factor: 'Data Origin', score: 94, status: 'operational' },
        { factor: 'Network Path', score: 89, status: 'operational' },
        { factor: 'Transport Security', score: 92, status: 'operational' },
        { factor: 'Certificate Validity', score: 89, status: 'operational' }
      ]
    },
    {
      category: 'Data Lineage Trust',
      score: 82,
      color: '#22C55E',
      breakdown: [
        { factor: 'Provenance Chain', score: 88, status: 'operational' },
        { factor: 'Transformation History', score: 79, status: 'operational' },
        { factor: 'Access Audit', score: 84, status: 'operational' },
        { factor: 'Integrity Verification', score: 78, status: 'caution' }
      ]
    }
  ];

  // Resilience Actions Data
  const resilienceActions = [
    {
      category: 'Node Isolation',
      actions: [
        { name: 'Isolate Node 12', target: 'Node 12', reason: 'Active port scan', urgency: 'CRITICAL', impact: 'High', estimatedDowntime: '5-10min' },
        { name: 'Isolate Storage Node 7', target: 'Storage Node 7', reason: 'Data exfiltration attempt', urgency: 'CRITICAL', impact: 'Medium', estimatedDowntime: '2-5min' }
      ]
    },
    {
      category: 'Model Degradation',
      actions: [
        { name: 'Degrade to S3M-Cyber-v3.0.2', target: 'S3M-Cyber-v3.1.4', reason: 'Drift detected', urgency: 'HIGH', impact: 'Low', estimatedDowntime: '30s' }
      ]
    },
    {
      category: 'Sync Control',
      actions: [
        { name: 'Freeze external sync', target: 'All external endpoints', reason: 'Suspicious activity', urgency: 'MEDIUM', impact: 'Medium', estimatedDowntime: 'N/A' }
      ]
    },
    {
      category: 'Key Rotation',
      actions: [
        { name: 'Rotate IAM keys', target: 'IAM Gateway', reason: 'Failed auth attempts', urgency: 'HIGH', impact: 'Low', estimatedDowntime: '1-2min' },
        { name: 'Rotate API keys', target: 'External API', reason: 'Preventive', urgency: 'LOW', impact: 'Low', estimatedDowntime: '30s' }
      ]
    },
    {
      category: 'Route Invalidation',
      actions: [
        { name: 'Invalidate route to Node 12', target: 'Node 12', reason: 'Compromised', urgency: 'CRITICAL', impact: 'High', estimatedDowntime: '15s' }
      ]
    }
  ];

  // Cyber-Attack Options Data
  const attackOptions = [
    { type: 'DDoS Simulation', target: 'External Gateway', status: 'Ready', impact: 'HIGH' },
    { type: 'Phishing Test', target: 'Personnel', status: 'Scheduled', impact: 'MEDIUM' },
    { type: 'Port Scan', target: 'Internal Network', status: 'In Progress', impact: 'LOW' },
    { type: 'SQL Injection Test', target: 'Web Services', status: 'Ready', impact: 'HIGH' }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return '#EF4444';
      case 'HIGH': return '#F97316';
      case 'MEDIUM': return '#EAB308';
      case 'LOW': return '#38BDF8';
      default: return '#607590';
    }
  };

  const getIntegrityColor = (integrity: string) => {
    if (integrity === 'VERIFIED') return '#22C55E';
    if (integrity.includes('DRIFT')) return '#EF4444';
    return '#EAB308';
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'CRITICAL': return '#EF4444';
      case 'HIGH': return '#F97316';
      case 'MEDIUM': return '#EAB308';
      case 'LOW': return '#38BDF8';
      default: return '#607590';
    }
  };

  return (
    <div className="p-4 h-full space-y-4 overflow-y-auto">
      {/* SOC Summary Section */}
      <div className="bg-s3m-card border border-s3m-border-default rounded-lg p-3">
        <button
          onClick={() => setExpandedSOC(!expandedSOC)}
          className="w-full flex items-center gap-2 mb-3 hover:bg-s3m-elevated/30 p-1 rounded transition-colors"
        >
          {expandedSOC ? (
            <ChevronDown className="w-4 h-4 text-s3m-cyan" />
          ) : (
            <ChevronRight className="w-4 h-4 text-s3m-cyan" />
          )}
          <ShieldAlert className="w-4 h-4 text-s3m-cyan" />
          <span className="text-[11px] text-s3m-text-tertiary uppercase tracking-wider font-semibold">
            SOC SUMMARY
          </span>
          <div className="ml-auto flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] text-s3m-text-tertiary uppercase">Active:</span>
              <span className="text-[11px] font-mono font-semibold text-s3m-red">{socSummaryMetrics.totalIncidents}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] text-s3m-text-tertiary uppercase">Avg Dwell:</span>
              <span className="text-[11px] font-mono font-semibold text-s3m-yellow">{socSummaryMetrics.avgDwellTime}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] text-s3m-text-tertiary uppercase">FP Rate:</span>
              <span className="text-[11px] font-mono font-semibold text-s3m-green">{socSummaryMetrics.falsePositiveRate}%</span>
            </div>
          </div>
        </button>

        {expandedSOC && (
          <div className="space-y-2">
            {activeIncidents.map((incident) => (
              <div
                key={incident.id}
                className="bg-s3m-elevated border border-s3m-border-default rounded-lg p-3 hover:border-s3m-cyan/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-semibold text-s3m-text-primary">
                      {incident.id}
                    </span>
                    <span
                      className="text-[8px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded"
                      style={{
                        color: getSeverityColor(incident.severity),
                        background: `${getSeverityColor(incident.severity)}20`,
                        border: `1px solid ${getSeverityColor(incident.severity)}40`
                      }}
                    >
                      {incident.severity}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="w-3 h-3" style={{ color: incident.status === 'active' ? '#EF4444' : '#EAB308' }} />
                    <span className="text-[9px] text-s3m-text-tertiary uppercase">{incident.status}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <span className="text-[9px] text-s3m-text-tertiary uppercase">Type:</span>
                    <span className="text-[10px] text-s3m-text-primary ml-1.5">{incident.type}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-s3m-text-tertiary uppercase">Target:</span>
                    <span className="text-[10px] text-s3m-text-primary ml-1.5">{incident.target}</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-s3m-card rounded p-1.5">
                    <div className="text-[8px] text-s3m-text-tertiary uppercase mb-0.5">Dwell Time</div>
                    <div className="font-mono text-[11px] font-semibold text-s3m-yellow">{incident.dwellTime}</div>
                  </div>
                  <div className="bg-s3m-card rounded p-1.5">
                    <div className="text-[8px] text-s3m-text-tertiary uppercase mb-0.5">Blast Radius</div>
                    <div className="font-mono text-[10px] font-semibold text-s3m-text-primary">{incident.blastRadius}</div>
                  </div>
                  <div className="bg-s3m-card rounded p-1.5">
                    <div className="text-[8px] text-s3m-text-tertiary uppercase mb-0.5">FP Rate</div>
                    <div className="font-mono text-[11px] font-semibold text-s3m-green">{incident.fpRate}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Model Security Section */}
      <div className="bg-s3m-card border border-s3m-border-default rounded-lg p-3">
        <button
          onClick={() => setExpandedModelSec(!expandedModelSec)}
          className="w-full flex items-center gap-2 mb-3 hover:bg-s3m-elevated/30 p-1 rounded transition-colors"
        >
          {expandedModelSec ? (
            <ChevronDown className="w-4 h-4 text-s3m-cyan" />
          ) : (
            <ChevronRight className="w-4 h-4 text-s3m-cyan" />
          )}
          <Lock className="w-4 h-4 text-s3m-cyan" />
          <span className="text-[11px] text-s3m-text-tertiary uppercase tracking-wider font-semibold">
            MODEL SECURITY
          </span>
        </button>

        {expandedModelSec && (
          <div className="grid grid-cols-3 gap-3">
            {modelSecurity.map((model) => (
              <div
                key={model.modelName}
                className="bg-s3m-elevated border border-s3m-border-default rounded-lg p-3"
              >
                <div className="mb-3">
                  <div className="text-[11px] text-s3m-text-primary font-semibold mb-1">
                    {model.modelName}
                  </div>
                  <div className="text-[9px] text-s3m-text-tertiary">
                    Version {model.version}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between bg-s3m-card rounded p-1.5">
                    <span className="text-[9px] text-s3m-text-tertiary uppercase">Integrity</span>
                    <span
                      className="text-[9px] font-semibold"
                      style={{ color: getIntegrityColor(model.integrity) }}
                    >
                      {model.integrity}
                    </span>
                  </div>

                  <div className="flex items-center justify-between bg-s3m-card rounded p-1.5">
                    <span className="text-[9px] text-s3m-text-tertiary uppercase">Attestation</span>
                    <span className="text-[9px] text-s3m-text-primary">{model.lastAttestation}</span>
                  </div>

                  <div className="bg-s3m-card rounded p-1.5">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] text-s3m-text-tertiary uppercase">Drift Score</span>
                      <span
                        className="text-[10px] font-mono font-semibold"
                        style={{ color: model.driftScore > 10 ? '#EF4444' : model.driftScore > 5 ? '#EAB308' : '#22C55E' }}
                      >
                        {model.driftScore}%
                      </span>
                    </div>
                    <ProgressBar
                      value={(model.driftScore / 15) * 100}
                      severity={model.driftScore > 10 ? 'critical' : model.driftScore > 5 ? 'caution' : 'operational'}
                    />
                  </div>

                  <div className="flex items-center justify-between bg-s3m-card rounded p-1.5">
                    <span className="text-[9px] text-s3m-text-tertiary uppercase">Anomalies</span>
                    <span
                      className="text-[10px] font-mono font-semibold"
                      style={{ color: model.anomalyCount > 0 ? '#EF4444' : '#22C55E' }}
                    >
                      {model.anomalyCount}
                    </span>
                  </div>

                  {model.suspiciousPrompts.length > 0 && (
                    <div className="bg-s3m-card rounded p-1.5 space-y-1">
                      <div className="text-[8px] text-s3m-text-tertiary uppercase mb-1">Suspicious Activity</div>
                      {model.suspiciousPrompts.map((prompt, idx) => (
                        <div key={idx} className="border-l-2" style={{ borderLeftColor: getSeverityColor(prompt.risk), paddingLeft: '6px' }}>
                          <div className="flex items-center justify-between">
                            <span className="text-[8px] font-mono text-s3m-text-tertiary">{prompt.time}</span>
                            <span
                              className="text-[7px] uppercase font-semibold"
                              style={{ color: getSeverityColor(prompt.risk) }}
                            >
                              {prompt.risk}
                            </span>
                          </div>
                          <div className="text-[9px] text-s3m-text-primary">{prompt.prompt}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Trust Fabric Section */}
      <div className="bg-s3m-card border border-s3m-border-default rounded-lg p-3">
        <button
          onClick={() => setExpandedTrust(!expandedTrust)}
          className="w-full flex items-center gap-2 mb-3 hover:bg-s3m-elevated/30 p-1 rounded transition-colors"
        >
          {expandedTrust ? (
            <ChevronDown className="w-4 h-4 text-s3m-cyan" />
          ) : (
            <ChevronRight className="w-4 h-4 text-s3m-cyan" />
          )}
          <Shield className="w-4 h-4 text-s3m-cyan" />
          <span className="text-[11px] text-s3m-text-tertiary uppercase tracking-wider font-semibold">
            TRUST FABRIC
          </span>
          <div className="ml-auto flex items-center gap-3">
            {trustScores.map((ts) => (
              <div key={ts.category} className="flex items-center gap-1.5">
                <span className="text-[8px] text-s3m-text-tertiary uppercase">{ts.category.split(' ')[0]}:</span>
                <span className="text-[11px] font-mono font-semibold" style={{ color: ts.color }}>{ts.score}</span>
              </div>
            ))}
          </div>
        </button>

        {expandedTrust && (
          <div className="grid grid-cols-2 gap-3">
            {trustScores.map((trustCat) => (
              <div
                key={trustCat.category}
                className="bg-s3m-elevated border border-s3m-border-default rounded-lg p-3"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="text-[11px] text-s3m-text-primary font-semibold">
                    {trustCat.category}
                  </div>
                  <div className="text-[14px] font-mono font-bold" style={{ color: trustCat.color }}>
                    {trustCat.score}
                  </div>
                </div>

                <div className="space-y-1.5">
                  {trustCat.breakdown.map((factor) => (
                    <div
                      key={factor.factor}
                      className="flex items-center justify-between bg-s3m-card rounded p-1.5"
                    >
                      <div className="flex items-center gap-2">
                        <StatusIndicator status={factor.status} label="" size="sm" />
                        <span className="text-[9px] text-s3m-text-primary">{factor.factor}</span>
                      </div>
                      <span className="text-[10px] font-mono font-semibold text-s3m-text-secondary">
                        {factor.score}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resilience Actions Section */}
      <div className="bg-s3m-card border border-s3m-border-default rounded-lg p-3">
        <button
          onClick={() => setExpandedResilience(!expandedResilience)}
          className="w-full flex items-center gap-2 mb-3 hover:bg-s3m-elevated/30 p-1 rounded transition-colors"
        >
          {expandedResilience ? (
            <ChevronDown className="w-4 h-4 text-s3m-cyan" />
          ) : (
            <ChevronRight className="w-4 h-4 text-s3m-cyan" />
          )}
          <Zap className="w-4 h-4 text-s3m-cyan" />
          <span className="text-[11px] text-s3m-text-tertiary uppercase tracking-wider font-semibold">
            RESILIENCE ACTIONS
          </span>
          <div className="ml-auto">
            <span className="text-[9px] text-s3m-text-tertiary uppercase">
              {resilienceActions.reduce((sum, cat) => sum + cat.actions.length, 0)} Actions Available
            </span>
          </div>
        </button>

        {expandedResilience && (
          <div className="space-y-3">
            {resilienceActions.map((category) => (
              <div key={category.category}>
                <div className="text-[10px] text-s3m-text-tertiary uppercase tracking-wider font-semibold mb-2 flex items-center gap-2">
                  <GitBranch className="w-3 h-3" />
                  {category.category}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {category.actions.map((action, idx) => (
                    <div
                      key={idx}
                      className="bg-s3m-elevated border border-s3m-border-default rounded-lg p-2.5 hover:border-s3m-cyan/40 transition-all cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="text-[10px] text-s3m-text-primary font-semibold">
                          {action.name}
                        </div>
                        <span
                          className="text-[8px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded"
                          style={{
                            color: getUrgencyColor(action.urgency),
                            background: `${getUrgencyColor(action.urgency)}20`,
                            border: `1px solid ${getUrgencyColor(action.urgency)}40`
                          }}
                        >
                          {action.urgency}
                        </span>
                      </div>
                      <div className="space-y-1 mb-2">
                        <div className="text-[9px]">
                          <span className="text-s3m-text-tertiary">Target:</span>
                          <span className="text-s3m-text-primary ml-1">{action.target}</span>
                        </div>
                        <div className="text-[9px]">
                          <span className="text-s3m-text-tertiary">Reason:</span>
                          <span className="text-s3m-text-primary ml-1">{action.reason}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[8px]">
                        <div>
                          <span className="text-s3m-text-tertiary">Impact:</span>
                          <span className="text-s3m-text-primary ml-1">{action.impact}</span>
                        </div>
                        <div>
                          <span className="text-s3m-text-tertiary">ETA:</span>
                          <span className="text-s3m-text-primary ml-1">{action.estimatedDowntime}</span>
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

      {/* Cyber-Attack Options Section */}
      <div className="bg-s3m-card border border-s3m-border-default rounded-lg p-3">
        <button
          onClick={() => setExpandedAttackOptions(!expandedAttackOptions)}
          className="w-full flex items-center gap-2 mb-3 hover:bg-s3m-elevated/30 p-1 rounded transition-colors"
        >
          {expandedAttackOptions ? (
            <ChevronDown className="w-4 h-4 text-s3m-cyan" />
          ) : (
            <ChevronRight className="w-4 h-4 text-s3m-cyan" />
          )}
          <AlertTriangle className="w-4 h-4 text-s3m-cyan" />
          <span className="text-[11px] text-s3m-text-tertiary uppercase tracking-wider font-semibold">
            CYBER-ATTACK OPTIONS
          </span>
        </button>

        {expandedAttackOptions && (
          <div className="grid grid-cols-2 gap-3">
            {attackOptions.map((option, idx) => {
              const impactColors: any = {
                HIGH: '#EF4444',
                MEDIUM: '#EAB308',
                LOW: '#38BDF8'
              };

              return (
                <div
                  key={idx}
                  className="bg-s3m-elevated border border-s3m-border-default rounded-lg p-3 hover:border-s3m-cyan/40 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-[11px] text-s3m-text-primary font-semibold">
                      {option.type}
                    </div>
                    <span
                      className="text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded"
                      style={{
                        color: impactColors[option.impact],
                        background: `${impactColors[option.impact]}20`,
                        border: `1px solid ${impactColors[option.impact]}40`
                      }}
                    >
                      {option.impact}
                    </span>
                  </div>
                  <div className="text-[10px] text-s3m-text-tertiary mb-1">
                    Target: {option.target}
                  </div>
                  <div className="text-[10px] text-s3m-cyan">
                    Status: {option.status}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
