export interface SafetyReport {
  id?: number;
  area: string;
  detail: string;
  category?: string;
  rank: string; 
  suggestion?: string;
  responsiblePerson: string;
  imageBeforeUrl?: string;
  imageAfterUrl?: string;
  status: string; 
  createdAt?: string;
  progress?: number;
}