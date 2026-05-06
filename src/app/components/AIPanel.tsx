import { useEffect, useRef, useState } from 'react';
import { Send, ChevronRight } from 'lucide-react';
import { ConfidenceBadge } from './ConfidenceBadge';
import { useAppStore, type WorkspaceType } from '../store';

interface AIPanelProps {
  isOpen: boolean;
}

type ChatRole = 'assistant' | 'user' | 'system' | 'loading';
type ChatAction =
  | 'OPEN READINESS'
  | 'OPEN RISK'
  | 'OPEN COP'
  | 'RUN SIMULATION'
  | 'GENERATE SITREP'
  | 'COMMAND SUMMARY'
  | 'CYBER WORKSPACE';

interface ChatMessage {
  id: string;
  role: ChatRole;
  text: string;
  confidence?: number;
  source?: string;
  actions?: ChatAction[];
}

const MAX_MESSAGES = 40;
const ANALYZING_TEXT = 'S3M Command Agent analyzing…';

const ACTION_WORKSPACE_MAP: Partial<Record<ChatAction, WorkspaceType>> = {
  'OPEN COP': 'cop',
  'OPEN RISK': 'risk',
  'OPEN READINESS': 'readiness',
  'CYBER WORKSPACE': 'cyber',
  'RUN SIMULATION': 'simulation',
  'GENERATE SITREP': 'command',
  'COMMAND SUMMARY': 'command'
};

const QUICK_PROMPTS = [
  'Hello',
  'What threats were detected today?',
  'What is my top priority right now?',
  'What is our readiness at Jubail?',
  'What is the risk of this mission?',
  'Launch defensive measures',
  'Launch Red Sea drone swarm simulation',
  'Generate Saudi MOD SITREP'
] as const;

const LIVE_FEED_EVENTS = [
  'LIVE FEED: COP track T-218 refreshed with Gulf corridor telemetry.',
  'LIVE FEED: Riyadh command node confirms mission package sync.',
  'LIVE FEED: SOC anomaly score reduced after firewall policy update.',
  'LIVE FEED: Readiness delta posted for Jubail coastal defense unit.',
  'LIVE FEED: Red Sea ISR sweep confirms low-visibility maritime traffic.'
] as const;

const DEMO_SEED_MESSAGES: Omit<ChatMessage, 'id'>[] = [
  {
    role: 'system',
    text: 'S3M Live Feed / Chat online. Demo channels synchronized for command operations.',
    source: 'Source: Command Workspace'
  },
  {
    role: 'system',
    text: 'COP track update: Track T-218 classified as hostile UAV with route shift toward Sector 7.',
    confidence: 86,
    source: 'Source: COP Workspace',
    actions: ['OPEN COP']
  },
  {
    role: 'system',
    text: 'Readiness update: Jubail and Riyadh units are mission-capable with one maintenance window pending.',
    confidence: 88,
    source: 'Source: Readiness Workspace',
    actions: ['OPEN READINESS']
  }
];

const capMessages = (messages: ChatMessage[]): ChatMessage[] =>
  messages.length > MAX_MESSAGES ? messages.slice(messages.length - MAX_MESSAGES) : messages;

