export type FocusLevel = 'low' | 'medium' | 'high';

export type ActivityId = 
  | 'coding' 
  | 'reading' 
  | 'writing' 
  | 'research' 
  | 'design' 
  | 'review' 
  | 'revision' 
  | 'learning' 
  | 'planning' 
  | 'problem_solving' 
  | 'creative_work' 
  | 'night_study'
  | 'debugging'
  | 'documentation'
  | 'testing'
  | 'refactoring'
  | 'meeting'
  | 'administration'
  | 'maintenance'
  | 'brainstorming'
  | 'analysis'
  | 'social';

export type SessionMode = 'focused' | 'pomodoro' | 'infinity';

export interface SessionData {
  activity_type: ActivityId;
  focus_level: FocusLevel;
  task_name: string;
  task_id?: string;
  duration_minutes: number;
  total_goal_minutes?: number;
  is_infinity: boolean;
  session_type: 'work' | 'short_break' | 'long_break';
  mode?: SessionMode;
  current_cycle?: number;
  total_cycles?: number;
}

export interface SessionPreset {
  id: string;
  label: string;
  icon: string;
  color: string;
  activity: ActivityId;
  duration: number;
  level: FocusLevel;
  isInfinity?: boolean;
}
