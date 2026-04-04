# S3M-Core Backend Requirements Contract

This document is the S3M-GUI to S3M-Core backend contract and issue-seeding source for S3M-Core development.

- Scope: Required backend endpoints used by current GUI workspaces.
- Priority legend used below:
  - 🔴 CRITICAL = required for workspace core functionality
  - 🟠 HIGH = required for full operational workflow
  - 🟡 MEDIUM = required for enhanced workflow/analysis

---

## Endpoint: GET /api/system/status
- **Frontend Workspace**: Global Shell (Top Bar / Sidebar)
- **Expected Response**: `{"online":true,"mode":"CMD","coalition":"KSA/GCC/NATO","language":"EN","currentTime":"14:42:18Z"}`
- **Polling Frequency**: 10 seconds
- **WebSocket Alternative**: `/ws/system-status`
- **Status Code**: 🔴 CRITICAL
- **Developer**: TBD (will be assigned in S3M-Core)

## Endpoint: GET /api/system/health
- **Frontend Workspace**: Global Shell (Health Strip)
- **Expected Response**: `{"cpuTempC":42,"gpuUsagePct":18,"memoryUsedGb":31,"memoryTotalGb":48,"network":"STABLE","auditRecording":true}`
- **Polling Frequency**: 5 seconds
- **WebSocket Alternative**: `/ws/system-health`
- **Status Code**: 🟠 HIGH
- **Developer**: TBD (will be assigned in S3M-Core)

## Endpoint: GET /api/timeline/events
- **Frontend Workspace**: Global Shell (Timeline)
- **Expected Response**: `{"events":[{"time":"14:32","label":"T-218 HOSTILE","severity":"CRITICAL"}]}`
- **Polling Frequency**: 15 seconds
- **WebSocket Alternative**: `/ws/timeline-events`
- **Status Code**: 🔴 CRITICAL
- **Developer**: TBD (will be assigned in S3M-Core)

## Endpoint: GET /api/navigation/workspaces
- **Frontend Workspace**: Global Shell (Sidebar)
- **Expected Response**: `{"workspaces":[{"id":"command","label":"COMMAND","enabled":true}]}`
- **Polling Frequency**: On app load + every 5 minutes
- **WebSocket Alternative**: `/ws/navigation-updates`
- **Status Code**: 🟡 MEDIUM
- **Developer**: TBD (will be assigned in S3M-Core)

## Endpoint: GET /api/command/overview
- **Frontend Workspace**: Command Overview
- **Expected Response**: `{"metrics":[{"label":"ACTIVE TRACKS","value":"7","sublabel":"2 unidentified"}]}`
- **Polling Frequency**: 30 seconds
- **WebSocket Alternative**: `/ws/command-updates`
- **Status Code**: 🔴 CRITICAL
- **Developer**: TBD (will be assigned in S3M-Core)

## Endpoint: GET /api/command/priorities
- **Frontend Workspace**: Command Overview
- **Expected Response**: `{"priorities":[{"id":"P1","title":"Track 218 fast mover IFF failure","severity":"CRITICAL"}]}`
- **Polling Frequency**: 15 seconds
- **WebSocket Alternative**: `/ws/command-updates`
- **Status Code**: 🔴 CRITICAL
- **Developer**: TBD (will be assigned in S3M-Core)

## Endpoint: GET /api/command/inbox
- **Frontend Workspace**: Command Overview
- **Expected Response**: `{"pendingApprovals":[],"crossDomainAlerts":[],"escalations":[],"shiftChanges":[]}`
- **Polling Frequency**: 20 seconds
- **WebSocket Alternative**: `/ws/command-inbox`
- **Status Code**: 🔴 CRITICAL
- **Developer**: TBD (will be assigned in S3M-Core)

## Endpoint: GET /api/command/directives
- **Frontend Workspace**: Command Overview
- **Expected Response**: `{"commandersIntent":"...","roeProfile":{},"theaterConstraints":[],"delegatedAuthorities":[],"protectedAssets":[]}`
- **Polling Frequency**: 60 seconds
- **WebSocket Alternative**: `/ws/command-directives`
- **Status Code**: 🟠 HIGH
- **Developer**: TBD (will be assigned in S3M-Core)