const buildAssistantResponse = (input: string): Omit<ChatMessage, 'id' | 'role'> => {
  const query = input.toLowerCase();
  const includesAny = (keywords: string[]) => keywords.some((keyword) => query.includes(keyword));
  const greetingPattern = /(^|\b)(hello|hi|salam)(\b|$)/;

  if (greetingPattern.test(query)) {
    return {
      text: 'Welcome to S3M Live Feed / Chat. I can retrieve readiness, risk, threats, priorities, simulation status, and command reports in this demo environment.',
      confidence: 96,
      source: 'Source: Command Workspace',
      actions: ['COMMAND SUMMARY', 'OPEN COP', 'OPEN READINESS']
    };
  }

  if (includesAny(['launch defensive measures', 'defensive measures', 'defend'])) {
    return {
      text: 'Defensive measures queued in sandbox/demo mode. No real-world mission, live autonomy, or external action was executed.',
      confidence: 95,
      source: 'Source: Command Workspace',
      actions: ['OPEN COP', 'RUN SIMULATION', 'OPEN RISK']
    };
  }

  if (includesAny(['top priority', 'priority right now', 'what should i do'])) {
    return {
      text: 'Top priority: review Red Sea ISR against hostile UAV track T-218, then verify readiness before launching simulation.',
      confidence: 89,
      source: 'Source: Command + COP + Readiness',
      actions: ['OPEN COP', 'OPEN READINESS', 'OPEN RISK']
    };
  }

  if (includesAny(['threats', 'detected today', 'threat detected'])) {
    return {
      text: "Today's threat summary: hostile UAV track T-218 remains active, maritime low-visibility traffic is elevated, a cyber anomaly cluster is contained, and readiness shows a minor delta from maintenance windows.",
      confidence: 84,
      source: 'Source: COP + Risk + Cyber + Readiness',
      actions: ['OPEN COP', 'OPEN RISK']
    };
  }

  if (includesAny(['readiness', 'base', 'unit', 'jubail', 'riyadh', 'king abdulaziz'])) {
    return {
      text: 'Readiness snapshot: Jubail Naval Base 86%, Riyadh Air Defense Group 79%, King Abdulaziz Air Base 83%. Two support units remain in planned maintenance.',
      confidence: 88,
      source: 'Source: Readiness Workspace',
      actions: ['OPEN READINESS', 'COMMAND SUMMARY']
    };
  }

  if (includesAny(['risk', 'mission', 'convoy', 'route'])) {
    return {
      text: 'Mission risk is HIGH (composite 64/100). Primary drivers: convoy route exposure and recent hostile sensor activity near the northern transit lane.',
      confidence: 81,
      source: 'Source: Risk Workspace',
      actions: ['OPEN RISK', 'OPEN COP']
    };
  }

  if (includesAny(['simulation', 'launch simulation', 'wargame', 'red sea', 'drone swarm'])) {
    return {
      text: 'Simulation package prepared for Red Sea drone swarm scenario. Sandbox/demo mode only; this is a deterministic training run with current COP tracks.',
      confidence: 92,
      source: 'Source: Simulation Workspace',
      actions: ['RUN SIMULATION', 'OPEN COP']
    };
  }

  if (includesAny(['threat', 'cop', 'track', 'hostile', 'uav'])) {
    return {
      text: 'Threat review: one hostile UAV track (T-218) is active with medium-to-high intent confidence. COP correlation shows no additional hostile manned platforms.',
      confidence: 85,
      source: 'Source: COP Workspace',
      actions: ['OPEN COP', 'OPEN RISK']
    };
  }

  if (includesAny(['cyber', 'soc', 'network', 'anomaly'])) {
    return {
      text: 'SOC posture is elevated. Current anomaly cluster is contained to one subnet with no command-layer compromise detected in this demo state.',
      confidence: 90,
      source: 'Source: Cyber Workspace',
      actions: ['CYBER WORKSPACE']
    };
  }

  if (includesAny(['brief', 'sitrep', 'report', 'arabic'])) {
    return {
      text: 'Saudi MOD SITREP package is ready for command brief generation, including Arabic-ready sections for threats, readiness, and mission risk.',
      confidence: 87,
      source: 'Source: Command Workspace',
      actions: ['GENERATE SITREP', 'COMMAND SUMMARY']
    };
  }

  return {
    text: 'Command intent acknowledged. I can provide readiness, COP threat, risk, cyber status, simulation launch, or SITREP generation in demo mode.',
    source: 'Source: Command Workspace',
    actions: ['COMMAND SUMMARY', 'OPEN COP', 'OPEN RISK']
  };
};

