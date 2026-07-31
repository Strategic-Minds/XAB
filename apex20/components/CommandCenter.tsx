/**
 * APEX-20 UI-01 Command Center — 3-Panel Shell
 * BP-01 Sovereign Black: #000 bg, #FFF text, #E5E4E2 accent, JetBrains Mono
 * Far-left 64px icon nav | 320px chat panel | fluid editor panel
 */
'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

// BP-01 Sovereign Black design tokens (CSS vars injected via globals.css)
// --apex-bg: #000000  --apex-surface: #0a0a0a  --apex-text: #ffffff
// --apex-muted: #a0a0a0  --apex-accent: #E5E4E2  --apex-border: #2a2a2a
// --apex-font-code: 'JetBrains Mono', monospace

type NavSection = {
  id: string;
  icon: string;
  label: string;
  cluster: 'create' | 'build' | 'validate' | 'operate' | 'settings';
};

const NAV_SECTIONS: NavSection[] = [
  // Cluster: CREATE
  { id: 'new-project',    icon: '⊕', label: 'New Project',      cluster: 'create' },
  { id: 'agent-team',     icon: '◈', label: 'Agent Team',        cluster: 'create' },
  { id: 'rooms',          icon: '⬡', label: 'Multi-Agent Rooms', cluster: 'create' },
  { id: 'workflows',      icon: '⟳', label: 'Workflows',         cluster: 'create' },
  // Cluster: BUILD
  { id: 'websites',       icon: '◻', label: 'Websites',          cluster: 'build' },
  { id: 'applications',   icon: '⊞', label: 'Applications',      cluster: 'build' },
  { id: 'funnels',        icon: '▽', label: 'Funnels',           cluster: 'build' },
  { id: 'ui-designs',     icon: '◇', label: 'UI Designs',        cluster: 'build' },
  { id: 'logos',          icon: '◎', label: 'Logos',             cluster: 'build' },
  { id: 'brand-systems',  icon: '◐', label: 'Brand Systems',     cluster: 'build' },
  { id: 'images',         icon: '▣', label: 'Images',            cluster: 'build' },
  { id: 'video',          icon: '▶', label: 'Video',             cluster: 'build' },
  { id: 'documents',      icon: '▤', label: 'Documents',         cluster: 'build' },
  { id: 'templates',      icon: '▥', label: 'Templates',         cluster: 'build' },
  // Cluster: VALIDATE
  { id: 'browser',        icon: '⊙', label: 'Browser',           cluster: 'validate' },
  { id: 'evaluations',    icon: '◉', label: 'Evaluations',       cluster: 'validate' },
  { id: 'security',       icon: '⊛', label: 'Security',          cluster: 'validate' },
  // Cluster: OPERATE
  { id: 'files',          icon: '▦', label: 'Files',             cluster: 'operate' },
  { id: 'knowledge',      icon: '◈', label: 'Knowledge',         cluster: 'operate' },
  { id: 'deployments',    icon: '⊗', label: 'Deployments',       cluster: 'operate' },
  { id: 'receipts',       icon: '◫', label: 'Receipts',          cluster: 'operate' },
  // Cluster: SETTINGS
  { id: 'settings',       icon: '⊜', label: 'Settings',          cluster: 'settings' },
];

const CLUSTER_DIVIDERS: NavSection['cluster'][] = ['create', 'build', 'validate', 'operate', 'settings'];

interface CommandCenterProps {
  children?: React.ReactNode;
}