## Endpoint: GET /api/command/action-board
- **Frontend Workspace**: Command Overview
- **Expected Response**: `{"actions":[{"id":"ACT-501","type":"APPROVAL","priority":"IMMEDIATE","title":"Strike Authorization"}]}`
- **Polling Frequency**: 10 seconds
- **WebSocket Alternative**: `/ws/action-board`
- **Status Code**: 🔴 CRITICAL
- **Developer**: TBD (will be assigned in S3M-Core)

## Endpoint: POST /api/command/action-board/{actionId}/decision
- **Frontend Workspace**: Command Overview
- **Expected Response**: `{"actionId":"ACT-501","decision":"APPROVE|REJECT|DEFER|ASSIGN|FRAGO","status":"accepted"}`
- **Polling Frequency**: N/A (request-driven)
- **WebSocket Alternative**: `/ws/action-board`
- **Status Code**: 🔴 CRITICAL
- **Developer**: TBD (will be assigned in S3M-Core)

## Endpoint: GET /api/command/agents
- **Frontend Workspace**: Command Overview
- **Expected Response**: `{"agents":[{"id":"AGT-001","name":"UAV-RECON-04","status":"ACTIVE","type":"Autonomous Operation"}]}`
- **Polling Frequency**: 15 seconds
- **WebSocket Alternative**: `/ws/agent-status`
- **Status Code**: 🔴 CRITICAL
- **Developer**: TBD (will be assigned in S3M-Core)

## Endpoint: POST /api/command/agents/{agentId}/missions
- **Frontend Workspace**: Command Overview
- **Expected Response**: `{"missionId":"MIS-9001","agentId":"AGT-001","status":"queued"}`
- **Polling Frequency**: N/A (request-driven)
- **WebSocket Alternative**: `/ws/agent-status`
- **Status Code**: 🟠 HIGH
- **Developer**: TBD (will be assigned in S3M-Core)

## Endpoint: GET /api/cop/tracks?environment={AIR|GROUND|MARITIME|CYBER}
- **Frontend Workspace**: COP Workspace
- **Expected Response**: `{"tracks":[{"id":"T-218","type":"HOSTILE","status":"critical","conf":89,"speed":"420 kts","alt":"15K ft"}]}`
- **Polling Frequency**: 5 seconds
- **WebSocket Alternative**: `/ws/cop-tracks`
- **Status Code**: 🔴 CRITICAL
- **Developer**: TBD (will be assigned in S3M-Core)

## Endpoint: GET /api/cop/tracks/{trackId}
- **Frontend Workspace**: COP Workspace
- **Expected Response**: `{"id":"T-218","identityProbabilities":{},"sensors":[],"trackHistory":{},"recommendedAction":"..."}`
- **Polling Frequency**: 5 seconds (while detail panel open)
- **WebSocket Alternative**: `/ws/cop-track-details`
- **Status Code**: 🔴 CRITICAL
- **Developer**: TBD (will be assigned in S3M-Core)

## Endpoint: GET /api/cop/mission-layers
- **Frontend Workspace**: COP Workspace
- **Expected Response**: `{"layers":[{"id":"units","name":"Tasked Units","enabled":true,"color":"#05DF72"}]}`
- **Polling Frequency**: 60 seconds
- **WebSocket Alternative**: `/ws/cop-layers`
- **Status Code**: 🟠 HIGH
- **Developer**: TBD (will be assigned in S3M-Core)

## Endpoint: POST /api/cop/control
- **Frontend Workspace**: COP Workspace
- **Expected Response**: `{"operation":"playback","state":"started|paused|rewound","speed":"5m|30m|6h"}`
- **Polling Frequency**: N/A (request-driven)
- **WebSocket Alternative**: `/ws/cop-playback`
- **Status Code**: 🟡 MEDIUM
- **Developer**: TBD (will be assigned in S3M-Core)

