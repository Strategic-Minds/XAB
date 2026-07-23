// XAB AI Frontend Editor — Type Definitions
// Allows the AI agent to autonomously read and modify frontend files
// All writes go to feature branches only. Main is protected.

export type EditMode = 'read' | 'branch-write' | 'protected';

export interface FrontendFile {
  path: string;          // relative to repo root, e.g. 'app/(app)/page.tsx'
  content: string;
  sha?: string;          // GitHub blob SHA for updates
  branch: string;
}

export interface EditPlan {
  planId: string;
  description: string;
  targetBranch: string;  // always a feature branch, never main
  files: FileChange[];
  rationale: string;
  rollback: string;      // how to undo
  requiresApproval: boolean;
}

export interface FileChange {
  path: string;
  action: 'create' | 'update' | 'delete';
  content?: string;
  previousSha?: string;
}

export interface EditReceipt {
  receiptId: string;
  planId: string;
  commitSha: string;
  branch: string;
  filesChanged: string[];
  timestamp: string;
  rollbackRef: string;   // commit sha before change
  prUrl?: string;
}

export interface NavigationItem {
  label: string;
  href: string;
  icon?: string;
  badge?: string;
  children?: NavigationItem[];
}

export interface SidebarConfig {
  sections: Array<{
    label: string;
    items: NavigationItem[];
  }>;
}

export interface ChatPanelConfig {
  width: number;         // default 380
  position: 'left' | 'right';
  collapsible: boolean;
  defaultOpen: boolean;
}

export interface EditorConfig {
  defaultView: 'preview' | 'code' | 'split';
  showFileTree: boolean;
  showDiff: boolean;
  theme: 'dark' | 'light';
}

export interface ShellConfig {
  sidebar: SidebarConfig;
  chatPanel: ChatPanelConfig;
  editor: EditorConfig;
  brandName: string;
  version: string;
}