export function AIPanel({ isOpen }: AIPanelProps) {
  const { toggleAiPanel, setActiveWorkspace } = useAppStore();
  const messageCounterRef = useRef(0);
  const liveFeedIndexRef = useRef(0);
  const timeoutIdsRef = useRef<number[]>([]);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    DEMO_SEED_MESSAGES.map((message) => ({
      ...message,
      id: `ai-msg-${++messageCounterRef.current}`
    }))
  );

  const nextMessageId = (): string => `ai-msg-${++messageCounterRef.current}`;

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      const event = LIVE_FEED_EVENTS[liveFeedIndexRef.current % LIVE_FEED_EVENTS.length];
      liveFeedIndexRef.current += 1;

      setMessages((previousMessages) =>
        capMessages([
          ...previousMessages,
          {
            id: nextMessageId(),
            role: 'system',
            text: event,
            source: 'Source: Live Feed'
          }
        ])
      );
    }, 15000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(
    () => () => {
      timeoutIdsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    },
    []
  );

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleActionChip = (action: ChatAction) => {
    const workspace = ACTION_WORKSPACE_MAP[action];
    if (workspace) {
      setActiveWorkspace(workspace);
    }
  };

  const handleSend = (rawMessage?: string) => {
    const outgoingText = (rawMessage ?? inputValue).trim();
    if (!outgoingText) return;

    const loadingId = nextMessageId();

    setMessages((previousMessages) =>
      capMessages([
        ...previousMessages,
        { id: nextMessageId(), role: 'user', text: outgoingText },
        { id: loadingId, role: 'loading', text: ANALYZING_TEXT, source: 'Source: S3M Command Agent' }
      ])
    );

    setInputValue('');

    const timeoutId = window.setTimeout(() => {
      const response = buildAssistantResponse(outgoingText);
      setMessages((previousMessages) =>
        capMessages([
          ...previousMessages.filter((message) => message.id !== loadingId),
          { id: nextMessageId(), role: 'assistant', ...response }
        ])
      );
    }, 900);

    timeoutIdsRef.current.push(timeoutId);
  };

  if (!isOpen) return null;

  return (
    <div className="w-[288px] bg-cyber-deep/40 border-l border-cyber-glass-border flex flex-col" style={{ backdropFilter: 'blur(15px)' }}>
      {/* Header */}
      <div className="p-4 border-b border-cyber-glass-border flex items-center gap-3">
        <div className="w-2.5 h-2.5 rounded-full bg-cyber-green glow-green" />
        <span className="text-[13px] text-cyber-cyan font-display font-semibold tracking-[0.12em] uppercase">
          LIVE FEED / CHAT
        </span>
        <div className="flex-1" />
        <button
          onClick={toggleAiPanel}
          className="w-6 h-6 rounded flex items-center justify-center hover:bg-cyber-cyan/10 transition-all duration-300 group"
          style={{
            border: '1px solid rgba(0, 240, 255, 0.2)'
          }}
        >
          <ChevronRight
            className="w-4 h-4 text-cyber-cyan transition-all duration-300 group-hover:translate-x-0.5"
            style={{ filter: 'drop-shadow(0 0 4px rgba(0, 240, 255, 0.6))' }}
          />
        </button>
      </div>

      {/* Messages */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isUserMessage = message.role === 'user';
          const isLoading = message.role === 'loading';

          return (
            <div
              key={message.id}
              className={
                isUserMessage
                  ? 'p-3 border border-cyber-glass-border/30 rounded-xl'
                  : 'glass-panel rounded-xl p-3'
              }
            >
              <div
                className={`text-[12px] leading-relaxed ${
                  isUserMessage ? 'text-cyber-text-secondary' : 'text-cyber-text-primary'
                } ${isLoading ? 'animate-pulse' : ''}`}
              >
                {message.text}
              </div>

              {(message.confidence !== undefined || message.source) && (
                <div className="flex items-center gap-3 mt-3">
                  {message.confidence !== undefined && <ConfidenceBadge value={message.confidence} size="sm" />}
                  {message.source && (
                    <span className="text-[10px] uppercase tracking-wider text-cyber-text-tertiary">
                      {message.source}
                    </span>
                  )}
                </div>
              )}

              {message.actions && message.actions.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {message.actions.map((action) => (
                    <button
                      key={`${message.id}-${action}`}
                      onClick={() => handleActionChip(action)}
                      className="text-[11px] text-cyber-cyan hover:text-cyber-blue transition-colors uppercase tracking-wider font-semibold"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-cyber-glass-border">
        <button
          onClick={() => setShowSuggestions((previous) => !previous)}
          className="w-full flex items-center justify-between text-[10px] tracking-[0.18em] px-3 py-2 mb-3 rounded-md border border-cyber-cyan/25 text-cyber-cyan hover:border-cyber-cyan/60 hover:bg-cyber-cyan/10 transition-colors"
        >
          <span>SUGGESTED COMMANDS</span>
          <span className="text-[11px]">{showSuggestions ? 'HIDE' : 'SHOW'}</span>
        </button>
        {showSuggestions && (
          <div className="flex flex-wrap gap-2 mb-3">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleSend(prompt)}
                className="text-[10px] tracking-wide px-2 py-1 rounded-md border border-cyber-cyan/25 text-cyber-cyan hover:border-cyber-cyan/60 hover:bg-cyber-cyan/10 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Ask, command, or query…"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                handleSend();
              }
            }}
            className="flex-1 glass-panel rounded-xl px-3 py-2 text-[12px] text-cyber-text-primary placeholder:text-cyber-text-tertiary focus:outline-none focus:border-cyber-cyan transition-colors"
            style={{ border: '1px solid rgba(0, 240, 255, 0.2)' }}
          />
          <button
            onClick={() => handleSend()}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
            style={{
              background: '#00F0FF',
              boxShadow: '0 0 20px rgba(0, 240, 255, 0.6)'
            }}
          >
            <Send className="w-4 h-4 text-cyber-void" />
          </button>
        </div>
      </div>
    </div>
  );
}
