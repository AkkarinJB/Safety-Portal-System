export interface SafetyReport {
  id?: number;
  area: string;
  reportDate: string; 
  detail: string;
  category?: string;
  stop6: number; 
  rank: string; 
  suggestion?: string;
  responsiblePerson: string;
  imageBeforeUrl?: string;
  imageAfterUrl?: string;
  status: string; 
  createdAt?: string;
  updatedAt?: string;
  progress?: number;
}