## Endpoint: POST /api/cop/track-actions
- **Frontend Workspace**: COP Workspace
- **Expected Response**: `{"action":"engage|intercept|defend|comms","trackId":"T-218","status":"accepted"}`
- **Polling Frequency**: N/A (request-driven)
- **WebSocket Alternative**: `/ws/cop-actions`
- **Status Code**: 🟠 HIGH
- **Developer**: TBD (will be assigned in S3M-Core)

## Endpoint: GET /api/decisions/queue?filter={pending|auto-approved|human-approved|vetoed|stale}
- **Frontend Workspace**: Decisions Workspace
- **Expected Response**: `{"decisions":[{"id":"R001","title":"ENGAGE UAV-02","severity":"CRITICAL","risk":82,"confidence":74,"status":"pending"}]}`
- **Polling Frequency**: 15 seconds
- **WebSocket Alternative**: `/ws/decision-queue`
- **Status Code**: 🔴 CRITICAL
- **Developer**: TBD (will be assigned in S3M-Core)

## Endpoint: GET /api/decisions/queue-counts
- **Frontend Workspace**: Decisions Workspace
- **Expected Response**: `{"pending":3,"autoApproved":12,"humanApproved":47,"vetoed":8,"stale":3}`
- **Polling Frequency**: 15 seconds
- **WebSocket Alternative**: `/ws/decision-queue`
- **Status Code**: 🟠 HIGH
- **Developer**: TBD (will be assigned in S3M-Core)

## Endpoint: GET /api/decisions/{decisionId}/explainability
- **Frontend Workspace**: Decisions Workspace
- **Expected Response**: `{"why":{},"replay":{},"alternatives":[],"evidenceInputs":[],"dissentingViews":[],"doctrineChecks":[]}`
- **Polling Frequency**: On decision open + refresh every 30 seconds
- **WebSocket Alternative**: `/ws/decision-explainability`
- **Status Code**: 🔴 CRITICAL
- **Developer**: TBD (will be assigned in S3M-Core)

## Endpoint: POST /api/decisions/{decisionId}/status
- **Frontend Workspace**: Decisions Workspace
- **Expected Response**: `{"decisionId":"R001","status":"approved|rejected","updatedBy":"operator-id","updatedAt":"2026-04-04T14:42:18Z"}`
- **Polling Frequency**: N/A (request-driven)
- **WebSocket Alternative**: `/ws/decision-queue`
- **Status Code**: 🔴 CRITICAL
- **Developer**: TBD (will be assigned in S3M-Core)

## Endpoint: POST /api/decisions/{decisionId}/override
- **Frontend Workspace**: Decisions Workspace
- **Expected Response**: `{"decisionId":"R001","overrideLogged":true,"reason":"...","authority":"O-5"}`
- **Polling Frequency**: N/A (request-driven)
- **WebSocket Alternative**: `/ws/decision-queue`
- **Status Code**: 🟠 HIGH
- **Developer**: TBD (will be assigned in S3M-Core)

## Endpoint: GET /api/risk/overview
- **Frontend Workspace**: Risk Workspace
- **Expected Response**: `{"compositeRisk":58,"domains":[{"name":"MISSION","value":68,"change":14}]}`
- **Polling Frequency**: 20 seconds
- **WebSocket Alternative**: `/ws/risk-updates`
- **Status Code**: 🔴 CRITICAL
- **Developer**: TBD (will be assigned in S3M-Core)

## Endpoint: GET /api/risk/domains?view={all|mission|cyber|supply|political}
- **Frontend Workspace**: Risk Workspace
- **Expected Response**: `{"categories":[{"id":"mission","composite":68,"risks":[{"label":"Casualty Risk","value":72}]}],"drivers":[]}`
- **Polling Frequency**: 20 seconds
- **WebSocket Alternative**: `/ws/risk-updates`
- **Status Code**: 🔴 CRITICAL
- **Developer**: TBD (will be assigned in S3M-Core)

## Endpoint: GET /api/risk/forecast
- **Frontend Workspace**: Risk Workspace
- **Expected Response**: `{"forecast":[{"label":"NOW","value":58},{"label":"+1H","value":66}],"scenarios":[]}`
- **Polling Frequency**: 30 seconds
- **WebSocket Alternative**: `/ws/risk-forecast`
- **Status Code**: 🟠 HIGH
- **Developer**: TBD (will be assigned in S3M-Core)

