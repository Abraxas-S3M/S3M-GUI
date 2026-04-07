import { useEffect } from 'react';
import { useAppStore } from '../store';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import { Timeline } from './Timeline';
import { HealthStrip } from './HealthStrip';
import { AIPanel } from './AIPanel';
import { BackendEvolutionPanel } from './BackendEvolutionPanel';
import { CommandOverview } from './workspaces/CommandOverview';
import { COPWorkspace } from './workspaces/COPWorkspace';
import { DecisionsWorkspace } from './workspaces/DecisionsWorkspace';
import { RiskWorkspace } from './workspaces/RiskWorkspace';
import { PlanningWorkspace } from './workspaces/PlanningWorkspace';
import { SustainmentWorkspace } from './workspaces/SustainmentWorkspace';
import { ReadinessWorkspace } from './workspaces/ReadinessWorkspace';
import { CyberWorkspace } from './workspaces/CyberWorkspace';
import { SimulationWorkspace } from './workspaces/SimulationWorkspace';
import { CommunicationWorkspace } from './workspaces/CommunicationWorkspace';
import { SurveillanceWorkspace } from './workspaces/SurveillanceWorkspace';
import { MessageSquare } from 'lucide-react';
import { useSystemStatus } from '../../services/hooks/useSystemStatus';

export function DashboardLayout() {
  const {
    activeWorkspace,
    aiPanelOpen,
    toggleAiPanel,
    updateTime,
    backendEvolutionPanelOpen,
  } = useAppStore();
  const systemStatus = useSystemStatus();

  // Update clock every second
  useEffect(() => {
    const interval = setInterval(() => {
      updateTime();
    }, 1000);

    return () => clearInterval(interval);
  }, [updateTime]);

  const renderWorkspace = () => {
    switch (activeWorkspace) {
      case 'command':
        return <CommandOverview />;
      case 'cop':
        return <COPWorkspace />;
      case 'decisions':
        return <DecisionsWorkspace />;
      case 'risk':
        return <RiskWorkspace />;
      case 'planning':
        return <PlanningWorkspace />;
      case 'sustainment':
        return <SustainmentWorkspace />;
      case 'readiness':
        return <ReadinessWorkspace />;
      case 'cyber':
        return <CyberWorkspace />;
      case 'simulation':
        return <SimulationWorkspace />;
      case 'communication':
        return <CommunicationWorkspace />;
      case 'surveillance':
        return <SurveillanceWorkspace />;
      default:
        return <CommandOverview />;
    }
  };

  return (
    <div className="h-screen w-screen bg-s3m-base text-s3m-text-primary flex flex-col overflow-hidden">
      {/* Top Bar */}
      <TopBar />

      {/* Timeline Strip */}
      <Timeline />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar */}
        <Sidebar />

        {/* Workspace Content */}
        <div className="flex-1 overflow-auto">
          {renderWorkspace()}
        </div>

        <BackendEvolutionPanel
          isOpen={backendEvolutionPanelOpen}
          data={systemStatus.data}
          isLoading={systemStatus.isLoading}
          error={systemStatus.error}
          endpointUnavailable={systemStatus.endpointUnavailable}
          onRefresh={systemStatus.refetch}
        />

        {/* AI Panel */}
        <AIPanel isOpen={aiPanelOpen} />

        {/* Floating Chat Bubble (appears when AI panel is closed) */}
        {!aiPanelOpen && (
          <button
            onClick={toggleAiPanel}
            className="absolute right-0 top-1/2 -translate-y-1/2 w-14 h-14 rounded-l-2xl glass-panel border-l-0 flex items-center justify-center transition-all duration-300 hover:w-16 group z-50"
            style={{
              border: '1px solid rgba(0, 240, 255, 0.4)',
              borderRight: 'none',
              boxShadow: '-4px 0 20px rgba(0, 240, 255, 0.2)',
              background: 'rgba(10, 10, 18, 0.95)',
              backdropFilter: 'blur(15px)'
            }}
          >
            <MessageSquare
              className="w-6 h-6 text-cyber-cyan transition-all duration-300 group-hover:scale-110"
              style={{ filter: 'drop-shadow(0 0 8px rgba(0, 240, 255, 0.8))' }}
            />
            <div className="absolute right-full mr-3 px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none" style={{
              background: 'rgba(0, 240, 255, 0.1)',
              border: '1px solid rgba(0, 240, 255, 0.3)',
              boxShadow: '0 0 15px rgba(0, 240, 255, 0.2)'
            }}>
              <span className="text-[11px] text-cyber-cyan uppercase tracking-wider font-semibold">
                LIVE FEED / CHAT
              </span>
            </div>
          </button>
        )}
      </div>

      {/* Health Strip */}
      <HealthStrip />
    </div>
  );
}
