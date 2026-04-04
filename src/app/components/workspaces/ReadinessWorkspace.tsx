import { CommandCard } from '../CommandCard';
import { ProgressBar } from '../ProgressBar';
import { CheckSquare, Square, Users, Award, Languages, AlertCircle, TrendingDown, Calendar, Clock, Target, ChevronDown, ChevronRight, Zap, Shield } from 'lucide-react';
import { useState } from 'react';

export function ReadinessWorkspace() {
  const [expandedPersonnel, setExpandedPersonnel] = useState(true);
  const [expandedManning, setExpandedManning] = useState(false);
  const [expandedQualification, setExpandedQualification] = useState(false);
  const [selectedForecastView, setSelectedForecastView] = useState<'7day' | '30day' | '90day'>('30day');

  const personnelReadiness = [
    {
      category: 'Deployable Status',
      deployable: 1247,
      nonDeployable: 183,
      total: 1430,
      reasons: [
        { reason: 'Medical profile', count: 87, color: '#EF4444' },
        { reason: 'Legal hold', count: 24, color: '#EF4444' },
        { reason: 'Training incomplete', count: 48, color: '#EAB308' },
        { reason: 'Security clearance pending', count: 24, color: '#EAB308' }
      ]
    }
  ];

  const certificationCurrency = [
    { cert: 'Weapons Qualification', current: 1184, expiring30: 142, expired: 104, total: 1430, color: '#22C55E' },
    { cert: 'CBRN Defense', current: 1098, expiring30: 218, expired: 114, total: 1430, color: '#EAB308' },
    { cert: 'First Aid/CPR', current: 1264, expiring30: 98, expired: 68, total: 1430, color: '#22C55E' },
    { cert: 'Tactical Comms', current: 982, expiring30: 287, expired: 161, total: 1430, color: '#EF4444' }
  ];

  const languageCapability = [
    { language: 'Arabic', proficient: 124, basic: 287, none: 1019, required: 200, gap: 76 },
    { language: 'Dari/Pashto', proficient: 34, basic: 89, none: 1307, required: 80, gap: 46 },
    { language: 'Russian', proficient: 18, basic: 54, none: 1358, required: 40, gap: 22 }
  ];

  const shiftRotationFatigue = [
    { shift: 'Alpha (Days)', personnel: 358, avgDaysOn: 12, fatigueScore: 34, status: 'OPERATIONAL' },
    { shift: 'Bravo (Nights)', personnel: 342, avgDaysOn: 14, fatigueScore: 58, status: 'CAUTION' },
    { shift: 'Charlie (Swing)', personnel: 296, avgDaysOn: 18, fatigueScore: 72, status: 'CRITICAL' },
    { shift: 'Reserve/Admin', personnel: 434, avgDaysOn: 0, fatigueScore: 8, status: 'READY' }
  ];

  const trainingRecency = [
    { training: 'Live Fire Exercise', within90: 892, within180: 378, over180: 160, color: '#EAB308' },
    { training: 'Combined Arms Maneuver', within90: 1124, within180: 234, over180: 72, color: '#22C55E' },
    { training: 'Urban Operations', within90: 687, within180: 512, over180: 231, color: '#EF4444' },
    { training: 'Night Operations', within90: 1048, within180: 298, over180: 84, color: '#22C55E' }
  ];

  const unitManning = [
    {
      unit: '1st Battalion',
      authorized: 510,
      assigned: 478,
      manning: 94,
      criticalGaps: [
        { mos: '11B Infantry', authorized: 180, assigned: 168, shortage: 12, criticality: 'MEDIUM' },
        { mos: '19K Armor Crewman', authorized: 72, assigned: 58, shortage: 14, criticality: 'HIGH' },
        { mos: '68W Combat Medic', authorized: 24, assigned: 18, shortage: 6, criticality: 'CRITICAL' }
      ]
    },
    {
      unit: '2nd Battalion',
      authorized: 510,
      assigned: 442,
      manning: 87,
      criticalGaps: [
        { mos: '11B Infantry', authorized: 180, assigned: 158, shortage: 22, criticality: 'HIGH' },
        { mos: '13F Fire Support', authorized: 18, assigned: 12, shortage: 6, criticality: 'CRITICAL' },
        { mos: '25U Signal', authorized: 36, assigned: 28, shortage: 8, criticality: 'HIGH' }
      ]
    },
    {
      unit: '3rd Battalion',
      authorized: 510,
      assigned: 465,
      manning: 91,
      criticalGaps: [
        { mos: '11B Infantry', authorized: 180, assigned: 172, shortage: 8, criticality: 'LOW' },
        { mos: '88M Motor Transport', authorized: 48, assigned: 38, shortage: 10, criticality: 'HIGH' },
        { mos: '92F Petroleum Supply', authorized: 12, assigned: 8, shortage: 4, criticality: 'MEDIUM' }
      ]
    }
  ];

  const specialistShortageHeatmap = [
    { specialty: 'Combat Medics (68W)', shortage: 18, impactScore: 95, units: ['1st Bn', '2nd Bn'], color: '#EF4444' },
    { specialty: 'Fire Support (13F)', shortage: 8, impactScore: 88, units: ['2nd Bn'], color: '#EF4444' },
    { specialty: 'Signals Intelligence (35N)', shortage: 12, impactScore: 78, units: ['HQ', '2nd Bn'], color: '#EAB308' },
    { specialty: 'Cyber Operations (17C)', shortage: 6, impactScore: 82, units: ['HQ'], color: '#EF4444' },
    { specialty: 'Motor Transport (88M)', shortage: 14, impactScore: 68, units: ['3rd Bn', '1st Bn'], color: '#EAB308' }
  ];

  const qualificationMatrix = {
    byMissionProfile: [
      { mission: 'Air Assault Operations', qualified: 892, training: 287, notQualified: 251, requirement: 1000 },
      { mission: 'Amphibious Operations', qualified: 456, training: 198, notQualified: 776, requirement: 600 },
      { mission: 'Airborne Operations', qualified: 712, training: 124, notQualified: 594, requirement: 800 },
      { mission: 'Mountain Warfare', qualified: 234, training: 87, notQualified: 1109, requirement: 400 }
    ],
    byPlatform: [
      { platform: 'M1A2 Abrams', qualified: 187, training: 42, notQualified: 28, requirement: 200 },
      { platform: 'M2 Bradley', qualified: 234, training: 38, notQualified: 18, requirement: 250 },
      { platform: 'UH-60 Blackhawk', qualified: 89, training: 12, notQualified: 6, requirement: 100 },
      { platform: 'MQ-9 Reaper (Operator)', qualified: 24, training: 8, notQualified: 4, requirement: 32 }
    ],
    byClassification: [
      { level: 'SECRET', current: 1342, pending: 54, expired: 34, required: 1400 },
      { level: 'TOP SECRET', current: 487, pending: 38, expired: 18, required: 520 },
      { level: 'TS/SCI', current: 142, pending: 24, expired: 8, required: 160 }
    ],
    byCoalitionAccess: [
      { level: 'NATO SECRET', current: 287, pending: 18, required: 300 },
      { level: 'Five Eyes', current: 124, pending: 12, required: 140 },
      { level: 'Regional Partner', current: 456, pending: 32, required: 500 }
    ]
  };

  const readinessForecast = {
    '7day': {
      overallReadiness: 82,
      trend: -3,
      qualificationGaps: [
        { type: 'Weapons qual expires', count: 48, impact: 'MEDIUM' },
        { type: 'Security clearances expire', count: 12, impact: 'HIGH' }
      ],
      expirationCliffs: [
        { item: 'CBRN certifications', count: 67, daysUntil: 5, criticality: 'HIGH' }
      ]
    },
    '30day': {
      overallReadiness: 76,
      trend: -8,
      qualificationGaps: [
        { type: 'Weapons qual expires', count: 142, impact: 'HIGH' },
        { type: 'CBRN expires', count: 218, impact: 'CRITICAL' },
        { type: 'Medical readiness', count: 87, impact: 'MEDIUM' }
      ],
      expirationCliffs: [
        { item: 'CBRN certifications', count: 218, daysUntil: 28, criticality: 'CRITICAL' },
        { item: 'Tactical comms certs', count: 287, daysUntil: 24, criticality: 'HIGH' }
      ]
    },
    '90day': {
      overallReadiness: 68,
      trend: -14,
      qualificationGaps: [
        { type: 'Weapons qual expires', count: 246, impact: 'CRITICAL' },
        { type: 'CBRN expires', count: 332, impact: 'CRITICAL' },
        { type: 'First aid/CPR expires', count: 166, impact: 'HIGH' },
        { type: 'Platform certifications', count: 124, impact: 'HIGH' }
      ],
      expirationCliffs: [
        { item: 'CBRN certifications', count: 332, daysUntil: 82, criticality: 'CRITICAL' },
        { item: 'Tactical comms certs', count: 448, daysUntil: 76, criticality: 'CRITICAL' },
        { item: 'Platform qualifications', count: 124, daysUntil: 68, criticality: 'HIGH' }
      ]
    }
  };

  const currentForecast = readinessForecast[selectedForecastView];

  return (
    <div className="p-4 h-full flex flex-col gap-4 overflow-y-auto">
      {/* Top Row - Personnel Readiness */}
      <CommandCard accentColor="#22C55E" title="PERSONNEL READINESS" indicator>
        <button
          onClick={() => setExpandedPersonnel(!expandedPersonnel)}
          className="w-full flex items-center gap-2 mb-3 hover:bg-s3m-elevated/50 p-2 rounded transition-colors"
        >
          {expandedPersonnel ? (
            <ChevronDown className="w-4 h-4 text-s3m-operational" />
          ) : (
            <ChevronRight className="w-4 h-4 text-s3m-operational" />
          )}
          <Users className="w-4 h-4 text-s3m-operational" />
          <span className="text-xs text-s3m-text-tertiary uppercase tracking-wider font-semibold">
            DETAILED PERSONNEL STATUS
          </span>
        </button>

        {expandedPersonnel && (
          <div className="space-y-4">
            {/* Deployable Status */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-s3m-elevated rounded p-3 border-l-2 border-s3m-operational">
                <div className="text-base text-s3m-text-tertiary uppercase tracking-wider mb-1">Deployable</div>
                <div className="font-mono text-xl font-semibold text-s3m-operational">{personnelReadiness[0].deployable}</div>
                <div className="text-xs text-s3m-text-tertiary mt-1">
                  {((personnelReadiness[0].deployable / personnelReadiness[0].total) * 100).toFixed(1)}% of force
                </div>
              </div>
              <div className="bg-s3m-elevated rounded p-3 border-l-2 border-s3m-caution">
                <div className="text-base text-s3m-text-tertiary uppercase tracking-wider mb-1">Non-Deployable</div>
                <div className="font-mono text-xl font-semibold text-s3m-caution">{personnelReadiness[0].nonDeployable}</div>
                <div className="text-xs text-s3m-text-tertiary mt-1">
                  {((personnelReadiness[0].nonDeployable / personnelReadiness[0].total) * 100).toFixed(1)}% of force
                </div>
              </div>
              <div className="bg-s3m-elevated rounded p-3">
                <div className="text-base text-s3m-text-tertiary uppercase tracking-wider mb-1">Total Force</div>
                <div className="font-mono text-xl font-semibold text-s3m-text-primary">{personnelReadiness[0].total}</div>
                <div className="text-xs text-s3m-text-tertiary mt-1">Authorized strength</div>
              </div>
            </div>

            {/* Non-Deployable Reasons */}
            <div>
              <div className="text-base text-s3m-text-tertiary uppercase tracking-wider font-semibold mb-2">
                NON-DEPLOYABLE BREAKDOWN
              </div>
              <div className="grid grid-cols-2 gap-2">
                {personnelReadiness[0].reasons.map((reason, i) => (
                  <div key={i} className="bg-s3m-elevated rounded p-2 flex items-center justify-between">
                    <span className="text-xs text-s3m-text-secondary">{reason.reason}</span>
                    <span className="font-mono text-xs font-semibold" style={{ color: reason.color }}>
                      {reason.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Certification Currency */}
            <div>
              <div className="text-base text-s3m-text-tertiary uppercase tracking-wider font-semibold mb-2">
                CERTIFICATION CURRENCY
              </div>
              <div className="space-y-2">
                {certificationCurrency.map((cert, i) => (
                  <div key={i} className="bg-s3m-elevated rounded p-2">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-s3m-text-primary">{cert.cert}</span>
                      <span className="text-base font-mono" style={{ color: cert.color }}>
                        {((cert.current / cert.total) * 100).toFixed(0)}% current
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 text-base">
                      <div className="bg-s3m-card rounded p-1.5">
                        <div className="text-xs text-s3m-text-tertiary mb-0.5">Current</div>
                        <div className="font-mono text-s3m-operational">{cert.current}</div>
                      </div>
                      <div className="bg-s3m-card rounded p-1.5">
                        <div className="text-xs text-s3m-text-tertiary mb-0.5">Expiring 30d</div>
                        <div className="font-mono text-s3m-caution">{cert.expiring30}</div>
                      </div>
                      <div className="bg-s3m-card rounded p-1.5">
                        <div className="text-xs text-s3m-text-tertiary mb-0.5">Expired</div>
                        <div className="font-mono text-s3m-critical">{cert.expired}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Language Capability */}
            <div>
              <div className="text-base text-s3m-text-tertiary uppercase tracking-wider font-semibold mb-2 flex items-center gap-1.5">
                <Languages className="w-3.5 h-3.5" />
                LANGUAGE CAPABILITY
              </div>
              <div className="space-y-2">
                {languageCapability.map((lang, i) => (
                  <div key={i} className="bg-s3m-elevated rounded p-2">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-s3m-text-primary">{lang.language}</span>
                      <span
                        className="text-xs uppercase px-1.5 py-0.5 rounded font-semibold"
                        style={{
                          color: lang.gap > 50 ? '#EF4444' : lang.gap > 20 ? '#EAB308' : '#22C55E',
                          backgroundColor: lang.gap > 50 ? '#EF444420' : lang.gap > 20 ? '#EAB30820' : '#22C55E20'
                        }}
                      >
                        {lang.gap} GAP
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5 text-base">
                      <div className="bg-s3m-card rounded p-1.5">
                        <div className="text-xs text-s3m-text-tertiary mb-0.5">Proficient</div>
                        <div className="font-mono text-s3m-operational">{lang.proficient}</div>
                      </div>
                      <div className="bg-s3m-card rounded p-1.5">
                        <div className="text-xs text-s3m-text-tertiary mb-0.5">Basic</div>
                        <div className="font-mono text-s3m-text-secondary">{lang.basic}</div>
                      </div>
                      <div className="bg-s3m-card rounded p-1.5">
                        <div className="text-xs text-s3m-text-tertiary mb-0.5">None</div>
                        <div className="font-mono text-s3m-text-tertiary">{lang.none}</div>
                      </div>
                      <div className="bg-s3m-card rounded p-1.5">
                        <div className="text-xs text-s3m-text-tertiary mb-0.5">Required</div>
                        <div className="font-mono text-s3m-cyan">{lang.required}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shift/Rotation Fatigue */}
            <div>
              <div className="text-base text-s3m-text-tertiary uppercase tracking-wider font-semibold mb-2 flex items-center gap-1.5">
                <TrendingDown className="w-3.5 h-3.5" />
                SHIFT/ROTATION FATIGUE
              </div>
              <div className="space-y-2">
                {shiftRotationFatigue.map((shift, i) => (
                  <div key={i} className="bg-s3m-elevated rounded p-2">
                    <div className="flex items-center justify-between mb-1.5">
                      <div>
                        <div className="text-xs font-semibold text-s3m-text-primary">{shift.shift}</div>
                        <div className="text-xs text-s3m-text-tertiary">{shift.personnel} personnel</div>
                      </div>
                      <span
                        className="text-xs uppercase px-1.5 py-0.5 rounded font-semibold"
                        style={{
                          color: shift.status === 'CRITICAL' ? '#EF4444' : shift.status === 'CAUTION' ? '#EAB308' : '#22C55E',
                          backgroundColor: shift.status === 'CRITICAL' ? '#EF444420' : shift.status === 'CAUTION' ? '#EAB30820' : '#22C55E20'
                        }}
                      >
                        {shift.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-base text-s3m-text-tertiary">
                        Avg {shift.avgDaysOn} days continuous ops
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-s3m-text-tertiary">Fatigue Score</span>
                        <span
                          className="font-mono text-xs font-semibold"
                          style={{
                            color: shift.fatigueScore >= 65 ? '#EF4444' : shift.fatigueScore >= 45 ? '#EAB308' : '#22C55E'
                          }}
                        >
                          {shift.fatigueScore}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Training Recency */}
            <div>
              <div className="text-base text-s3m-text-tertiary uppercase tracking-wider font-semibold mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                TRAINING RECENCY
              </div>
              <div className="space-y-2">
                {trainingRecency.map((training, i) => (
                  <div key={i} className="bg-s3m-elevated rounded p-2">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-s3m-text-primary">{training.training}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 text-base">
                      <div className="bg-s3m-card rounded p-1.5">
                        <div className="text-xs text-s3m-text-tertiary mb-0.5">Within 90d</div>
                        <div className="font-mono text-s3m-operational">{training.within90}</div>
                      </div>
                      <div className="bg-s3m-card rounded p-1.5">
                        <div className="text-xs text-s3m-text-tertiary mb-0.5">90-180d</div>
                        <div className="font-mono text-s3m-caution">{training.within180}</div>
                      </div>
                      <div className="bg-s3m-card rounded p-1.5">
                        <div className="text-xs text-s3m-text-tertiary mb-0.5">Over 180d</div>
                        <div className="font-mono text-s3m-critical">{training.over180}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CommandCard>

      {/* Middle Row - Unit Manning */}
      <div className="grid grid-cols-2 gap-4">
        <CommandCard accentColor="#38BDF8" title="UNIT MANNING" indicator>
          <button
            onClick={() => setExpandedManning(!expandedManning)}
            className="w-full flex items-center gap-2 mb-3 hover:bg-s3m-elevated/50 p-2 rounded transition-colors"
          >
            {expandedManning ? (
              <ChevronDown className="w-4 h-4 text-s3m-blue" />
            ) : (
              <ChevronRight className="w-4 h-4 text-s3m-blue" />
            )}
            <Users className="w-4 h-4 text-s3m-blue" />
            <span className="text-xs text-s3m-text-tertiary uppercase tracking-wider font-semibold">
              AUTHORIZED VS ASSIGNED
            </span>
          </button>

          {expandedManning && (
            <div className="space-y-3">
              {unitManning.map((unit, i) => (
                <div key={i} className="bg-s3m-elevated rounded p-3 border border-s3m-border-default">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-base font-semibold text-s3m-text-primary">{unit.unit}</span>
                    <span
                      className="font-mono text-sm font-semibold"
                      style={{
                        color: unit.manning >= 90 ? '#22C55E' : unit.manning >= 80 ? '#EAB308' : '#EF4444'
                      }}
                    >
                      {unit.manning}%
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-s3m-card rounded p-1.5">
                      <div className="text-xs text-s3m-text-tertiary mb-0.5">Assigned</div>
                      <div className="font-mono text-base font-semibold text-s3m-text-primary">{unit.assigned}</div>
                    </div>
                    <div className="bg-s3m-card rounded p-1.5">
                      <div className="text-xs text-s3m-text-tertiary mb-0.5">Authorized</div>
                      <div className="font-mono text-base font-semibold text-s3m-text-secondary">{unit.authorized}</div>
                    </div>
                  </div>

                  <div className="text-base text-s3m-text-tertiary uppercase tracking-wider font-semibold mb-2">
                    CRITICAL MOS GAPS
                  </div>
                  <div className="space-y-1.5">
                    {unit.criticalGaps.map((gap, j) => (
                      <div key={j} className="bg-s3m-card rounded p-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-s3m-text-primary">{gap.mos}</span>
                          <span
                            className="text-xs uppercase px-1.5 py-0.5 rounded font-semibold"
                            style={{
                              color: gap.criticality === 'CRITICAL' ? '#EF4444' : gap.criticality === 'HIGH' ? '#EAB308' : gap.criticality === 'MEDIUM' ? '#38BDF8' : '#22C55E',
                              backgroundColor: gap.criticality === 'CRITICAL' ? '#EF444420' : gap.criticality === 'HIGH' ? '#EAB30820' : gap.criticality === 'MEDIUM' ? '#38BDF820' : '#22C55E20'
                            }}
                          >
                            {gap.criticality}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-base">
                          <span className="text-s3m-text-tertiary">
                            {gap.assigned} / {gap.authorized}
                          </span>
                          <span
                            className="font-mono font-semibold"
                            style={{
                              color: gap.criticality === 'CRITICAL' ? '#EF4444' : gap.criticality === 'HIGH' ? '#EAB308' : '#38BDF8'
                            }}
                          >
                            -{gap.shortage} short
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Specialist Shortage Heatmap */}
              <div className="bg-s3m-card rounded p-3 border border-s3m-border-default">
                <div className="text-base text-s3m-text-tertiary uppercase tracking-wider font-semibold mb-2 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  SPECIALIST SHORTAGE HEATMAP
                </div>
                <div className="space-y-2">
                  {specialistShortageHeatmap.map((spec, i) => (
                    <div key={i} className="bg-s3m-elevated rounded p-2">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-semibold text-s3m-text-primary">{spec.specialty}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-s3m-text-tertiary">Impact</span>
                          <span
                            className="font-mono text-base font-semibold"
                            style={{ color: spec.color }}
                          >
                            {spec.impactScore}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-base text-s3m-text-tertiary">
                          {spec.units.join(', ')}
                        </span>
                        <span
                          className="font-mono text-base font-semibold"
                          style={{ color: spec.color }}
                        >
                          -{spec.shortage}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CommandCard>

        {/* Qualification Matrix */}
        <CommandCard accentColor="#8B5CF6" title="QUALIFICATION MATRIX" indicator>
          <button
            onClick={() => setExpandedQualification(!expandedQualification)}
            className="w-full flex items-center gap-2 mb-3 hover:bg-s3m-elevated/50 p-2 rounded transition-colors"
          >
            {expandedQualification ? (
              <ChevronDown className="w-4 h-4 text-s3m-purple" />
            ) : (
              <ChevronRight className="w-4 h-4 text-s3m-purple" />
            )}
            <Award className="w-4 h-4 text-s3m-purple" />
            <span className="text-xs text-s3m-text-tertiary uppercase tracking-wider font-semibold">
              MULTI-DIMENSIONAL VIEW
            </span>
          </button>

          {expandedQualification && (
            <div className="space-y-4">
              {/* By Mission Profile */}
              <div>
                <div className="text-base text-s3m-text-tertiary uppercase tracking-wider font-semibold mb-2 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5" />
                  BY MISSION PROFILE
                </div>
                <div className="space-y-2">
                  {qualificationMatrix.byMissionProfile.map((mission, i) => (
                    <div key={i} className="bg-s3m-elevated rounded p-2">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-semibold text-s3m-text-primary">{mission.mission}</span>
                        <span className="text-base text-s3m-text-tertiary">
                          Req: {mission.requirement}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5 text-base">
                        <div className="bg-s3m-card rounded p-1">
                          <div className="text-xs text-s3m-text-tertiary mb-0.5">Qualified</div>
                          <div className="font-mono text-s3m-operational">{mission.qualified}</div>
                        </div>
                        <div className="bg-s3m-card rounded p-1">
                          <div className="text-xs text-s3m-text-tertiary mb-0.5">Training</div>
                          <div className="font-mono text-s3m-caution">{mission.training}</div>
                        </div>
                        <div className="bg-s3m-card rounded p-1">
                          <div className="text-xs text-s3m-text-tertiary mb-0.5">Not Qual</div>
                          <div className="font-mono text-s3m-critical">{mission.notQualified}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* By Platform */}
              <div>
                <div className="text-base text-s3m-text-tertiary uppercase tracking-wider font-semibold mb-2">
                  BY PLATFORM
                </div>
                <div className="space-y-2">
                  {qualificationMatrix.byPlatform.map((platform, i) => (
                    <div key={i} className="bg-s3m-elevated rounded p-2">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-semibold text-s3m-text-primary">{platform.platform}</span>
                        <span className="text-base text-s3m-text-tertiary">
                          Req: {platform.requirement}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5 text-base">
                        <div className="bg-s3m-card rounded p-1">
                          <div className="text-xs text-s3m-text-tertiary mb-0.5">Qualified</div>
                          <div className="font-mono text-s3m-operational">{platform.qualified}</div>
                        </div>
                        <div className="bg-s3m-card rounded p-1">
                          <div className="text-xs text-s3m-text-tertiary mb-0.5">Training</div>
                          <div className="font-mono text-s3m-caution">{platform.training}</div>
                        </div>
                        <div className="bg-s3m-card rounded p-1">
                          <div className="text-xs text-s3m-text-tertiary mb-0.5">Not Qual</div>
                          <div className="font-mono text-s3m-critical">{platform.notQualified}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* By Classification */}
              <div>
                <div className="text-base text-s3m-text-tertiary uppercase tracking-wider font-semibold mb-2 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  BY CLASSIFICATION CAVEAT
                </div>
                <div className="space-y-2">
                  {qualificationMatrix.byClassification.map((classification, i) => (
                    <div key={i} className="bg-s3m-elevated rounded p-2">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-semibold text-s3m-text-primary">{classification.level}</span>
                        <span className="text-base text-s3m-text-tertiary">
                          Req: {classification.required}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5 text-base">
                        <div className="bg-s3m-card rounded p-1">
                          <div className="text-xs text-s3m-text-tertiary mb-0.5">Current</div>
                          <div className="font-mono text-s3m-operational">{classification.current}</div>
                        </div>
                        <div className="bg-s3m-card rounded p-1">
                          <div className="text-xs text-s3m-text-tertiary mb-0.5">Pending</div>
                          <div className="font-mono text-s3m-caution">{classification.pending}</div>
                        </div>
                        <div className="bg-s3m-card rounded p-1">
                          <div className="text-xs text-s3m-text-tertiary mb-0.5">Expired</div>
                          <div className="font-mono text-s3m-critical">{classification.expired}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* By Coalition Access */}
              <div>
                <div className="text-base text-s3m-text-tertiary uppercase tracking-wider font-semibold mb-2">
                  BY COALITION ACCESS LEVEL
                </div>
                <div className="space-y-2">
                  {qualificationMatrix.byCoalitionAccess.map((coalition, i) => (
                    <div key={i} className="bg-s3m-elevated rounded p-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-s3m-text-primary">{coalition.level}</span>
                        <span className="text-base text-s3m-text-tertiary">
                          Req: {coalition.required}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-base">
                        <div className="flex items-center gap-2">
                          <span className="text-s3m-text-tertiary">Current:</span>
                          <span className="font-mono text-s3m-operational">{coalition.current}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-s3m-text-tertiary">Pending:</span>
                          <span className="font-mono text-s3m-caution">{coalition.pending}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CommandCard>
      </div>

      {/* Bottom Row - Readiness Forecast */}
      <CommandCard accentColor="#EF4444" title="READINESS FORECAST" indicator>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-base text-s3m-text-tertiary uppercase tracking-wider font-semibold">
            FORECAST VIEW:
          </span>
          <select
            value={selectedForecastView}
            onChange={(e) => setSelectedForecastView(e.target.value as any)}
            className="bg-s3m-elevated border border-s3m-border-default rounded px-2 py-1 text-xs font-semibold text-s3m-text-primary cursor-pointer focus:outline-none focus:border-s3m-cyan transition-colors"
          >
            <option value="7day">7 Day Readiness</option>
            <option value="30day">30 Day Readiness</option>
            <option value="90day">90 Day Readiness</option>
          </select>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-s3m-elevated rounded p-3 border-l-2" style={{ borderColor: currentForecast.overallReadiness >= 75 ? '#22C55E' : currentForecast.overallReadiness >= 60 ? '#EAB308' : '#EF4444' }}>
            <div className="text-base text-s3m-text-tertiary uppercase tracking-wider mb-1">
              {selectedForecastView === '7day' ? '7-Day' : selectedForecastView === '30day' ? '30-Day' : '90-Day'} Readiness
            </div>
            <div
              className="font-mono text-3xl font-semibold"
              style={{
                color: currentForecast.overallReadiness >= 75 ? '#22C55E' : currentForecast.overallReadiness >= 60 ? '#EAB308' : '#EF4444'
              }}
            >
              {currentForecast.overallReadiness}%
            </div>
            <div className="flex items-center gap-1 text-base text-s3m-critical mt-1">
              <TrendingDown className="w-3 h-3" />
              <span className="font-semibold">{currentForecast.trend}%</span>
            </div>
          </div>

          <div className="col-span-2 bg-s3m-elevated rounded p-3">
            <div className="text-base text-s3m-text-tertiary uppercase tracking-wider font-semibold mb-2">
              PREDICTED QUALIFICATION GAPS
            </div>
            <div className="space-y-1.5">
              {currentForecast.qualificationGaps.map((gap, i) => (
                <div key={i} className="flex items-center justify-between bg-s3m-card rounded p-2">
                  <span className="text-xs text-s3m-text-secondary">{gap.type}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-s3m-text-primary">{gap.count}</span>
                    <span
                      className="text-xs uppercase px-1.5 py-0.5 rounded font-semibold"
                      style={{
                        color: gap.impact === 'CRITICAL' ? '#EF4444' : gap.impact === 'HIGH' ? '#EAB308' : '#38BDF8',
                        backgroundColor: gap.impact === 'CRITICAL' ? '#EF444420' : gap.impact === 'HIGH' ? '#EAB30820' : '#38BDF820'
                      }}
                    >
                      {gap.impact}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-s3m-critical/10 border border-s3m-critical/40 rounded p-3">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-s3m-critical" />
            <span className="text-xs text-s3m-critical uppercase tracking-wider font-semibold">
              UPCOMING EXPIRATION CLIFFS
            </span>
          </div>
          <div className="space-y-2">
            {currentForecast.expirationCliffs.map((cliff, i) => (
              <div key={i} className="bg-s3m-elevated rounded p-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-s3m-text-primary">{cliff.item}</span>
                  <span
                    className="text-xs uppercase px-1.5 py-0.5 rounded font-semibold"
                    style={{
                      color: cliff.criticality === 'CRITICAL' ? '#EF4444' : cliff.criticality === 'HIGH' ? '#EAB308' : '#38BDF8',
                      backgroundColor: cliff.criticality === 'CRITICAL' ? '#EF444420' : cliff.criticality === 'HIGH' ? '#EAB30820' : '#38BDF820'
                    }}
                  >
                    {cliff.criticality}
                  </span>
                </div>
                <div className="flex items-center justify-between text-base">
                  <span className="text-s3m-text-tertiary">{cliff.count} expiring</span>
                  <span className="font-mono font-semibold text-s3m-critical">{cliff.daysUntil} days</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CommandCard>
    </div>
  );
}