## Endpoint: POST /api/risk/mitigations/{mitigationId}/apply
- **Frontend Workspace**: Risk Workspace
- **Expected Response**: `{"mitigationId":"MIT-1001","status":"applied","projectedDelta":-18}`
- **Polling Frequency**: N/A (request-driven)
- **WebSocket Alternative**: `/ws/risk-updates`
- **Status Code**: 🟡 MEDIUM
- **Developer**: TBD (will be assigned in S3M-Core)

## Endpoint: GET /api/planning/missions
- **Frontend Workspace**: Planning Workspace
- **Expected Response**: `{"missions":[{"id":"hostile-track","name":"Hostile Track T-218","priority":"CRITICAL","category":"Air Defense"}]}`
- **Polling Frequency**: 60 seconds
- **WebSocket Alternative**: `/ws/planning-updates`
- **Status Code**: 🔴 CRITICAL
- **Developer**: TBD (will be assigned in S3M-Core)

## Endpoint: GET /api/planning/coas?missionId={missionId}
- **Frontend Workspace**: Planning Workspace
- **Expected Response**: `{"coas":[{"id":"COA-2","name":"Shadow and Report","recommended":true,"risk":"LOW","objectives":[],"assets":[],"metrics":{}}]}`
- **Polling Frequency**: 30 seconds
- **WebSocket Alternative**: `/ws/planning-coas`
- **Status Code**: 🔴 CRITICAL
- **Developer**: TBD (will be assigned in S3M-Core)

## Endpoint: GET /api/planning/constraints?missionId={missionId}
- **Frontend Workspace**: Planning Workspace
- **Expected Response**: `{"constraints":[{"id":"roe","name":"ROE","items":[{"label":"Engagement Authority","value":"O-6 Required"}]}]}`
- **Polling Frequency**: 60 seconds
- **WebSocket Alternative**: `/ws/planning-constraints`
- **Status Code**: 🟠 HIGH
- **Developer**: TBD (will be assigned in S3M-Core)

## Endpoint: GET /api/planning/replan
- **Frontend Workspace**: Planning Workspace
- **Expected Response**: `{"triggers":[],"alternateRoutes":[],"reserveActivation":[]}`
- **Polling Frequency**: 30 seconds
- **WebSocket Alternative**: `/ws/replan-events`
- **Status Code**: 🟠 HIGH
- **Developer**: TBD (will be assigned in S3M-Core)

## Endpoint: POST /api/planning/coas/{coaId}/select
- **Frontend Workspace**: Planning Workspace
- **Expected Response**: `{"coaId":"COA-2","selected":true,"selectedBy":"operator-id","selectedAt":"2026-04-04T14:42:18Z"}`
- **Polling Frequency**: N/A (request-driven)
- **WebSocket Alternative**: `/ws/planning-updates`
- **Status Code**: 🟠 HIGH
- **Developer**: TBD (will be assigned in S3M-Core)

## Endpoint: GET /api/planning/suggestions?missionId={missionId}
- **Frontend Workspace**: Planning Workspace
- **Expected Response**: `{"suggestions":[{"type":"optimization","title":"Alternate Asset Allocation","confidence":87,"impact":"HIGH"}]}`
- **Polling Frequency**: 30 seconds
- **WebSocket Alternative**: `/ws/planning-suggestions`
- **Status Code**: 🟡 MEDIUM
- **Developer**: TBD (will be assigned in S3M-Core)

## Endpoint: GET /api/sustainment/fleet-health
- **Frontend Workspace**: Sustainment Workspace
- **Expected Response**: `{"units":[{"unit":"1-82nd Aviation","readiness":78,"platforms":[],"cannibalizationAlerts":[]}]}`
- **Polling Frequency**: 30 seconds
- **WebSocket Alternative**: `/ws/sustainment-fleet`
- **Status Code**: 🔴 CRITICAL
- **Developer**: TBD (will be assigned in S3M-Core)

