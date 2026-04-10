export interface Task {
  id: string;
  user_id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  due_date: string | null;
  created_at: string;
}

export interface StudySession {
  id: string;
  user_id: string;
  duration_minutes: number;
  session_type: 'work' | 'short_break' | 'long_break';
  completed_at: string;
  notes: string | null;
}

import type { ActivityId, FocusLevel } from './session';

export interface MusicTrack {
  id: string;
  user_id: string | null;
  title: string;
  category: 'lofi' | 'ambient' | 'classical' | string;
  focus_level: FocusLevel;
  activity_type: ActivityId;
  embed_url: string;
  created_at: string;
}

export interface PlannerEntry {
  id: string;
  user_id: string;
  title: string;
  scheduled_date: string;
  subject: string;
  notes: string | null;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  focus_score: number;
  created_at: string;
}

export interface DailyStats {
  date: string;
  study_minutes: number;
  tasks_completed: number;
  sessions_count: number;
  focus_score: number;
}
