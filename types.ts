
export interface StudyDay {
  date: string;
  day: string;
  topic: string;
  study_strategy: string;
  readiness_score: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  provider: 'google' | 'microsoft' | 'github' | 'email';
}

export interface SyllabusInsight {
  title: string;
  description: string;
}