## Endpoint: GET /api/sustainment/supply-chain
- **Frontend Workspace**: Sustainment Workspace
- **Expected Response**: `{"categories":[{"category":"ammo","items":[{"type":"120mm APFSDS","stock":280,"target":400,"leadTime":"45 days"}]}]}`
- **Polling Frequency**: 60 seconds
- **WebSocket Alternative**: `/ws/supply-chain`
- **Status Code**: 🔴 CRITICAL
- **Developer**: TBD (will be assigned in S3M-Core)

## Endpoint: GET /api/sustainment/dependencies
- **Frontend Workspace**: Sustainment Workspace
- **Expected Response**: `{"dependencies":[{"component":"JP-8 Aviation Fuel","daysToThreshold":8,"affectedMissions":[],"allocation":"..."}]}`
- **Polling Frequency**: 60 seconds
- **WebSocket Alternative**: `/ws/sustainment-dependencies`
- **Status Code**: 🟠 HIGH
- **Developer**: TBD (will be assigned in S3M-Core)

## Endpoint: GET /api/sustainment/maintenance
- **Frontend Workspace**: Sustainment Workspace
- **Expected Response**: `{"recommendations":[],"technicianWorkload":[],"depotBottlenecks":[]}`
- **Polling Frequency**: 30 seconds
- **WebSocket Alternative**: `/ws/maintenance-updates`
- **Status Code**: 🟠 HIGH
- **Developer**: TBD (will be assigned in S3M-Core)

## Endpoint: GET /api/readiness/personnel
- **Frontend Workspace**: Readiness Workspace
- **Expected Response**: `{"deployableStatus":{},"certificationCurrency":[],"languageCapability":[],"shiftFatigue":[],"trainingRecency":[]}`
- **Polling Frequency**: 60 seconds
- **WebSocket Alternative**: `/ws/readiness-updates`
- **Status Code**: 🔴 CRITICAL
- **Developer**: TBD (will be assigned in S3M-Core)

## Endpoint: GET /api/readiness/manning-qualification
- **Frontend Workspace**: Readiness Workspace
- **Expected Response**: `{"unitManning":[],"specialistShortageHeatmap":[],"qualificationMatrix":{"byMissionProfile":[],"byPlatform":[],"byClassification":[],"byCoalitionAccess":[]}}`
- **Polling Frequency**: 60 seconds
- **WebSocket Alternative**: `/ws/readiness-updates`
- **Status Code**: 🔴 CRITICAL
- **Developer**: TBD (will be assigned in S3M-Core)

## Endpoint: GET /api/readiness/forecast?window={7day|30day|90day}
- **Frontend Workspace**: Readiness Workspace
- **Expected Response**: `{"overallReadiness":76,"trend":-8,"qualificationGaps":[],"expirationCliffs":[]}`
- **Polling Frequency**: 30 seconds
- **WebSocket Alternative**: `/ws/readiness-forecast`
- **Status Code**: 🟠 HIGH
- **Developer**: TBD (will be assigned in S3M-Core)

## Endpoint: GET /api/cyber/soc
- **Frontend Workspace**: Cyber Workspace
- **Expected Response**: `{"summary":{"totalIncidents":3},"activeIncidents":[{"id":"INC-2847","severity":"CRITICAL","target":"Node 12"}]}`
- **Polling Frequency**: 10 seconds
- **WebSocket Alternative**: `/ws/cyber-alerts`
- **Status Code**: 🔴 CRITICAL
- **Developer**: TBD (will be assigned in S3M-Core)

## Endpoint: GET /api/cyber/models
- **Frontend Workspace**: Cyber Workspace
- **Expected Response**: `{"models":[{"modelName":"S3M-Core-v4.2.1","integrity":"VERIFIED","driftScore":2.1,"anomalyCount":0}]}`
- **Polling Frequency**: 20 seconds
- **WebSocket Alternative**: `/ws/model-security`
- **Status Code**: 🟠 HIGH
- **Developer**: TBD (will be assigned in S3M-Core)

## Endpoint: GET /api/cyber/trust
- **Frontend Workspace**: Cyber Workspace
- **Expected Response**: `{"trustScores":[{"category":"Identity Trust","score":87,"breakdown":[]}]}`
- **Polling Frequency**: 30 seconds
- **WebSocket Alternative**: `/ws/trust-fabric`
- **Status Code**: 🟠 HIGH
- **Developer**: TBD (will be assigned in S3M-Core)

