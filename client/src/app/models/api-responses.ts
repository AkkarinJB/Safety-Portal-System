export interface ApiResponse<T = unknown> {
  data?: T;
  message?: string;
  success?: boolean;
}

export interface LoginResponse {
  token: string;
  role: string;
  username: string;
  message?: string;
}

export interface AiAnalysisResult {
  suggestion: string;
  category: string;
  rank: string;
}

export interface CreateReportResponse {
  id: number;
  message?: string;
}

export interface UpdateReportResponse {
  message?: string;
}

export interface DeleteReportResponse {
  message?: string;
}

