import { useState } from 'react';
import { CommandCard } from '../CommandCard';
import { ConfidenceBadge } from '../ConfidenceBadge';
import { ProgressBar } from '../ProgressBar';
import { Play, Radio, ChevronDown, ChevronRight, Wifi, Activity, MessageSquare, Layers, Lightbulb, Satellite, Signal, Globe } from 'lucide-react';

export function CommunicationWorkspace() {
  const [expandedBearerHealth, setExpandedBearerHealth] = useState(true);
  const [expandedMessageAssurance, setExpandedMessageAssurance] = useState(false);
  const [expandedPriorityRouting, setExpandedPriorityRouting] = useState(false);
  const [expandedCommsAdvisor, setExpandedCommsAdvisor] = useState(false);

  const commsChannels = [
    { channel: 'SATCOM Primary', confidence: 92 },
    { channel: 'SATCOM Backup', confidence: 88 },
    { channel: 'Ground Link A', confidence: 74 },
    { channel: 'Ground Link B', confidence: 45 },
    { channel: 'UAV Datalink', confidence: 82 },
    { channel: 'Coalition Net', confidence: 91 }
  ];

  const liveChats = [
    { id: 'CH-001', callsign: 'OVERLORD-6', frequency: '142.50', status: 'ACTIVE', time: '00:12:34' },
    { id: 'CH-002', callsign: 'VIPER-2', frequency: '138.25', status: 'ACTIVE', time: '00:08:15' },
    { id: 'CH-003', callsign: 'ECHO-1', frequency: '151.75', status: 'ACTIVE', time: '00:04:22' },
    { id: 'CH-004', callsign: 'BRAVO-4', frequency: '145.00', status: 'STANDBY', time: '00:01:08' }
  ];

  const archivedChats = [
    { id: 'ARC-045', callsign: 'ALPHA-3', timestamp: '14:32Z', duration: '12:45', summary: 'Tactical movement coordination' },
    { id: 'ARC-044', callsign: 'OVERLORD-6', timestamp: '14:18Z', duration: '08:12', summary: 'Fire mission request approved' },
    { id: 'ARC-043', callsign: 'WHISKEY-5', timestamp: '14:05Z', duration: '05:38', summary: 'Casualty evacuation complete' },
    { id: 'ARC-042', callsign: 'THUNDER-2', timestamp: '13:47Z', duration: '15:22', summary: 'Air support coordination' },
    { id: 'ARC-041', callsign: 'DELTA-9', timestamp: '13:31Z', duration: '06:54', summary: 'Route clearance status update' }
  ];

  // Bearer Health Data
  const bearerHealth = [
    {
      type: 'SATCOM',
      icon: Satellite,
      status: 'operational',
      latency: '247ms',
      packetLoss: '0.8%',
      failoverEvents: 0,
      bandwidth: '2.4 Mbps',
      uptime: '99.7%'
    },
    {
      type: 'RF',
      icon: Radio,
      status: 'caution',
      latency: '82ms',
      packetLoss: '4.2%',
      failoverEvents: 2,
      bandwidth: '512 Kbps',
      uptime: '94.2%'
    },
    {
      type: 'LTE',
      icon: Signal,
      status: 'operational',
      latency: '34ms',
      packetLoss: '1.1%',
      failoverEvents: 1,
      bandwidth: '8.7 Mbps',
      uptime: '98.4%'
    },
    {
      type: 'Mesh',
      icon: Globe,
      status: 'critical',
      latency: '412ms',
      packetLoss: '12.7%',
      failoverEvents: 7,
      bandwidth: '128 Kbps',
      uptime: '78.3%'
    },
    {
      type: 'Wired',
      icon: Activity,
      status: 'operational',
      latency: '12ms',
      packetLoss: '0.1%',
      failoverEvents: 0,
      bandwidth: '100 Mbps',
      uptime: '99.9%'
    }
  ];

  // Message Assurance Data
  const messageAssurance = {
    summary: {
      total: 8472,
      delivered: 7894,
      delayed: 342,
      dropped: 124,
      retransmitted: 236,
      acknowledged: 7658
    },
    recentMessages: [
      { id: 'MSG-2847', from: 'OVERLORD-6', to: 'VIPER-2', status: 'delivered', latency: '1.2s', retries: 0, priority: 'command' },
      { id: 'MSG-2846', from: 'ECHO-1', to: 'ALPHA-3', status: 'delayed', latency: '8.4s', retries: 2, priority: 'logistics' },
      { id: 'MSG-2845', from: 'BRAVO-4', to: 'OVERLORD-6', status: 'delivered', latency: '0.8s', retries: 0, priority: 'emergency' },
      { id: 'MSG-2844', from: 'WHISKEY-5', to: 'ECHO-1', status: 'retransmitted', latency: '4.7s', retries: 3, priority: 'ISR' },
      { id: 'MSG-2843', from: 'VIPER-2', to: 'THUNDER-2', status: 'dropped', latency: 'N/A', retries: 5, priority: 'logistics' }
    ]
  };

  // Priority Routing Data
  const priorityRouting = [
    {
      category: 'Command Traffic',
      active: 24,
      bandwidth: '1.2 Mbps',
      avgLatency: '124ms',
      queueDepth: 0,
      color: '#EF4444',
      priority: 1
    },
    {
      category: 'Emergency Override',
      active: 2,
      bandwidth: '256 Kbps',
      avgLatency: '87ms',
      queueDepth: 0,
      color: '#F97316',
      priority: 0
    },
    {
      category: 'ISR Traffic',
      active: 47,
      bandwidth: '4.8 Mbps',
      avgLatency: '342ms',
      queueDepth: 12,
      color: '#8B5CF6',
      priority: 2
    },
    {
      category: 'Logistics Traffic',
      active: 89,
      bandwidth: '2.1 Mbps',
      avgLatency: '1247ms',
      queueDepth: 34,
      color: '#38BDF8',
      priority: 3
    }
  ];

  // Comms Degradation Advisor Data
  const commsAdvisor = {
    currentCondition: 'Moderate Degradation',
    severity: 'caution',
    recommendations: [
      {
        action: 'Switch to SATCOM Primary',
        reason: 'RF link experiencing 12.7% packet loss',
        impact: 'High',
        bandwidth: '+1.8 Mbps',
        latency: '+165ms',
        complexity: 'Low'
      },
      {
        action: 'Compress ISR imagery',
        reason: 'Bandwidth constrained on current path',
        impact: 'Medium',
        bandwidth: '+2.4 Mbps',
        latency: '±0ms',
        complexity: 'Low'
      },
      {
        action: 'Switch to S3M-Lite model',
        reason: 'Low bandwidth on primary links',
        impact: 'Medium',
        bandwidth: '-800 Kbps',
        latency: '-50ms',
        complexity: 'Medium'
      },
      {
        action: 'Queue non-essential sync',
        reason: 'Emergency traffic prioritization',
        impact: 'Low',
        bandwidth: '+600 Kbps',
        latency: '±0ms',
        complexity: 'Low'
      },
      {
        action: 'Summarize logistics reports',
        reason: 'Reduce message payload by 70%',
        impact: 'Low',
        bandwidth: '+400 Kbps',
        latency: '±0ms',
        complexity: 'Low'
      }
    ]
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return '#22C55E';
      case 'caution': return '#EAB308';
      case 'critical': return '#EF4444';
      default: return '#607590';
    }
  };

  const getMessageStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return '#22C55E';
      case 'acknowledged': return '#22C55E';
      case 'delayed': return '#EAB308';
      case 'retransmitted': return '#F97316';
      case 'dropped': return '#EF4444';
      default: return '#607590';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'High': return '#22C55E';
      case 'Medium': return '#EAB308';
      case 'Low': return '#38BDF8';
      default: return '#607590';
    }
  };

  return (
    <div className="p-4 h-full space-y-4 overflow-y-auto">
      {/* Comms Confidence */}
      <CommandCard accentColor="#22C55E" title="COMMS CONFIDENCE" indicator>
        <div className="grid grid-cols-2 gap-4">
          {commsChannels.map((channel, i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] text-cyber-text-primary">{channel.channel}</span>
                <ConfidenceBadge value={channel.confidence} />
              </div>
              <ProgressBar
                value={channel.confidence}
                severity={channel.confidence >= 80 ? 'operational' : channel.confidence >= 60 ? 'caution' : 'critical'}
              />
            </div>
          ))}
        </div>
      </CommandCard>

      {/* Live Chats and Archived Chats */}
      <div className="grid grid-cols-2 gap-4">
        {/* Live Chats */}
        <CommandCard accentColor="#00F0FF" title="LIVE CHATS" indicator>
          <div className="space-y-2">
            {liveChats.map((chat, i) => (
              <div
                key={i}
                className="glass-panel rounded-lg p-3 hover:border-cyber-cyan/40 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-cyber-cyan" style={{ filter: 'drop-shadow(0 0 4px rgba(0, 240, 255, 0.6))' }} />
                    <span className="text-[11px] text-cyber-cyan font-semibold font-mono">
                      {chat.callsign}
                    </span>
                  </div>
                  <div
                    className={`w-2 h-2 rounded-full ${chat.status === 'ACTIVE' ? 'bg-cyber-green glow-green' : 'bg-cyber-text-tertiary'}`}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-cyber-text-tertiary mb-1">
                  <span>FREQ: {chat.frequency} MHz</span>
                  <span className="font-mono">{chat.time}</span>
                </div>
                <button
                  className="w-full flex items-center justify-center gap-2 mt-2 py-1.5 rounded-lg transition-all"
                  style={{
                    background: 'rgba(0, 240, 255, 0.1)',
                    border: '1px solid rgba(0, 240, 255, 0.3)'
                  }}
                >
                  <Play className="w-3 h-3 text-cyber-cyan" />
                  <span className="text-[10px] text-cyber-cyan uppercase tracking-wider font-semibold">
                    LISTEN
                  </span>
                </button>
              </div>
            ))}
          </div>
        </CommandCard>

        {/* Archived Chats */}
        <CommandCard accentColor="#8A5CFF" title="ARCHIVED CHATS" indicator>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {archivedChats.map((chat, i) => (
              <div
                key={i}
                className="glass-panel rounded-lg p-3 hover:border-cyber-purple/40 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="text-[11px] text-cyber-text-primary font-semibold font-mono">
                      {chat.callsign}
                    </span>
                    <div className="text-[9px] text-cyber-text-tertiary mt-0.5">
                      {chat.timestamp} • {chat.duration}
                    </div>
                  </div>
                  <span className="text-[9px] text-cyber-text-tertiary font-mono">{chat.id}</span>
                </div>
                <div className="text-[10px] text-cyber-text-secondary mb-2 leading-relaxed">
                  {chat.summary}
                </div>
                <button
                  className="w-full flex items-center justify-center gap-2 py-1.5 rounded-lg transition-all"
                  style={{
                    background: 'rgba(138, 92, 255, 0.1)',
                    border: '1px solid rgba(138, 92, 255, 0.3)'
                  }}
                >
                  <Play className="w-3 h-3 text-cyber-purple" />
                  <span className="text-[10px] text-cyber-purple uppercase tracking-wider font-semibold">
                    PLAYBACK
                  </span>
                </button>
              </div>
            ))}
          </div>
        </CommandCard>
      </div>

      {/* Bearer Health Section */}
      <div className="bg-s3m-card border border-s3m-border-default rounded-lg p-3">
        <button
          onClick={() => setExpandedBearerHealth(!expandedBearerHealth)}
          className="w-full flex items-center gap-2 mb-3 hover:bg-s3m-elevated/30 p-1 rounded transition-colors"
        >
          {expandedBearerHealth ? (
            <ChevronDown className="w-4 h-4 text-s3m-cyan" />
          ) : (
            <ChevronRight className="w-4 h-4 text-s3m-cyan" />
          )}
          <Wifi className="w-4 h-4 text-s3m-cyan" />
          <span className="text-[11px] text-s3m-text-tertiary uppercase tracking-wider font-semibold">
            BEARER HEALTH
          </span>
        </button>

        {expandedBearerHealth && (
          <div className="grid grid-cols-5 gap-3">
            {bearerHealth.map((bearer) => (
              <div
                key={bearer.type}
                className="bg-s3m-elevated border border-s3m-border-default rounded-lg p-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <bearer.icon className="w-4 h-4" style={{ color: getStatusColor(bearer.status) }} />
                    <span className="text-[11px] text-s3m-text-primary font-semibold">{bearer.type}</span>
                  </div>
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: getStatusColor(bearer.status) }}
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between bg-s3m-card rounded p-1 text-[8px]">
                    <span className="text-s3m-text-tertiary uppercase">Latency</span>
                    <span className="font-mono text-s3m-text-primary">{bearer.latency}</span>
                  </div>
                  <div className="flex items-center justify-between bg-s3m-card rounded p-1 text-[8px]">
                    <span className="text-s3m-text-tertiary uppercase">Loss</span>
                    <span className="font-mono" style={{ color: parseFloat(bearer.packetLoss) > 10 ? '#EF4444' : parseFloat(bearer.packetLoss) > 5 ? '#EAB308' : '#22C55E' }}>
                      {bearer.packetLoss}
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-s3m-card rounded p-1 text-[8px]">
                    <span className="text-s3m-text-tertiary uppercase">Failovers</span>
                    <span className="font-mono" style={{ color: bearer.failoverEvents > 5 ? '#EF4444' : bearer.failoverEvents > 2 ? '#EAB308' : '#22C55E' }}>
                      {bearer.failoverEvents}
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-s3m-card rounded p-1 text-[8px]">
                    <span className="text-s3m-text-tertiary uppercase">Bandwidth</span>
                    <span className="font-mono text-s3m-cyan">{bearer.bandwidth}</span>
                  </div>
                  <div className="flex items-center justify-between bg-s3m-card rounded p-1 text-[8px]">
                    <span className="text-s3m-text-tertiary uppercase">Uptime</span>
                    <span className="font-mono text-s3m-green">{bearer.uptime}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Message Assurance Section */}
      <div className="bg-s3m-card border border-s3m-border-default rounded-lg p-3">
        <button
          onClick={() => setExpandedMessageAssurance(!expandedMessageAssurance)}
          className="w-full flex items-center gap-2 mb-3 hover:bg-s3m-elevated/30 p-1 rounded transition-colors"
        >
          {expandedMessageAssurance ? (
            <ChevronDown className="w-4 h-4 text-s3m-cyan" />
          ) : (
            <ChevronRight className="w-4 h-4 text-s3m-cyan" />
          )}
          <MessageSquare className="w-4 h-4 text-s3m-cyan" />
          <span className="text-[11px] text-s3m-text-tertiary uppercase tracking-wider font-semibold">
            MESSAGE ASSURANCE
          </span>
          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-[8px] text-s3m-text-tertiary uppercase">Total:</span>
              <span className="text-[11px] font-mono font-semibold text-s3m-text-primary">{messageAssurance.summary.total}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[8px] text-s3m-text-tertiary uppercase">Delivered:</span>
              <span className="text-[11px] font-mono font-semibold text-s3m-green">{messageAssurance.summary.delivered}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[8px] text-s3m-text-tertiary uppercase">Dropped:</span>
              <span className="text-[11px] font-mono font-semibold text-s3m-red">{messageAssurance.summary.dropped}</span>
            </div>
          </div>
        </button>

        {expandedMessageAssurance && (
          <div className="space-y-3">
            <div className="grid grid-cols-5 gap-3">
              <div className="bg-s3m-elevated rounded p-2">
                <div className="text-[8px] text-s3m-text-tertiary uppercase mb-1">Delivered</div>
                <div className="font-mono text-[14px] font-semibold text-s3m-green">{messageAssurance.summary.delivered}</div>
                <div className="text-[8px] text-s3m-text-tertiary">{((messageAssurance.summary.delivered / messageAssurance.summary.total) * 100).toFixed(1)}%</div>
              </div>
              <div className="bg-s3m-elevated rounded p-2">
                <div className="text-[8px] text-s3m-text-tertiary uppercase mb-1">Delayed</div>
                <div className="font-mono text-[14px] font-semibold text-s3m-yellow">{messageAssurance.summary.delayed}</div>
                <div className="text-[8px] text-s3m-text-tertiary">{((messageAssurance.summary.delayed / messageAssurance.summary.total) * 100).toFixed(1)}%</div>
              </div>
              <div className="bg-s3m-elevated rounded p-2">
                <div className="text-[8px] text-s3m-text-tertiary uppercase mb-1">Dropped</div>
                <div className="font-mono text-[14px] font-semibold text-s3m-red">{messageAssurance.summary.dropped}</div>
                <div className="text-[8px] text-s3m-text-tertiary">{((messageAssurance.summary.dropped / messageAssurance.summary.total) * 100).toFixed(1)}%</div>
              </div>
              <div className="bg-s3m-elevated rounded p-2">
                <div className="text-[8px] text-s3m-text-tertiary uppercase mb-1">Retransmitted</div>
                <div className="font-mono text-[14px] font-semibold text-s3m-text-primary">{messageAssurance.summary.retransmitted}</div>
                <div className="text-[8px] text-s3m-text-tertiary">{((messageAssurance.summary.retransmitted / messageAssurance.summary.total) * 100).toFixed(1)}%</div>
              </div>
              <div className="bg-s3m-elevated rounded p-2">
                <div className="text-[8px] text-s3m-text-tertiary uppercase mb-1">Acknowledged</div>
                <div className="font-mono text-[14px] font-semibold text-s3m-cyan">{messageAssurance.summary.acknowledged}</div>
                <div className="text-[8px] text-s3m-text-tertiary">{((messageAssurance.summary.acknowledged / messageAssurance.summary.total) * 100).toFixed(1)}%</div>
              </div>
            </div>

            <div>
              <div className="text-[10px] text-s3m-text-tertiary uppercase tracking-wider font-semibold mb-2">Recent Messages</div>
              <div className="space-y-2">
                {messageAssurance.recentMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className="bg-s3m-elevated border border-s3m-border-default rounded-lg p-2"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[9px] text-s3m-text-tertiary">{msg.id}</span>
                        <span className="text-[9px] text-s3m-text-primary">{msg.from} → {msg.to}</span>
                      </div>
                      <span
                        className="text-[8px] uppercase font-semibold px-1.5 py-0.5 rounded"
                        style={{
                          color: getMessageStatusColor(msg.status),
                          background: `${getMessageStatusColor(msg.status)}20`,
                          border: `1px solid ${getMessageStatusColor(msg.status)}40`
                        }}
                      >
                        {msg.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[8px]">
                      <span className="text-s3m-text-tertiary">Priority: <span className="text-s3m-cyan">{msg.priority}</span></span>
                      <span className="text-s3m-text-tertiary">Latency: <span className="font-mono text-s3m-text-primary">{msg.latency}</span></span>
                      <span className="text-s3m-text-tertiary">Retries: <span className="font-mono" style={{ color: msg.retries > 3 ? '#EF4444' : msg.retries > 0 ? '#EAB308' : '#22C55E' }}>{msg.retries}</span></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Priority Routing Section */}
      <div className="bg-s3m-card border border-s3m-border-default rounded-lg p-3">
        <button
          onClick={() => setExpandedPriorityRouting(!expandedPriorityRouting)}
          className="w-full flex items-center gap-2 mb-3 hover:bg-s3m-elevated/30 p-1 rounded transition-colors"
        >
          {expandedPriorityRouting ? (
            <ChevronDown className="w-4 h-4 text-s3m-cyan" />
          ) : (
            <ChevronRight className="w-4 h-4 text-s3m-cyan" />
          )}
          <Layers className="w-4 h-4 text-s3m-cyan" />
          <span className="text-[11px] text-s3m-text-tertiary uppercase tracking-wider font-semibold">
            PRIORITY ROUTING
          </span>
        </button>

        {expandedPriorityRouting && (
          <div className="grid grid-cols-2 gap-3">
            {priorityRouting.map((route) => (
              <div
                key={route.category}
                className="bg-s3m-elevated border border-s3m-border-default rounded-lg p-3"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: route.color }}
                    />
                    <span className="text-[11px] text-s3m-text-primary font-semibold">{route.category}</span>
                  </div>
                  <span
                    className="text-[9px] uppercase font-semibold px-2 py-0.5 rounded"
                    style={{
                      color: route.color,
                      background: `${route.color}20`,
                      border: `1px solid ${route.color}40`
                    }}
                  >
                    P{route.priority}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between bg-s3m-card rounded p-1.5">
                    <span className="text-[9px] text-s3m-text-tertiary uppercase">Active</span>
                    <span className="text-[11px] font-mono font-semibold text-s3m-text-primary">{route.active}</span>
                  </div>
                  <div className="flex items-center justify-between bg-s3m-card rounded p-1.5">
                    <span className="text-[9px] text-s3m-text-tertiary uppercase">Bandwidth</span>
                    <span className="text-[11px] font-mono font-semibold text-s3m-cyan">{route.bandwidth}</span>
                  </div>
                  <div className="flex items-center justify-between bg-s3m-card rounded p-1.5">
                    <span className="text-[9px] text-s3m-text-tertiary uppercase">Avg Latency</span>
                    <span className="text-[11px] font-mono font-semibold text-s3m-text-primary">{route.avgLatency}</span>
                  </div>
                  <div className="flex items-center justify-between bg-s3m-card rounded p-1.5">
                    <span className="text-[9px] text-s3m-text-tertiary uppercase">Queue Depth</span>
                    <span
                      className="text-[11px] font-mono font-semibold"
                      style={{ color: route.queueDepth > 20 ? '#EF4444' : route.queueDepth > 10 ? '#EAB308' : '#22C55E' }}
                    >
                      {route.queueDepth}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Comms Degradation Advisor Section */}
      <div className="bg-s3m-card border border-s3m-border-default rounded-lg p-3">
        <button
          onClick={() => setExpandedCommsAdvisor(!expandedCommsAdvisor)}
          className="w-full flex items-center gap-2 mb-3 hover:bg-s3m-elevated/30 p-1 rounded transition-colors"
        >
          {expandedCommsAdvisor ? (
            <ChevronDown className="w-4 h-4 text-s3m-cyan" />
          ) : (
            <ChevronRight className="w-4 h-4 text-s3m-cyan" />
          )}
          <Lightbulb className="w-4 h-4 text-s3m-cyan" />
          <span className="text-[11px] text-s3m-text-tertiary uppercase tracking-wider font-semibold">
            COMMS DEGRADATION ADVISOR
          </span>
          <div className="ml-auto">
            <span
              className="text-[9px] uppercase font-semibold px-2 py-0.5 rounded"
              style={{
                color: getStatusColor(commsAdvisor.severity),
                background: `${getStatusColor(commsAdvisor.severity)}20`,
                border: `1px solid ${getStatusColor(commsAdvisor.severity)}40`
              }}
            >
              {commsAdvisor.currentCondition}
            </span>
          </div>
        </button>

        {expandedCommsAdvisor && (
          <div className="space-y-2">
            {commsAdvisor.recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="bg-s3m-elevated border border-s3m-border-default rounded-lg p-3 hover:border-s3m-cyan/40 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="text-[11px] text-s3m-text-primary font-semibold">
                    {rec.action}
                  </div>
                  <span
                    className="text-[9px] uppercase font-semibold px-2 py-0.5 rounded"
                    style={{
                      color: getImpactColor(rec.impact),
                      background: `${getImpactColor(rec.impact)}20`,
                      border: `1px solid ${getImpactColor(rec.impact)}40`
                    }}
                  >
                    {rec.impact} Impact
                  </span>
                </div>
                <div className="text-[9px] text-s3m-text-tertiary mb-2">{rec.reason}</div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-s3m-card rounded p-1.5">
                    <div className="text-[8px] text-s3m-text-tertiary uppercase mb-0.5">Bandwidth</div>
                    <div className="font-mono text-[10px] font-semibold text-s3m-cyan">{rec.bandwidth}</div>
                  </div>
                  <div className="bg-s3m-card rounded p-1.5">
                    <div className="text-[8px] text-s3m-text-tertiary uppercase mb-0.5">Latency</div>
                    <div className="font-mono text-[10px] font-semibold text-s3m-text-primary">{rec.latency}</div>
                  </div>
                  <div className="bg-s3m-card rounded p-1.5">
                    <div className="text-[8px] text-s3m-text-tertiary uppercase mb-0.5">Complexity</div>
                    <div className="text-[10px] font-semibold" style={{ color: rec.complexity === 'Low' ? '#22C55E' : rec.complexity === 'Medium' ? '#EAB308' : '#EF4444' }}>
                      {rec.complexity}
                    </div>
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