## Endpoint: GET /api/cyber/actions
- **Frontend Workspace**: Cyber Workspace
- **Expected Response**: `{"resilienceActions":[],"attackOptions":[]}`
- **Polling Frequency**: 20 seconds
- **WebSocket Alternative**: `/ws/cyber-actions`
- **Status Code**: 🟠 HIGH
- **Developer**: TBD (will be assigned in S3M-Core)

## Endpoint: POST /api/cyber/actions/{actionId}/execute
- **Frontend Workspace**: Cyber Workspace
- **Expected Response**: `{"actionId":"CYB-ACT-01","executed":true,"estimatedDowntime":"30s","ticketId":"IR-9007"}`
- **Polling Frequency**: N/A (request-driven)
- **WebSocket Alternative**: `/ws/cyber-actions`
- **Status Code**: 🔴 CRITICAL
- **Developer**: TBD (will be assigned in S3M-Core)

## Endpoint: GET /api/simulation/scenarios
- **Frontend Workspace**: Simulation Workspace
- **Expected Response**: `{"recentScenarios":[],"scenarioLibrary":[]}`
- **Polling Frequency**: 60 seconds
- **WebSocket Alternative**: `/ws/simulation-updates`
- **Status Code**: 🟠 HIGH
- **Developer**: TBD (will be assigned in S3M-Core)

## Endpoint: GET /api/simulation/rehearsal
- **Frontend Workspace**: Simulation Workspace
- **Expected Response**: `{"missionRehearsalScenarios":[],"humanAIComparison":{}}`
- **Polling Frequency**: 30 seconds
- **WebSocket Alternative**: `/ws/simulation-rehearsal`
- **Status Code**: 🟠 HIGH
- **Developer**: TBD (will be assigned in S3M-Core)

## Endpoint: GET /api/simulation/aar/{scenarioId}
- **Frontend Workspace**: Simulation Workspace
- **Expected Response**: `{"scenarioId":"SIM-003","findings":[],"lessons":[],"analytics":{"keyDecisionPoints":[],"avoidableLosses":[],"missedDetections":[],"timeToDecision":{},"recommendationQuality":{}}}`
- **Polling Frequency**: On panel open + manual refresh
- **WebSocket Alternative**: `/ws/aar-updates`
- **Status Code**: 🟠 HIGH
- **Developer**: TBD (will be assigned in S3M-Core)

## Endpoint: GET /api/communication/channels
- **Frontend Workspace**: Communication Workspace
- **Expected Response**: `{"commsChannels":[{"channel":"SATCOM Primary","confidence":92}]}`
- **Polling Frequency**: 15 seconds
- **WebSocket Alternative**: `/ws/comms-channels`
- **Status Code**: 🔴 CRITICAL
- **Developer**: TBD (will be assigned in S3M-Core)

## Endpoint: GET /api/communication/chats
- **Frontend Workspace**: Communication Workspace
- **Expected Response**: `{"liveChats":[],"archivedChats":[]}`
- **Polling Frequency**: 10 seconds
- **WebSocket Alternative**: `/ws/comms-chats`
- **Status Code**: 🟠 HIGH
- **Developer**: TBD (will be assigned in S3M-Core)

## Endpoint: GET /api/communication/network
- **Frontend Workspace**: Communication Workspace
- **Expected Response**: `{"bearerHealth":[],"messageAssurance":{"summary":{},"recentMessages":[]},"priorityRouting":[],"degradationAdvisor":{}}`
- **Polling Frequency**: 10 seconds
- **WebSocket Alternative**: `/ws/comms-network`
- **Status Code**: 🔴 CRITICAL
- **Developer**: TBD (will be assigned in S3M-Core)

## Endpoint: POST /api/communication/chats/{chatId}/listen
- **Frontend Workspace**: Communication Workspace
- **Expected Response**: `{"chatId":"CH-001","streamToken":"jwt-or-session-token","expiresInSec":300}`
- **Polling Frequency**: N/A (request-driven)
- **WebSocket Alternative**: `/ws/comms-audio`
- **Status Code**: 🟡 MEDIUM
- **Developer**: TBD (will be assigned in S3M-Core)

