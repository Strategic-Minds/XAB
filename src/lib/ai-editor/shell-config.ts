// XAB Shell Configuration
// Single source of truth for the UI layout Jeremy approved:
// LEFT: Workspace rail (nav) | LEFT: Chat/Mission panel | RIGHT: Canvas/Editor
// This is the AUTOBUILDER-2.0 layout — kept exactly as Jeremy instructed.

import type { ShellConfig } from './types';

export const XAB_SHELL_CONFIG: ShellConfig = {
  brandName: 'XAB',
  version: '3.0',
  sidebar: {
    sections: [
      {
        label: 'Overview',
        items: [
          { label: 'Dashboard', href: '/', icon: 'LayoutDashboard' },
          { label: 'AI Chat', href: '/chat', icon: 'MessageSquare' },
        ],
      },
      {
        label: 'Build',
        items: [
          { label: 'Builder', href: '/builder', icon: 'Hammer' },
          { label: 'Website Factory', href: '/website-factory', icon: 'Globe' },
          { label: 'Workflow Factory', href: '/workflow-factory', icon: 'Workflow' },
          { label: 'Agent Factory', href: '/agent-factory', icon: 'Bot' },
          { label: 'Funnels', href: '/funnels', icon: 'GitBranch', badge: 'New' },
        ],
      },
      {
        label: 'Swarm',
        items: [
          { label: 'Agent Swarm', href: '/agent-factory', icon: 'Bot' },
          { label: 'Swarm Room', href: '/chat', icon: 'MessageSquare' },
          { label: 'Mission Control', href: '/', icon: 'Zap' },
        ],
      },
      {
        label: 'Intelligence',
        items: [
          { label: 'Research', href: '/research', icon: 'Search' },
          { label: 'Knowledge Base', href: '/knowledge', icon: 'BookOpen' },
          { label: 'Memory', href: '/memory', icon: 'Brain' },
        ],
      },
      {
        label: 'CRM',
        items: [
          { label: 'Leads', href: '/leads', icon: 'TrendingUp' },
          { label: 'Contacts', href: '/crm', icon: 'Users' },
          { label: 'Projects', href: '/projects', icon: 'FolderKanban' },
          { label: 'Client Portal', href: '/client-portal', icon: 'Building2' },
        ],
      },
      {
        label: 'System',
        items: [
          { label: 'Analytics', href: '/analytics', icon: 'BarChart2' },
          { label: 'Admin', href: '/admin', icon: 'Settings' },
        ],
      },
    ],
  },
  chatPanel: {
    width: 380,
    position: 'left',
    collapsible: true,
    defaultOpen: true,
  },
  editor: {
    defaultView: 'preview',
    showFileTree: true,
    showDiff: true,
    theme: 'dark',
  },
};
