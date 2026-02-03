
export type GradeLevel = 
  | '1st Grade' 
  | '2nd Grade' 
  | '3rd Grade' 
  | '4th Grade' 
  | '5th Grade' 
  | '6th Grade' 
  | '7th Grade' 
  | '8th Grade' 
  | '9th Grade' 
  | '10th Grade' 
  | '11th Grade' 
  | '12th Grade';

export interface FileData {
  data: string;
  mimeType: string;
  name: string;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  grade: GradeLevel;
  subject: string;
  query: string;
  explanation: string;
}

export interface TutorState {
  isLoading: boolean;
  error: string | null;
  explanation: string | null;
  grade: GradeLevel;
  subject: string;
  history: HistoryItem[];
  showHistory: boolean;
}