## Endpoint: GET /api/surveillance/entities
- **Frontend Workspace**: Surveillance Workspace
- **Expected Response**: `{"personsOfInterest":[],"targetsOfInterest":[],"liveTargets":[]}`
- **Polling Frequency**: 10 seconds
- **WebSocket Alternative**: `/ws/surveillance-entities`
- **Status Code**: 🔴 CRITICAL
- **Developer**: TBD (will be assigned in S3M-Core)

## Endpoint: GET /api/surveillance/collection
- **Frontend Workspace**: Surveillance Workspace
- **Expected Response**: `{"collectionTasks":[],"collectionGaps":[],"retaskingRecommendations":[]}`
- **Polling Frequency**: 20 seconds
- **WebSocket Alternative**: `/ws/surveillance-collection`
- **Status Code**: 🟠 HIGH
- **Developer**: TBD (will be assigned in S3M-Core)

## Endpoint: GET /api/surveillance/fusion
- **Frontend Workspace**: Surveillance Workspace
- **Expected Response**: `{"sourceReliability":[],"watchlists":{},"fusionAlerts":[],"autoGeneratedBriefs":[]}`
- **Polling Frequency**: 20 seconds
- **WebSocket Alternative**: `/ws/surveillance-fusion`
- **Status Code**: 🔴 CRITICAL
- **Developer**: TBD (will be assigned in S3M-Core)

## Endpoint: POST /api/surveillance/retasking/{recommendationId}/apply
- **Frontend Workspace**: Surveillance Workspace
- **Expected Response**: `{"recommendationId":"RETASK-001","applied":true,"taskId":"COLL-999"}`
- **Polling Frequency**: N/A (request-driven)
- **WebSocket Alternative**: `/ws/surveillance-collection`
- **Status Code**: 🟠 HIGH
- **Developer**: TBD (will be assigned in S3M-Core)

## Endpoint: GET /api/assistant/conversations/active
- **Frontend Workspace**: AI Panel (Live Feed / Chat)
- **Expected Response**: `{"conversationId":"conv-001","messages":[{"role":"system","text":"Track T-218 identified as hostile.","timestamp":"2026-04-04T14:42:18Z"}]}`
- **Polling Frequency**: 5 seconds
- **WebSocket Alternative**: `/ws/assistant-stream`
- **Status Code**: 🔴 CRITICAL
- **Developer**: TBD (will be assigned in S3M-Core)

## Endpoint: POST /api/assistant/messages
- **Frontend Workspace**: AI Panel (Live Feed / Chat)
- **Expected Response**: `{"conversationId":"conv-001","messageId":"msg-928","accepted":true,"stream":"ws"}`
- **Polling Frequency**: N/A (request-driven)
- **WebSocket Alternative**: `/ws/assistant-stream`
- **Status Code**: 🔴 CRITICAL
- **Developer**: TBD (will be assigned in S3M-Core)

## Endpoint: GET /api/assistant/suggested-actions
- **Frontend Workspace**: AI Panel (Live Feed / Chat)
- **Expected Response**: `{"actions":[{"label":"OPEN COP","workspace":"cop"},{"label":"RISK ENGINE","workspace":"risk"},{"label":"VIEW READINESS","workspace":"readiness"}]}`
- **Polling Frequency**: 20 seconds
- **WebSocket Alternative**: `/ws/assistant-suggestions`
- **Status Code**: 🟡 MEDIUM
- **Developer**: TBD (will be assigned in S3M-Core)

---

## Notes for S3M-Core Issue Creation

- This list intentionally favors aggregated endpoints where the UI panels can be served from coherent domain payloads.
- Request/response endpoints should emit domain events to the listed WebSocket channels so GUI can converge quickly.
- All timestamps should be ISO-8601 UTC (`YYYY-MM-DDTHH:mm:ssZ`).
- Enum values should be returned exactly as displayed where possible (for minimal front-end mapping risk).
