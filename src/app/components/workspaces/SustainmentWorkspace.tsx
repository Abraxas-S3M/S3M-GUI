import { CommandCard } from '../CommandCard';
import { ProgressBar } from '../ProgressBar';
import { Wrench, Package, AlertTriangle, TrendingDown, Users, Clock, Zap, Target, ChevronDown, ChevronRight, Truck, ShieldAlert } from 'lucide-react';
import { useState } from 'react';

export function SustainmentWorkspace() {
  const [expandedFleetUnit, setExpandedFleetUnit] = useState<string | null>('1-82nd');
  const [expandedSupplyCategory, setExpandedSupplyCategory] = useState<string | null>('ammo');
  const [expandedMaintenance, setExpandedMaintenance] = useState(false);

  const fleetHealth = [
    {
      unit: '1-82nd Aviation',
      readiness: 78,
      platforms: [
        { name: 'UH-60 Blackhawk', count: 12, ready: 9, degraded: 2, down: 1, missionCapableHrs: 248, color: '#EAB308' },
        { name: 'AH-64 Apache', count: 8, ready: 7, degraded: 0, down: 1, missionCapableHrs: 312, color: '#22C55E' },
        { name: 'CH-47 Chinook', count: 4, ready: 2, degraded: 1, down: 1, missionCapableHrs: 96, color: '#EF4444' }
      ],
      cannibalizationAlerts: [
        { from: 'UH-60 (Tail #847)', to: 'UH-60 (Tail #823)', part: 'Main rotor blade actuator', urgency: 'HIGH' }
      ]
    },
    {
      unit: '3-15th Armor',
      readiness: 62,
      platforms: [
        { name: 'M1A2 Abrams', count: 18, ready: 11, degraded: 5, down: 2, missionCapableHrs: 184, color: '#EF4444' },
        { name: 'M2 Bradley', count: 24, ready: 18, degraded: 4, down: 2, missionCapableHrs: 276, color: '#EAB308' },
        { name: 'M88 Recovery', count: 6, ready: 5, degraded: 1, down: 0, missionCapableHrs: 420, color: '#22C55E' }
      ],
      cannibalizationAlerts: [
        { from: 'M1A2 (Hull #4127)', to: 'M1A2 (Hull #4089)', part: 'Fire control computer', urgency: 'CRITICAL' },
        { from: 'M2 (Hull #2156)', to: 'M2 (Hull #2143)', part: 'Track assembly', urgency: 'MEDIUM' }
      ]
    }
  ];

  const supplyChain = [
    {
      category: 'ammo',
      name: 'Ammunition',
      icon: Target,
      color: '#EF4444',
      items: [
        { type: '5.56mm', stock: 145000, target: 200000, leadTime: '12 days', leadTimeRisk: 'HIGH', vendor: 'Lake City AAP', vendorReliability: 92 },
        { type: '120mm APFSDS', stock: 280, target: 400, leadTime: '45 days', leadTimeRisk: 'CRITICAL', vendor: 'General Dynamics', vendorReliability: 88 },
        { type: 'Hellfire', stock: 48, target: 80, leadTime: '8 days', leadTimeRisk: 'MEDIUM', vendor: 'Lockheed Martin', vendorReliability: 95 }
      ],
      theaterLatency: '3-5 days via strategic airlift'
    },
    {
      category: 'fuel',
      name: 'Fuel',
      icon: Zap,
      color: '#EAB308',
      items: [
        { type: 'JP-8 Aviation', stock: 482000, target: 650000, leadTime: '7 days', leadTimeRisk: 'MEDIUM', vendor: 'DLA Energy', vendorReliability: 98 },
        { type: 'Diesel (Ground)', stock: 1240000, target: 1500000, leadTime: '4 days', leadTimeRisk: 'LOW', vendor: 'Theater Fuel Farm', vendorReliability: 96 }
      ],
      theaterLatency: '1-2 days via tanker convoy'
    },
    {
      category: 'spares',
      name: 'Spare Parts',
      icon: Wrench,
      color: '#8B5CF6',
      items: [
        { type: 'Engine assemblies', stock: 8, target: 15, leadTime: '60 days', leadTimeRisk: 'CRITICAL', vendor: 'Honeywell', vendorReliability: 78 },
        { type: 'Transmission units', stock: 12, target: 18, leadTime: '45 days', leadTimeRisk: 'HIGH', vendor: 'Allison', vendorReliability: 85 },
        { type: 'Electronics modules', stock: 34, target: 50, leadTime: '30 days', leadTimeRisk: 'MEDIUM', vendor: 'Raytheon', vendorReliability: 91 }
      ],
      theaterLatency: '5-7 days via cargo aircraft'
    }
  ];

  const missionDependencies = [
    {
      component: '120mm APFSDS rounds',
      threshold: 200,
      currentStock: 280,
      daysToThreshold: 18,
      affectedMissions: [
        { name: 'Operation Thunder Strike', priority: 'CRITICAL', failureImpact: 95, unitsDependant: '3-15th Armor' },
        { name: 'Sector Defense Alpha', priority: 'HIGH', failureImpact: 72, unitsDependant: '1-22nd Armor' }
      ],
      allocation: 'Recommend prioritize Thunder Strike (95% impact) over Sector Defense (72% impact)'
    },
    {
      component: 'UH-60 Mission Capable Hours',
      threshold: 150,
      currentStock: 248,
      daysToThreshold: 12,
      affectedMissions: [
        { name: 'Medevac Standby', priority: 'CRITICAL', failureImpact: 100, unitsDependant: '1-82nd Aviation' },
        { name: 'Troop Movement Echo', priority: 'MEDIUM', failureImpact: 58, unitsDependant: '1-82nd Aviation' },
        { name: 'ISR Support Bravo', priority: 'HIGH', failureImpact: 68, unitsDependant: '1-82nd Aviation' }
      ],
      allocation: 'Recommend reserve all available hours for Medevac (100% critical) until restocked'
    },
    {
      component: 'JP-8 Aviation Fuel',
      threshold: 350000,
      currentStock: 482000,
      daysToThreshold: 8,
      affectedMissions: [
        { name: 'Air Superiority CAP', priority: 'CRITICAL', failureImpact: 88, unitsDependant: 'Multiple air units' },
        { name: 'Close Air Support', priority: 'HIGH', failureImpact: 78, unitsDependant: 'Multiple air units' }
      ],
      allocation: 'Recommend increase fuel allocation by 40% immediately to prevent mission failure'
    }
  ];

  const maintenanceSchedule = [
    {
      type: 'predictive',
      platform: 'M1A2 Hull #4089',
      issue: 'Transmission fluid analysis shows metal particulates',
      recommendedAction: 'Preventive transmission replacement',
      window: 'Next 72h before mission criticality',
      confidence: 87,
      failureProbability: 68
    },
    {
      type: 'predictive',
      platform: 'UH-60 Tail #823',
      issue: 'Gearbox vibration anomaly detected',
      recommendedAction: 'Inspect and potentially replace main gearbox',
      window: 'Next 48h during scheduled downtime',
      confidence: 92,
      failureProbability: 74
    },
    {
      type: 'opportunistic',
      platform: 'AH-64 Tail #412',
      issue: 'Scheduled for avionics upgrade',
      recommendedAction: 'Bundle engine inspection (due in 12 days) with current maintenance',
      window: 'Currently in hangar - add 6h to timeline',
      savings: 'Save 14h turnaround time'
    },
    {
      type: 'opportunistic',
      platform: 'M2 Bradley Hull #2143',
      issue: 'Track replacement in progress',
      recommendedAction: 'Perform suspension overhaul (due in 8 days) simultaneously',
      window: 'Currently in depot',
      savings: 'Save 18h turnaround time'
    }
  ];

  const technicianWorkload = [
    { name: 'Team Alpha', workload: 92, specialty: 'Aviation', taskCount: 14, bottleneck: true },
    { name: 'Team Bravo', workload: 68, specialty: 'Armor', taskCount: 9, bottleneck: false },
    { name: 'Team Charlie', workload: 78, specialty: 'Electronics', taskCount: 11, bottleneck: false },
    { name: 'Team Delta', workload: 45, specialty: 'Wheeled Vehicles', taskCount: 6, bottleneck: false }
  ];

  const depotBottlenecks = [
    { depot: 'Forward Maintenance Area 1', utilizationRate: 94, queueDepth: 8, avgWaitTime: '4.2 days', status: 'CRITICAL' },
    { depot: 'Forward Maintenance Area 2', utilizationRate: 72, queueDepth: 3, avgWaitTime: '1.8 days', status: 'OPERATIONAL' },
    { depot: 'Theater Support Depot', utilizationRate: 88, queueDepth: 12, avgWaitTime: '6.5 days', status: 'CAUTION' }
  ];

  return (
    <div className="p-4 h-full flex flex-col gap-4 overflow-y-auto">
      {/* Top Row - Fleet Health */}
      <div className="grid grid-cols-2 gap-4">
        {fleetHealth.map((unit) => {
          const isExpanded = expandedFleetUnit === unit.unit;
          return (
            <CommandCard key={unit.unit} accentColor="#38BDF8" title="FLEET HEALTH" indicator>
              <button
                onClick={() => setExpandedFleetUnit(isExpanded ? null : unit.unit)}
                className="w-full flex items-center justify-between mb-3 hover:bg-s3m-elevated/50 p-2 rounded transition-colors"
              >
                <div className="flex items-center gap-2">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-s3m-blue" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-s3m-blue" />
                  )}
                  <span className="text-base font-semibold text-s3m-text-primary">{unit.unit}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-base text-s3m-text-tertiary uppercase tracking-wider">READINESS</span>
                  <span
                    className="font-mono text-sm font-bold"
                    style={{
                      color: unit.readiness >= 75 ? '#22C55E' : unit.readiness >= 50 ? '#EAB308' : '#EF4444'
                    }}
                  >
                    {unit.readiness}%
                  </span>
                </div>
              </button>

              {isExpanded && (
                <div className="space-y-3">
                  {unit.platforms.map((platform) => (
                    <div key={platform.name} className="bg-s3m-elevated rounded p-3 border border-s3m-border-default">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-s3m-text-primary">{platform.name}</span>
                        <span className="text-base text-s3m-text-tertiary">
                          Total: {platform.count}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mb-2">
                        <div className="bg-s3m-card rounded p-1.5">
                          <div className="text-xs text-s3m-text-tertiary mb-0.5">Ready</div>
                          <div className="font-mono text-base font-semibold text-s3m-operational">{platform.ready}</div>
                        </div>
                        <div className="bg-s3m-card rounded p-1.5">
                          <div className="text-xs text-s3m-text-tertiary mb-0.5">Degraded</div>
                          <div className="font-mono text-base font-semibold text-s3m-caution">{platform.degraded}</div>
                        </div>
                        <div className="bg-s3m-card rounded p-1.5">
                          <div className="text-xs text-s3m-text-tertiary mb-0.5">Down</div>
                          <div className="font-mono text-base font-semibold text-s3m-critical">{platform.down}</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between bg-s3m-card rounded p-2">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3" style={{ color: platform.color }} />
                          <span className="text-base text-s3m-text-tertiary">Mission Capable Hours</span>
                        </div>
                        <span
                          className="font-mono text-xs font-semibold"
                          style={{ color: platform.color }}
                        >
                          {platform.missionCapableHrs}h
                        </span>
                      </div>
                    </div>
                  ))}

                  {unit.cannibalizationAlerts.length > 0 && (
                    <div className="bg-s3m-critical/10 border border-s3m-critical/40 rounded p-2">
                      <div className="flex items-center gap-2 mb-2">
                        <ShieldAlert className="w-3.5 h-3.5 text-s3m-critical" />
                        <span className="text-base text-s3m-critical uppercase tracking-wider font-semibold">
                          CANNIBALIZATION ALERTS
                        </span>
                      </div>
                      {unit.cannibalizationAlerts.map((alert, i) => (
                        <div key={i} className="text-xs text-s3m-text-secondary leading-relaxed mb-1">
                          <span className="text-s3m-text-primary font-semibold">{alert.part}</span> from{' '}
                          <span className="font-mono">{alert.from}</span> → <span className="font-mono">{alert.to}</span>
                          <span
                            className="ml-2 text-xs uppercase px-1.5 py-0.5 rounded"
                            style={{
                              color: alert.urgency === 'CRITICAL' ? '#EF4444' : alert.urgency === 'HIGH' ? '#EAB308' : '#38BDF8',
                              backgroundColor: alert.urgency === 'CRITICAL' ? '#EF444420' : alert.urgency === 'HIGH' ? '#EAB30820' : '#38BDF820'
                            }}
                          >
                            {alert.urgency}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CommandCard>
          );
        })}
      </div>

      {/* Middle Row - Supply Chain and Mission Dependencies */}
      <div className="grid grid-cols-2 gap-4">
        {/* Supply Chain */}
        <CommandCard accentColor="#EAB308" title="SUPPLY CHAIN POSTURE" indicator>
          <div className="space-y-2">
            {supplyChain.map((category) => {
              const Icon = category.icon;
              const isExpanded = expandedSupplyCategory === category.category;

              return (
                <div key={category.category} className="bg-s3m-elevated rounded border border-s3m-border-default">
                  <button
                    onClick={() => setExpandedSupplyCategory(isExpanded ? null : category.category)}
                    className="w-full flex items-center justify-between p-2 hover:bg-s3m-elevated-hover transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5" style={{ color: category.color }} />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5" style={{ color: category.color }} />
                      )}
                      <Icon className="w-3.5 h-3.5" style={{ color: category.color }} />
                      <span className="text-base font-semibold text-s3m-text-primary">{category.name}</span>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-2 pb-2 space-y-2">
                      {category.items.map((item, i) => (
                        <div key={i} className="bg-s3m-card rounded p-2">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-semibold text-s3m-text-primary">{item.type}</span>
                            <span
                              className="text-xs uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded"
                              style={{
                                color: item.leadTimeRisk === 'CRITICAL' ? '#EF4444' : item.leadTimeRisk === 'HIGH' ? '#EAB308' : item.leadTimeRisk === 'MEDIUM' ? '#38BDF8' : '#22C55E',
                                backgroundColor: item.leadTimeRisk === 'CRITICAL' ? '#EF444420' : item.leadTimeRisk === 'HIGH' ? '#EAB30820' : item.leadTimeRisk === 'MEDIUM' ? '#38BDF820' : '#22C55E20'
                              }}
                            >
                              {item.leadTimeRisk} RISK
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-1.5 mb-2">
                            <div>
                              <div className="text-xs text-s3m-text-tertiary mb-0.5">Stock / Target</div>
                              <div className="font-mono text-base text-s3m-text-secondary">
                                {item.stock.toLocaleString()} / {item.target.toLocaleString()}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-s3m-text-tertiary mb-0.5">Lead Time</div>
                              <div className="font-mono text-base text-s3m-text-secondary">{item.leadTime}</div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between bg-s3m-elevated rounded p-1.5">
                            <span className="text-xs text-s3m-text-tertiary">{item.vendor}</span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-s3m-text-tertiary">Reliability</span>
                              <span
                                className="font-mono text-base font-semibold"
                                style={{
                                  color: item.vendorReliability >= 90 ? '#22C55E' : item.vendorReliability >= 80 ? '#EAB308' : '#EF4444'
                                }}
                              >
                                {item.vendorReliability}%
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}

                      <div className="bg-s3m-blue/10 border-l-2 border-s3m-blue rounded p-2">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Truck className="w-3 h-3 text-s3m-blue" />
                          <span className="text-xs text-s3m-blue uppercase tracking-wider font-semibold">
                            THEATER DISTRIBUTION
                          </span>
                        </div>
                        <div className="text-base text-s3m-text-secondary">{category.theaterLatency}</div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CommandCard>

        {/* Mission Dependency View */}
        <CommandCard accentColor="#EF4444" title="MISSION DEPENDENCY VIEW" indicator>
          <div className="space-y-3">
            {missionDependencies.map((dep, i) => (
              <div key={i} className="bg-s3m-elevated rounded p-3 border border-s3m-border-default">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-s3m-text-primary">{dep.component}</span>
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="w-3 h-3 text-s3m-caution" />
                    <span className="font-mono text-base text-s3m-caution font-semibold">
                      {dep.daysToThreshold}d to threshold
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div className="bg-s3m-card rounded p-1.5">
                    <div className="text-xs text-s3m-text-tertiary mb-0.5">Current Stock</div>
                    <div className="font-mono text-xs font-semibold text-s3m-text-primary">{dep.currentStock}</div>
                  </div>
                  <div className="bg-s3m-card rounded p-1.5">
                    <div className="text-xs text-s3m-text-tertiary mb-0.5">Failure Threshold</div>
                    <div className="font-mono text-xs font-semibold text-s3m-critical">{dep.threshold}</div>
                  </div>
                </div>

                <div className="mb-2">
                  <div className="text-base text-s3m-text-tertiary uppercase tracking-wider font-semibold mb-1.5">
                    AFFECTED MISSIONS
                  </div>
                  <div className="space-y-1">
                    {dep.affectedMissions.map((mission, j) => (
                      <div key={j} className="bg-s3m-card rounded p-2 flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-base font-semibold text-s3m-text-primary">{mission.name}</span>
                            <span
                              className="text-xs uppercase tracking-wider font-semibold px-1 py-0.5 rounded"
                              style={{
                                color: mission.priority === 'CRITICAL' ? '#EF4444' : mission.priority === 'HIGH' ? '#EAB308' : '#38BDF8',
                                backgroundColor: mission.priority === 'CRITICAL' ? '#EF444420' : mission.priority === 'HIGH' ? '#EAB30820' : '#38BDF820'
                              }}
                            >
                              {mission.priority}
                            </span>
                          </div>
                          <div className="text-xs text-s3m-text-tertiary">{mission.unitsDependant}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-s3m-text-tertiary">Impact</div>
                          <div
                            className="font-mono text-xs font-semibold"
                            style={{
                              color: mission.failureImpact >= 80 ? '#EF4444' : mission.failureImpact >= 60 ? '#EAB308' : '#22C55E'
                            }}
                          >
                            {mission.failureImpact}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-s3m-purple/10 border-l-2 border-s3m-purple rounded p-2">
                  <div className="text-xs text-s3m-purple uppercase tracking-wider font-semibold mb-1">
                    ALLOCATION RECOMMENDATION
                  </div>
                  <div className="text-base text-s3m-text-secondary leading-relaxed">{dep.allocation}</div>
                </div>
              </div>
            ))}
          </div>
        </CommandCard>
      </div>

      {/* Bottom Row - Maintenance Scheduling */}
      <div className="grid grid-cols-1 gap-4">
        <CommandCard accentColor="#8B5CF6" title="MAINTENANCE SCHEDULING" indicator>
          <button
            onClick={() => setExpandedMaintenance(!expandedMaintenance)}
            className="w-full flex items-center gap-2 mb-3 hover:bg-s3m-elevated/50 p-2 rounded transition-colors"
          >
            {expandedMaintenance ? (
              <ChevronDown className="w-4 h-4 text-s3m-purple" />
            ) : (
              <ChevronRight className="w-4 h-4 text-s3m-purple" />
            )}
            <Wrench className="w-4 h-4 text-s3m-purple" />
            <span className="text-xs text-s3m-text-tertiary uppercase tracking-wider font-semibold">
              INTELLIGENT MAINTENANCE RECOMMENDATIONS
            </span>
          </button>

          {expandedMaintenance && (
            <div className="space-y-3">
              {/* Predictive and Opportunistic Maintenance */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-base text-s3m-text-tertiary uppercase tracking-wider font-semibold mb-2">
                    PREDICTIVE MAINTENANCE
                  </div>
                  <div className="space-y-2">
                    {maintenanceSchedule.filter(m => m.type === 'predictive').map((item, i) => (
                      <div key={i} className="bg-s3m-elevated rounded p-2 border-l-2 border-s3m-critical">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-semibold text-s3m-text-primary">{item.platform}</span>
                          <span
                            className="font-mono text-base font-semibold"
                            style={{
                              color: item.failureProbability >= 70 ? '#EF4444' : item.failureProbability >= 50 ? '#EAB308' : '#22C55E'
                            }}
                          >
                            {item.failureProbability}% fail risk
                          </span>
                        </div>
                        <div className="text-base text-s3m-text-secondary mb-1.5">{item.issue}</div>
                        <div className="bg-s3m-card rounded p-1.5 mb-1.5">
                          <div className="text-xs text-s3m-text-tertiary mb-0.5">Recommended Action</div>
                          <div className="text-base text-s3m-text-primary">{item.recommendedAction}</div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-s3m-text-tertiary">{item.window}</div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-s3m-text-tertiary">Confidence</span>
                            <span
                              className="font-mono text-base font-semibold"
                              style={{
                                color: item.confidence >= 85 ? '#22C55E' : item.confidence >= 70 ? '#EAB308' : '#EF4444'
                              }}
                            >
                              {item.confidence}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-base text-s3m-text-tertiary uppercase tracking-wider font-semibold mb-2">
                    OPPORTUNISTIC MAINTENANCE
                  </div>
                  <div className="space-y-2">
                    {maintenanceSchedule.filter(m => m.type === 'opportunistic').map((item, i) => (
                      <div key={i} className="bg-s3m-elevated rounded p-2 border-l-2 border-s3m-operational">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-semibold text-s3m-text-primary">{item.platform}</span>
                          <span className="text-xs uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-s3m-operational/20 text-s3m-operational">
                            EFFICIENCY
                          </span>
                        </div>
                        <div className="text-base text-s3m-text-secondary mb-1.5">{item.issue}</div>
                        <div className="bg-s3m-card rounded p-1.5 mb-1.5">
                          <div className="text-xs text-s3m-text-tertiary mb-0.5">Recommended Action</div>
                          <div className="text-base text-s3m-text-primary">{item.recommendedAction}</div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-s3m-text-tertiary">{item.window}</div>
                          <div className="text-base font-semibold text-s3m-operational">{item.savings}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Technician Workload and Depot Bottlenecks */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-s3m-elevated rounded p-3 border border-s3m-border-default">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-3.5 h-3.5 text-s3m-cyan" />
                    <span className="text-base text-s3m-text-tertiary uppercase tracking-wider font-semibold">
                      TECHNICIAN WORKLOAD
                    </span>
                  </div>
                  <div className="space-y-2">
                    {technicianWorkload.map((team, i) => (
                      <div key={i} className="bg-s3m-card rounded p-2">
                        <div className="flex items-center justify-between mb-1.5">
                          <div>
                            <div className="text-xs font-semibold text-s3m-text-primary flex items-center gap-1.5">
                              {team.name}
                              {team.bottleneck && (
                                <AlertTriangle className="w-3 h-3 text-s3m-critical" />
                              )}
                            </div>
                            <div className="text-xs text-s3m-text-tertiary">{team.specialty}</div>
                          </div>
                          <div className="text-right">
                            <div
                              className="font-mono text-base font-semibold"
                              style={{
                                color: team.workload >= 85 ? '#EF4444' : team.workload >= 70 ? '#EAB308' : '#22C55E'
                              }}
                            >
                              {team.workload}%
                            </div>
                            <div className="text-xs text-s3m-text-tertiary">{team.taskCount} tasks</div>
                          </div>
                        </div>
                        <div className="h-1.5 bg-s3m-elevated rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${team.workload}%`,
                              backgroundColor: team.workload >= 85 ? '#EF4444' : team.workload >= 70 ? '#EAB308' : '#22C55E'
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-s3m-elevated rounded p-3 border border-s3m-border-default">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingDown className="w-3.5 h-3.5 text-s3m-yellow" />
                    <span className="text-base text-s3m-text-tertiary uppercase tracking-wider font-semibold">
                      DEPOT BOTTLENECKS
                    </span>
                  </div>
                  <div className="space-y-2">
                    {depotBottlenecks.map((depot, i) => (
                      <div key={i} className="bg-s3m-card rounded p-2">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-semibold text-s3m-text-primary">{depot.depot}</span>
                          <span
                            className="text-xs uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded"
                            style={{
                              color: depot.status === 'CRITICAL' ? '#EF4444' : depot.status === 'CAUTION' ? '#EAB308' : '#22C55E',
                              backgroundColor: depot.status === 'CRITICAL' ? '#EF444420' : depot.status === 'CAUTION' ? '#EAB30820' : '#22C55E20'
                            }}
                          >
                            {depot.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-1.5 mb-1.5">
                          <div>
                            <div className="text-xs text-s3m-text-tertiary mb-0.5">Utilization</div>
                            <div
                              className="font-mono text-base font-semibold"
                              style={{
                                color: depot.utilizationRate >= 90 ? '#EF4444' : depot.utilizationRate >= 75 ? '#EAB308' : '#22C55E'
                              }}
                            >
                              {depot.utilizationRate}%
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-s3m-text-tertiary mb-0.5">Queue</div>
                            <div className="font-mono text-base text-s3m-text-secondary">{depot.queueDepth}</div>
                          </div>
                          <div>
                            <div className="text-xs text-s3m-text-tertiary mb-0.5">Avg Wait</div>
                            <div className="font-mono text-base text-s3m-text-secondary">{depot.avgWaitTime}</div>
                          </div>
                        </div>
                        <div className="h-1 bg-s3m-elevated rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${depot.utilizationRate}%`,
                              backgroundColor: depot.utilizationRate >= 90 ? '#EF4444' : depot.utilizationRate >= 75 ? '#EAB308' : '#22C55E'
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CommandCard>
      </div>
    </div>
  );
}
