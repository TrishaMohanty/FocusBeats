import type { ActivityId } from '../../types/session';

export interface ActivityDefinition {
  id: ActivityId;
  label: string;
  icon: string;
}

export const ACTIVITIES: ActivityDefinition[] = [
  { id: 'coding', label: 'Coding', icon: 'terminal' },
  { id: 'debugging', label: 'Debugging', icon: 'bug_report' },
  { id: 'documentation', label: 'Documentation', icon: 'description' },
  { id: 'refactoring', label: 'Refactoring', icon: 'rebase_edit' },
  { id: 'testing', label: 'Testing', icon: 'contract_edit' },
  { id: 'problem_solving', label: 'Problem Solving', icon: 'problem' },
  { id: 'research', label: 'Research', icon: 'manage_search' },
  { id: 'analysis', label: 'Analysis', icon: 'database' },
  { id: 'brainstorming', label: 'Brainstorming', icon: 'lightbulb' },
  { id: 'planning', label: 'Planning', icon: 'calendar_month' },
  { id: 'review', label: 'Review', icon: 'fact_check' },
  { id: 'learning', label: 'Learning', icon: 'psychology' },
  { id: 'creative_work', label: 'Creative Work', icon: 'auto_awesome' },
  { id: 'writing', label: 'Writing', icon: 'edit_note' },
  { id: 'reading', label: 'Reading', icon: 'book_4' },
  { id: 'revision', label: 'Revision', icon: 'history_edu' },
  { id: 'meeting', label: 'Meeting', icon: 'groups' },
  { id: 'administration', label: 'Admin', icon: 'admin_panel_settings' },
  { id: 'maintenance', label: 'Maintenance', icon: 'build' },
  { id: 'social', label: 'Social', icon: 'hub' },
  { id: 'night_study', label: 'Night Flow', icon: 'nightlight' },
];

export const ACTIVITY_MAP = ACTIVITIES.reduce((acc, curr) => {
  acc[curr.id] = curr;
  return acc;
}, {} as Record<ActivityId, ActivityDefinition>);
