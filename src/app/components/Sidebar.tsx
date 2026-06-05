import { useAppStore, WorkspaceType } from '../store';
import { useNavigate } from 'react-router';
import { Home, Target, CheckSquare, AlertTriangle, Map, Package, Activity, Shield, Play, Radio, Eye } from 'lucide-react';

const workspaceIcons: Record<WorkspaceType, any> = {
  command: Home,
  cop: Target,
  decisions: CheckSquare,
  risk: AlertTriangle,
  planning: Map,
  sustainment: Package,
  readiness: Activity,
  cyber: Shield,
  simulation: Play,
  communication: Radio,
  surveillance: Eye
};

const workspaceLabels: Record<WorkspaceType, string> = {
  command: 'COMMAND',
  cop: 'COP',
  decisions: 'DECISIONS',
  risk: 'RISK',
  planning: 'PLANNING',
  sustainment: 'SUSTAINMENT',
  readiness: 'READINESS',
  cyber: 'CYBER',
  simulation: 'SIMULATION',
  communication: 'COMMUNICATION',
  surveillance: 'SURVEILLANCE'
};

export function Sidebar() {
  const { activeWorkspace, setActiveWorkspace } = useAppStore();
  const navigate = useNavigate();

  const workspaces: WorkspaceType[] = [
    'command',
    'cop',
    'decisions',
    'planning',
    'risk',
    'simulation',
    'sustainment',
    'readiness',
    'cyber',
    'communication',
    'surveillance'
  ];

  return (
    <div className="w-48 bg-cyber-deep/50 border-r border-cyber-glass-border flex flex-col py-4 gap-1" style={{ backdropFilter: 'blur(10px)' }}>
      {workspaces.map((workspace) => {
        const Icon = workspaceIcons[workspace];
        const isActive = activeWorkspace === workspace;

        return (
          <button
            key={workspace}
            onClick={() => {
              setActiveWorkspace(workspace);
              navigate('/dashboard');
            }}
            className={`relative h-12 mx-2 px-3 rounded-xl flex items-center gap-3 transition-all duration-300 group ${
              isActive
                ? 'text-cyber-cyan'
                : 'text-cyber-text-tertiary hover:text-cyber-cyan'
            }`}
            style={isActive ? {
              background: 'rgba(0, 240, 255, 0.1)',
              border: '1px solid rgba(0, 240, 255, 0.4)',
              boxShadow: '0 0 20px rgba(0, 240, 255, 0.3)'
            } : {
              border: '1px solid transparent'
            }}
          >
            {isActive && (
              <div
                className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full"
                style={{
                  backgroundColor: '#00F0FF',
                  boxShadow: '0 0 12px rgba(0, 240, 255, 0.8)'
                }}
              />
            )}
            <Icon className="w-5 h-5 flex-shrink-0" style={isActive ? { filter: 'drop-shadow(0 0 4px rgba(0, 240, 255, 0.8))' } : {}} />
            <span className={`text-[11px] font-semibold uppercase tracking-wider ${
              isActive ? 'text-cyber-cyan' : 'text-cyber-text-tertiary'
            }`} style={isActive ? { textShadow: '0 0 8px rgba(0, 240, 255, 0.6)' } : {}}>
              {workspaceLabels[workspace]}
            </span>
          </button>
        );
      })}

    </div>
  );
}