export default function CommandCenter({ children }: CommandCenterProps) {
  const [activeSection, setActiveSection] = useState('new-project');
  const [chatCollapsed, setChatCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  return (
    <div
      className={cn(
        'flex h-screen w-full overflow-hidden font-mono',
        darkMode ? 'apex-dark' : 'apex-light'
      )}
      style={{
        background: darkMode ? '#000000' : '#FAFAFA',
        color: darkMode ? '#FFFFFF' : '#000000',
        fontFamily: "'JetBrains Mono', monospace",
      }}
    >
      {/* ── Far-left nav rail (64px) ── */}
      <nav
        className="flex flex-col items-center py-3 gap-0 border-r flex-shrink-0 z-20"
        style={{
          width: 64,
          background: darkMode ? '#0a0a0a' : '#F0F0F0',
          borderColor: darkMode ? '#2a2a2a' : '#E0E0E0',
        }}
      >
        {/* Logo */}
        <div
          className="mb-4 w-9 h-9 flex items-center justify-center rounded-lg text-xs font-bold"
          style={{ background: '#FFFFFF', color: '#000000', letterSpacing: '-0.05em' }}
        >
          A20
        </div>

        {NAV_SECTIONS.map((section, i) => {
          const prevCluster = i > 0 ? NAV_SECTIONS[i - 1].cluster : null;
          const showDivider = prevCluster && prevCluster !== section.cluster;
          return (
            <React.Fragment key={section.id}>
              {showDivider && (
                <div className="w-8 my-1" style={{ borderTop: `1px solid ${darkMode ? '#2a2a2a' : '#E0E0E0'}` }} />
              )}
              <button
                title={section.label}
                onClick={() => setActiveSection(section.id)}
                className="w-full flex items-center justify-center h-10 text-lg transition-all relative group"
                style={{
                  color: activeSection === section.id
                    ? (darkMode ? '#FFFFFF' : '#000000')
                    : (darkMode ? '#606060' : '#909090'),
                  background: activeSection === section.id
                    ? (darkMode ? '#1a1a1a' : '#E8E8E8')
                    : 'transparent',
                }}
              >
                <span>{section.icon}</span>
                {/* Tooltip */}
                <span
                  className="absolute left-full ml-2 px-2 py-1 rounded text-xs whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 z-50"
                  style={{ background: darkMode ? '#1a1a1a' : '#F0F0F0', border: `1px solid ${darkMode ? '#2a2a2a' : '#E0E0E0'}` }}
                >
                  {section.label}
                </span>
              </button>
            </React.Fragment>
          );
        })}

        {/* Dark mode toggle at bottom */}
        <div className="mt-auto">
          <button
            onClick={() => setDarkMode(!darkMode)}
            title={darkMode ? 'Switch to Light' : 'Switch to Dark'}
            className="w-10 h-10 flex items-center justify-center rounded-lg text-sm"
            style={{ color: darkMode ? '#a0a0a0' : '#606060' }}
          >
            {darkMode ? '○' : '●'}
          </button>
        </div>
      </nav>

      {/* ── Left chat workspace (320px, collapsible) ── */}
      {!chatCollapsed && (
        <aside
          className="flex flex-col flex-shrink-0 border-r relative"
          style={{
            width: 320,
            background: darkMode ? '#060606' : '#F8F8F8',
            borderColor: darkMode ? '#2a2a2a' : '#E0E0E0',
          }}
        >
          <AgentChatPanel darkMode={darkMode} />
          {/* Collapse button */}
          <button
            onClick={() => setChatCollapsed(true)}
            className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-12 rounded-r flex items-center justify-center text-xs z-10"
            style={{ background: darkMode ? '#1a1a1a' : '#E8E8E8', color: darkMode ? '#606060' : '#909090', border: `1px solid ${darkMode ? '#2a2a2a' : '#E0E0E0'}` }}
          >
            ‹
          </button>
        </aside>
      )}

      {chatCollapsed && (
        <button
          onClick={() => setChatCollapsed(false)}
          className="flex-shrink-0 w-6 flex items-center justify-center"
          style={{ background: darkMode ? '#0a0a0a' : '#F0F0F0', color: darkMode ? '#606060' : '#909090', borderRight: `1px solid ${darkMode ? '#2a2a2a' : '#E0E0E0'}` }}
        >
          ›
        </button>
      )}

      {/* ── Right editor workspace (fluid) ── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <TopBar darkMode={darkMode} section={activeSection} />
        <div className="flex-1 overflow-auto p-6">
          {children ?? (
            <EditorPlaceholder darkMode={darkMode} section={activeSection} />
          )}
        </div>
      </main>
    </div>
  );
}

function AgentChatPanel({ darkMode }: { darkMode: boolean }) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b flex items-center gap-2"
        style={{ borderColor: darkMode ? '#2a2a2a' : '#E0E0E0' }}>
        <span className="text-xs font-bold" style={{ color: darkMode ? '#E5E4E2' : '#333' }}>APEX CHAT</span>
        <span className="ml-auto text-xs px-2 py-0.5 rounded"
          style={{ background: darkMode ? '#1a1a1a' : '#E8E8E8', color: darkMode ? '#a0a0a0' : '#666' }}>A01</span>
      </div>
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        <div className="text-xs" style={{ color: darkMode ? '#606060' : '#999' }}>
          APEX-20 system initialised. 20 agents active. Schema migrated 36/36 tables.
        </div>
        <AgentMessage agentId="A10" content="B44-08 complete. 36 apex20_ tables live in Supabase." darkMode={darkMode} />
        <AgentMessage agentId="A01" content="Acknowledged. Proceeding to B44-09: Workflow + PWA deployment." darkMode={darkMode} />
      </div>
      {/* Input */}
      <div className="px-4 py-3 border-t" style={{ borderColor: darkMode ? '#2a2a2a' : '#E0E0E0' }}>
        <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs"
          style={{ background: darkMode ? '#1a1a1a' : '#F0F0F0', border: `1px solid ${darkMode ? '#2a2a2a' : '#E0E0E0'}` }}>
          <input className="flex-1 bg-transparent outline-none placeholder:opacity-40 text-xs"
            placeholder="Message APEX-20..."
            style={{ color: darkMode ? '#FFFFFF' : '#000000', fontFamily: 'inherit' }} />
          <span style={{ color: darkMode ? '#606060' : '#999' }}>↵</span>
        </div>
      </div>
    </div>
  );
}

function AgentMessage({ agentId, content, darkMode }: { agentId: string; content: string; darkMode: boolean }) {
  return (
    <div className="flex gap-2 text-xs">
      <span className="flex-shrink-0 w-6 h-6 rounded flex items-center justify-center font-bold text-xs"
        style={{ background: darkMode ? '#1a1a1a' : '#E8E8E8', color: darkMode ? '#E5E4E2' : '#333' }}>
        {agentId.slice(1)}
      </span>
      <div>
        <div className="font-bold mb-0.5" style={{ color: darkMode ? '#E5E4E2' : '#333' }}>{agentId}</div>
        <div style={{ color: darkMode ? '#c0c0c0' : '#444' }}>{content}</div>
      </div>
    </div>
  );
}

function TopBar({ darkMode, section }: { darkMode: boolean; section: string }) {
  return (
    <div className="flex items-center px-6 py-3 border-b gap-4 text-xs flex-shrink-0"
      style={{ borderColor: darkMode ? '#2a2a2a' : '#E0E0E0', background: darkMode ? '#060606' : '#F8F8F8' }}>
      <span style={{ color: darkMode ? '#a0a0a0' : '#666' }}>APEX-20</span>
      <span style={{ color: darkMode ? '#2a2a2a' : '#E0E0E0' }}>›</span>
      <span style={{ color: darkMode ? '#E5E4E2' : '#333' }}>{section.replace(/-/g, ' ').toUpperCase()}</span>
      <div className="ml-auto flex items-center gap-3">
        <span className="px-2 py-0.5 rounded text-xs" style={{ background: '#00ff0022', color: '#00cc44' }}>● LIVE</span>
        <span style={{ color: darkMode ? '#606060' : '#999' }}>WF-03</span>
        <span style={{ color: darkMode ? '#606060' : '#999' }}>BP-01</span>
        <span style={{ color: darkMode ? '#606060' : '#999' }}>Jeremy ▾</span>
      </div>
    </div>
  );
}

function EditorPlaceholder({ darkMode, section }: { darkMode: boolean; section: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 opacity-40">
      <div className="text-4xl">◻</div>
      <div className="text-sm" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        {section.replace(/-/g, ' ').toUpperCase()} workspace
      </div>
      <div className="text-xs" style={{ color: darkMode ? '#606060' : '#999' }}>
        B44-09 deployment in progress
      </div>
    </div>
  );
}
